"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { COUPON_CODE, saveLead } from "@/lib/leads";
import { MISSING } from "@/lib/products";

const STORAGE_KEY = "tange:popup-cupom";
const REOPEN_AFTER_DAYS = 7;
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const COUNTRIES = [
  { code: "BR", dial: "+55", label: "Brasil" },
  { code: "PT", dial: "+351", label: "Portugal" },
  { code: "US", dial: "+1", label: "Estados Unidos" },
];

// Mostra o popup só para quem ainda não se inscreveu nem fechou nos últimos 7 dias.
function shouldOpen(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return true;
    const saved = JSON.parse(raw) as { status: "fechado" | "inscrito"; at: number };
    if (saved.status === "inscrito") return false;
    return Date.now() - saved.at > REOPEN_AFTER_DAYS * 864e5;
  } catch {
    return true;
  }
}

function remember(status: "fechado" | "inscrito") {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ status, at: Date.now() }));
  } catch {
    // sem armazenamento: o popup pode aparecer de novo na próxima visita
  }
}

function formatBrPhone(digits: string): string {
  const d = digits.slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function BrazilFlag() {
  return (
    <svg viewBox="0 0 28 20" className="h-5 w-7 shrink-0" aria-hidden="true">
      <rect width="28" height="20" rx="2" fill="#009B3A" />
      <path d="M14 3 L25 10 L14 17 L3 10 Z" fill="#FEDF00" />
      <circle cx="14" cy="10" r="4.2" fill="#002776" />
    </svg>
  );
}

export function CouponPopup() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [country, setCountry] = useState("BR");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !shouldOpen()) return;
    dialog.showModal();
    dialog.focus(); // foco no popup, não no botão fechar

  }, []);

  function close() {
    if (!done) remember("fechado");
    dialogRef.current?.close();
  }

  const dial = COUNTRIES.find((c) => c.code === country)!.dial;
  const digits = phone.replace(/\D/g, "");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Confira o e-mail.");
      return;
    }
    const phoneOk = country === "BR" ? digits.length >= 10 && digits.length <= 11 : digits.length >= 6;
    if (!phoneOk) {
      setError("Confira o telefone, com DDD.");
      return;
    }
    setError("");
    setSending(true);
    try {
      await saveLead({
        email: email.trim().toLowerCase(),
        phone: `${dial}${digits}`,
        source: "popup-cupom-10",
        consent: true,
        createdAt: new Date().toISOString(),
      });
      remember("inscrito");
      setDone(true);
    } catch {
      setError("Não deu para enviar agora. Tente de novo em instantes.");
    } finally {
      setSending(false);
    }
  }

  const field = "rounded-[6px] border border-tinta/30 bg-branco focus-within:border-verde";

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={`${id}-titulo`}
      tabIndex={-1}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) close(); // clique fora do cartão
      }}
      className="m-auto w-[calc(100%-32px)] outline-none max-w-[640px] overflow-hidden rounded-[10px] bg-creme-claro p-0 text-tinta backdrop:bg-[#121212b3]"
    >
      <div className="grid md:grid-cols-2">
        <div className="relative h-44 bg-creme-base md:h-auto md:min-h-[450px]">
          <img
            src={`${base}/produtos/curva-encaixadas.webp`}
            alt="Anel Curva em prata polida, com as duas partes encaixadas"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <p className="absolute bottom-16 left-6 right-6 hidden text-[24px] font-light leading-[1.2] text-creme-claro md:block">
            Toda peça é duas.
          </p>
        </div>

        <div className="relative px-6 pb-6 pt-12 text-center md:px-8">
          <button
            type="button"
            onClick={close}
            aria-label="Fechar"
            className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center text-tinta"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M5 5 L19 19 M19 5 L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {done ? (
            <div aria-live="polite">
              <h2 id={`${id}-titulo`} className="text-[22px] font-semibold leading-[1.2] text-verde">
                Pronto. Seu cupom:
              </h2>
              <p className="mt-6 rounded-[6px] border border-dashed border-verde bg-branco px-4 py-4 text-[20px] font-semibold tracking-[0.12em] text-verde">
                {COUPON_CODE ?? MISSING}
              </p>
              <p className="mt-4 text-[14px] leading-[1.6] text-verde">
                Use no fechamento do seu primeiro pedido para ter 10% OFF.
              </p>
              <button
                type="button"
                onClick={close}
                className="mt-6 min-h-12 w-full rounded-[6px] bg-verde px-6 text-[15px] font-medium text-creme-claro hover:bg-verde-claro"
              >
                Ver as peças
              </button>
            </div>
          ) : (
            <>
              <h2 id={`${id}-titulo`} className="text-[22px] font-semibold leading-[1.2] text-verde">
                10% OFF no seu primeiro pedido
              </h2>
              <p className="mt-3 text-[14px] leading-[1.6] text-verde">
                Preencha as informações abaixo para receber o seu desconto de primeira compra
              </p>

              <form onSubmit={onSubmit} noValidate className="mt-8 space-y-3 text-left">
                <div className={`${field} px-4 py-2`}>
                  <label htmlFor={`${id}-email`} className="block text-[12px] text-tinta/75">
                    E-mail
                  </label>
                  <input
                    id={`${id}-email`}
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full bg-transparent py-1 text-[15px] font-normal outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <div className={`${field} relative flex w-[92px] shrink-0 items-center gap-2 px-3`}>
                    {country === "BR" ? (
                      <BrazilFlag />
                    ) : (
                      <span className="text-[14px] font-medium">{country}</span>
                    )}
                    <label htmlFor={`${id}-pais`} className="sr-only">
                      País do telefone
                    </label>
                    <select
                      id={`${id}-pais`}
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="absolute inset-0 min-h-12 w-full cursor-pointer opacity-0"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label} ({c.dial})
                        </option>
                      ))}
                    </select>
                    <svg viewBox="0 0 12 12" className="ml-auto h-3 w-3" aria-hidden="true">
                      <path d="M2 4 L6 8 L10 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <div className={`${field} flex-1 px-4 py-2`}>
                    <label htmlFor={`${id}-tel`} className="block text-[12px] text-tinta/75">
                      Telefone
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[15px] font-normal" aria-hidden="true">
                        {dial}
                      </span>
                      <input
                        id={`${id}-tel`}
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        required
                        value={country === "BR" ? formatBrPhone(digits) : phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="block w-full min-w-0 bg-transparent py-1 text-[15px] font-normal outline-none"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <p role="alert" className="text-center text-[14px] font-normal text-laranja-tinta">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="min-h-12 w-full rounded-[6px] bg-verde px-6 text-[15px] font-medium text-creme-claro hover:bg-verde-claro disabled:opacity-80"
                >
                  {sending ? "Enviando…" : "Quero meus 10% OFF"}
                </button>
              </form>

              <p className="mt-4 text-[11px] leading-[1.5] text-verde">
                Ao se inscrever, você concorda em receber e-mails de marketing, mensagens de texto e pelo WhatsApp.
              </p>
            </>
          )}
        </div>
      </div>
    </dialog>
  );
}
