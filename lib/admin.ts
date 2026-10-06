"use client";

// Painel da loja: lê e avança pedidos por funções do banco que só respondem a administradores
// (tabela admins, ver supabase/schema.sql). O site não tem acesso direto aos pedidos de outros clientes.
import type { OrderStatus } from "./orders";
import { supabase } from "./supabase";

export type AdminOrder = {
  id: string;
  number: number;
  status: OrderStatus;
  items: { productId: string; name: string; priceCents: number; sizes: number[]; engraving: string }[];
  subtotal_cents: number;
  shipping_cents: number;
  discount_cents: number;
  coupon_code: string | null;
  coupon_cents: number;
  total_cents: number;
  shipping_service: string;
  shipping_days: number | null;
  shipping_address: {
    recipient: string;
    cep: string;
    street: string;
    number: string;
    complement: string;
    district: string;
    city: string;
    state: string;
  };
  payment_method: "pix" | "cartao";
  tracking_code: string | null;
  created_at: string;
  paid_at: string | null;
  production_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_cpf: string | null;
  customer_phone: string | null;
};

function client() {
  if (!supabase) throw new Error("Supabase não configurado.");
  return supabase;
}

export async function isAdmin(): Promise<boolean> {
  const { data, error } = await client().rpc("is_admin");
  return !error && data === true;
}

export async function listAdminOrders(): Promise<AdminOrder[]> {
  const { data, error } = await client().rpc("admin_pedidos");
  if (error) throw error;
  return (data ?? []) as AdminOrder[];
}

export async function advanceOrder(id: string, status: "em_producao" | "enviado" | "entregue", tracking?: string) {
  const { error } = await client().rpc("admin_avancar_pedido", { p_id: id, p_status: status, p_rastreio: tracking ?? null });
  if (error) {
    if (error.message.includes("rastreio")) throw new Error("Informe o código de rastreio.");
    if (error.message.includes("etapa")) throw new Error("Esse pedido já mudou de etapa. Atualize a página.");
    throw new Error("Não deu para atualizar o pedido agora.");
  }
}
