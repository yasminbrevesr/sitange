// Dados mockados do catálogo. A estrutura já é a que uma API/headless deve devolver:
// para trocar, substitua o conteúdo de `products` e mantenha as funções de acesso abaixo.
// Campos com `null` são informação que ainda falta e aparecem como [COLOCAR AQUI] no site.

export type Family = "para-dois" | "para-um";

export type ImageView = "encaixadas" | "separadas" | "parte" | "verde";

export type ProductImage = {
  view: ImageView;
  /** Caminho da foto real. Enquanto for null, o site mostra a ilustração da peça. */
  src: string | null;
  alt: string;
};

export type ProductPart = {
  label: string;
  weightGrams: number | null;
  diameterMm: number | null;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  family: Family;
  /** Preço do par, em centavos. */
  priceCents: number;
  maxInstallments: number;
  totalWeightGrams: number;
  parts: [ProductPart, ProductPart];
  shortDescription: string;
  material: string;
  finish: string;
  productionDays: number;
  engravingMaxChars: number;
  warrantyMonths: number;
  sizeExchangeDays: number;
  sizes: number[];
  images: ProductImage[];
};

export const RING_SIZES = Array.from({ length: 17 }, (_, i) => i + 10); // 10 a 26

export const FAMILIES: Record<Family, { label: string; tag: string; description: string }> = {
  "para-dois": {
    label: "Para dois",
    tag: "Duas pessoas",
    description:
      "As duas partes têm tamanhos diferentes e foram feitas para mãos diferentes. Cada um usa a sua. Juntas de novo só quando vocês estiverem.",
  },
  "para-um": {
    label: "Para um",
    tag: "Você decide",
    description:
      "As duas partes são iguais e ficam com você. Juntas num dedo, ou separadas em dois. Um aro só — o anelar, o médio e o indicador têm praticamente a mesma largura.",
  },
};

const shared = {
  maxInstallments: 6,
  material: "Prata 925 maciça",
  finish: "Polido",
  productionDays: 10,
  engravingMaxChars: 12,
  warrantyMonths: 12,
  sizeExchangeDays: 30,
  sizes: RING_SIZES,
};

function images(name: string, family: Family, photo: { src: string | null; alt?: string }): ProductImage[] {
  const destino =
    family === "para-dois" ? "uma para cada mão" : "iguais, lado a lado";
  return [
    { view: "encaixadas", src: photo.src, alt: photo.alt ?? `Anel ${name} em prata com as duas partes encaixadas` },
    { view: "separadas", src: null, alt: `Anel ${name} com as duas partes separadas, ${destino}` },
    { view: "parte", src: null, alt: `Uma das duas partes do anel ${name}, sozinha` },
    { view: "verde", src: null, alt: `Anel ${name} encaixado sobre fundo verde` },
  ];
}

export const products: Product[] = [
  {
    ...shared,
    id: "curva",
    slug: "curva",
    name: "Curva",
    family: "para-dois",
    priceCents: 46000,
    totalWeightGrams: 2.53,
    parts: [
      { label: "Parte maior", weightGrams: 1.75, diameterMm: 21.9 },
      { label: "Parte menor", weightGrams: 0.78, diameterMm: 16.7 },
    ],
    shortDescription: "Dois aros de tamanhos diferentes, um dentro do outro.",
    images: images("Curva", "para-dois", {
      src: "/produtos/curva-encaixadas.webp",
      alt: "Anel Curva em prata polida: um aro maior com um aro menor encaixado por dentro",
    }),
  },
  {
    ...shared,
    id: "letra",
    slug: "letra",
    name: "Letra",
    family: "para-dois",
    priceCents: 82000,
    totalWeightGrams: 5.88,
    parts: [
      { label: "Parte maior", weightGrams: null, diameterMm: null },
      { label: "Parte menor", weightGrams: null, diameterMm: null },
    ],
    shortDescription: "A letra existe partida. Fecha quando as duas mãos se encontram.",
    images: images("Letra", "para-dois", {
      src: "/produtos/letra-encaixadas.webp",
      alt: "Anel Letra em prata polida: duas bandas encaixadas formando as letras C e A, divididas entre as duas partes",
    }),
  },
  {
    ...shared,
    id: "linha",
    slug: "linha",
    name: "Linha",
    family: "para-um",
    priceCents: 24000,
    totalWeightGrams: 1.05,
    parts: [
      { label: "Parte 1", weightGrams: null, diameterMm: null },
      { label: "Parte 2", weightGrams: null, diameterMm: null },
    ],
    shortDescription: "Duas bandas finas e iguais. Um dedo ou dois. A porta de entrada.",
    images: images("Linha", "para-um", {
      src: "/produtos/linha-encaixadas.webp",
      alt: "Anel Linha em prata polida: duas bandas finas e iguais encaixadas lado a lado",
    }),
  },
  {
    ...shared,
    id: "plano",
    slug: "plano",
    name: "Plano",
    family: "para-um",
    priceCents: 78000,
    totalWeightGrams: 5.54,
    parts: [
      { label: "Parte 1", weightGrams: null, diameterMm: null },
      { label: "Parte 2", weightGrams: null, diameterMm: null },
    ],
    shortDescription: "A face reta no topo. É a peça que aparece de longe no vídeo.",
    images: images("Plano", "para-um", {
      src: "/produtos/plano-encaixadas.webp",
      alt: "Anel Plano em prata polida: duas partes encaixadas formando uma face reta no topo",
    }),
  },
];

export function getProducts(): Product[] {
  return products;
}

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByFamily(family: Family): Product[] {
  return products.filter((p) => p.family === family);
}

export const MISSING = "[COLOCAR AQUI]";

export function formatPrice(cents: number): string {
  const digits = cents % 100 === 0 ? 0 : 2;
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatGrams(value: number | null): string {
  if (value === null) return MISSING;
  return `${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} g`;
}

export function formatMm(value: number | null): string {
  if (value === null) return MISSING;
  return `Ø ${value.toLocaleString("pt-BR", { minimumFractionDigits: 1 })} mm`;
}
