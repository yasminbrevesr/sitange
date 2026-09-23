"use client";

import Link from "next/link";
import { MISSING, formatPrice, getProduct } from "@/lib/products";
import { STORE } from "@/lib/store";
import { Container } from "./Container";
import { useCart } from "./CartProvider";

export function CartView() {
  const { items, remove } = useCart();
  const lines = items
    .map((item) => ({ item, product: getProduct(item.productId) }))
    .filter((l) => l.product);
  const total = lines.reduce((sum, l) => sum + l.product!.priceCents, 0);

  return (
    <section className="bg-creme-claro py-16 md:py-24" aria-labelledby="sacola-titulo">
      <Container className="max-w-[960px]">
        <h1 id="sacola-titulo" className="display text-[46px] md:text-[62px]">
          Sacola
        </h1>

        {lines.length === 0 ? (
          <div className="mt-10">
            <p className="corpo text-tinta/80">Sua sacola está vazia.</p>
            <Link
              href="/#as-pecas"
              className="rotulo mt-6 inline-flex min-h-12 items-center rounded-full bg-verde px-8 text-[11px] text-creme-claro hover:bg-verde-claro"
            >
              Ver as quatro peças
            </Link>
          </div>
        ) : (
          <>
            <ul className="mt-10 divide-y divide-tinta/15 border-y border-tinta/15">
              {lines.map(({ item, product }) => (
                <li key={item.key} className="flex flex-wrap items-center justify-between gap-4 py-5">
                  <div>
                    <Link href={`/pecas/${product!.slug}`} className="rotulo text-[12px] hover:underline">
                      {product!.name}
                    </Link>
                    <p className="mt-1 text-[14px] text-tinta/80">
                      {item.sizes.length === 2
                        ? `Aros ${item.sizes[0]} e ${item.sizes[1]}`
                        : `Aro ${item.sizes[0]}`}
                      {item.engraving && ` · Gravação: “${item.engraving}”`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[17px] font-normal">{formatPrice(product!.priceCents)}</span>
                    <button
                      type="button"
                      onClick={() => remove(item.key)}
                      className="rotulo min-h-11 px-2 text-[10px] underline underline-offset-4"
                      aria-label={`Remover ${product!.name} da sacola`}
                    >
                      Remover
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-6 flex items-baseline justify-between">
              <span className="rotulo text-[11px]">Total</span>
              <span className="text-[28px] font-extralight">{formatPrice(total)}</span>
            </p>
            <p className="mt-2 text-right text-[14px] text-tinta/80">
              {total >= STORE.freeShippingMinCents
                ? "Frete grátis"
                : `Faltam ${formatPrice(STORE.freeShippingMinCents - total)} para o frete grátis`}
            </p>
            <p className="mt-8 border border-tinta/30 bg-branco p-5 text-[14px] text-tinta/80">
              Finalizar compra: {MISSING} (integração de pagamento e checkout)
            </p>
          </>
        )}
      </Container>
    </section>
  );
}
