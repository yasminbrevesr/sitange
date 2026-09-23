import { Symbol } from "./Symbol";

// "O que chega até você": mosaico no estilo da referência enviada (docs/referencias).
// Desktop, 3 colunas: foto alta na esquerda (linhas 2-3) e na direita (linhas 1-2), a seda com
// adesivo e a caixa kraft com cinta na linha de cima, o manual de uso no meio e, embaixo,
// a caixa de aliança verde aberta e o detalhe ampliado da Letra (letras CA).
// Os blocos pequenos são quadrados; as fotos altas ocupam duas linhas.
// No celular vira uma coluna, na ordem do código.

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const KRAFT = "#C8B08E";
const KRAFT_TAMPA = "#D6C3A5";
const KRAFT_LINHA = "#B39B78";
const VERDE_TAMPA = "#14502E";
const SEDA = "#FBF8EF";

function PhotoTile({ src, alt, place, shape }: { src: string; alt: string; place: string; shape: string }) {
  return (
    <li className={`relative overflow-hidden bg-creme-base ${shape} ${place}`}>
      {/* absoluta: a foto preenche o bloco sem mudar a altura das linhas da grade */}
      <img src={`${base}${src}`} alt={alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
    </li>
  );
}

// Caixa kraft 12×9×5 cm com a cinta de papel verde (desenho do mockup da embalagem)
function BoxTile({ place }: { place: string }) {
  return (
    <li className={`flex aspect-[4/3] items-center justify-center bg-creme-base md:aspect-square ${place}`}>
      <div
        role="img"
        aria-label="Caixa de papelão kraft com a cinta de papel verde com o nome TANGÈ"
        className="relative aspect-[275/162] w-[76%]"
        style={{ background: KRAFT }}
      >
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
    </li>
  );
}

// Papel seda creme lacrado pelo adesivo redondo de 4 cm, só com o símbolo (desenho do mockup)
function SilkTile({ place }: { place: string }) {
  return (
    <li className={`flex aspect-[4/3] items-center justify-center bg-creme-base md:aspect-square ${place}`}>
      <div
        role="img"
        aria-label="Papel seda creme lacrado por um adesivo redondo com o símbolo da marca"
        className="relative aspect-[194/130] w-[66%]"
      >
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
    </li>
  );
}

// Manual de uso, frente "Como usar" (desenho do mockup da embalagem)
function ManualTile({ place }: { place: string }) {
  return (
    <li className={`flex aspect-[4/3] items-center justify-center bg-creme-base md:aspect-square ${place}`}>
      <div
        role="img"
        aria-label="Manual de uso: encoste uma na outra e gire até assentar. Existe uma posição em que elas param."
        className="flex aspect-[252/197] w-[76%] rotate-[1.5deg] flex-col justify-between border border-tinta/10 bg-creme-claro p-[7%]"
      >
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
    </li>
  );
}

// Caixa de aliança verde aberta, com as duas partes assentadas na almofada (ilustração)
function RingBoxTile({ place }: { place: string }) {
  const verde = "#0C3A21";
  const aro = "#9EA3A8";
  const brilho = "#ECEEF0";
  return (
    <li className={`flex aspect-square items-center justify-center bg-creme-base ${place}`}>
      <svg
        viewBox="44 36 312 324"
        role="img"
        aria-label="Caixa de aliança verde aberta, com o nome TANGÈ na tampa e as duas partes do anel assentadas na almofada creme"
        className="w-[84%]"
      >
        {/* tampa aberta */}
        <rect x="96" y="62" width="208" height="170" rx="4" fill={verde} />
        <rect x="108" y="74" width="184" height="150" fill="#EFE6D6" />
        <g transform="translate(189 104) scale(0.22)" aria-hidden="true">
          <path d="M68 16 A40 40 0 1 0 68 84" fill="none" stroke={verde} strokeWidth="8" strokeLinecap="round" />
          <circle cx="82" cy="50" r="10" fill="#FF6B35" />
        </g>
        <text
          x="200"
          y="158"
          textAnchor="middle"
          fill={verde}
          style={{ fontFamily: "var(--font-jakarta)", fontSize: 17, fontWeight: 500, letterSpacing: "0.34em" }}
        >
          TANGÈ
        </text>
        {/* almofada (fundo) */}
        <rect x="96" y="222" width="208" height="26" fill="#F3ECDF" />
        {/* as duas partes, encostadas */}
        <ellipse cx="178" cy="226" rx="42" ry="32" fill="none" stroke={aro} strokeWidth="9" />
        <ellipse cx="178" cy="226" rx="42" ry="32" fill="none" stroke={brilho} strokeWidth="2.5" />
        <ellipse cx="236" cy="232" rx="31" ry="24" fill="none" stroke={aro} strokeWidth="7" />
        <ellipse cx="236" cy="232" rx="31" ry="24" fill="none" stroke={brilho} strokeWidth="2" />
        {/* almofada (frente) com a fenda */}
        <rect x="96" y="244" width="208" height="20" fill="#FBF8EF" />
        <line x1="104" y1="244" x2="296" y2="244" stroke="#E5D8C4" strokeWidth="2" />
        {/* base da caixa */}
        <rect x="84" y="262" width="232" height="12" fill="#14502E" />
        <rect x="84" y="274" width="232" height="72" rx="3" fill={verde} />
      </svg>
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
          <SilkTile place="md:col-start-1 md:row-start-1" />
          <BoxTile place="md:col-start-2 md:row-start-1" />
          <ManualTile place="md:col-start-2 md:row-start-2" />
          <PhotoTile
            src="/produtos/curva-vertical.webp"
            alt="Anel Curva em prata polida, com o aro menor encostado por dentro do maior, como chega na caixa"
            shape="aspect-[4/5] md:aspect-auto"
            place="md:col-start-1 md:row-span-2 md:row-start-2"
          />
          <RingBoxTile place="md:col-start-2 md:row-start-3" />
          <PhotoTile
            src="/produtos/linha-vertical.webp"
            alt="Anel Linha em prata polida: duas bandas finas e iguais, encostadas lado a lado"
            shape="aspect-[4/5] md:aspect-auto"
            place="md:col-start-3 md:row-span-2 md:row-start-1"
          />
          <PhotoTile
            src="/produtos/letra-detalhe.webp"
            alt="Detalhe do anel Letra: as letras C e A gravadas atravessam a divisão entre as duas partes"
            shape="aspect-square"
            place="md:col-start-3 md:row-start-3"
          />
        </ul>
      </div>
    </section>
  );
}
