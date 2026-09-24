"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { displayName, signOut, useSession } from "@/lib/auth";
import { Symbol } from "../Symbol";
import { QuickCart } from "./QuickCart";

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
  const [leaving, setLeaving] = useState(false);
  const confirmRef = useRef<HTMLDialogElement>(null);

  // Sem sessão, vai para /entrar (a não ser que a pessoa tenha acabado de escolher sair: aí vai para a home)
  useEffect(() => {
    if (session === null && !leaving) router.replace("/entrar/");
  }, [session, leaving, router]);

  useEffect(() => setOpen(false), [pathname]);

  const current = (href: string) => {
    const clean = (s: string) => s.replace(/\/$/, "");
    return clean(pathname) === clean(href) || clean(pathname).endsWith(clean(href));
  };

  return (
    <div className="min-h-screen bg-branco">
      <header className="bg-verde text-creme-claro">
        <div className="mx-auto grid h-16 max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 md:px-10">
          <Link href="/" className="rotulo flex min-h-11 items-center gap-2 text-[10px] hover:text-laranja">
            <Icon name="seta" />
            <span className="hidden sm:inline">Continuar comprando</span>
            <span className="sm:hidden">Loja</span>
          </Link>
          <Link href="/" aria-label="TANGÈ, página inicial" className="flex min-h-11 items-center gap-2.5">
            <Symbol className="h-6 w-6" decorative />
            <span className="text-[20px] font-medium uppercase tracking-[0.34em]">Tangè</span>
          </Link>
          <p className="rotulo flex items-center justify-end gap-2 text-[10px] text-creme-claro/85">
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
                className="flex w-full items-center gap-4 bg-verde p-5 text-left text-creme-claro lg:cursor-default"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-creme-claro/40">
                  <Icon name="usuario" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-normal">Olá, {displayName(session)}</span>
                  <span className="rotulo block truncate text-[10px] text-creme-claro/80">{session.user.email}</span>
                </span>
                <svg viewBox="0 0 12 12" className={`h-3 w-3 transition-transform lg:hidden ${open ? "rotate-180" : ""}`} aria-hidden="true">
                  <path d="M2 4 L6 8 L10 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>

              <nav id="menu-conta" aria-label="Minha conta" className={`${open ? "block" : "hidden"} mt-2 lg:block`}>
                <ul>
                  {MENU.map((m) => {
                    const active = current(m.href);
                    return (
                      <li key={m.href}>
                        <Link
                          href={m.href}
                          aria-current={active ? "page" : undefined}
                          className={`flex min-h-14 items-center gap-3 border-b border-tinta/10 px-4 text-[15px] ${
                            active ? "bg-verde font-medium text-creme-claro" : "text-verde hover:bg-verde/5"
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
                      onClick={() => confirmRef.current?.showModal()}
                      className="flex min-h-14 w-full items-center gap-3 border-b border-tinta/10 px-4 text-left text-[15px] text-verde hover:bg-verde/5"
                    >
                      <Icon name="sair" />
                      Sair
                    </button>
                  </li>
                </ul>
              </nav>

              <div className={`${open ? "block" : "hidden"} lg:block`}>
                <QuickCart />
              </div>
            </aside>

            <section className="min-w-0">{children}</section>
          </div>
        )}

        {/* confirmação para não sair com um toque sem querer; "Ficar" vem selecionado */}
        <dialog
          ref={confirmRef}
          aria-labelledby="sair-titulo"
          aria-describedby="sair-texto"
          onClick={(e) => {
            if (e.target === confirmRef.current) confirmRef.current?.close();
          }}
          className="m-auto w-[calc(100%-32px)] max-w-[420px] bg-branco p-0 text-tinta backdrop:bg-[#121212b3]"
        >
          <div className="bg-verde px-8 py-6 text-creme-claro">
            <Symbol className="h-8 w-8" decorative />
          </div>
          <div className="p-8">
            <h2 id="sair-titulo" className="display text-[30px] text-verde">
              Tem certeza que quer sair
              <span className="text-laranja">?</span>
            </h2>
            <p id="sair-texto" className="mt-3 text-[15px] text-tinta/80">
              Peças incríveis te esperam aqui.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <button
                type="button"
                autoFocus
                onClick={() => confirmRef.current?.close()}
                className="rotulo min-h-14 w-full rounded-full bg-verde px-8 text-[11px] text-creme-claro hover:bg-verde-claro"
              >
                Ficar
              </button>
              <button
                type="button"
                disabled={leaving}
                onClick={async () => {
                  setLeaving(true);
                  await signOut();
                  confirmRef.current?.close();
                  router.replace("/");
                }}
                className="rotulo min-h-12 w-full text-[11px] text-tinta/80 underline underline-offset-4 hover:text-tinta disabled:opacity-60"
              >
                {leaving ? "Saindo…" : "Sair da conta"}
              </button>
            </div>
          </div>
        </dialog>
      </main>
    </div>
  );
}
