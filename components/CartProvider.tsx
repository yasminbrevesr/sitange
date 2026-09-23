"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = {
  key: string;
  productId: string;
  /** Um aro por parte: dois para "para dois", um para "para um". */
  sizes: number[];
  engraving: string;
};

type CartContextValue = {
  items: CartItem[];
  add: (item: Omit<CartItem, "key">) => void;
  remove: (key: string) => void;
};

const STORAGE_KEY = "tange:sacola";
const CartContext = createContext<CartContextValue | null>(null);

// Sacola local (navegador). Quando houver checkout real, trocar por chamadas à API.
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {
      // armazenamento indisponível: sacola começa vazia
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignora: a sacola continua funcionando na sessão atual
    }
  }, [items, loaded]);

  const add = useCallback((item: Omit<CartItem, "key">) => {
    setItems((prev) => [...prev, { ...item, key: `${item.productId}-${Date.now()}` }]);
  }, []);

  const remove = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  return <CartContext.Provider value={{ items, add, remove }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart precisa estar dentro de <CartProvider>");
  return ctx;
}
