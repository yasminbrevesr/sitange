"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, type FormEvent } from "react";
import { FAMILIES, formatPrice, getProducts } from "@/lib/products";

const normalize = (t: string) =>
  t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

// Busca de produtos no próprio navegador (o catálogo é pequeno e está em lib/products.ts).
// Mostra as peças que batem com o texto; Enter abre a primeira.
export function SearchBox({ onNavigate }: { onNavigate?: () => void }) {
  const id = useId();
  const router = useRouter();
  const wrapper = useRef<HTMLFormElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const term = normalize(query.trim());
  const results = term
    ? getProducts().filter((p) =>
        normalize(`${p.name} ${FAMILIES[p.family].label} ${p.shortDescription}`).includes(term),
      )
    : [];

  function go() {
    setQuery("");
    setOpen(false);
    onNavigate?.();
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (results[0]) {
      router.push(`/pecas/${results[0].slug}`);
      go();
    }
  }

  return (
    <form
      ref={wrapper}
      role="search"
      onSubmit={onSubmit}
      onBlur={(e) => {
        if (!wrapper.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
      className="relative flex w-full items-center gap-3"
    >
      <button type="submit" aria-label="Buscar" className="flex h-11 w-11 shrink-0 items-center justify-center text-verde">
        <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="m15.5 15.5 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
      <label htmlFor={`${id}-busca`} className="sr-only">
        Buscar produto
      </label>
      <input
        id={`${id}-busca`}
        type="search"
        autoComplete="off"
        placeholder="Buscar produto"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setQuery("");
            setOpen(false);
          }
        }}
        aria-describedby={`${id}-status`}
        className="h-11 w-full min-w-0 border border-verde bg-branco px-4 text-center text-[14px] font-normal text-verde placeholder:text-verde/80 focus:text-left"
      />
      <p id={`${id}-status`} className="sr-only" aria-live="polite">
        {term ? `${results.length} ${results.length === 1 ? "peça encontrada" : "peças encontradas"}` : ""}
      </p>

      {open && term && (
        <div className="absolute left-14 right-0 top-full z-10 mt-1 border border-verde bg-branco">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-[14px] text-tinta/80">Nenhuma peça encontrada.</p>
          ) : (
            <ul>
              {results.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/pecas/${p.slug}`}
                    onClick={go}
                    className="flex min-h-12 items-center justify-between gap-4 px-4 text-[14px] hover:bg-creme-claro focus:bg-creme-claro"
                  >
                    <span>
                      <span className="font-medium text-verde">{p.name}</span>
                      <span className="text-tinta/75"> · {FAMILIES[p.family].label}</span>
                    </span>
                    <span className="text-tinta">{formatPrice(p.priceCents)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </form>
  );
}
