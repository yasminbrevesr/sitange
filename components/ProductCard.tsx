import Link from "next/link";
import { FAMILIES, formatGrams, formatPrice, type Product } from "@/lib/products";
import { ProductImage } from "./ProductArt";

type Props = { product: Product; imagePanel?: "creme-claro" | "creme-base" };

// Card de produto usado em "As quatro" e em "As outras três".
export function ProductCard({ product, imagePanel = "creme-claro" }: Props) {
  const panel = imagePanel === "creme-claro" ? "bg-creme-claro" : "bg-creme-base";
  return (
    <Link href={`/pecas/${product.slug}`} className="group flex h-full flex-col bg-branco">
      <div className={`relative aspect-square ${panel} p-6`}>
        <span className="rotulo absolute left-4 top-4 z-10 bg-creme-claro px-2 py-1 text-[10px] text-laranja-tinta">
          {FAMILIES[product.family].label}
        </span>
        <ProductImage slug={product.slug} image={product.images[0]} />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="rotulo text-[12px] text-tinta group-hover:underline">{product.name}</h3>
        <p className="mt-2 text-[14px] leading-[1.6] text-tinta/75">{product.shortDescription}</p>
        <div className="mt-auto pt-6">
          <div className="flex items-baseline justify-between border-t border-tinta/15 pt-4">
            <span className="text-[18px] font-normal">{formatPrice(product.priceCents)}</span>
            <span className="rotulo text-[10px] text-tinta/75">{formatGrams(product.totalWeightGrams)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
