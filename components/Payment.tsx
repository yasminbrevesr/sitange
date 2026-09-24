"use client";

import { useId, useState, type FormEvent } from "react";
import {
  cardBrand,
  createPixCharge,
  formatCardNumber,
  formatExpiry,
  isValidCardNumber,
  isValidExpiry,
  onlyDigits,
  PAYMENTS_ENABLED,
  PaymentsNotConfiguredError,
  payWithCard,
} from "@/lib/payments";
import { formatPrice } from "@/lib/products";
import { STORE } from "@/lib/store";
import { CheckoutStep, optionGroup, optionRow } from "./CheckoutStep";

export type PayMethod = "pix" | "cartao";

const input = "mt-2 min-h-12 w-full rounded-none border border-tinta/30 bg-branco px-4 text-[15px] font-normal focus:border-verde";
const label = "block text-[14px] font-normal";

const NEED_DELIVERY = "Preencha o endereço de entrega antes de pagar.";

function notReady(err: unknown) {
  return err instanceof PaymentsNotConfiguredError
    ? "O pagamento ainda não está ativo. Nenhum dado foi enviado."
    : "Não deu para concluir o pagamento agora. Tente de novo em instantes.";
}

function Option({
  checked,
  onSelect,
  title,
  hint,
  badge,
  children,
}: {
  checked: boolean;
  onSelect: () => void;
  title: string;
  hint: string;
  badge?: string;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={optionRow(checked)}>
        <input id={id} type="radio" name="forma-pagamento" checked={checked} onChange={onSelect} className="h-5 w-5 shrink-0 accent-verde" />
        <span className="flex-1">
          <span className="block text-[15px] text-verde">{title}</span>
          <span className="mt-0.5 block text-[13px] text-tinta/75">{hint}</span>
        </span>
        {badge && <span className="rotulo shrink-0 rounded-full bg-laranja px-3 py-1 text-[10px] text-tinta">{badge}</span>}
      </label>
      {checked && <div className="px-4 pb-6 pt-5 md:px-5">{children}</div>}
    </div>
  );
}

function PixPanel({ amountCents, canPay }: { amountCents: number; canPay: boolean }) {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[15px] text-tinta/80">
        Pague pelo app do seu banco: o QR Code e o código copia e cola aparecem aqui.
      </p>
      <p className="flex items-baseline justify-between border-y border-tinta/10 py-3">
        <span className="rotulo text-[11px]">Total no PIX</span>
        <span className="text-[24px] font-light text-verde">{formatPrice(amountCents)}</span>
      </p>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          if (!canPay) return setMsg(NEED_DELIVERY);
          setBusy(true);
          setMsg("");
          try {
            await createPixCharge(amountCents);
          } catch (err) {
            setMsg(notReady(err));
          } finally {
            setBusy(false);
          }
        }}
        className="rotulo min-h-14 w-full rounded-full bg-verde px-8 text-[11px] text-creme-claro hover:bg-verde-claro disabled:opacity-80"
      >
        {busy ? "Gerando…" : "Gerar PIX"}
      </button>
      {msg && (
        <p role="status" className="text-[14px] text-laranja-tinta">
          {msg}
        </p>
      )}
    </div>
  );
}

