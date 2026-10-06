"use client";

// Pedidos: o PIX é criado pela função "criar-pix" do Supabase, que recalcula preço, frete e total.
// O site só lê os próprios pedidos (regra RLS da tabela orders).
import type { CartItem } from "@/components/CartProvider";
import type { DeliveryAddress } from "@/components/Shipping";
import { supabase } from "./supabase";

export type OrderStatus = "aguardando_pagamento" | "pago" | "em_producao" | "enviado" | "entregue" | "cancelado" | "expirado";

export type PixOrder = {
  pedidoId: string;
  numero: number;
  totalCents: number;
  copiaECola: string;
  qrBase64: string | null;
  expiraEm: string;
};

export type Order = {
  id: string;
  number: number;
  status: OrderStatus;
  items: { productId: string; name: string; priceCents: number; sizes: number[]; engraving: string }[];
  total_cents: number;
  shipping_service: string;
  payment_method: "pix" | "cartao";
  tracking_code: string | null;
  created_at: string;
};

export class OrderError extends Error {
  constructor(message: string, public code: string) {
    super(message);
  }
}

function client() {
  if (!supabase) throw new OrderError("Pagamento indisponível no momento.", "config");
  return supabase;
}

export async function createPixOrder(input: {
  items: CartItem[];
  address: DeliveryAddress;
  serviceId: string;
  cpf?: string;
}): Promise<PixOrder> {
  const { data, error } = await client().functions.invoke("criar-pix", {
    body: {
      itens: input.items.map(({ productId, sizes, engraving }) => ({ productId, sizes, engraving })),
      endereco: input.address,
      freteId: input.serviceId,
      cpf: input.cpf,
    },
  });
  if (error) {
    let msg = "Não deu para gerar o PIX agora. Tente de novo em instantes.";
    let code = "pagamento";
    // A resposta da função (com o motivo) vem em error.context; lida sem depender de instanceof.
    const res = (error as { context?: Response }).context;
    if (res && typeof res.text === "function") {
      const raw = await res.text().catch(() => "");
      try {
        const body = JSON.parse(raw);
        if (body?.erro) msg = body.erro;
        if (body?.codigo) code = body.codigo;
      } catch {
        msg = `${msg} (erro ${res.status})`;
      }
      console.error("criar-pix respondeu", res.status, raw);
    } else {
      console.error("criar-pix falhou", error);
    }
    throw new OrderError(msg, code);
  }
  return data as PixOrder;
}

export async function getOrderStatus(id: string): Promise<OrderStatus | null> {
  const { data } = await client().from("orders").select("status").eq("id", id).maybeSingle();
  return (data?.status as OrderStatus) ?? null;
}

export async function listOrders(): Promise<Order[]> {
  const { data, error } = await client()
    .from("orders")
    .select("id,number,status,items,total_cents,shipping_service,payment_method,tracking_code,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Order[];
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  aguardando_pagamento: "Aguardando pagamento",
  pago: "Pago",
  em_producao: "Em produção",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
  expirado: "PIX expirado",
};

/** Site dos Correios para acompanhar a entrega. */
export const TRACKING_URL = "https://rastreamento.correios.com.br/app/index.php";
