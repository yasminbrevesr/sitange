"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { displayName, signOut, useSession } from "@/lib/auth";
import { Symbol } from "../Symbol";

const MENU = [
  { href: "/minha-conta/", label: "Meus pedidos", icon: "pedidos" },
  { href: "/minha-conta/dados/", label: "Meus dados", icon: "dados" },
  { href: "/minha-conta/enderecos/", label: "Meus endereços", icon: "enderecos" },
] as const;

function Icon({ name }: { name: "pedidos" | "dados" | "enderecos" | "sair" | "usuario" | "cadeado" | "seta" }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
      {name === "pedidos" && <g {...p}><path d="M5 8h14l-1.2 12.5H6.2z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></g>}
      {name === "dados" && <g {...p}><circle cx="12" cy="8" r="3.8" /><path d="M4.5 20.5c.8-3.8 3.8-6 7.5-6s6.7 2.2 7.5 6" /></g>}
      {name === "usuario" && <g {...p}><circle cx="12" cy="8" r="3.8" /><path d="M4.5 20.5c.8-3.8 3.8-6 7.5-6s6.7 2.2 7.5 6" /></g>}
      {name === "enderecos" && <g {...p}><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.3" /></g>}
      {name === "sair" && <g {...p}><path d="M14 4.5H6.5v15H14" /><path d="M10.5 12H20m-3-3 3 3-3 3" /></g>}
      {name === "cadeado" && <g {...p}><rect x="5" y="10.5" width="14" height="10" rx="1.5" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></g>}
      {name === "seta" && <g {...p}><path d="M19 12H5m5-5-5 5 5 5" /></g>}
    </svg>
  );
}

// Área logada: topo próprio (voltar à loja, logo, conexão segura), cartão da pessoa e menu lateral.
// Sem sessão, manda para /entrar.
export function AccountShell({ children }: { children: ReactNode }) {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (session === null) router.replace("/entrar/");
  }, [session, router]);

  useEffect(() => setOpen(false), [pathname]);

  const current = (href: string) => {
    const clean = (s: string) => s.replace(/\/$/, "");
    return clean(pathname) === clean(href) || clean(pathname).endsWith(clean(href));
  };

  return (
    <div className="min-h-screen bg-branco">
      <header className="border-b border-tinta/10 bg-creme-claro">
        <div className="mx-auto grid h-16 max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 md:px-10">
          <Link href="/" className="rotulo flex min-h-11 items-center gap-2 text-[10px] hover:text-verde">
            <Icon name="seta" />
            <span className="hidden sm:inline">Continuar comprando</span>
            <span className="sm:hidden">Loja</span>
          </Link>
          <Link href="/" aria-label="TANGÈ, página inicial" className="flex min-h-11 items-center gap-2.5 text-verde">
            <Symbol className="h-6 w-6" decorative />
            <span className="text-[20px] font-medium uppercase tracking-[0.34em]">Tangè</span>
          </Link>
          <p className="rotulo flex items-center justify-end gap-2 text-[10px] text-tinta/75">
            <Icon name="cadeado" />
            <span className="hidden sm:inline">Conexão segura</span>
          </p>
        </div>
      </header>

      <main id="conteudo" className="mx-auto max-w-[1280px] px-4 py-8 md:px-10 md:py-12">
        {!session ? (
          <p className="py-24 text-center text-[15px] text-tinta/75" role="status">
            Carregando sua conta…
          </p>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[320px_1fr] lg:gap-12">
            <aside>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="menu-conta"
                className="flex w-full items-center gap-4 border border-tinta/15 p-4 text-left lg:cursor-default"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-tinta/20 text-verde">
                  <Icon name="usuario" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-normal">Olá, {displayName(session)}</span>
                  <span className="rotulo block truncate text-[10px] text-tinta/75">{session.user.email}</span>
                </span>
                <svg viewBox="0 0 12 12" className={`h-3 w-3 transition-transform lg:hidden ${open ? "rotate-180" : ""}`} aria-hidden="true">
                  <path d="M2 4 L6 8 L10 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>

              <nav id="menu-conta" aria-label="Minha conta" className={`${open ? "block" : "hidden"} lg:block`}>
                <ul>
                  {MENU.map((m) => {
                    const active = current(m.href);
                    return (
                      <li key={m.href}>
                        <Link
                          href={m.href}
                          aria-current={active ? "page" : undefined}
                          className={`flex min-h-14 items-center gap-3 border-b border-tinta/10 px-4 text-[15px] ${
                            active ? "bg-creme-claro font-medium text-verde" : "hover:bg-creme-claro/60"
                          }`}
                        >
                          <Icon name={m.icon} />
                          {m.label}
                        </Link>
                      </li>
                    );
                  })}
                  <li>
                    <button
                      type="button"
                      onClick={async () => {
                        await signOut();
                        router.replace("/");
                      }}
                      className="flex min-h-14 w-full items-center gap-3 border-b border-tinta/10 px-4 text-left text-[15px] hover:bg-creme-claro/60"
                    >
                      <Icon name="sair" />
                      Sair
                    </button>
                  </li>
                </ul>
              </nav>
            </aside>

            <section className="min-w-0">{children}</section>
          </div>
        )}
      </main>
    </div>
  );
}
