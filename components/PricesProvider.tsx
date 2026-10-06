"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { formatPrice } from "@/lib/products";
import { supabase } from "@/lib/supabase";

// Preços das peças vêm da tabela products do banco (o mesmo lugar que a cobrança usa).
// O valor de lib/products.ts só aparece no primeiro instante, enquanto o banco responde.
type Prices = Record<string, number>;
const PricesContext = createContext<Prices | null>(null);

export function PricesProvider({ children }: { children: ReactNode }) {
  const [prices, setPrices] = useState<Prices | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("products")
      .select("id,price_cents")
      .then(({ data }) => {
        if (data?.length) setPrices(Object.fromEntries(data.map((p) => [p.id as string, p.price_cents as number])));
      });
  }, []);

  return <PricesContext.Provider value={prices}>{children}</PricesContext.Provider>;
}

/** Preço atual de uma peça, em centavos. */
export function usePrice(): (product: { id: string; priceCents: number }) => number {
  const prices = useContext(PricesContext);
  return (product) => prices?.[product.id] ?? product.priceCents;
}

/** Preço formatado, para usar em páginas que não são "client". */
export function Price({ id, cents, perInstallments }: { id: string; cents: number; perInstallments?: number }) {
  const price = usePrice()({ id, priceCents: cents });
  return <>{formatPrice(perInstallments ? Math.round(price / perInstallments) : price)}</>;
}
