// Envio do cadastro do popup de cupom.
// Defina NEXT_PUBLIC_LEADS_ENDPOINT (ex.: webhook do Klaviyo, RD Station, n8n, Make) para receber os dados.
// Sem endpoint configurado, nada é salvo: o cadastro só mostra o cupom na tela.

export type Lead = {
  email: string;
  phone: string; // formato E.164, ex.: +5511912345678
  source: "popup-cupom-10";
  consent: true;
  createdAt: string;
};

export async function saveLead(lead: Lead): Promise<void> {
  const endpoint = process.env.NEXT_PUBLIC_LEADS_ENDPOINT;
  if (!endpoint) {
    console.warn("[leads] NEXT_PUBLIC_LEADS_ENDPOINT não configurado: cadastro não foi enviado.");
    return;
  }
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
  });
  if (!res.ok) throw new Error(`Falha ao enviar cadastro (${res.status})`);
}

export const COUPON_CODE: string | null = null; // [COLOCAR AQUI] código do cupom de 10%
