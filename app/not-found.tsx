import type { Metadata } from "next";
import Link from "next/link";
import { Symbol } from "@/components/Symbol";

export const metadata: Metadata = { title: "Página não encontrada", robots: { index: false } };

// Página 404: link quebrado ou endereço digitado errado.
export default function NotFound() {
  const btn = "rotulo inline-flex min-h-12 items-center justify-center rounded-full px-8 text-[11px]";
  return (
    <main id="conteudo" className="flex min-h-screen flex-col bg-creme-base">
      <header className="bg-verde text-creme-claro">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-center px-4">
          <Link href="/" className="flex min-h-11 items-center gap-3" aria-label="TANGÈ, página inicial">
            <Symbol className="h-6 w-6" decorative />
            <span className="text-[20px] font-medium uppercase tracking-[0.34em]">Tangè</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[960px] flex-1 flex-col items-start justify-center gap-6 px-4 py-20 md:px-10">
        <p className="rotulo text-[10px] text-tinta/80">Erro 404</p>
        <div className="flex items-center gap-4 text-verde md:gap-6" aria-hidden="true">
          <span className="display text-[96px] leading-none md:text-[160px]">4</span>
          <Symbol className="h-20 w-20 md:h-32 md:w-32" decorative />
          <span className="display text-[96px] leading-none md:text-[160px]">4</span>
        </div>
        <h1 className="display text-[36px] text-verde md:text-[52px]">
          Essa página ficou sem par<span className="text-laranja">.</span>
        </h1>
        <p className="corpo max-w-xl text-tinta/80">
          O endereço pode ter mudado ou foi digitado com algum erro. As peças continuam todas aqui.
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <Link href="/#as-pecas" className={`${btn} bg-laranja text-tinta hover:bg-verde hover:text-creme-claro`}>
            Ver as peças
          </Link>
          <Link href="/" className={`${btn} border border-verde text-verde hover:bg-verde hover:text-creme-claro`}>
            Página inicial
          </Link>
        </div>
      </div>
    </main>
  );
}
