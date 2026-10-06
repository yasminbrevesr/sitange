"use client";

// Carrega o SDK do Mercado Pago (MercadoPago.js v2) uma única vez.
// Os campos do cartão (número, validade, CVV) são iframes do Mercado Pago: o site nunca vê esses dados.
const SDK_URL = "https://sdk.mercadopago.com/js/v2";
export const MP_PUBLIC_KEY = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY ?? "";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type MP = any;
let loading: Promise<MP> | null = null;

export function loadMercadoPago(): Promise<MP> {
  if (!MP_PUBLIC_KEY) return Promise.reject(new Error("Public Key do Mercado Pago não configurada."));
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const w = window as any;
    const ready = () => resolve(new w.MercadoPago(MP_PUBLIC_KEY, { locale: "pt-BR" }));
    if (w.MercadoPago) return ready();
    const s = document.createElement("script");
    s.src = SDK_URL;
    s.async = true;
    s.onload = ready;
    s.onerror = () => {
      loading = null;
      reject(new Error("Não deu para carregar o Mercado Pago."));
    };
    document.head.appendChild(s);
  });
  return loading;
}
