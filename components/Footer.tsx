import Link from "next/link";
import { Symbol } from "./Symbol";
import { MISSING, getProductsByFamily } from "@/lib/products";

const columns = [
  {
    title: "Para dois",
    links: getProductsByFamily("para-dois").map((p) => ({ label: p.name, href: `/pecas/${p.slug}` })),
  },
  {
    title: "Para um",
    links: getProductsByFamily("para-um").map((p) => ({ label: p.name, href: `/pecas/${p.slug}` })),
  },
  {
    title: "Ajuda",
    links: [
      { label: "Guia de aro", href: "/aro" },
      { label: "Como funciona", href: "/#como-funciona" },
      { label: "Termos de Uso", href: "/termos" },
      { label: "Política de Privacidade", href: "/privacidade" },
      { label: `Contato ${MISSING}`, href: null },
    ],
  },
  {
    title: "Onde",
    links: [
      { label: `Instagram ${MISSING}`, href: null },
      { label: `TikTok ${MISSING}`, href: null },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-verde text-creme-claro">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-4 pb-10 pt-16 md:px-10 lg:grid-cols-[1.2fr_2fr]">
        <div className="max-w-sm">
          <Symbol className="h-12 w-12" />
          <p className="mt-6 text-[20px] font-medium uppercase tracking-[0.34em]">Tangè</p>
          <p className="corpo mt-4 text-creme-claro/80">
            Anéis em prata 925 maciça, feitos sob encomenda no Brasil. Toda peça é duas.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <h2 className="rotulo text-laranja">{col.title}</h2>
              <ul className="mt-4">
                {col.links.map((l) =>
                  l.href ? (
                    <li key={l.label}>
                      <Link href={l.href} className="flex min-h-11 items-center text-[15px] hover:text-laranja">
                        {l.label}
                      </Link>
                    </li>
                  ) : (
                    <li key={l.label} className="flex min-h-11 items-center text-[15px] text-creme-claro/80">
                      {l.label}
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto flex max-w-[1440px] flex-col gap-2 border-t border-[#F2E9DA26] px-4 py-6 md:flex-row md:justify-between md:px-10">
        <p className="rotulo text-[10px] text-creme-claro/80">CNPJ {MISSING}</p>
        <p className="rotulo text-[10px] text-creme-claro/80">Duas peças. Um ponto.</p>
      </div>
    </footer>
  );
}
