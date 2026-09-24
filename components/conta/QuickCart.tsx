"use client";

import Link from "next/link";
import { formatPrice, getProduct } from "@/lib/products";
import { useCart } from "../CartProvider";
import { ProductImage } from "../ProductArt";

// Sacola rápida na lateral da área logada: peças, subtotal e atalho para finalizar.
export function QuickCart() {
  const { items, remove } = useCart();
  const lines = items
    .map((item) => ({ item, product: getProduct(item.productId) }))
    .filter((l) => l.product);
  const subtotal = lines.reduce((sum, l) => sum + l.product!.priceCents, 0);

  return (
    <section aria-labelledby="sacola-rapida-titulo" className="mt-6 border border-tinta/10 bg-branco p-4">
      <div className="flex items-baseline justify-between">
        <h2 id="sacola-rapida-titulo" className="rotulo text-[11px] text-verde">
          Sua sacola
        </h2>
        <span className="text-[13px] text-tinta/75">
          {lines.length} {lines.length === 1 ? "peça" : "peças"}
        </span>
      </div>

      {lines.length === 0 ? (
        <div className="mt-3">
          <p className="text-[14px] text-tinta/80">Sua sacola está vazia.</p>
          <Link href="/#as-pecas" className="mt-1 inline-flex min-h-11 items-center text-[14px] text-verde underline underline-offset-4">
            Ver as peças
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-3 flex flex-col">
            {lines.map(({ item, product }) => (
              <li key={item.key} className="flex gap-3 border-t border-tinta/10 py-3">
                <div className="h-14 w-14 shrink-0 bg-branco">
                  <ProductImage slug={product!.slug} image={{ ...product!.images[0], alt: "" }} surface="branco" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[15px] text-verde">{product!.name}</span>
                    <span className="text-[14px] font-light">{formatPrice(product!.priceCents)}</span>
                  </div>
                  <span className="text-[13px] text-tinta/75">
                    {item.sizes.length === 2 ? `Aros ${item.sizes[0]} e ${item.sizes[1]}` : `Aro ${item.sizes[0]}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(item.key)}
                    className="min-h-8 self-start text-[12px] text-tinta/75 underline underline-offset-4 hover:text-laranja-tinta"
                    aria-label={`Remover ${product!.name} da sacola`}
                  >
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex items-baseline justify-between border-t border-tinta/10 pt-3">
            <span className="rotulo text-[10px]">Subtotal</span>
            <span className="text-[20px] font-light text-verde">{formatPrice(subtotal)}</span>
          </div>
          <Link
            href="/sacola"
            className="rotulo mt-4 flex min-h-12 items-center justify-center rounded-full bg-laranja px-6 text-[11px] text-tinta hover:bg-verde hover:text-creme-claro"
          >
            Finalizar compra
          </Link>
        </>
      )}
    </section>
  );
}
