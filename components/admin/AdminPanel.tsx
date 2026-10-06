"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";
import { advanceOrder, isAdmin, listAdminOrders, type AdminOrder } from "@/lib/admin";
import { useSession } from "@/lib/auth";
import { formatCep, formatCpf, formatPhone } from "@/lib/format";
import { STATUS_LABEL, type OrderStatus } from "@/lib/orders";
import { formatPrice } from "@/lib/products";
import { Symbol } from "../Symbol";

const TABS: { id: string; label: string; statuses: OrderStatus[] }[] = [
  { id: "produzir", label: "A produzir", statuses: ["pago"] },
  { id: "producao", label: "Em produção", statuses: ["em_producao"] },
  { id: "enviados", label: "Enviados", statuses: ["enviado"] },
  { id: "entregues", label: "Entregues", statuses: ["entregue"] },
  { id: "aguardando", label: "Aguardando pagamento", statuses: ["aguardando_pagamento"] },
  { id: "todos", label: "Todos", statuses: [] },
];

const PILL: Record<OrderStatus, string> = {
  aguardando_pagamento: "bg-creme-claro text-tinta",
  pago: "bg-laranja text-tinta",
  em_producao: "bg-verde text-creme-claro",
  enviado: "bg-verde text-creme-claro",
  entregue: "border border-verde text-verde",
  cancelado: "border border-tinta/30 text-tinta/80",
  expirado: "border border-tinta/30 text-tinta/80",
};

const btn = "rotulo inline-flex min-h-12 items-center justify-center rounded-full px-6 text-[10px] disabled:opacity-70";

const dateTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

function addressText(o: AdminOrder) {
  const a = o.shipping_address;
  return [
    a.recipient,
    `${a.street}, ${a.number}${a.complement ? ` - ${a.complement}` : ""}`,
    `${a.district} - ${a.city}/${a.state}`,
    `CEP ${formatCep(a.cep)}`,
  ].join("\n");
}

function OrderCard({ o, onChanged }: { o: AdminOrder; onChanged: () => void }) {
  const id = useId();
  const [tracking, setTracking] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function advance(status: "em_producao" | "enviado" | "entregue") {
    setError("");
    setBusy(true);
    try {
      await advanceOrder(o.id, status, status === "enviado" ? tracking : undefined);
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não deu para atualizar o pedido agora.");
    } finally {
      setBusy(false);
    }
  }

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(addressText(o));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  const a = o.shipping_address;
  return (
    <li className="border border-tinta/15 bg-branco">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-tinta/10 px-5 py-4 md:px-6">
        <div>
          <h2 className="text-[20px] font-light text-verde">Pedido nº {o.number}</h2>
          <p className="text-[13px] text-tinta/75">Feito em {dateTime(o.created_at)}{o.paid_at && ` · pago em ${dateTime(o.paid_at)}`}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`rotulo rounded-full px-3 py-1 text-[10px] ${PILL[o.status]}`}>{STATUS_LABEL[o.status]}</span>
          <span className="text-[20px] font-light">{formatPrice(o.total_cents)}</span>
        </div>
      </div>

      <div className="grid gap-6 px-5 py-5 md:grid-cols-3 md:px-6">
        <section>
          <h3 className="rotulo text-[10px] text-tinta/75">Peças</h3>
          <ul className="mt-2 flex flex-col gap-3">
            {o.items.map((i, n) => (
              <li key={n} className="bg-creme-claro px-3 py-2.5">
                <p className="text-[16px] text-verde">{i.name}</p>
                <p className="text-[15px]">
                  {i.sizes.length === 2 ? (
                    <>Aros <strong>{i.sizes[0]}</strong> e <strong>{i.sizes[1]}</strong></>
                  ) : (
                    <>Aro <strong>{i.sizes[0]}</strong></>
                  )}
                </p>
                <p className="text-[14px] text-tinta/80">
                  Gravação: {i.engraving ? <strong className="text-tinta">“{i.engraving}”</strong> : "sem gravação"}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="rotulo text-[10px] text-tinta/75">Entrega</h3>
          <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed">{addressText(o)}</p>
          <button
            type="button"
            onClick={copyAddress}
            className="mt-2 min-h-11 text-[13px] text-verde underline underline-offset-4"
          >
            {copied ? "Endereço copiado" : "Copiar endereço"}
          </button>
          <p className="mt-2 text-[14px] text-tinta/80">
            {o.shipping_service}
            {o.shipping_days ? ` · até ${o.shipping_days} dias úteis` : ""} · frete{" "}
            {o.shipping_cents === 0 ? "grátis" : formatPrice(o.shipping_cents)}
          </p>
          {o.tracking_code && (
            <p className="mt-1 text-[14px]">
              Rastreio: <strong>{o.tracking_code}</strong>
            </p>
          )}
        </section>

        <section>
          <h3 className="rotulo text-[10px] text-tinta/75">Cliente</h3>
          <dl className="mt-2 flex flex-col gap-1 text-[14px]">
            <div><dt className="sr-only">Nome</dt><dd>{o.customer_name || a.recipient}</dd></div>
            {o.customer_email && <div><dt className="sr-only">E-mail</dt><dd className="break-all text-tinta/80">{o.customer_email}</dd></div>}
            {o.customer_phone && <div><dt className="sr-only">Telefone</dt><dd className="text-tinta/80">{formatPhone(o.customer_phone.replace(/^\+55/, ""))}</dd></div>}
            {o.customer_cpf && <div><dt className="inline text-tinta/75">CPF </dt><dd className="inline">{formatCpf(o.customer_cpf)}</dd></div>}
          </dl>
          <p className="mt-3 text-[13px] text-tinta/75">
            Peças {formatPrice(o.subtotal_cents)}
            {o.coupon_cents > 0 && ` · cupom ${o.coupon_code} − ${formatPrice(o.coupon_cents)}`}
            {o.discount_cents > 0 && ` · desconto ${o.payment_method === "pix" ? "PIX " : ""}− ${formatPrice(o.discount_cents)}`}
          </p>
        </section>
      </div>

      {(o.status === "pago" || o.status === "em_producao" || o.status === "enviado") && (
        <div className="flex flex-col gap-3 border-t border-tinta/10 bg-creme-claro/50 px-5 py-4 md:px-6">
          {o.status === "pago" && (
            <button type="button" disabled={busy} onClick={() => advance("em_producao")} className={`${btn} self-start bg-laranja text-tinta hover:bg-verde hover:text-creme-claro`}>
              {busy ? "Salvando…" : "Iniciar produção"}
            </button>
          )}
          {o.status === "em_producao" && (
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[220px] flex-1">
                <label htmlFor={`${id}-rastreio`} className="block text-[14px]">
                  Código de rastreio
                </label>
                <input
                  id={`${id}-rastreio`}
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value.toUpperCase().replace(/\s/g, ""))}
                  placeholder="Ex.: QB123456789BR"
                  className="mt-2 min-h-12 w-full border border-tinta/30 bg-branco px-4 text-[15px] focus:border-verde"
                />
              </div>
              <button type="button" disabled={busy} onClick={() => advance("enviado")} className={`${btn} bg-laranja text-tinta hover:bg-verde hover:text-creme-claro`}>
                {busy ? "Salvando…" : "Marcar como enviado"}
              </button>
            </div>
          )}
          {o.status === "enviado" && (
            <button type="button" disabled={busy} onClick={() => advance("entregue")} className={`${btn} self-start bg-verde text-creme-claro hover:bg-verde-claro`}>
              {busy ? "Salvando…" : "Marcar como entregue"}
            </button>
          )}
          {error && <p role="alert" className="text-[14px] text-laranja-tinta">{error}</p>}
        </div>
      )}
    </li>
  );
}

