// Supabase Edge Function: recebe o aviso do Mercado Pago quando um pagamento muda.
// Publicar com "Verify JWT" DESLIGADO (o Mercado Pago não manda login do Supabase).
//
// Segurança: o aviso só diz "o pagamento X mudou". O status de verdade é sempre consultado
// direto no Mercado Pago com o nosso token, e o valor pago é conferido com o total do pedido.
//
// Secrets: MP_ACCESS_TOKEN. Automáticos: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const ok = () => new Response("ok", { status: 200 });

async function db(path: string, init: RequestInit = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE,
      Authorization: `Bearer ${SERVICE}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`banco ${res.status}: ${await res.text()}`);
  return res.json();
}

Deno.serve(async (req) => {
  const MP = Deno.env.get("MP_ACCESS_TOKEN");
  if (!MP) return new Response("sem token", { status: 500 });

  // O id do pagamento pode vir na URL (?data.id=...&type=payment) ou no corpo ({ type, data: { id } }).
  const url = new URL(req.url);
  let tipo = url.searchParams.get("type") ?? url.searchParams.get("topic") ?? "";
  let id = url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "";
  if (req.method === "POST") {
    try {
      const b = await req.json();
      tipo = b.type ?? b.topic ?? tipo;
      id = String(b.data?.id ?? id);
    } catch {
      // corpo vazio: fica com o que veio na URL
    }
  }
  if (tipo !== "payment" || !/^\d+$/.test(id)) return ok();

  try {
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, { headers: { Authorization: `Bearer ${MP}` } });
    if (!res.ok) {
      console.error("Não deu para consultar o pagamento", id, res.status);
      return new Response("erro", { status: 502 }); // o Mercado Pago tenta de novo depois
    }
    const pg = await res.json();
    const pedidoId = String(pg.external_reference ?? "");
    if (!/^[0-9a-f-]{36}$/.test(pedidoId)) return ok();

    const [pedido] = (await db(`orders?id=eq.${pedidoId}&mp_payment_id=eq.${id}&select=id,status,total_cents`)) as {
      id: string;
      status: string;
      total_cents: number;
    }[];
    if (!pedido) return ok();

    let status: string | null = null;
    if (pg.status === "approved") {
      if (Math.round(Number(pg.transaction_amount) * 100) !== pedido.total_cents) {
        console.error("Valor pago diferente do pedido", pedidoId, pg.transaction_amount);
        return ok();
      }
      status = "pago";
    } else if (pg.status === "cancelled" && pg.status_detail === "expired") status = "expirado";
    else if (["cancelled", "rejected", "refunded", "charged_back"].includes(pg.status)) status = "cancelado";

    if (status && status !== pedido.status) {
      await db(`orders?id=eq.${pedidoId}`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          paid_at: status === "pago" ? pg.date_approved ?? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        }),
      });
    }
    return ok();
  } catch (e) {
    console.error("Erro no aviso do Mercado Pago", e);
    return new Response("erro", { status: 500 });
  }
});
