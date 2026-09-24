import Link from "next/link";
import { Container } from "@/components/Container";
import { Dot } from "@/components/Dot";
import { ProductImage } from "@/components/ProductArt";
import { ProductCard } from "@/components/ProductCard";
import { Stripe } from "@/components/Stripe";
import { Unboxing } from "@/components/Unboxing";
import {
  FAMILIES,
  formatGrams,
  formatPrice,
  getProduct,
  getProducts,
  getProductsByFamily,
  type Family,
} from "@/lib/products";

// Ordem e fundo das seções (nenhum fundo se repete entre vizinhas; no máximo 2 áreas laranja):
// nav verde → hero creme-base → faixa laranja → como funciona branco → famílias creme-claro
// → as quatro creme-base → você decide verde → o que chega branco → frase laranja → rodapé verde

const curva = getProduct("curva")!;
const plano = getProduct("plano")!;

const steps = [
  {
    n: "01",
    title: "Chega inteira",
    text: "Na caixa, as duas partes vêm encaixadas. É uma peça só, e é assim que ela aparece na foto.",
    image: curva.images[0],
  },
  {
    n: "02",
    title: "Você separa",
    text: "Vira duas. Uma pode ir para outra mão, ou as duas ficam com você. Ninguém te diz qual.",
    image: curva.images[1],
  },
  {
    n: "03",
    title: "Fecha de novo",
    text: "O encaixe não é decoração: as bordas foram desenhadas para voltar ao lugar exato. Sempre.",
    image: { ...curva.images[0], alt: "Anel Curva com as duas partes encaixadas de novo" },
  },
];

