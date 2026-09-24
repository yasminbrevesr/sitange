"use client";

import Link from "next/link";
import { useState } from "react";
import { FAMILIES, MISSING, formatPrice, getProduct } from "@/lib/products";
import { SHIPPING_OPTIONS, STORE, shippingPrice, type ShippingOption } from "@/lib/store";
import { Container } from "./Container";
import { useCart } from "./CartProvider";
import { Payment, type PayMethod } from "./Payment";
import { ProductImage } from "./ProductArt";
import { Shipping } from "./Shipping";

export function CartView() {
  const { items, remove } = useCart();
  const [method, setMethod] = useState<PayMethod>("pix");
  const lines = items
    .map((item) => ({ item, product: getProduct(item.productId) }))
    .filter((l) => l.product);
  const subtotal = lines.reduce((sum, l) => sum + l.product!.priceCents, 0);
  const freeShipping = subtotal >= STORE.freeShippingMinCents;
  const pixDiscount = Math.round((subtotal * STORE.pixDiscountPercent) / 100);
  const [shipOption, setShipOption] = useState<ShippingOption["id"]>("padrao");
  const [deliveryReady, setDeliveryReady] = useState(false);
  const selectedShipping = SHIPPING_OPTIONS.find((o) => o.id === shipOption) ?? SHIPPING_OPTIONS[0];
  const shipPrice = shippingPrice(selectedShipping, subtotal);
  const shipCents = shipPrice ?? 0;
  const productionDays = Math.max(0, ...lines.map((l) => l.product!.productionDays));
  const total = (method === "pix" ? subtotal - pixDiscount : subtotal) + shipCents;

  return (
    <section className="bg-creme-base py-12 md:py-20" aria-labelledby="sacola-titulo">
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
          <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12">
            {/* entrega e forma de pagamento */}
            <div className="flex flex-col gap-12">
              <Shipping
                subtotalCents={subtotal}
                productionDays={productionDays}
                option={shipOption}
                onOption={setShipOption}
                onReady={setDeliveryReady}
              />
              <Payment
                method={method}
                onMethod={setMethod}
                pixTotalCents={subtotal - pixDiscount + shipCents}
                cardTotalCents={subtotal + shipCents}
                canPay={deliveryReady}
              />
            </div>

            {/* pedido: peças, resumo e continuar comprando */}
            <div className="order-first flex flex-col gap-3 lg:sticky lg:top-32 lg:order-none">
              <p className="rotulo text-[10px] text-tinta/75">
                {lines.length} {lines.length === 1 ? "peça" : "peças"}
              </p>
              <ul className="flex flex-col gap-3">
                {lines.map(({ item, product }) => (
                  <li key={item.key} className="flex gap-4 bg-branco p-4 md:gap-6 md:p-5">
                    <Link href={`/pecas/${product!.slug}`} className="block h-24 w-24 shrink-0 md:h-28 md:w-28" tabIndex={-1} aria-hidden="true">
                      <ProductImage slug={product!.slug} image={{ ...product!.images[0], alt: "" }} surface="branco" />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="rotulo block text-[10px] text-laranja-tinta">{FAMILIES[product!.family].label}</span>
                          <Link href={`/pecas/${product!.slug}`} className="mt-1 block text-[18px] font-normal text-verde hover:underline">
                            {product!.name}
                          </Link>
                        </div>
                        <span className="text-[18px] font-light">{formatPrice(product!.priceCents)}</span>
                      </div>
                      <p className="mt-2 text-[14px] text-tinta/80">
                        {item.sizes.length === 2 ? `Aros ${item.sizes[0]} e ${item.sizes[1]}` : `Aro ${item.sizes[0]}`}
                        {item.engraving && ` · Gravação: “${item.engraving}”`}
                      </p>
                      <button
                        type="button"
                        onClick={() => remove(item.key)}
                        className="mt-auto min-h-11 self-start text-[13px] text-tinta/75 underline underline-offset-4 hover:text-laranja-tinta"
                        aria-label={`Remover ${product!.name} da sacola`}
                      >
                        Remover
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="bg-branco p-6 md:p-8">
                <h2 className="rotulo text-[11px] text-verde">Resumo</h2>
                <dl className="mt-5 flex flex-col gap-3 text-[15px]">
                  <div className="flex justify-between">
                    <dt>Subtotal</dt>
                    <dd>{formatPrice(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Frete · {selectedShipping.label}</dt>
                    <dd className="text-right">
                      {shipPrice === 0 ? <span className="text-verde">Grátis</span> : shipPrice === null ? MISSING : formatPrice(shipPrice)}
                    </dd>
                  </div>
                  {method === "pix" && (
                    <div className="flex justify-between">
                      <dt>Desconto PIX ({STORE.pixDiscountPercent}%)</dt>
                      <dd className="text-laranja-tinta">− {formatPrice(pixDiscount)}</dd>
                    </div>
                  )}
                  <div className="mt-2 flex items-baseline justify-between border-t border-tinta/15 pt-4">
                    <dt className="rotulo text-[11px]">Total</dt>
                    <dd className="text-[30px] font-extralight text-verde">{formatPrice(total)}</dd>
                  </div>
                </dl>
                {!freeShipping && (
                  <p className="mt-3 bg-laranja/15 px-3 py-2 text-[13px] text-tinta">
                    Faltam {formatPrice(STORE.freeShippingMinCents - subtotal)} para o frete grátis.
                  </p>
                )}
              </div>

              <Link href="/#as-pecas" className="rotulo mt-2 inline-flex min-h-11 items-center self-start text-[10px] text-verde underline underline-offset-4">
                Continuar comprando
              </Link>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
