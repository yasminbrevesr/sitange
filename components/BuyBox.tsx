"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { FAMILIES, formatPrice, type Product } from "@/lib/products";
import { useCart } from "./CartProvider";

export function BuyBox({ product }: { product: Product }) {
  const { add } = useCart();
  const id = useId();
  const twoSizes = product.family === "para-dois";
  const sizeFields = twoSizes
    ? [
        { key: "maior", label: "Aro da parte maior" },
        { key: "menor", label: "Aro da parte menor" },
      ]
    : [{ key: "unico", label: "Aro" }];

  const [sizes, setSizes] = useState<Record<string, string>>({});
  const [engraving, setEngraving] = useState("");
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  const installment = formatPrice(Math.round(product.priceCents / product.maxInstallments));

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const chosen = sizeFields.map((f) => sizes[f.key]);
    if (chosen.some((s) => !s)) {
      setError(twoSizes ? "Escolha o aro das duas partes." : "Escolha o aro.");
      setAdded(false);
      return;
    }
    add({ productId: product.id, sizes: chosen.map(Number), engraving: engraving.trim() });
    setError("");
    setAdded(true);
  }

  return (
    <div>
      <p className="rotulo text-[10px] text-laranja-tinta">{FAMILIES[product.family].label}</p>
      <h1 className="display mt-3 text-[48px] md:text-[62px]">{product.name}</h1>
      <p className="corpo mt-4 max-w-md text-tinta/80">{product.shortDescription}</p>

      <p className="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="text-[40px] font-extralight leading-none">{formatPrice(product.priceCents)}</span>
        <span className="rotulo text-[10px] text-tinta/75">
          O par · Em até {product.maxInstallments}x de {installment} sem juros
        </span>
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-6" noValidate>
        <div className={`grid gap-4 ${twoSizes ? "sm:grid-cols-2" : ""}`}>
          {sizeFields.map((f) => (
            <div key={f.key}>
              <label htmlFor={`${id}-${f.key}`} className="rotulo block text-[10px]">
                {f.label}
              </label>
              <select
                id={`${id}-${f.key}`}
                value={sizes[f.key] ?? ""}
                onChange={(e) => {
                  setSizes((prev) => ({ ...prev, [f.key]: e.target.value }));
                  setAdded(false);
                }}
                aria-invalid={Boolean(error) && !sizes[f.key]}
                aria-describedby={error ? `${id}-erro` : undefined}
                className="mt-2 min-h-12 w-full appearance-none rounded-none border border-tinta/30 bg-branco px-4 text-[15px] font-normal"
              >
                <option value="">Escolher</option>
                {product.sizes.map((s) => (
                  <option key={s} value={s}>
                    Aro {s}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <Link href="/aro" className="rotulo inline-flex min-h-11 items-center text-[10px] underline underline-offset-4">
          Não sabe seu aro?
        </Link>

        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor={`${id}-gravacao`} className="rotulo text-[10px]">
              Gravação interna (opcional)
            </label>
            <span className="rotulo text-[10px] text-tinta/75" aria-live="polite">
              {engraving.length}/{product.engravingMaxChars}
            </span>
          </div>
          <input
            id={`${id}-gravacao`}
            type="text"
            maxLength={product.engravingMaxChars}
            value={engraving}
            onChange={(e) => setEngraving(e.target.value)}
            autoComplete="off"
            className="mt-2 min-h-12 w-full rounded-none border border-tinta/30 bg-branco px-4 text-[15px] font-normal"
          />
        </div>

        {error && (
          <p id={`${id}-erro`} role="alert" className="text-[14px] font-normal text-laranja-tinta">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="rotulo min-h-14 w-full rounded-full bg-verde px-8 text-[11px] text-creme-claro hover:bg-verde-claro"
        >
          Colocar na sacola · {formatPrice(product.priceCents)}
        </button>

        <p aria-live="polite" className="text-[14px] font-normal">
          {added && (
            <>
              Na sacola.{" "}
              <Link href="/sacola" className="underline underline-offset-4">
                Ver sacola
              </Link>
            </>
          )}
        </p>
      </form>

      <ul className="mt-2 divide-y divide-tinta/15 border-y border-tinta/15">
        {[
          `Pronta em até ${product.productionDays} dias úteis`,
          `Troca de aro sem custo em ${product.sizeExchangeDays} dias`,
          `Garantia de ${product.warrantyMonths / 12} ano`,
        ].map((line) => (
          <li key={line} className="rotulo py-4 text-[10px] text-tinta/80">
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