// Painel da loja: pedidos por etapa, com tudo o que é preciso para produzir e despachar.
export function AdminPanel() {
  const session = useSession();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState("produzir");

  const userId = session?.user.id;
  const load = useCallback(() => {
    setError(false);
    listAdminOrders()
      .then(setOrders)
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    if (!userId) return;
    isAdmin().then((ok) => {
      setAllowed(ok);
      if (ok) load();
    });
  }, [userId, load]);

  const current = TABS.find((t) => t.id === tab)!;
  const visible = (orders ?? []).filter((o) => current.statuses.length === 0 || current.statuses.includes(o.status));
  const count = (t: (typeof TABS)[number]) =>
    (orders ?? []).filter((o) => t.statuses.length === 0 || t.statuses.includes(o.status)).length;

  return (
    <div className="min-h-screen bg-branco">
      <header className="bg-verde text-creme-claro">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-4 md:px-10">
          <Link href="/" className="flex min-h-11 items-center gap-2.5" aria-label="TANGÈ, página inicial">
            <Symbol className="h-6 w-6" decorative />
            <span className="text-[18px] font-medium uppercase tracking-[0.34em]">Tangè</span>
          </Link>
          <p className="rotulo text-[10px] text-creme-claro/85">Painel da loja</p>
        </div>
      </header>

      <main id="conteudo" className="mx-auto max-w-[1280px] px-4 py-8 md:px-10 md:py-12">
        {session === undefined || (session && allowed === null) ? (
          <p role="status" className="py-24 text-center text-[15px] text-tinta/75">Carregando…</p>
        ) : !session ? (
          <div className="flex flex-col items-start gap-4 py-12">
            <p className="text-[16px]">Entre com a conta de administrador para ver os pedidos.</p>
            <Link href="/entrar?voltar=/admin/" className={`${btn} bg-laranja text-tinta`}>Entrar</Link>
          </div>
        ) : !allowed ? (
          <p className="py-24 text-center text-[16px]">Acesso restrito. Esta conta não é de administrador da loja.</p>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h1 className="display text-[38px] text-verde md:text-[46px]">
                Pedidos<span className="text-laranja" aria-hidden="true">.</span>
              </h1>
              <button type="button" onClick={load} className="min-h-11 text-[14px] text-verde underline underline-offset-4">
                Atualizar lista
              </button>
            </div>

            <div className="mt-6 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Etapas">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={`rotulo min-h-11 shrink-0 rounded-full px-4 text-[10px] ${
                    tab === t.id ? "bg-verde text-creme-claro" : "border border-tinta/20 bg-branco text-tinta hover:border-verde"
                  }`}
                >
                  {t.label} ({count(t)})
                </button>
              ))}
            </div>

            <div className="mt-6" role="tabpanel">
              {error && <p role="alert" className="text-[14px] text-laranja-tinta">Não deu para carregar os pedidos agora.</p>}
              {orders === null && !error && <p className="text-[14px] text-tinta/75">Carregando pedidos…</p>}
              {orders && visible.length === 0 && (
                <p className="border border-dashed border-tinta/25 bg-branco px-5 py-8 text-center text-[15px] text-tinta/75">
                  Nenhum pedido nesta etapa.
                </p>
              )}
              <ul className="flex flex-col gap-4">
                {visible.map((o) => (
                  <OrderCard key={o.id} o={o} onChanged={load} />
                ))}
              </ul>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
