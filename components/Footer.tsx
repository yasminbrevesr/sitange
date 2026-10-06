import { COMPANY } from "@/lib/site";
import Link from "next/link";
import { Symbol } from "./Symbol";
import { MISSING, getProductsByFamily } from "@/lib/products";

// Símbolo do WhatsApp (só o ícone, sem o número escrito).
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
      <path
        fill="currentColor"
        d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.94.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.44-9.43 2.52 0 4.89.98 6.67 2.77a9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.24 9.43-9.44 9.43zm8.03-17.46A11.27 11.27 0 0 0 12.05.72C5.79.72.7 5.81.7 12.07c0 2 .52 3.95 1.52 5.67L.6 23.28l5.67-1.49a11.33 11.33 0 0 0 5.78 1.47h.01c6.25 0 11.34-5.09 11.35-11.35 0-3.03-1.18-5.88-3.33-8.02z"
      />
    </svg>
  );
}

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
      { label: "Perguntas frequentes", href: "/perguntas-frequentes" },
      { label: "Como funciona", href: "/#como-funciona" },
      { label: "Termos de Uso", href: "/termos" },
      { label: "Política de Privacidade", href: "/privacidade" },
      { label: `WhatsApp ${COMPANY.phone}`, href: COMPANY.whatsappHref, icon: true },
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
            Anéis em prata 950 maciça, feitos sob encomenda no Brasil. Toda peça é duas.
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
                      {"icon" in l ? (
                        <a
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={l.label}
                          title={l.label}
                          className="flex min-h-11 min-w-11 items-center hover:text-laranja"
                        >
                          <WhatsAppIcon />
                        </a>
                      ) : (
                        <Link href={l.href} className="flex min-h-11 items-center text-[15px] hover:text-laranja">
                          {l.label}
                        </Link>
                      )}
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
        <p className="rotulo text-[10px] text-creme-claro/80">CNPJ {COMPANY.cnpj}</p>
        <p className="rotulo text-[10px] text-creme-claro/80">Duas peças. Um ponto.</p>
      </div>
    </footer>
  );
}
