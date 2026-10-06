"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { useSession } from "@/lib/auth";
import { formatCep } from "@/lib/format";
import { STATUS_LABEL, TRACKING_URL, displayStatus, listOrders, type Order } from "@/lib/orders";
import { formatPrice } from "@/lib/products";

const STATUS_STYLE: Record<Order["status"], string> = {
  aguardando_pagamento: "bg-creme-claro text-tinta",
  pago: "bg-verde text-creme-claro",
  em_producao: "bg-verde text-creme-claro",
  enviado: "bg-laranja text-tinta",
  entregue: "bg-verde text-creme-claro",
  cancelado: "border border-tinta/30 text-tinta/80",
  expirado: "border border-tinta/30 text-tinta/80",
};

const STEPS = ["pago", "em_producao", "enviado", "entregue"] as const;

const sizesText = (sizes: number[]) => (sizes.length === 2 ? `aros ${sizes[0]} e ${sizes[1]}` : `aro ${sizes[0]}`);

// Um pedido: o resumo abre e fecha os detalhes (etapas, entrega, valores e, se ainda der, o PIX para pagar).
function OrderCard({ o }: { o: Order }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const status = displayStatus(o);
  const step = STEPS.indexOf(status as (typeof STEPS)[number]);
  const a = o.shipping_address;
  const pixOpen = status === "aguardando_pagamento" && !!o.pix_qr_code;

  async function copy() {
    if (!o.pix_qr_code) return;
    try {
      await navigator.clipboard.writeText(o.pix_qr_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <li className="border border-tinta/10">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-detalhes`}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full flex-col gap-4 p-5 text-left hover:bg-creme-claro/40 md:p-6"
      >
        <span className="flex w-full flex-wrap items-center justify-between gap-3">
          <span>
            <span className="block text-[17px] text-verde">Pedido nº {o.number}</span>
            <span className="block text-[13px] text-tinta/75">
              {new Date(o.created_at).toLocaleDateString("pt-BR")} · {o.payment_method === "pix" ? "PIX" : "Cartão"} · {o.shipping_service}
            </span>
          </span>
          <span className="flex items-center gap-3">
            <span className={`rotulo rounded-full px-3 py-1 text-[10px] ${STATUS_STYLE[status]}`}>{STATUS_LABEL[status]}</span>
            <svg viewBox="0 0 24 24" className={`h-5 w-5 text-verde transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true">
              <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </span>
        <span className="flex w-full items-end justify-between gap-4 border-t border-tinta/10 pt-4 text-[14px] text-tinta/80">
          <span>{o.items.map((i) => `${i.name} · ${sizesText(i.sizes)}`).join(" / ")}</span>
          <span className="shrink-0 text-[18px] font-light text-verde">{formatPrice(o.total_cents)}</span>
        </span>
      </button>

      {open && (
        <div id={`${id}-detalhes`} className="flex flex-col gap-6 border-t border-tinta/10 px-5 pb-6 pt-5 md:px-6">
          {pixOpen && (
            <section className="flex flex-col gap-4 bg-creme-claro p-4 md:p-5">
              <h3 className="rotulo text-[11px]">Pague com PIX</h3>
              <p className="text-[14px] text-tinta/80">
                Abra o app do seu banco, escolha pagar com PIX e aponte a câmera para o QR Code ou cole o código.
                {o.pix_expires_at &&
                  ` Vale até ${new Date(o.pix_expires_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.`}
              </p>
              {o.pix_qr_base64 && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`data:image/png;base64,${o.pix_qr_base64}`} alt="QR Code do PIX" className="h-48 w-48 border border-tinta/10 bg-branco" />
              )}
              <div className="flex gap-2">
                <label htmlFor={`${id}-pix`} className="sr-only">PIX copia e cola</label>
                <input id={`${id}-pix`} readOnly value={o.pix_qr_code ?? ""} onFocus={(e) => e.target.select()} className="min-h-12 min-w-0 flex-1 border border-tinta/30 bg-branco px-3 text-[13px]" />
                <button type="button" onClick={copy} className="rotulo min-h-12 shrink-0 bg-verde px-5 text-[10px] text-creme-claro hover:bg-verde-claro">
                  {copied ? "Copiado" : "Copiar"}
                </button>
              </div>
            </section>
          )}
          {status === "expirado" && (
            <p className="text-[14px] text-tinta/80">
              O prazo deste PIX acabou e nada foi cobrado. Para comprar, monte a sacola de novo e gere um novo PIX.
            </p>
          )}

          {step >= 0 && (
            <ol className="grid grid-cols-4 gap-2" aria-label="Andamento do pedido">
              {STEPS.map((st, n) => (
                <li key={st} className="flex flex-col gap-2">
                  <span className={`h-1.5 ${n <= step ? "bg-verde" : "bg-tinta/15"}`} aria-hidden="true" />
                  <span className={`text-[12px] ${n <= step ? "text-verde" : "text-tinta/60"}`}>
                    {STATUS_LABEL[st]}
                    <span className="sr-only">{n <= step ? " (concluído)" : " (a seguir)"}</span>
                  </span>
                </li>
              ))}
            </ol>
          )}

          {o.tracking_code && (
            <p className="text-[14px] text-tinta/80">
              Rastreio: <strong className="font-medium text-tinta">{o.tracking_code}</strong> ·{" "}
              <a href={TRACKING_URL} target="_blank" rel="noopener noreferrer" className="text-verde underline underline-offset-4">
                acompanhar nos Correios
              </a>
            </p>
          )}

          <div className="grid gap-6 md:grid-cols-3">
            <section>
              <h3 className="rotulo text-[10px] text-tinta/75">Peças</h3>
              <ul className="mt-2 flex flex-col gap-2 text-[14px]">
                {o.items.map((i, n) => (
                  <li key={n}>
                    <span className="text-verde">{i.name}</span> · {sizesText(i.sizes)}
                    {i.engraving && <> · gravação “{i.engraving}”</>}
                    <span className="block text-tinta/75">{formatPrice(i.priceCents)}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h3 className="rotulo text-[10px] text-tinta/75">Entrega</h3>
              {a && (
                <p className="mt-2 text-[14px] leading-relaxed">
                  {a.recipient}
                  <br />
                  {a.street}, {a.number}
                  {a.complement ? ` - ${a.complement}` : ""}
                  <br />
                  {a.district} - {a.city}/{a.state}
                  <br />
                  CEP {formatCep(a.cep)}
                </p>
              )}
              <p className="mt-2 text-[13px] text-tinta/75">
                {o.shipping_service}
                {o.shipping_days ? ` · entrega em até ${o.shipping_days} dias úteis depois da produção` : ""}
              </p>
            </section>
            <section>
              <h3 className="rotulo text-[10px] text-tinta/75">Valores</h3>
              <dl className="mt-2 flex flex-col gap-1 text-[14px]">
                <div className="flex justify-between gap-4"><dt className="text-tinta/80">Peças</dt><dd>{formatPrice(o.subtotal_cents)}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-tinta/80">Frete</dt><dd>{o.shipping_cents === 0 ? "Grátis" : formatPrice(o.shipping_cents)}</dd></div>
                {o.discount_cents > 0 && (
                  <div className="flex justify-between gap-4"><dt className="text-tinta/80">Desconto PIX</dt><dd>− {formatPrice(o.discount_cents)}</dd></div>
                )}
                <div className="mt-1 flex justify-between gap-4 border-t border-tinta/10 pt-2"><dt className="font-medium">Total</dt><dd className="font-medium text-verde">{formatPrice(o.total_cents)}</dd></div>
              </dl>
            </section>
          </div>
        </div>
      )}
    </li>
  );
}

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
            <OrderCard key={o.id} o={o} />
          ))}
        </ul>
      )}
    </div>
  );
}
