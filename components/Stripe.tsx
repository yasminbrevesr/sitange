"use client";

import { useState, type ReactNode } from "react";
import { formatPrice } from "@/lib/products";
import { STORE } from "@/lib/store";

// Faixa laranja de 54px que corre como esteira, com os benefícios da loja (valores em lib/store.ts).
// A trilha tem duas metades iguais e anda 50% em loop, então a emenda não aparece.
// Para quem pede menos movimento, fica parada.
const REPEAT = 2; // cada metade repete os itens para cobrir telas largas

type IconName = "caixa" | "cartao" | "garantia" | "pix" | "caminhao" | "gravacao";

function Icon({ name }: { name: IconName }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" aria-hidden="true">
      {name === "caixa" && (
        <g {...common}>
          <path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z" />
          <path d="M3.5 7.5 12 12l8.5-4.5M12 12v9M7.8 5.3l8.5 4.5" />
        </g>
      )}
      {name === "cartao" && (
        <g {...common}>
          <rect x="3" y="5.5" width="18" height="13" rx="2" />
          <path d="M3 9.5h18M6.5 14.5h4" />
        </g>
      )}
      {name === "garantia" && (
        <g {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="m8.3 12.2 2.5 2.5 5-5" />
        </g>
      )}
      {name === "pix" && (
        <g {...common}>
          <path d="M12 3.5 20.5 12 12 20.5 3.5 12z" />
          <path d="M8.5 12h7M12 8.5v7" />
        </g>
      )}
      {name === "caminhao" && (
        <g {...common}>
          <path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3.2v2.8h-7" />
          <circle cx="6.5" cy="17" r="1.7" />
          <circle cx="16.8" cy="17" r="1.7" />
        </g>
      )}
      {name === "gravacao" && (
        <g {...common}>
          <path d="m14.5 5 4.5 4.5L9 19.5H4.5V15z" />
          <path d="m12.5 7 4.5 4.5" />
        </g>
      )}
    </svg>
  );
}

const b = (text: string) => <strong className="font-semibold">{text}</strong>;

const BENEFITS: { icon: IconName; label: string; content: ReactNode }[] = [
  {
    icon: "caixa",
    label: `Frete grátis acima de ${formatPrice(STORE.freeShippingMinCents)}`,
    content: (
      <>
        {b("Frete grátis")} acima de {formatPrice(STORE.freeShippingMinCents)}
      </>
    ),
  },
  {
    icon: "cartao",
    label: `Em até ${STORE.maxInstallmentsInterestFree}x sem juros`,
    content: <>Em até {b(`${STORE.maxInstallmentsInterestFree}x sem juros`)}</>,
  },
  {
    icon: "garantia",
    label: `Garantia de ${STORE.warrantyMonths / 12} ano em todas as peças`,
    content: (
      <>
        {b("Garantia")} de {STORE.warrantyMonths / 12} ano em todas as peças
      </>
    ),
  },
  {
    icon: "pix",
    label: `${STORE.pixDiscountPercent}% de desconto pagando no Pix`,
    content: (
      <>
        {b(`${STORE.pixDiscountPercent}%`)} de desconto pagando no {b("Pix")}
      </>
    ),
  },
  {
    icon: "caminhao",
    label: "Envio expresso disponível",
    content: <>Envio {b("expresso")} disponível</>,
  },
  {
    icon: "gravacao",
    label: "Gravação incluída",
    content: <>{b("Gravação")} incluída</>,
  },
];

export function Stripe() {
  const [paused, setPaused] = useState(false);
  const half = Array.from({ length: REPEAT }, () => BENEFITS).flat();

  return (
    <div className="relative overflow-hidden bg-laranja text-tinta">
      <ul className="sr-only">
        {BENEFITS.map((item) => (
          <li key={item.label}>{item.label}</li>
        ))}
      </ul>

      <div className="esteira flex w-max" data-paused={paused} aria-hidden="true">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex min-h-[54px] shrink-0 items-center">
            {half.map((item, i) => (
              <span
                key={i}
                className="flex items-center gap-2 whitespace-nowrap px-8 text-[13px] font-light md:px-14 md:text-[14px]"
              >
                <Icon name={item.icon} />
                <span>{item.content}</span>
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
