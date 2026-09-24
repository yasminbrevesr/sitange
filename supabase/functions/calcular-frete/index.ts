// Supabase Edge Function: calcula o frete no SuperFrete.
// O token fica só no Supabase (Edge Functions → Secrets), nunca no site.
// Nome do secret: api_superfrete (ou SUPERFRETE_TOKEN).
//
// O site chama esta função com: { cep: "00000000", valor: 460.00 }
// e recebe: { opcoes: [{ id, nome, transportadora, preco, prazo }] }

// Endereço de onde as peças saem.
const CEP_ORIGEM = "20775001";

// Caixa de envio (em cm e kg). Ajuste quando tiver as medidas reais.
// Correios aceitam no mínimo 16 × 11 × 2 cm.
const CAIXA = { height: 4, width: 11, length: 16, weight: 0.3 };

// Serviços cotados: 1 = PAC, 2 = SEDEX, 17 = Mini Envios (Correios).
const SERVICOS = "1,2,17";

const API = {
  producao: "https://api.superfrete.com/api/v0/calculator",
  sandbox: "https://sandbox.superfrete.com/api/v0/calculator",
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

type Cotacao = {
  id?: number;
  name?: string;
  price?: number | string;
  delivery_time?: number;
  delivery_range?: { min?: number; max?: number };
  company?: { name?: string };
  error?: string;
  has_error?: boolean;
};

async function cotar(url: string, token: string, cep: string, valor: number) {
  return fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      // O SuperFrete pede um e-mail de contato no User-Agent (secret opcional SUPERFRETE_EMAIL).
      "User-Agent": `TANGE loja (${Deno.env.get("SUPERFRETE_EMAIL") ?? "contato"})`,
    },
    body: JSON.stringify({
      from: { postal_code: CEP_ORIGEM },
      to: { postal_code: cep },
      services: SERVICOS,
      options: { own_hand: false, receipt: false, insurance_value: valor, use_insurance_value: false },
      package: CAIXA,
    }),
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ erro: "Método não permitido." }, 405);

  const token = Deno.env.get("api_superfrete") ?? Deno.env.get("SUPERFRETE_TOKEN");
  if (!token) return json({ erro: "Token do SuperFrete não configurado." }, 500);

  let cep = "";
  let valor = 0;
  try {
    const body = await req.json();
    cep = String(body.cep ?? "").replace(/\D/g, "");
    valor = Math.max(0, Math.min(100000, Number(body.valor) || 0));
  } catch {
    return json({ erro: "Pedido inválido." }, 400);
  }
  if (cep.length !== 8) return json({ erro: "CEP inválido." }, 400);

  try {
    // Tenta a conta real; se o token for do sandbox (conta de teste), a produção recusa e tenta o sandbox.
    let res = await cotar(API.producao, token, cep, valor);
    if (res.status === 401 || res.status === 403) res = await cotar(API.sandbox, token, cep, valor);
    if (!res.ok) {
      console.error("SuperFrete respondeu", res.status, await res.text());
      return json({ erro: "Não deu para calcular o frete agora." }, 502);
    }

    const data = (await res.json()) as Cotacao[] | { data?: Cotacao[] };
    const lista = Array.isArray(data) ? data : data.data ?? [];
    const opcoes = lista
      .filter((c) => !c.error && !c.has_error && c.price !== undefined && Number(c.price) > 0)
      .map((c) => ({
        id: String(c.id ?? c.name),
        nome: c.name ?? "Envio",
        transportadora: c.company?.name ?? "",
        preco: Math.round(Number(c.price) * 100), // centavos
        prazo: c.delivery_time ?? c.delivery_range?.max ?? null, // dias úteis
      }))
      .sort((a, b) => a.preco - b.preco);

    return json({ opcoes });
  } catch (e) {
    console.error("Erro ao consultar o SuperFrete", e);
    return json({ erro: "Não deu para calcular o frete agora." }, 502);
  }
});
