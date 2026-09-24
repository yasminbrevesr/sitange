import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Dot } from "@/components/Dot";
import { RingSizer, StringCalculator } from "@/components/RingSizer";
import { MAX_SIZE, MIN_SIZE, SIZE_TABLE, formatMmValue } from "@/lib/ringSizes";

export const metadata: Metadata = { title: "Guia de aro" };

const TIPS = [
  "Meça no fim do dia. De manhã e no frio o dedo fica mais fino.",
  "Ficou entre dois aros? Escolha o maior.",
  "Meça o dedo onde a peça vai ficar. A mão que você mais usa costuma ter o aro um pouco maior.",
  "Nas peças Para dois, cada parte tem o seu aro. Meça as duas mãos.",
];

export default function AroPage() {
  return (
    <section className="bg-creme-claro py-16 md:py-24" aria-labelledby="aro-titulo">
      <Container className="max-w-[960px]">
        <p className="rotulo text-[10px] text-laranja-tinta">Guia</p>
        <h1 id="aro-titulo" className="display mt-3 text-[46px] md:text-[62px]">
          Como achar seu aro
          <Dot />
        </h1>
        <p className="corpo mt-6 max-w-xl text-tinta/80">
          Aros disponíveis: {MIN_SIZE} a {MAX_SIZE}. Errou? A troca de aro é sem custo nos primeiros 30 dias.
        </p>

        <div className="mt-10" id="medidor">
          <h2 className="rotulo mb-4 text-[11px]">Medidor virtual</h2>
          <RingSizer />
        </div>

        <div className="mt-12 grid gap-10 border border-tinta/30 bg-branco p-6 md:grid-cols-2 md:p-8">
          <div>
            <h2 className="rotulo text-[11px]">Sem anel? Meça com um barbante</h2>
            <ol className="mt-4 flex list-decimal flex-col gap-2 pl-5 text-[15px] text-tinta/80">
              <li>Passe um barbante ou uma tira fina de papel em volta do dedo, na base.</li>
              <li>Marque com caneta o ponto onde as pontas se encontram. Precisa passar pela junta sem apertar.</li>
              <li>Estique numa régua e meça, em milímetros, do começo até a marca.</li>
              <li>Digite a medida ao lado.</li>
            </ol>
          </div>
          <StringCalculator />
        </div>

        <div className="mt-12">
          <h2 className="rotulo text-[11px]">Dicas</h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {TIPS.map((t) => (
              <li key={t} className="bg-branco p-5 text-[15px] text-tinta/80">
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12">
          <h2 className="rotulo text-[11px]">Tabela de medidas</h2>
          <div className="mt-4 overflow-x-auto border border-tinta/30 bg-branco">
            <table className="w-full min-w-[320px] text-left text-[15px]">
              <caption className="sr-only">Aro, volta interna e diâmetro interno em milímetros</caption>
              <thead className="bg-verde text-creme-claro">
                <tr>
                  <th scope="col" className="rotulo px-4 py-3 text-[10px] font-medium">Aro</th>
                  <th scope="col" className="rotulo px-4 py-3 text-[10px] font-medium">Volta interna</th>
                  <th scope="col" className="rotulo px-4 py-3 text-[10px] font-medium">Diâmetro interno</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_TABLE.map((r) => (
                  <tr key={r.size} className="border-t border-tinta/15">
                    <th scope="row" className="px-4 py-2.5 font-medium text-verde">{r.size}</th>
                    <td className="px-4 py-2.5 text-tinta/80">{r.circumference} mm</td>
                    <td className="px-4 py-2.5 text-tinta/80">{formatMmValue(r.diameter)} mm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[13px] text-tinta/70">Numeração brasileira: o número do aro é a volta interna em mm menos 40.</p>
        </div>
      </Container>
    </section>
  );
}