function CardPanel({ amountCents, canPay }: { amountCents: number; canPay: boolean }) {
  const id = useId();
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [installments, setInstallments] = useState(1);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const brand = cardBrand(number);
  const maxCvv = brand === "Amex" ? 4 : 3;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!canPay) return setError(NEED_DELIVERY);
    if (!isValidCardNumber(number)) return setError("Confira o número do cartão.");
    if (name.trim().length < 3) return setError("Digite o nome como está no cartão.");
    if (!isValidExpiry(expiry)) return setError("Confira a validade (MM/AA).");
    if (onlyDigits(cvv).length !== maxCvv) return setError(`O CVV tem ${maxCvv} números.`);
    setError("");
    setBusy(true);
    try {
      // Com o gateway ativo, aqui entra o token gerado pelos campos seguros dele (nunca o número do cartão).
      await payWithCard({ cardToken: "", installments, amountCents });
    } catch (err) {
      setMsg(notReady(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor={`${id}-num`} className={label}>
          Número do cartão {brand && <span className="text-tinta/75">· {brand}</span>}
        </label>
        <input
          id={`${id}-num`}
          inputMode="numeric"
          autoComplete="cc-number"
          value={number}
          onChange={(e) => setNumber(formatCardNumber(e.target.value))}
          placeholder="0000 0000 0000 0000"
          className={input}
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={`${id}-nome`} className={label}>
          Nome impresso no cartão
        </label>
        <input id={`${id}-nome`} autoComplete="cc-name" value={name} onChange={(e) => setName(e.target.value.toUpperCase())} className={input} />
      </div>
      <div>
        <label htmlFor={`${id}-val`} className={label}>
          Validade
        </label>
        <input
          id={`${id}-val`}
          inputMode="numeric"
          autoComplete="cc-exp"
          placeholder="MM/AA"
          value={expiry}
          onChange={(e) => setExpiry(formatExpiry(e.target.value))}
          className={input}
        />
      </div>
      <div>
        <label htmlFor={`${id}-cvv`} className={label}>
          CVV
        </label>
        <input
          id={`${id}-cvv`}
          inputMode="numeric"
          autoComplete="cc-csc"
          value={cvv}
          onChange={(e) => setCvv(onlyDigits(e.target.value).slice(0, maxCvv))}
          className={input}
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={`${id}-parc`} className={label}>
          Parcelas
        </label>
        <select id={`${id}-parc`} value={installments} onChange={(e) => setInstallments(Number(e.target.value))} className={input}>
          {Array.from({ length: STORE.maxInstallmentsInterestFree }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n === 1 ? `À vista · ${formatPrice(amountCents)}` : `${n}x de ${formatPrice(Math.round(amountCents / n))} sem juros`}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p role="alert" className="text-[14px] font-normal text-laranja-tinta sm:col-span-2">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="rotulo min-h-14 w-full rounded-full bg-verde px-8 text-[11px] text-creme-claro hover:bg-verde-claro disabled:opacity-80 sm:col-span-2"
      >
        {busy ? "Processando…" : `Pagar ${formatPrice(amountCents)}`}
      </button>
      {msg && (
        <p role="status" className="text-[14px] text-laranja-tinta sm:col-span-2">
          {msg}
        </p>
      )}
    </form>
  );
}

export function Payment({
  method,
  onMethod,
  pixTotalCents,
  cardTotalCents,
  canPay,
}: {
  method: PayMethod;
  onMethod: (m: PayMethod) => void;
  pixTotalCents: number;
  cardTotalCents: number;
  /** false enquanto a entrega não estiver preenchida */
  canPay: boolean;
}) {
  return (
    <CheckoutStep
      n={2}
      id="pagamento-titulo"
      title="Pagamento"
      note={PAYMENTS_ENABLED ? undefined : "Pagamento em configuração: nenhum dado é enviado por enquanto."}
    >
      <div className={optionGroup} role="radiogroup" aria-label="Forma de pagamento">
        <Option
          checked={method === "pix"}
          onSelect={() => onMethod("pix")}
          title="PIX"
          hint="Aprovação na hora."
          badge={`${STORE.pixDiscountPercent}% off`}
        >
          <PixPanel amountCents={pixTotalCents} canPay={canPay} />
        </Option>
        <Option
          checked={method === "cartao"}
          onSelect={() => onMethod("cartao")}
          title="Cartão de crédito"
          hint={`Em até ${STORE.maxInstallmentsInterestFree}x sem juros.`}
        >
          <CardPanel amountCents={cardTotalCents} canPay={canPay} />
        </Option>
      </div>
    </CheckoutStep>
  );
}
