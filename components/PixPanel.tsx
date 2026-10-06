"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { getProfile } from "@/lib/account";
import { useSession } from "@/lib/auth";
import { formatCpf, isValidCpf, onlyDigits } from "@/lib/format";
import { OrderError, createPixOrder, getOrderStatus, type OrderStatus, type PixOrder } from "@/lib/orders";
import { formatPrice } from "@/lib/products";
import { useCart } from "./CartProvider";
import type { ShippingSelection } from "./Shipping";

const button =
  "rotulo min-h-14 w-full rounded-full bg-laranja px-8 text-[11px] text-tinta hover:bg-verde hover:text-creme-claro disabled:opacity-80";

// PIX na sacola: gera o QR Code pelo servidor, mostra o copia e cola e acompanha o pagamento.
export function PixPanel({ amountCents, shipping }: { amountCents: number; shipping: ShippingSelection | null }) {
  const id = useId();
  const session = useSession();
  const router = useRouter();
  const { items, clear } = useCart();
  const [needCpf, setNeedCpf] = useState(false);
  const [cpf, setCpf] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [pix, setPix] = useState<PixOrder | null>(null);
  const [status, setStatus] = useState<OrderStatus>("aguardando_pagamento");
  const [copied, setCopied] = useState(false);

  // O Mercado Pago pede o CPF de quem paga: se não estiver em "Meus dados", pedimos aqui.
  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) return;
    getProfile()
      .then((p) => setNeedCpf(!p?.cpf || !isValidCpf(p.cpf)))
      .catch(() => setNeedCpf(true));
  }, [userId]);

  // Enquanto o PIX está na tela, confere a cada 5 segundos se o pagamento caiu.
  useEffect(() => {
    if (!pix || status !== "aguardando_pagamento") return;
    const t = setInterval(async () => {
      const s = await getOrderStatus(pix.pedidoId).catch(() => null);
      if (s && s !== "aguardando_pagamento") setStatus(s);
    }, 5000);
    return () => clearInterval(t);
  }, [pix, status]);

  useEffect(() => {
    if (status !== "pago" || !pix) return;
    clear();
    router.push(`/minha-conta/?pago=${pix.numero}`);
  }, [status, pix, clear, router]);

  async function generate() {
    setMsg("");
    if (!shipping) return setMsg("Preencha o endereço de entrega e escolha o frete antes de pagar.");
    if (needCpf && !isValidCpf(cpf)) return setMsg("Informe um CPF válido.");
    setBusy(true);
    try {
      const order = await createPixOrder({
        items,
        address: shipping.address,
        serviceId: shipping.serviceId,
        cpf: needCpf ? onlyDigits(cpf) : undefined,
      });
      setStatus("aguardando_pagamento");
      setPix(order);
      setNeedCpf(false);
    } catch (err) {
      setMsg(err instanceof OrderError ? err.message : "Não deu para gerar o PIX agora. Tente de novo em instantes.");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!pix) return;
    try {
      await navigator.clipboard.writeText(pix.copiaECola);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(false);
    }
  }

  if (session === null) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-[15px] text-tinta/80">Para pagar, entre na sua conta ou crie uma. Sua sacola continua aqui.</p>
        <Link href="/entrar?voltar=/sacola/" className={`${button} flex items-center justify-center`}>
          Entrar para pagar
        </Link>
      </div>
    );
  }

  if (pix) {
    const expira = new Date(pix.expiraEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    if (status === "expirado" || status === "cancelado") {
      return (
        <div className="flex flex-col gap-4">
          <p role="alert" className="text-[15px] text-laranja-tinta">
            {status === "expirado" ? "Esse PIX expirou." : "Esse PIX foi cancelado."} Gere um novo para pagar.
          </p>
          <button type="button" className={button} onClick={() => setPix(null)}>
            Gerar novo PIX
          </button>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-5">
        <p className="flex items-baseline justify-between border-b border-tinta/10 pb-3">
          <span className="rotulo text-[11px]">Pedido nº {pix.numero}</span>
          <span className="text-[24px] font-light text-verde">{formatPrice(pix.totalCents)}</span>
        </p>
        <ol className="flex list-decimal flex-col gap-1 pl-5 text-[14px] text-tinta/80">
          <li>Abra o app do seu banco e escolha pagar com PIX.</li>
          <li>Aponte a câmera para o QR Code ou cole o código abaixo.</li>
          <li>Confirme o pagamento. Esta tela atualiza sozinha.</li>
        </ol>
        {pix.qrBase64 && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`data:image/png;base64,${pix.qrBase64}`}
            alt="QR Code do PIX"
            className="mx-auto h-56 w-56 border border-tinta/10"
          />
        )}
        <div>
          <label htmlFor={`${id}-pix`} className="block text-[14px]">
            PIX copia e cola
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id={`${id}-pix`}
              readOnly
              value={pix.copiaECola}
              onFocus={(e) => e.target.select()}
              className="min-h-12 min-w-0 flex-1 border border-tinta/30 bg-branco px-3 text-[13px]"
            />
            <button
              type="button"
              onClick={copy}
              className="rotulo min-h-12 shrink-0 bg-verde px-5 text-[10px] text-creme-claro hover:bg-verde-claro"
            >
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
        </div>
        <p role="status" className="flex items-center gap-2 bg-creme-claro px-4 py-3 text-[14px] text-tinta">
          <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-laranja" aria-hidden="true" />
          Aguardando pagamento. O código vale até {expira}.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[15px] text-tinta/80">Pague pelo app do seu banco: o QR Code e o código copia e cola aparecem aqui.</p>
      {needCpf && (
        <div>
          <label htmlFor={`${id}-cpf`} className="block text-[14px]">
            CPF de quem paga
          </label>
          <input
            id={`${id}-cpf`}
            inputMode="numeric"
            value={cpf}
            onChange={(e) => setCpf(formatCpf(e.target.value))}
            placeholder="000.000.000-00"
            className="mt-2 min-h-12 w-full border border-tinta/30 bg-branco px-4 text-[15px] focus:border-verde"
          />
          <p className="mt-1 text-[13px] text-tinta/75">O Mercado Pago pede o CPF para gerar o PIX. Ele fica salvo em Meus dados.</p>
        </div>
      )}
      <p className="flex items-baseline justify-between border-y border-tinta/10 py-3">
        <span className="rotulo text-[11px]">Total no PIX</span>
        <span className="text-[24px] font-light text-verde">{formatPrice(amountCents)}</span>
      </p>
      <button type="button" disabled={busy || session === undefined} onClick={generate} className={button}>
        {busy ? "Gerando PIX…" : "Gerar PIX"}
      </button>
      {msg && (
        <p role="alert" className="text-[14px] text-laranja-tinta">
          {msg}
        </p>
      )}
    </div>
  );
}
