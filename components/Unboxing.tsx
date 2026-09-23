import { Symbol } from "./Symbol";

// "O que chega até você": mosaico no estilo da referência enviada (docs/referencias).
// Desktop, 3 colunas: foto alta na esquerda (linhas 2-3) e na direita (linhas 1-2), foto
// quadrada no centro em cima, e os quatro blocos de texto com fundos alternados.
// Os blocos de texto e a foto do centro são quadrados; as fotos altas ocupam duas linhas.
// No celular vira uma coluna, na ordem do código.

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

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

        <ul className="mt-12 grid grid-cols-1 gap-[6px] md:grid-cols-3">
          <TextTile
            n="01"
            title="A cinta"
            text="Faixa verde em volta da caixa. Rasga ou desliza."
            tone="claro"
            place="md:col-start-1 md:row-start-1"
          />
          <PhotoTile
            src="/produtos/plano-encaixadas.webp"
            alt="Anel Plano em prata polida, com as duas partes encaixadas formando a face reta no topo"
            shape="aspect-square"
            place="md:col-start-2 md:row-start-1"
          />
          <TextTile
            n="02"
            title="A seda"
            text="Papel creme lacrado pelo adesivo redondo."
            tone="base"
            place="md:col-start-2 md:row-start-2"
          />
          <PhotoTile
            src="/produtos/curva-vertical.webp"
            alt="Anel Curva em prata polida, com o aro menor encostado por dentro do maior, como chega na caixa"
            shape="aspect-[4/5] md:aspect-auto"
            place="md:col-start-1 md:row-span-2 md:row-start-2"
          />
          <TextTile
            n="03"
            title="A caixa verde"
            text="As duas peças chegam encostadas, já assentadas."
            tone="claro"
            place="md:col-start-2 md:row-start-3"
          />
          <PhotoTile
            src="/produtos/linha-vertical.webp"
            alt="Anel Linha em prata polida: duas bandas finas e iguais, encostadas lado a lado"
            shape="aspect-[4/5] md:aspect-auto"
            place="md:col-start-3 md:row-span-2 md:row-start-1"
          />
          <TextTile
            n="04"
            title="Os cartões"
            text="Garantia e manual, embaixo da caixa verde."
            tone="base"
            place="md:col-start-3 md:row-start-3"
          />
        </ul>
      </div>
    </section>
  );
}
