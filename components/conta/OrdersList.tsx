"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth";
import { STATUS_LABEL, listOrders, type Order } from "@/lib/orders";
import { formatPrice } from "@/lib/products";

const STATUS_STYLE: Record<Order["status"], string> = {
  aguardando_pagamento: "bg-creme-claro text-tinta",
  pago: "bg-verde text-creme-claro",
  cancelado: "border border-tinta/30 text-tinta/80",
  expirado: "border border-tinta/30 text-tinta/80",
};

// Meus pedidos: lista os pedidos da pessoa (mais recentes primeiro).
export function OrdersList() {
  const session = useSession();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState(false);
  const [paid, setPaid] = useState<string | null>(null);

  useEffect(() => {
    setPaid(new URLSearchParams(window.location.search).get("pago"));
  }, []);

  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) return;
    listOrders()
      .then(setOrders)
      .catch(() => setError(true));
  }, [userId]);

  return (
    <div className="mt-8 flex flex-col gap-4">
      {paid && (
        <p role="status" className="bg-laranja px-5 py-4 text-[15px] text-tinta">
          Pagamento confirmado. Recebemos seu pedido nº {paid}.
        </p>
      )}
      {error && <p role="alert" className="text-[14px] text-laranja-tinta">Não deu para carregar seus pedidos agora.</p>}
      {orders === null && !error && <p className="text-[14px] text-tinta/75">Carregando pedidos…</p>}
      {orders?.length === 0 && (
        <div className="flex flex-col items-start gap-5 bg-verde p-8 text-creme-claro md:p-10">
          <p className="text-[18px] font-light">Você ainda não fez nenhum pedido.</p>
          <Link
            href="/#as-pecas"
            className="rotulo inline-flex min-h-12 items-center rounded-full bg-laranja px-8 text-[11px] text-tinta hover:bg-creme-claro"
          >
            Ver as quatro peças
          </Link>
        </div>
      )}
      {orders && orders.length > 0 && (
        <ul className="flex flex-col gap-3">
          {orders.map((o) => (
            <li key={o.id} className="border border-tinta/10 p-5 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[17px] text-verde">Pedido nº {o.number}</p>
                  <p className="text-[13px] text-tinta/75">
                    {new Date(o.created_at).toLocaleDateString("pt-BR")} · {o.payment_method === "pix" ? "PIX" : "Cartão"} ·{" "}
                    {o.shipping_service}
                  </p>
                </div>
                <span className={`rotulo rounded-full px-3 py-1 text-[10px] ${STATUS_STYLE[o.status]}`}>{STATUS_LABEL[o.status]}</span>
              </div>
              <ul className="mt-4 flex flex-col gap-1 border-t border-tinta/10 pt-4 text-[14px] text-tinta/80">
                {o.items.map((i, n) => (
                  <li key={n}>
                    {i.name} · {i.sizes.length === 2 ? `aros ${i.sizes[0]} e ${i.sizes[1]}` : `aro ${i.sizes[0]}`}
                    {i.engraving && ` · gravação “${i.engraving}”`}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-right text-[18px] font-light text-verde">{formatPrice(o.total_cents)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
