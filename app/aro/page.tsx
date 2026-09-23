import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { MISSING, RING_SIZES } from "@/lib/products";

export const metadata: Metadata = { title: "Guia de aro" };

export default function AroPage() {
  return (
    <section className="bg-creme-claro py-16 md:py-24" aria-labelledby="aro-titulo">
      <Container className="max-w-[960px]">
        <p className="rotulo text-[10px] text-laranja-tinta">Guia</p>
        <h1 id="aro-titulo" className="display mt-3 text-[46px] md:text-[62px]">
          Como achar seu aro
        </h1>
        <p className="corpo mt-6 max-w-xl text-tinta/80">
          Aros disponíveis: {RING_SIZES[0]} a {RING_SIZES[RING_SIZES.length - 1]}. Errou? A troca de aro é sem
          custo nos primeiros 30 dias.
        </p>
        <div className="mt-10 border border-tinta/30 bg-branco p-6">
          <h2 className="rotulo text-[11px]">Como medir</h2>
          <p className="mt-3 text-[15px] text-tinta/80">{MISSING} (passo a passo para medir o aro em casa)</p>
          <h2 className="rotulo mt-8 text-[11px]">Tabela de medidas</h2>
          <p className="mt-3 text-[15px] text-tinta/80">{MISSING} (diâmetro interno em mm de cada aro)</p>
        </div>
      </Container>
    </section>
  );
}
