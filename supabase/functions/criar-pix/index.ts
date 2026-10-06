// Supabase Edge Function: cria o pedido e o PIX no Mercado Pago.
//
// Segurança: o navegador manda só O QUE a pessoa quer comprar (peças, aros, endereço, frete escolhido).
// Preço, frete, desconto e total são recalculados AQUI, nunca aceitos do navegador.
//
// Secrets usados (Edge Functions → Secrets):
//   MP_ACCESS_TOKEN  token do Mercado Pago (TEST-... para teste, APP_USR-... para produção)
// Automáticos do Supabase: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

// Catálogo: manter igual a lib/products.ts (preços em centavos).
const CATALOGO: Record<string, { nome: string; precoCents: number; partes: 1 | 2 }> = {
  curva: { nome: "Curva", precoCents: 46000, partes: 2 },
  letra: { nome: "Letra", precoCents: 82000, partes: 2 },
  linha: { nome: "Linha", precoCents: 24000, partes: 1 },
  plano: { nome: "Plano", precoCents: 78000, partes: 1 },
};
// Regras: manter igual a lib/store.ts.
const FRETE_GRATIS_A_PARTIR = 45000;
const DESCONTO_PIX_PCT = 5;
const ARO_MIN = 10;
const ARO_MAX = 26;
const GRAVACAO_MAX = 12;
const PIX_VALIDADE_MIN = 30;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const ANON = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}
function falha(codigo: string, mensagem: string, status = 400) {
  return json({ erro: mensagem, codigo }, status);
}

const so = (v: unknown) => String(v ?? "").replace(/\D/g, "");
const texto = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

function cpfValido(v: string) {
  const d = so(v);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  for (const t of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < t; i++) soma += Number(d[i]) * (t + 1 - i);
    if (((soma * 10) % 11) % 10 !== Number(d[t])) return false;
  }
  return true;
}

// Acesso ao banco com a chave de serviço (só aqui no servidor).
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
  return res.status === 204 ? null : res.json();
}

// Data no formato que o Mercado Pago pede, no horário de Brasília (ex.: 2026-10-06T15:30:00.000-03:00).
function dataMP(d: Date) {
  const br = new Date(d.getTime() - 3 * 60 * 60 * 1000);
  return br.toISOString().replace("Z", "-03:00");
}

