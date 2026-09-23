import type { ReactNode } from "react";
import { Symbol } from "./Symbol";

// "O que chega até você": mosaico no estilo da referência enviada (docs/referencias).
// Desktop, 3 colunas × 4 linhas: foto alta na direita (linhas 1-2) e na esquerda (linhas 3-4),
// desenhos da caixa com cinta e da seda com adesivo (mockup da embalagem), fotos do Plano e da
// Letra e os quatro blocos de texto. Os tons de fundo evitam dois blocos vizinhos da mesma cor.
// No celular vira uma coluna, na ordem do código.

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const KRAFT = "#C8B08E";
const KRAFT_TAMPA = "#D6C3A5";
const KRAFT_LINHA = "#B39B78";
const VERDE_TAMPA = "#14502E";
const SEDA = "#FBF8EF";

type Tone = "claro" | "base";

function TextTile({
  n,
  title,
  text,
  tone,
  place,
}: {
  n: string;
  title: string;
  text: string;
  tone: Tone;
  place: string;
}) {
  const bg = tone === "claro" ? "bg-creme-claro" : "bg-creme-base";
  return (
    <li
      className={`flex min-h-[220px] flex-col items-center justify-center gap-6 px-6 py-10 text-center md:aspect-square md:min-h-0 md:py-6 ${bg} ${place}`}
    >
      <span className="rotulo text-[11px] font-semibold text-verde">{n}</span>
      <p className="max-w-[230px] text-[14px] leading-[1.6] text-tinta/80">{text}</p>
      <h3 className="text-[15px] font-semibold uppercase tracking-[0.14em] text-verde">{title}</h3>
    </li>
  );
}

function PhotoTile({ src, alt, place, shape }: { src: string; alt: string; place: string; shape: string }) {
  return (
    <li className={`relative overflow-hidden bg-creme-base ${shape} ${place}`}>
      {/* absoluta: a foto preenche o bloco sem mudar a altura das linhas da grade */}
      <img src={`${base}${src}`} alt={alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
    </li>
  );
}

function ArtTile({ label, place, children }: { label: string; place: string; children: ReactNode }) {
  return (
    <li className={`flex aspect-[4/3] items-center justify-center bg-creme-base md:aspect-square ${place}`}>
      <div role="img" aria-label={label} className="flex h-full w-full items-center justify-center">
        {children}
      </div>
    </li>
  );
}

// Caixa kraft 12×9×5 cm com a cinta de papel verde (desenho do mockup da embalagem)
function BoxArt() {
  return (
    <div className="relative aspect-[275/162] w-[76%]" style={{ background: KRAFT }}>
      <div className="absolute inset-x-0 top-0 h-[16%]" style={{ background: KRAFT_TAMPA }} />
      <div className="absolute inset-x-0 top-[16%] h-[3px]" style={{ background: KRAFT_LINHA }} />
      <div className="absolute inset-y-0 left-[32%] w-[26%] bg-verde">
        <div className="absolute inset-x-0 top-0 h-[16%]" style={{ background: VERDE_TAMPA }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pt-[10%] text-creme-claro">
          <Symbol className="h-4 w-4" decorative />
          <span className="rotate-180 text-[9px] font-medium uppercase tracking-[0.34em] [writing-mode:vertical-rl]">
            Tangè
          </span>
        </div>
      </div>
    </div>
  );
}

// Papel seda creme lacrado pelo adesivo redondo de 4 cm, só com o símbolo (desenho do mockup)
function SilkArt() {
  return (
    <div className="relative aspect-[194/130] w-[66%]">
      <div className="absolute inset-0 translate-x-[3%] translate-y-[5%] rotate-[-2deg]" style={{ background: SEDA }} />
      <div
        className="absolute inset-0 flex rotate-[2deg] items-center justify-center border border-tinta/5"
        style={{ background: SEDA }}
      >
        <span className="flex aspect-square w-[32%] items-center justify-center rounded-full bg-creme-base">
          <Symbol className="h-1/2 w-1/2 text-tinta" decorative />
        </span>
      </div>
    </div>
  );
}

export function Unboxing() {
  return (
    <section className="bg-branco py-16 md:py-24" aria-labelledby="chega-titulo">
      <div className="mx-auto w-full max-w-[900px] px-4 md:px-10">
        <header className="text-center">
          <h2 id="chega-titulo" className="text-[20px] font-light uppercase tracking-[0.3em] text-verde md:text-[26px]">
            O que chega até você
          </h2>
          <div className="mx-auto mt-3 flex max-w-[460px] items-center justify-between gap-4">
            <Symbol className="h-4 w-4 shrink-0 text-verde" decorative />
            <p className="text-[13px] text-tinta/80">Quatro camadas. Cada uma leva alguns segundos.</p>
            <Symbol className="h-4 w-4 shrink-0 text-verde" decorative />
          </div>
        </header>

        {/* Desktop, 4 linhas: foto alta à direita em cima e à esquerda embaixo; em cada linha
            um texto encosta na imagem da sua camada. As fotos quadradas só aparecem do tablet para cima. */}
        <ul className="mt-12 grid grid-cols-1 gap-[6px] md:grid-cols-3">
          <TextTile
            n="01"
            title="A cinta"
            text="Faixa verde em volta da caixa. Rasga ou desliza."
            tone="claro"
            place="md:col-start-1 md:row-start-1"
          />
          <ArtTile
            label="Caixa de papelão kraft com a cinta de papel verde com o nome TANGÈ"
            place="md:col-start-2 md:row-start-1"
          >
            <BoxArt />
          </ArtTile>
          <TextTile
            n="02"
            title="A seda"
            text="Papel creme lacrado pelo adesivo redondo."
            tone="claro"
            place="md:col-start-2 md:row-start-2"
          />
          <ArtTile
            label="Papel seda creme lacrado por um adesivo redondo com o símbolo da marca"
            place="md:col-start-1 md:row-start-2"
          >
            <SilkArt />
          </ArtTile>
          <PhotoTile
            src="/produtos/linha-vertical.webp"
            alt="Anel Linha em prata polida: duas bandas finas e iguais, encostadas lado a lado"
            shape="aspect-[4/5] md:aspect-auto"
            place="md:col-start-3 md:row-span-2 md:row-start-1"
          />
          <TextTile
            n="03"
            title="A caixa verde"
            text="As duas peças chegam encostadas, já assentadas."
            tone="base"
            place="md:col-start-2 md:row-start-3"
          />
          <PhotoTile
            src="/produtos/plano-encaixadas.webp"
            alt="Anel Plano em prata polida, com as duas partes encaixadas formando a face reta no topo"
            shape="hidden aspect-square md:block"
            place="md:col-start-3 md:row-start-3"
          />
          <PhotoTile
            src="/produtos/curva-vertical.webp"
            alt="Anel Curva em prata polida, com o aro menor encostado por dentro do maior, como chega na caixa"
            shape="aspect-[4/5] md:aspect-auto"
            place="md:col-start-1 md:row-span-2 md:row-start-3"
          />
          <TextTile
            n="04"
            title="Os cartões"
            text="Garantia e manual, embaixo da caixa verde."
            tone="claro"
            place="md:col-start-3 md:row-start-4"
          />
          <PhotoTile
            src="/produtos/letra-encaixadas.webp"
            alt="Anel Letra em prata polida: duas bandas encaixadas formando as letras C e A"
            shape="hidden aspect-square md:block"
            place="md:col-start-2 md:row-start-4"
          />
        </ul>
      </div>
    </section>
  );
}
