"use client";

import { useId } from "react";
import { STORE } from "@/lib/store";
import { CardPanel } from "./CardPanel";
import { PixPanel } from "./PixPanel";
import type { ShippingSelection } from "./Shipping";
import { CheckoutStep, optionGroup, optionRow, optHint, optRadio, optTitle } from "./CheckoutStep";

export type PayMethod = "pix" | "cartao";

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
      <label htmlFor={id} data-on={checked} className={optionRow(checked)}>
        <input id={id} type="radio" name="forma-pagamento" checked={checked} onChange={onSelect} className={optRadio} />
        <span className="flex-1">
          <span className={`block text-[15px] ${optTitle}`}>{title}</span>
          <span className={`mt-0.5 block text-[13px] ${optHint}`}>{hint}</span>
        </span>
        {badge && <span className="rotulo shrink-0 rounded-full bg-laranja px-3 py-1 text-[10px] text-tinta">{badge}</span>}
      </label>
      {checked && <div className="px-4 pb-6 pt-5 md:px-5">{children}</div>}
    </div>
  );
}

export function Payment({
  method,
  onMethod,
  pixTotalCents,
  cardTotalCents,
  couponCode,
  shipping,
}: {
  method: PayMethod;
  onMethod: (m: PayMethod) => void;
  pixTotalCents: number;
  cardTotalCents: number;
  /** Cupom aplicado na sacola (conferido de novo no servidor) */
  couponCode: string | null;
  /** Entrega escolhida; null enquanto falta endereço ou frete */
  shipping: ShippingSelection | null;
}) {
  return (
    <CheckoutStep
      n={2}
      id="pagamento-titulo"
      title="Pagamento"
    >
      <div className={optionGroup} role="radiogroup" aria-label="Forma de pagamento">
        <Option
          checked={method === "pix"}
          onSelect={() => onMethod("pix")}
          title="PIX"
          hint="Aprovação na hora."
          badge={`${STORE.pixDiscountPercent}% off`}
        >
          <PixPanel amountCents={pixTotalCents} shipping={shipping} couponCode={couponCode} />
        </Option>
        <Option
          checked={method === "cartao"}
          onSelect={() => onMethod("cartao")}
          title="Cartão de crédito"
          hint={`Em até ${STORE.maxInstallmentsInterestFree}x sem juros.`}
        >
          <CardPanel amountCents={cardTotalCents} shipping={shipping} couponCode={couponCode} />
        </Option>
      </div>
    </CheckoutStep>
  );
}