type Endereco = { recipient: string; cep: string; street: string; number: string; complement: string; district: string; city: string; state: string };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return falha("metodo", "Método não permitido.", 405);

  const MP = Deno.env.get("MP_ACCESS_TOKEN");
  if (!MP) return falha("config", "Pagamento não configurado.", 500);

  // 1. Quem está comprando (precisa estar logado)
  const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const u = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: ANON, Authorization: `Bearer ${jwt}` } });
  if (!u.ok) return falha("login", "Entre na sua conta para pagar.", 401);
  const user = (await u.json()) as { id: string; email: string };

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return falha("pedido", "Pedido inválido.");
  }

  // 2. Peças: confere cada uma no catálogo e calcula o subtotal aqui
  const brutos = Array.isArray(body.itens) ? body.itens.slice(0, 20) : [];
  const itens = [];
  for (const b of brutos as Record<string, unknown>[]) {
    const p = CATALOGO[String(b.productId)];
    const aros = Array.isArray(b.sizes) ? b.sizes.map(Number) : [];
    const gravacao = texto(b.engraving, 100);
    if (!p || aros.length !== p.partes || aros.some((a) => !Number.isInteger(a) || a < ARO_MIN || a > ARO_MAX) || gravacao.length > GRAVACAO_MAX)
      return falha("itens", "Confira as peças da sacola.");
    itens.push({ productId: String(b.productId), name: p.nome, priceCents: p.precoCents, sizes: aros, engraving: gravacao });
  }
  if (!itens.length) return falha("itens", "Sua sacola está vazia.");
  const subtotal = itens.reduce((s, i) => s + i.priceCents, 0);

  // 3. Endereço
  const e = (body.endereco ?? {}) as Record<string, unknown>;
  const endereco: Endereco = {
    recipient: texto(e.recipient, 120),
    cep: so(e.cep).slice(0, 8),
    street: texto(e.street, 200),
    number: texto(e.number, 20),
    complement: texto(e.complement, 100),
    district: texto(e.district, 100),
    city: texto(e.city, 100),
    state: texto(e.state, 2).toUpperCase(),
  };
  if (endereco.recipient.length < 2 || endereco.cep.length !== 8 || !endereco.street || !endereco.number || !endereco.district || !endereco.city || !/^[A-Z]{2}$/.test(endereco.state))
    return falha("endereco", "Confira o endereço de entrega.");

  // 4. Frete: cota de novo no SuperFrete (pela função calcular-frete) e aplica o frete grátis
  const f = await fetch(`${SUPABASE_URL}/functions/v1/calcular-frete`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON, Authorization: `Bearer ${ANON}` },
    body: JSON.stringify({ cep: endereco.cep, valor: subtotal / 100 }),
  });
  const cot = f.ok ? ((await f.json()).opcoes ?? []) as { id: string; nome: string; preco: number; prazo: number | null }[] : [];
  const escolhida = cot.find((o) => o.id === String(body.freteId));
  if (!escolhida) return falha("frete", "O frete mudou. Escolha a opção de frete de novo.");
  const maisBarata = cot.reduce((m, o) => (o.preco < m.preco ? o : m), cot[0]);
  const frete = subtotal >= FRETE_GRATIS_A_PARTIR && escolhida.id === maisBarata.id ? 0 : escolhida.preco;

  // 5. Total no PIX (desconto só sobre as peças)
  const desconto = Math.round((subtotal * DESCONTO_PIX_PCT) / 100);
  const total = subtotal - desconto + frete;

  // 6. Dados de quem paga: nome e CPF do perfil (o CPF pode vir agora e fica salvo no perfil)
  const perfis = (await db(`profiles?id=eq.${user.id}&select=name,cpf`)) as { name: string | null; cpf: string | null }[];
  const perfil = perfis[0] ?? { name: null, cpf: null };
  let cpf = so(perfil.cpf);
  if (!cpfValido(cpf)) {
    cpf = so(body.cpf);
    if (!cpfValido(cpf)) return falha("cpf", "Informe um CPF válido para gerar o PIX.");
    await db(`profiles?id=eq.${user.id}`, { method: "PATCH", body: JSON.stringify({ cpf, updated_at: new Date().toISOString() }) });
  }
  const nome = (perfil.name ?? endereco.recipient).trim().split(/\s+/);

  // 7. Cria o pedido
  const expira = new Date(Date.now() + PIX_VALIDADE_MIN * 60 * 1000);
  const [pedido] = (await db("orders", {
    method: "POST",
    body: JSON.stringify({
      user_id: user.id,
      items: itens,
      subtotal_cents: subtotal,
      shipping_cents: frete,
      discount_cents: desconto,
      total_cents: total,
      shipping_service: escolhida.nome,
      shipping_days: escolhida.prazo,
      shipping_address: endereco,
      payment_method: "pix",
      pix_expires_at: expira.toISOString(),
    }),
  })) as { id: string; number: number }[];

  // 8. Cria o PIX no Mercado Pago
  const mp = await fetch("https://api.mercadopago.com/v1/payments", {
    method: "POST",
    headers: { Authorization: `Bearer ${MP}`, "Content-Type": "application/json", "X-Idempotency-Key": pedido.id },
    body: JSON.stringify({
      transaction_amount: total / 100,
      description: `Pedido TANGÈ nº ${pedido.number}`,
      payment_method_id: "pix",
      external_reference: pedido.id,
      notification_url: `${SUPABASE_URL}/functions/v1/webhook-mercadopago`,
      date_of_expiration: dataMP(expira),
      payer: {
        email: user.email,
        first_name: nome[0] ?? "",
        last_name: nome.slice(1).join(" "),
        identification: { type: "CPF", number: cpf },
      },
    }),
  });
  const pg = await mp.json().catch(() => ({}));
  const dados = pg?.point_of_interaction?.transaction_data;
  if (!mp.ok || !dados?.qr_code) {
    console.error("Mercado Pago recusou o PIX", mp.status, JSON.stringify(pg));
    await db(`orders?id=eq.${pedido.id}`, { method: "PATCH", body: JSON.stringify({ status: "cancelado", updated_at: new Date().toISOString() }) });
    return falha("pagamento", "Não deu para gerar o PIX agora. Tente de novo em instantes.", 502);
  }

  await db(`orders?id=eq.${pedido.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      mp_payment_id: String(pg.id),
      pix_qr_code: dados.qr_code,
      pix_qr_base64: dados.qr_code_base64 ?? null,
      updated_at: new Date().toISOString(),
    }),
  });

  return json({
    pedidoId: pedido.id,
    numero: pedido.number,
    totalCents: total,
    copiaECola: dados.qr_code,
    qrBase64: dados.qr_code_base64 ?? null,
    expiraEm: expira.toISOString(),
  });
});