function FamilyCard({ family }: { family: Family }) {
  const info = FAMILIES[family];
  const items = getProductsByFamily(family);
  const hero = items[0];
  return (
    <article id={family} className="flex scroll-mt-20 flex-col bg-branco lg:scroll-mt-[130px]">
      <div className="aspect-[16/10] bg-creme-base p-8">
        <ProductImage slug={hero.slug} image={hero.images[0]} surface="creme-base" />
      </div>
      <div className="flex flex-1 flex-col p-6 md:p-8">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-[22px] font-light uppercase tracking-[0.12em]">{info.label}</h3>
          <span className="rotulo text-[10px] text-laranja-tinta">{info.tag}</span>
        </div>
        <p className="corpo mt-3 text-tinta/80">{info.description}</p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {items.map((p) => (
            <li key={p.id}>
              <Link
                href={`/pecas/${p.slug}`}
                className="rotulo flex min-h-11 items-center rounded-full border border-tinta/25 px-5 text-[10px] hover:border-tinta"
              >
                {p.name} · {formatPrice(p.priceCents)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export default function Home() {
  return (
    <>
      {/* 2. HERO */}
      <section className="bg-creme-base" aria-labelledby="hero-titulo">
        <Container className="grid items-center gap-10 py-12 lg:min-h-[806px] lg:grid-cols-2 lg:py-0">
          <div>
            <p className="rotulo text-[10px] text-tinta/75">Prata 925 · Feita sob encomenda</p>
            <h1 id="hero-titulo" className="display mt-6 text-[52px] lg:text-[112px]">
              <span className="block">
                Duas peças
                <Dot />
              </span>
              <span className="block">
                Um ponto
                <Dot />
              </span>
            </h1>
            <p className="corpo mt-8 max-w-md text-tinta/80">
              Nenhuma peça nossa é uma só. Todas são feitas de duas partes que se encostam, e o que muda é
              quem fica com cada uma.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link
                href="#as-pecas"
                className="rotulo flex min-h-12 items-center rounded-full bg-verde px-8 text-[11px] text-creme-claro hover:bg-verde-claro"
              >
                Ver as quatro peças
              </Link>
              <Link
                href="#como-funciona"
                className="rotulo flex min-h-11 items-center text-[11px] underline underline-offset-8"
              >
                Como funciona
              </Link>
            </div>
          </div>

          <div className="relative">
            <p className="rotulo absolute right-0 top-0 z-10 text-right text-[10px] text-tinta/75">
              {curva.name}
              <br />
              {formatGrams(curva.totalWeightGrams)} · O par
              <br />
              {formatPrice(curva.priceCents)}
            </p>
            <Link href={`/pecas/${curva.slug}`} className="block aspect-square pt-10">
              {/* recorte fechado na peça, com o mesmo fundo creme da seção */}
              <ProductImage
                slug={curva.slug}
                image={{ ...curva.images[0], src: "/produtos/curva-destaque-creme-base.webp" }}
              />
            </Link>
          </div>
        </Container>
      </section>

      {/* 3. FAIXA */}
      <Stripe />

      {/* 4. COMO FUNCIONA */}
      <section id="como-funciona" className="bg-creme-base py-16 md:py-24" aria-labelledby="como-titulo">
        <Container>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="rotulo text-[10px] text-tinta/75">O sistema</p>
              <h2 id="como-titulo" className="display mt-3 text-[34px] md:text-[46px]">
                Toda peça é duas
              </h2>
            </div>
            <p className="max-w-sm text-[14px] leading-[1.7] text-tinta/75">
              A peça chega inteira e sai de casa dividida. Nenhuma outra loja de joias no Brasil vende assim.
            </p>
          </div>

          <ol className="mt-10 grid gap-[3px] md:grid-cols-3">
            {steps.map((s) => (
              <li key={s.n} className="flex flex-col bg-branco p-6 md:p-8">
                <div className="flex items-baseline gap-3">
                  <span className="text-[44px] font-extralight leading-none text-laranja-tinta">{s.n}</span>
                  <h3 className="rotulo text-[11px]">{s.title}</h3>
                </div>
                <div className="my-6 aspect-[4/3]">
                  <ProductImage slug={curva.slug} image={s.image} surface="branco" />
                </div>
                <p className="corpo text-[15px] text-tinta/80 md:text-[15px]">{s.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* 5. DUAS FAMÍLIAS */}
      <section className="bg-branco py-16 md:py-24" aria-labelledby="familias-titulo">
        <Container>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 id="familias-titulo" className="display text-[34px] md:text-[46px]">
              Duas famílias
            </h2>
            <p className="rotulo text-[10px] text-tinta/75">A diferença é quem fica com cada parte</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 md:gap-6">
            <FamilyCard family="para-dois" />
            <FamilyCard family="para-um" />
          </div>
        </Container>
      </section>

      {/* 6. AS QUATRO */}
      <section id="as-pecas" className="bg-creme-base py-16 md:py-24" aria-labelledby="quatro-titulo">
        <Container>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 id="quatro-titulo" className="display text-[34px] md:text-[46px]">
              As quatro
            </h2>
            <p className="rotulo text-[10px] text-tinta/75">Peso real medido na peça</p>
          </div>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {getProducts().map((p) => (
              <li key={p.id}>
                <ProductCard product={p} imagePanel="branco" />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* 7. VOCÊ DECIDE */}
      <section className="bg-verde py-16 text-creme-claro md:py-24" aria-labelledby="decide-titulo">
        <Container className="grid items-center gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="rotulo text-[10px] text-laranja">Sem instrução</p>
            <h2 id="decide-titulo" className="display mt-4 text-[40px] md:text-[56px]">
              Você decide onde vai cada uma
            </h2>
            <p className="corpo mt-6 max-w-md text-creme-claro/85">
              Juntas num dedo. Separadas em dois. Ou dividida com alguém. A peça chega sem dizer o que você tem
              que fazer com ela, e é por isso que cada pessoa usa de um jeito.
            </p>
            <Link
              href="#as-pecas"
              className="rotulo mt-8 inline-flex min-h-12 items-center rounded-full bg-creme-claro px-8 text-[11px] text-verde hover:bg-creme-base"
            >
              Escolher a sua
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Juntas", image: { ...plano.images[0], alt: "Anel Plano com as duas partes juntas, empilhadas" } },
              { label: "Separadas", image: { ...plano.images[1], alt: "Anel Plano com as duas partes separadas, lado a lado" } },
            ].map((panel) => (
              <figure key={panel.label} className="bg-verde-claro p-6">
                <figcaption className="rotulo text-[10px] text-creme-claro/85">{panel.label}</figcaption>
                <div className="mt-4 aspect-square">
                  <ProductImage slug={plano.slug} image={panel.image} tone="escuro" surface="verde-claro" />
                </div>
              </figure>
            ))}
          </div>
        </Container>
      </section>

      {/* 8. O QUE CHEGA ATÉ VOCÊ */}
      <Unboxing />

      {/* 9. FRASE */}
      <section className="flex min-h-[300px] items-center bg-laranja py-12 text-tinta">
        <Container>
          <p className="display text-center text-[46px] leading-[1.04]">
            <span className="block">
              A gente não vende par
              <Dot className="text-verde" />
            </span>
            <span className="block">
              Vende encaixe
              <Dot className="text-verde" />
            </span>
          </p>
        </Container>
      </section>
    </>
  );
}
