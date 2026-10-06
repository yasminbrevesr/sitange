"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { useSession } from "@/lib/auth";
import { COUPON_STORAGE_KEY, validateCoupon, type Coupon } from "@/lib/coupons";

// Campo de cupom do cartão "Seu pedido" (fundo verde).
// Se a pessoa pegou o cupom no pop-up, ele já vem preenchido e aplicado.
export function CouponField({ coupon, onChange }: { coupon: Coupon | null; onChange: (c: Coupon | null) => void }) {
  const id = useId();
  const session = useSession();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function apply(value: string, silent = false) {
    setError("");
    if (!value.trim()) return;
    setBusy(true);
    try {
      const c = await validateCoupon(value);
      onChange(c);
      setCode("");
      try {
        localStorage.setItem(COUPON_STORAGE_KEY, c.code);
      } catch {
        // sem armazenamento: o cupom vale só nesta visita
      }
    } catch (e) {
      if (!silent) setError(e instanceof Error ? e.message : "Não deu para conferir o cupom agora.");
      else setCode(value);
    } finally {
      setBusy(false);
    }
  }

  function remove() {
    onChange(null);
    try {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    } catch {
      // nada a fazer
    }
  }

  // Aplica o cupom guardado (pop-up) quando a sessão já foi verificada,
  // para a regra de "primeira compra" valer para quem está logado.
  useEffect(() => {
    if (session === undefined || coupon) return;
    let saved = "";
    try {
      saved = localStorage.getItem(COUPON_STORAGE_KEY) ?? "";
    } catch {
      saved = "";
    }
    if (saved) apply(saved, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session === undefined]);

  if (coupon) {
    return (
      <div className="flex items-center justify-between gap-3 border border-dashed border-creme-claro/50 px-3 py-2.5 text-[14px]">
        <span>
          Cupom <strong className="font-medium tracking-[0.06em]">{coupon.code}</strong> · {coupon.percent}% off nas peças
        </span>
        <button type="button" onClick={remove} className="min-h-9 shrink-0 text-[13px] underline underline-offset-4 hover:text-laranja">
          Remover
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        apply(code);
      }}
      noValidate
    >
      <label htmlFor={`${id}-cupom`} className="block text-[14px] text-creme-claro/85">
        Cupom de desconto
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id={`${id}-cupom`}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s/g, ""))}
          autoComplete="off"
          aria-describedby={error ? `${id}-erro` : undefined}
          className="min-h-12 min-w-0 flex-1 border border-creme-claro/40 bg-branco px-3 text-[15px] tracking-[0.06em] text-tinta"
        />
        <button
          type="submit"
          disabled={busy || !code}
          className="rotulo min-h-12 shrink-0 rounded-full bg-laranja px-5 text-[10px] text-tinta hover:bg-creme-claro disabled:opacity-70"
        >
          {busy ? "Conferindo…" : "Aplicar"}
        </button>
      </div>
      {error && (
        <p id={`${id}-erro`} role="alert" className="mt-2 bg-creme-claro px-3 py-2 text-[13px] text-laranja-tinta">
          {error}
        </p>
      )}
    </form>
  );
}
