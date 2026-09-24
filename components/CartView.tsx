"use client";

import Link from "next/link";
import { useState } from "react";
import { FAMILIES, formatPrice, getProduct } from "@/lib/products";
import { STORE } from "@/lib/store";
import { Container } from "./Container";
import { useCart } from "./CartProvider";
import { Payment, type PayMethod } from "./Payment";
import { ProductImage } from "./ProductArt";
import { Shipping, type ShippingSelection } from "./Shipping";

export function CartView() {
  const { items, remove } = useCart();
  const [method, setMethod] = useState<PayMethod>("pix");
  const lines = items
    .map((item) => ({ item, product: getProduct(item.productId) }))
    .filter((l) => l.product);
  const subtotal = lines.reduce((sum, l) => sum + l.product!.priceCents, 0);
  const freeShipping = subtotal >= STORE.freeShippingMinCents;
  const pixDiscount = Math.round((subtotal * STORE.pixDiscountPercent) / 100);
  const [shipping, setShipping] = useState<ShippingSelection | null>(null);
  const shipCents = shipping?.priceCents ?? 0;
  const productionDays = Math.max(0, ...lines.map((l) => l.product!.productionDays));
  const total = (method === "pix" ? subtotal - pixDiscount : subtotal) + shipCents;

  return (
    <section className="bg-branco py-12 md:py-20" aria-labelledby="sacola-titulo">
      <Container>
        <h1 id="sacola-titulo" className="display text-[46px] text-verde md:text-[62px]">
          Sacola
          <span className="text-laranja" aria-hidden="true">
            .
          </span>
        </h1>

        {lines.length === 0 ? (
          <div className="mt-10 flex flex-col items-start gap-5 bg-verde p-8 text-creme-claro md:p-12">
            <p className="text-[20px] font-light">Sua sacola está vazia.</p>
            <Link
              href="/#as-pecas"
              className="rotulo inline-flex min-h-12 items-center rounded-full bg-laranja px-8 text-[11px] text-tinta hover:bg-creme-claro"
            >
              Ver as quatro peças
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-10">
            {/* entrega e forma de pagamento */}
            <div className="flex flex-col gap-4">
              <Shipping
                subtotalCents={subtotal}
                productionDays={productionDays}
                onChange={setShipping}
              />
              <Payment
                method={method}
                onMethod={setMethod}
                pixTotalCents={subtotal - pixDiscount + shipCents}
                cardTotalCents={subtotal + shipCents}
                canPay={shipping !== null}
              />
            </div>

            {/* pedido: peças, resumo e continuar comprando */}
            <div className="order-first flex flex-col gap-4 lg:sticky lg:top-32 lg:order-none">
              <section aria-labelledby="pedido-titulo" className="bg-verde p-5 text-creme-claro md:p-8">
                <div className="flex items-baseline justify-between">
                  <h2 id="pedido-titulo" className="text-[22px] font-light uppercase tracking-[0.04em]">
                    Seu pedido
                  </h2>
                  <span className="text-[13px] text-creme-claro/80">
                    {lines.length} {lines.length === 1 ? "peça" : "peças"}
                  </span>
                </div>
                <ul className="mt-5 divide-y divide-creme-claro/15 border-y border-creme-claro/15">
                  {lines.map(({ item, product }) => (
                    <li key={item.key} className="flex gap-4 py-4">
                      <Link href={`/pecas/${product!.slug}`} className="block h-20 w-20 shrink-0 bg-verde-claro" tabIndex={-1} aria-hidden="true">
                        <ProductImage slug={product!.slug} image={{ ...product!.images[0], alt: "" }} surface="verde-claro" />
                      </Link>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span className="rotulo block text-[9px] text-creme-claro/80">{FAMILIES[product!.family].label}</span>
                            <Link href={`/pecas/${product!.slug}`} className="block text-[16px] hover:underline">
                              {product!.name}
                            </Link>
                          </div>
                          <span className="text-[16px] font-light">{formatPrice(product!.priceCents)}</span>
                        </div>
                        <p className="text-[13px] text-creme-claro/80">
                          {item.sizes.length === 2 ? `Aros ${item.sizes[0]} e ${item.sizes[1]}` : `Aro ${item.sizes[0]}`}
                          {item.engraving && ` · Gravação: “${item.engraving}”`}
                        </p>
                        <button
                          type="button"
                          onClick={() => remove(item.key)}
                          className="mt-auto min-h-9 self-start text-[12px] text-creme-claro/80 underline underline-offset-4 hover:text-laranja"
                          aria-label={`Remover ${product!.name} da sacola`}
                        >
                          Remover
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                <dl className="mt-5 flex flex-col gap-2.5 text-[15px]">
                  <div className="flex justify-between">
                    <dt className="text-creme-claro/85">Subtotal</dt>
                    <dd>{formatPrice(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-creme-claro/85">Frete{shipping ? ` · ${shipping.label}` : ""}</dt>
                    <dd className="text-right">
                      {!shipping ? (
                        <span className="text-creme-claro/80">Informe o CEP</span>
                      ) : shipping.priceCents === 0 ? (
                        <span className="font-medium">Grátis</span>
                      ) : (
                        formatPrice(shipping.priceCents)
                      )}
                    </dd>
                  </div>
                  {method === "pix" && (
                    <div className="flex justify-between">
                      <dt className="text-creme-claro/85">Desconto PIX ({STORE.pixDiscountPercent}%)</dt>
                      <dd>− {formatPrice(pixDiscount)}</dd>
                    </div>
                  )}
                  <div className="mt-3 flex items-baseline justify-between border-t border-creme-claro/25 pt-4">
                    <dt className="rotulo text-[11px]">Total</dt>
                    <dd className="text-[30px] font-extralight">{formatPrice(total)}</dd>
                  </div>
                </dl>
                {!freeShipping && (
                  <p className="mt-4 bg-laranja px-3 py-2 text-[13px] text-tinta">
                    Faltam {formatPrice(STORE.freeShippingMinCents - subtotal)} para o frete grátis.
                  </p>
                )}
              </section>

              <Link href="/#as-pecas" className="rotulo inline-flex min-h-11 items-center self-start text-[10px] text-verde underline underline-offset-4">
                Continuar comprando
              </Link>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
