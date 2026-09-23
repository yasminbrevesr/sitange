"use client";

import { useState } from "react";
import type { Product } from "@/lib/products";
import { ProductImage } from "./ProductArt";

const VIEW_LABEL: Record<string, string> = {
  encaixadas: "Encaixadas",
  separadas: "Separadas",
  parte: "Uma parte",
  verde: "Encaixadas",
};

export function Gallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const image = product.images[active];
  const onGreen = image.view === "verde";

  return (
    <div className="w-full lg:max-w-[700px]">
      <div className={`relative aspect-square p-8 md:p-14 ${onGreen ? "bg-verde-claro" : "bg-branco"}`}>
        <span
          className={`rotulo absolute left-4 top-4 z-10 px-2 py-1 text-[10px] ${
            onGreen ? "bg-verde text-creme-claro" : "bg-creme-claro text-laranja-tinta"
          }`}
        >
          {VIEW_LABEL[image.view]}
        </span>
        <ProductImage slug={product.slug} image={image} />
      </div>
      <ul className="mt-2 grid grid-cols-4 gap-2" aria-label="Outras fotos">
        {product.images.map((img, i) => (
          <li key={img.view}>
            <button
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver foto: ${img.alt}`}
              aria-pressed={i === active}
              className={`block aspect-square w-full p-2 ${img.view === "verde" ? "bg-verde-claro" : "bg-branco"} ${
                i === active ? "outline outline-2 -outline-offset-2 outline-tinta" : "hover:outline hover:outline-1 hover:-outline-offset-1 hover:outline-tinta/40"
              }`}
            >
              <ProductImage slug={product.slug} image={{ ...img, alt: "" }} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
