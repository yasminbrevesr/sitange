import type { ReactNode } from "react";
import { Symbol } from "./Symbol";

// "O que chega até você": mosaico das quatro camadas da embalagem.
// Textos e imagens reproduzem o mockup da embalagem (docs/referencias/embalagem-mockup.webp).
// As imagens são desenhos chapados feitos em código para ficarem nítidos em qualquer tela;
// quando houver fotos reais da embalagem, troque o conteúdo de cada <ArtTile>.
// No celular vira uma coluna, na ordem do código (texto e, logo depois, a imagem da camada).

const KRAFT = "#C8B08E";
const KRAFT_TAMPA = "#D6C3A5";
const KRAFT_LINHA = "#B39B78";
const VERDE_TAMPA = "#14502E";
const SEDA = "#FBF8EF";

function TextTile({ n, title, text, place }: { n: string; title: string; text: string; place: string }) {
  return (
    <li className={`flex flex-col items-center justify-between bg-creme-claro px-6 py-8 text-center ${place}`}>
      <span className="rotulo text-[10px] text-laranja-tinta">{n}</span>
      <p className="my-6 max-w-[220px] text-[14px] leading-[1.6] text-tinta/80">{text}</p>
      <h3 className="text-[15px] font-semibold uppercase tracking-[0.14em] text-verde">{title}</h3>
    </li>
  );
}

function ArtTile({ label, place, tall, children }: { label: string; place: string; tall?: boolean; children: ReactNode }) {
  const size = tall ? "py-10 md:py-0" : "aspect-[4/3] md:aspect-auto";
  return (
    <li className={`flex items-center justify-center overflow-hidden bg-creme-base ${size} ${place}`}>
      <div role="img" aria-label={label} className="flex h-full w-full items-center justify-center">
        {children}
      </div>
    </li>
  );
}

// Caixa kraft 12×9×5 cm com a cinta de papel verde
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

// Papel seda creme lacrado pelo adesivo redondo de 4 cm, só com o símbolo
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

// Caixa de aliança verde, comprada pronta, sem nada impresso
function RingBoxArt() {
  return (
    <div className="relative aspect-[193/110] w-[62%] bg-verde">
      <div className="absolute inset-x-0 top-0 h-[22%]" style={{ background: VERDE_TAMPA }} />
    </div>
  );
}

// Cartão de garantia (frente) e manual de uso (como usar)
function CardsArt() {
  return (
    <div className="flex w-[74%] flex-col items-center gap-6">
      <div className="flex aspect-[85/55] w-full rotate-[-2deg] flex-col justify-between bg-verde p-[7%] text-creme-claro">
        <span className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.34em]">
          <Symbol className="h-3 w-3" decorative /> Tangè
        </span>
        <span className="text-[17px] font-light uppercase leading-[1.1]">
          Garantia
          <br />
          de um ano
        </span>
      </div>
      <div className="flex aspect-[252/197] w-[92%] rotate-[1.5deg] flex-col justify-between border border-tinta/10 bg-creme-claro p-[7%]">
        <span className="rotulo text-[8px] text-laranja-tinta">Como usar</span>
        <span className="text-[14px] font-light uppercase leading-[1.15] text-tinta">
          Encoste uma
          <br />
          na outra e gire
          <br />
          até assentar
        </span>
        <span className="text-[8px] text-tinta/70">Existe uma posição em que elas param.</span>
      </div>
    </div>
  );
}

export function Unboxing() {
  return (
    <section className="bg-branco py-16 md:py-24" aria-labelledby="chega-titulo">
      <div className="mx-auto w-full max-w-[1000px] px-4 md:px-10">
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

        {/* Desktop: 3 colunas × 3 linhas, cada texto encostado na imagem da sua camada */}
        <ul className="mt-12 grid grid-cols-1 gap-[6px] md:grid-cols-3 md:auto-rows-[240px]">
          <TextTile
            n="01"
            title="A cinta"
            text="Faixa verde em volta da caixa. Rasga ou desliza."
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
            place="md:col-start-2 md:row-start-2"
          />
          <ArtTile
            label="Papel seda creme lacrado por um adesivo redondo com o símbolo da marca"
            place="md:col-start-1 md:row-start-2"
          >
            <SilkArt />
          </ArtTile>

          <TextTile
            n="03"
            title="A caixa verde"
            text="As duas peças chegam encostadas, já assentadas."
            place="md:col-start-1 md:row-start-3"
          />
          <ArtTile label="Caixa de aliança verde, lisa" place="md:col-start-2 md:row-start-3">
            <RingBoxArt />
          </ArtTile>

          <TextTile
            n="04"
            title="Os cartões"
            text="Garantia e manual, embaixo da caixa verde."
            place="md:col-start-3 md:row-start-3"
          />
          <ArtTile
            label="Cartão verde de garantia de um ano e manual de uso: encoste uma na outra e gire até assentar"
            place="md:col-start-3 md:row-span-2 md:row-start-1"
            tall
          >
            <CardsArt />
          </ArtTile>
        </ul>

        <p className="mx-auto mt-8 max-w-md text-center text-[13px] text-tinta/75">
          É isso que faz o unboxing existir como vídeo.
        </p>
      </div>
    </section>
  );
}
