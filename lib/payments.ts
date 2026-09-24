// Pagamentos (PIX e cartão).
// IMPORTANTE (segurança): dados de cartão NUNCA devem ir para o nosso banco nem para os nossos logs.
// Ao ativar um gateway (Mercado Pago, Pagar.me, Asaas, Stripe...), os campos do cartão da tela são
// trocados pelos campos seguros do gateway, que devolvem só um "token". A cobrança (PIX e cartão) é
// criada num servidor (ex.: Supabase Edge Function) com a chave secreta do gateway, fora do site.

export const PAYMENTS_ENABLED = false; // [COLOCAR AQUI] true quando o gateway estiver integrado

export class PaymentsNotConfiguredError extends Error {
  constructor() {
    super("O pagamento ainda não está ativo.");
  }
}

export type PixCharge = { qrCodeBase64: string; copyPaste: string; expiresAt: string };

export async function createPixCharge(_amountCents: number): Promise<PixCharge> {
  throw new PaymentsNotConfiguredError();
}

export async function payWithCard(_input: { cardToken: string; installments: number; amountCents: number }): Promise<void> {
  throw new PaymentsNotConfiguredError();
}

// ---------- validações da tela (os dados não saem do navegador) ----------

export function onlyDigits(v: string) {
  return v.replace(/\D/g, "");
}

/** Algoritmo de Luhn: confere se o número do cartão é plausível. */
export function isValidCardNumber(v: string): boolean {
  const d = onlyDigits(v);
  if (d.length < 13 || d.length > 19) return false;
  let sum = 0;
  for (let i = 0; i < d.length; i++) {
    let n = Number(d[d.length - 1 - i]);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
}

export function cardBrand(v: string): string | null {
  const d = onlyDigits(v);
  if (/^4/.test(d)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(d)) return "Mastercard";
  if (/^3[47]/.test(d)) return "Amex";
  if (/^(4011|4312|4389|4514|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6550)/.test(d)) return "Elo";
  if (/^(606282|3841)/.test(d)) return "Hipercard";
  return null;
}

export function formatCardNumber(v: string): string {
  const d = onlyDigits(v).slice(0, 19);
  return d.replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function formatExpiry(v: string): string {
  const d = onlyDigits(v).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

export function isValidExpiry(v: string, now = new Date()): boolean {
  const d = onlyDigits(v);
  if (d.length !== 4) return false;
  const month = Number(d.slice(0, 2));
  const year = 2000 + Number(d.slice(2));
  if (month < 1 || month > 12) return false;
  const lastDay = new Date(year, month, 0, 23, 59, 59);
  return lastDay >= now;
}
