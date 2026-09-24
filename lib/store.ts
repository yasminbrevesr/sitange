// Regras comerciais da loja, num lugar só. A faixa laranja, a página de produto e a sacola leem daqui.
export const STORE = {
  /** Frete grátis a partir deste valor (centavos). */
  freeShippingMinCents: 45000,
  /** Parcelamento máximo, sem juros. */
  maxInstallmentsInterestFree: 6,
  /** Desconto pagando no Pix (%). */
  pixDiscountPercent: 5,
  expressShipping: true,
  warrantyMonths: 12,
  engravingIncluded: true,
};

export type ShippingOption = {
  id: "padrao" | "expresso";
  label: string;
  /** Preço em centavos. null = ainda não definido (aparece [COLOCAR AQUI]). */
  priceCents: number | null;
  /** Dias úteis de transporte, depois da produção. null = ainda não definido. */
  deliveryDays: number | null;
  /** Se entra no frete grátis a partir de STORE.freeShippingMinCents. */
  freeAboveMin: boolean;
};

// Opções de frete mostradas na sacola. Preencha preço e prazo quando estiverem definidos.
export const SHIPPING_OPTIONS: ShippingOption[] = [
  { id: "padrao", label: "Envio padrão", priceCents: null, deliveryDays: null, freeAboveMin: true },
  { id: "expresso", label: "Envio expresso", priceCents: null, deliveryDays: null, freeAboveMin: false },
];

/** Preço do frete para um subtotal; null quando ainda não definido. */
export function shippingPrice(option: ShippingOption, subtotalCents: number): number | null {
  if (option.freeAboveMin && subtotalCents >= STORE.freeShippingMinCents) return 0;
  return option.priceCents;
}
