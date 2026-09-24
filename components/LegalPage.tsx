import type { ReactNode } from "react";
import { Container } from "./Container";

// Layout das páginas legais (Política de Privacidade e Termos de Uso)
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <section className="bg-branco py-16 md:py-24" aria-labelledby="legal-titulo">
      <Container className="max-w-[820px]">
        <p className="rotulo text-[10px] text-laranja-tinta">Última atualização: {updated}</p>
        <h1 id="legal-titulo" className="display mt-3 text-[40px] md:text-[56px]">
          {title}
        </h1>
        <div className="legal mt-10 text-[16px] leading-[1.75] text-tinta/85">{children}</div>
      </Container>
    </section>
  );
}
