"use client";

// Cotação de frete pela função "calcular-frete" do Supabase (que consulta o SuperFrete).
// O token do SuperFrete fica só no Supabase; o site só manda CEP e valor.
import { supabase } from "./supabase";
import { STORE } from "./store";

export type ShippingQuote = {
  id: string;
  nome: string;
  transportadora: string;
  /** centavos, antes do frete grátis */
  preco: number;
  /** dias úteis de transporte (sem a produção) */
  prazo: number | null;
};

export async function quoteShipping(cep: string, subtotalCents: number): Promise<ShippingQuote[]> {
  if (!supabase) throw new Error("Supabase não configurado.");
  const { data, error } = await supabase.functions.invoke("calcular-frete", {
    body: { cep, valor: subtotalCents / 100 },
  });
  if (error || !data?.opcoes) throw new Error("Não deu para calcular o frete agora.");
  return data.opcoes as ShippingQuote[];
}

/** Preço cobrado: a opção mais barata fica grátis a partir do valor mínimo. */
export function chargedPrice(quote: ShippingQuote, quotes: ShippingQuote[], subtotalCents: number): number {
  const cheapest = quotes.reduce((min, q) => (q.preco < min.preco ? q : min), quotes[0]);
  if (subtotalCents >= STORE.freeShippingMinCents && quote.id === cheapest.id) return 0;
  return quote.preco;
}
