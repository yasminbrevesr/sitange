import type { ReactNode } from "react";

// Bloco numerado da sacola (1 Entrega, 2 Pagamento): fundo branco, número no círculo verde.
export function CheckoutStep({
  n,
  id,
  title,
  note,
  children,
}: {
  n: number;
  id: string;
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="bg-branco p-5 md:p-8">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-verde text-[14px] text-creme-claro">
          {n}
        </span>
        <h2 id={id} className="text-[22px] font-light uppercase tracking-[0.04em] text-verde">
          {title}
        </h2>
      </div>
      {note && <p className="mt-2 text-[13px] text-tinta/75">{note}</p>}
      <div className="mt-6 flex flex-col gap-7">{children}</div>
    </section>
  );
}

/** Lista de opções agrupadas, separadas por linhas finas. */
export const optionGroup = "divide-y divide-tinta/10 border border-tinta/15";

/** Linha de opção; a escolhida ganha fundo creme e barra verde. */
export function optionRow(checked: boolean) {
  return `flex min-h-16 cursor-pointer items-center gap-4 px-4 py-3.5 md:px-5 ${checked ? "bg-creme-claro" : "hover:bg-creme-claro/50"}`;
}

export function GroupLabel({ children }: { children: ReactNode }) {
  return <h3 className="rotulo mb-3 text-[10px] text-tinta/75">{children}</h3>;
}
