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
            alt=""
            fetchPriority="high"
            className="abertura-zoom h-full w-full object-cover"
          />
        )}
        {/* efeito sutil: um toque de verde na foto, escurecimento leve no topo (menu) e atrás do texto */}
        <div className="absolute inset-0 bg-[#0C3A21]/[0.22]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#121212]/40 via-transparent to-[#121212]/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_46%_30%_at_50%_50%,rgba(18,18,18,0.42),transparent_75%)]" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-6 text-center [text-shadow:0_1px_14px_rgba(18,18,18,0.55)]">
        <h1
          id="hero-titulo"
          className="text-[20px] font-medium uppercase leading-[1.7] tracking-[0.38em] [text-shadow:0_2px_18px_rgba(18,18,18,0.7),0_0_2px_rgba(18,18,18,0.5)] md:text-[30px]"
        >
          <span className="block">
            Duas peças
            <Dot />
          </span>
          <span className="block">
            Um ponto
            <Dot />
          </span>
        </h1>
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
