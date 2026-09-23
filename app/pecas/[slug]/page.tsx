import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyBox } from "@/components/BuyBox";
import { Container } from "@/components/Container";
import { Gallery } from "@/components/Gallery";
import { ProductCard } from "@/components/ProductCard";
import { Stripe } from "@/components/Stripe";
import { formatGrams, formatMm, getProduct, getProducts } from "@/lib/products";

// Fundos: nav verde → compra creme-claro → faixa laranja → ficha verde → outras três branco → rodapé verde

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  return product ? { title: product.name, description: product.shortDescription } : {};
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const others = getProducts().filter((p) => p.id !== product.id);

  const specs: [string, string][] = [
    ["Material", product.material],
    ["Peso total", `${formatGrams(product.totalWeightGrams)} · o par`],
    ...product.parts.map(
      (part): [string, string] => [part.label, `${formatGrams(part.weightGrams)} · ${formatMm(part.diameterMm)}`],
    ),
    ["Acabamento", product.finish],
    ["Produção", `Sob encomenda, pronta em até ${product.productionDays} dias úteis`],
    ["Gravação", `Interna, até ${product.engravingMaxChars} caracteres, incluída`],
    ["Garantia", `${product.warrantyMonths / 12} ano`],
  ];

  return (
    <>
      <section className="bg-creme-claro pb-16 pt-6 md:pb-24">
        <Container>
          <nav aria-label="Você está em">
            <ol className="rotulo flex flex-wrap items-center gap-2 text-[10px] text-tinta/75">
              <li>
                <Link href="/" className="flex min-h-11 items-center hover:text-tinta">
                  Início
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/#as-pecas" className="flex min-h-11 items-center hover:text-tinta">
                  As peças
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-tinta">
                {product.name}
              </li>
            </ol>
          </nav>

          <div className="mt-4 grid gap-10 lg:grid-cols-[minmax(0,700px)_1fr] lg:gap-16">
            <Gallery product={product} />
            <BuyBox product={product} />
          </div>
        </Container>
      </section>

      <Stripe />

      <section className="bg-verde py-16 text-creme-claro md:py-24" aria-labelledby="ficha-titulo">
        <Container>
          <h2 id="ficha-titulo" className="display text-[34px] md:text-[46px]">
            Ficha técnica
          </h2>
          <dl className="mt-10 grid border-t border-[#F2E9DA26] md:grid-cols-2 md:gap-x-16">
            {specs.map(([term, value]) => (
              <div key={term} className="flex flex-col gap-1 border-b border-[#F2E9DA26] py-5 sm:flex-row sm:justify-between">
                <dt className="rotulo text-[10px] text-creme-claro/85">{term}</dt>
                <dd className="text-[15px] sm:text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section className="bg-branco py-16 md:py-24" aria-labelledby="outras-titulo">
        <Container>
          <h2 id="outras-titulo" className="display text-[34px] md:text-[46px]">
            As outras três
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-3">
            {others.map((p) => (
              <li key={p.id} className="bg-creme-base">
                <ProductCard product={p} imagePanel="creme-base" />
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
