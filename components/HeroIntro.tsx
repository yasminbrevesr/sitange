import Link from "next/link";
import { Dot } from "./Dot";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Vídeo da abertura (opcional): coloque o arquivo em public/ (ex.: public/abertura.mp4) e escreva o nome aqui.
// Enquanto for null, a abertura usa a foto com um zoom lento.
const HERO_VIDEO: string | null = null;

// Abertura da home em tela cheia: foto (ou vídeo) de fundo, texto curto no centro e botão.
// O menu fica transparente por cima dela (ver components/Nav.tsx).
export function HeroIntro() {
  return (
    <section
      aria-labelledby="hero-titulo"
      className="relative -mt-16 flex h-[100svh] min-h-[560px] items-center justify-center overflow-hidden bg-verde text-creme-claro lg:-mt-[120px]"
    >
      <div className="absolute inset-0" aria-hidden="true">
        {HERO_VIDEO ? (
          <video
            className="h-full w-full object-cover"
            src={`${BASE}/${HERO_VIDEO}`}
            poster={`${BASE}/produtos/abertura-2048.webp`}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img
            src={`${BASE}/produtos/abertura-2048.webp`}
            srcSet={`${BASE}/produtos/abertura-1080.webp 1080w, ${BASE}/produtos/abertura-2048.webp 2048w`}
            sizes="100vw"
            alt=""
            fetchPriority="high"
            className="abertura-zoom h-full w-full object-cover"
          />
        )}
        {/* escurece a foto para o texto ficar legível */}
        <div className="absolute inset-0 bg-[#0C3A21]/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#121212]/40 via-transparent to-[#121212]/30" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-6 text-center [text-shadow:0_1px_14px_rgba(18,18,18,0.55)]">
        <h1 id="hero-titulo" className="text-[13px] font-medium uppercase leading-[2.1] tracking-[0.42em] md:text-[17px]">
          <span className="block">
            Duas peças
            <Dot />
          </span>
          <span className="block">
            Um ponto
            <Dot />
          </span>
        </h1>
        <p className="mt-2 text-[13px] font-medium uppercase leading-[2.1] tracking-[0.42em] md:text-[17px]">
          Prata 950, feita sob encomenda.
        </p>
        <Link
          href="#as-pecas"
          className="rotulo mt-8 inline-flex min-h-11 items-center bg-creme-claro px-7 text-[10px] text-verde hover:bg-laranja hover:text-tinta"
        >
          Ver as peças
        </Link>
      </div>
    </section>
  );
}
