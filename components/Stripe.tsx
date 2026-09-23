"use client";

import { useState } from "react";

// Faixa laranja de 54px que corre como esteira. A trilha tem duas metades iguais e
// anda 50% em loop, então a emenda não aparece. Para quem pede menos movimento, fica parada.
const REPEAT = 3; // cada metade repete os itens para cobrir telas largas

export function Stripe({ items }: { items: string[] }) {
  const [paused, setPaused] = useState(false);
  const half = Array.from({ length: REPEAT }, () => items).flat();

  return (
    <div className="relative overflow-hidden bg-laranja text-tinta">
      <ul className="sr-only">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <div className="esteira flex w-max" data-paused={paused} aria-hidden="true">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex min-h-[54px] shrink-0 items-center">
            {half.map((item, i) => (
              <span key={i} className="flex items-center">
                <span className="rotulo whitespace-nowrap px-5 text-[10px] md:px-8 md:text-[11px]">{item}</span>
                <span className="text-[#12121266]">/</span>
              </span>
            ))}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? "Continuar movimento da faixa" : "Pausar movimento da faixa"}
        aria-pressed={paused}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center bg-laranja motion-reduce:hidden"
      >
        <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
          {paused ? (
            <path d="M3 1.5 L10 6 L3 10.5 Z" fill="currentColor" />
          ) : (
            <path d="M3 1.5 H5 V10.5 H3 Z M7 1.5 H9 V10.5 H7 Z" fill="currentColor" />
          )}
        </svg>
      </button>
    </div>
  );
}
