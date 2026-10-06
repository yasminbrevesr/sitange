import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/products";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

// Mapa do site para o Google: só páginas públicas (sem sacola, conta e painel).
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: [string, number][] = [
    ["/", 1],
    ...getProducts().map((p): [string, number] => [`/pecas/${p.slug}/`, 0.9]),
    ["/aro/", 0.7],
    ["/perguntas-frequentes/", 0.6],
    ["/termos/", 0.2],
    ["/privacidade/", 0.2],
  ];
  return pages.map(([path, priority]) => ({ url: absoluteUrl(path), lastModified: now, priority }));
}
