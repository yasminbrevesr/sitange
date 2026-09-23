"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "./Symbol";
import { useCart } from "./CartProvider";

const LINKS = [
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/#para-dois", label: "Para dois" },
  { href: "/#para-um", label: "Para um" },
  { href: "/#as-pecas", label: "As peças" },
];

export function Nav() {
  const { items } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-verde text-creme-claro">
      <nav aria-label="Principal" className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 md:px-10">
        <Link href="/" className="flex min-h-11 items-center" aria-label="TANGÈ, página inicial">
          <Logo />
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="rotulo flex min-h-11 items-center hover:text-laranja">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1 md:gap-5">
          <Link href="/aro" className="rotulo hidden min-h-11 items-center px-2 opacity-80 hover:opacity-100 sm:flex">
            Aro
          </Link>
          <Link href="/sacola" className="rotulo flex min-h-11 items-center px-2 hover:text-laranja">
            Sacola ({items.length})
          </Link>
          <button
            type="button"
            className="rotulo flex min-h-11 min-w-11 items-center justify-center px-2 lg:hidden"
            aria-expanded={open}
            aria-controls="menu-movel"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Fechar" : "Menu"}
          </button>
        </div>
      </nav>

      {open && (
        <ul id="menu-movel" className="border-t border-[#F2E9DA26] px-4 pb-4 lg:hidden">
          {[...LINKS, { href: "/aro", label: "Guia de aro" }].map((l) => (
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
      )}
    </header>
  );
}
