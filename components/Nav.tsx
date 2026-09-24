"use client";

import Link from "next/link";
import { useState } from "react";
import { Symbol } from "./Symbol";
import { SearchBox } from "./SearchBox";
import { useCart } from "./CartProvider";

const LINKS = [
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/#para-dois", label: "Para dois" },
  { href: "/#para-um", label: "Para um" },
  { href: "/#as-pecas", label: "As peças" },
];

function RulerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[22px] w-[22px] shrink-0" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
        <rect x="8.5" y="1.5" width="7" height="21" rx="1.2" transform="rotate(35 12 12)" />
        <path d="m9.6 6.3 1.6 1.1M8.2 8.4l2.4 1.7M6.8 10.4l1.6 1.1M5.4 12.5l2.4 1.7M4 14.5l1.6 1.1" />
      </g>
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[22px] w-[22px] shrink-0" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="12" cy="8" r="3.8" />
        <path d="M4.5 20.5c.8-3.8 3.8-6 7.5-6s6.7 2.2 7.5 6" />
      </g>
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[24px] w-[24px]" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
        <path d="M5 8h14l-1.2 12.5H6.2z" />
        <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
      </g>
    </svg>
  );
}

// Menu fixo no topo: busca à esquerda, logo no centro, guia de aro e sacola à direita.
// Embaixo, uma linha fina com os links das seções (no celular, ficam no botão Menu).
export function Nav() {
  const { items } = useCart();
  const [open, setOpen] = useState(false);
  const count = items.length;

  return (
    <header className="sticky top-0 z-50 bg-verde text-creme-claro">
      <nav aria-label="Principal" className="mx-auto max-w-[1440px] px-4 md:px-10">
        <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4 lg:h-20">
          {/* esquerda: busca (desktop) ou botão de menu (celular) */}
          <div className="flex items-center">
            <div className="hidden w-full max-w-[400px] lg:block">
              <SearchBox />
            </div>
            <button
              type="button"
              className="rotulo flex min-h-11 min-w-11 items-center text-[11px] lg:hidden"
              aria-expanded={open}
              aria-controls="menu-movel"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? "Fechar" : "Menu"}
            </button>
          </div>

          {/* centro: logo */}
          <Link href="/" className="flex min-h-11 items-center gap-3" aria-label="TANGÈ, página inicial">
            <Symbol className="h-6 w-6 lg:h-8 lg:w-8" decorative />
            <span className="text-[20px] font-medium uppercase tracking-[0.34em] lg:text-[28px]">Tangè</span>
          </Link>

          {/* direita: guia de aro, conta e sacola */}
          <div className="flex items-center justify-end gap-1 lg:gap-6">
            <Link href="/aro" className="hidden min-h-11 items-center gap-2 text-[14px] font-normal hover:text-laranja lg:flex">
              <RulerIcon />
              Descubra seu aro
            </Link>
            <Link
              href="/entrar"
              aria-label="Entre ou cadastre-se"
              className="flex h-11 min-w-11 items-center justify-center gap-2 text-[14px] font-normal hover:text-laranja"
            >
              <UserIcon />
              <span className="hidden xl:inline" aria-hidden="true">
                Entre / Cadastre-se
              </span>
            </Link>
            <Link
              href="/sacola"
              aria-label={`Sacola, ${count} ${count === 1 ? "item" : "itens"}`}
              className="relative flex h-11 w-11 items-center justify-center hover:text-laranja"
            >
              <BagIcon />
              <span
                aria-hidden="true"
                className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-creme-claro px-1 text-[10px] font-semibold text-verde"
              >
                {count}
              </span>
            </Link>
          </div>
        </div>

        <ul className="hidden h-10 items-center justify-center gap-10 border-t border-[#F2E9DA26] lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="rotulo flex min-h-10 items-center text-[10px] hover:text-laranja">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {open && (
        <div id="menu-movel" className="border-t border-[#F2E9DA26] px-4 pb-4 pt-3 lg:hidden">
          <SearchBox onNavigate={() => setOpen(false)} />
          <ul className="mt-2">
            {[...LINKS, { href: "/aro", label: "Descubra seu aro" }].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="rotulo flex min-h-12 items-center border-b border-[#F2E9DA26]"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
