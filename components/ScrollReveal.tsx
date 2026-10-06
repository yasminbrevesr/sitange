"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Entrada suave (sobe e aparece) dos títulos e cards ao rolar a página.
// Só anima o que está ABAIXO da tela quando a página abre (nada "pisca" no topo)
// e não faz nada para quem pediu menos movimento no sistema (prefers-reduced-motion).
const TARGETS = "main h2, main ul.grid > li, main [data-reveal]";

export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>(TARGETS)).filter(
      (el) => el.getBoundingClientRect().top > window.innerHeight,
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          el.classList.remove("reveal-pending");
          observer.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    for (const el of els) {
      // Cards da mesma lista entram um pouco depois do outro.
      const index = el.parentElement ? Array.from(el.parentElement.children).indexOf(el) : 0;
      el.style.transitionDelay = el.matches("li") ? `${Math.min(index, 4) * 80}ms` : "";
      el.classList.add("reveal", "reveal-pending");
      observer.observe(el);
    }
    return () => {
      observer.disconnect();
      for (const el of els) el.classList.remove("reveal-pending");
    };
  }, [pathname]);

  return null;
}
