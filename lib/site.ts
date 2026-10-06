// Endereço público do site, sem barra no final (ver NEXT_PUBLIC_SITE_URL em .env.production).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://yasminbrevesr.github.io/sitange").replace(/\/$/, "");

export const SITE_NAME = "TANGÈ";
export const SITE_DESCRIPTION =
  "Anéis em prata 925 maciça, feitos sob encomenda no Brasil. Toda peça é feita de duas partes que se encaixam: para dois ou para um.";

/** Endereço completo de uma página (ex.: absoluteUrl("/aro/")). */
export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

// Dados da empresa (rodapé, termos, privacidade e perguntas frequentes).
export const COMPANY = {
  cnpj: "68.054.344/0001-17",
  phone: "(21) 98467-9373",
  phoneHref: "tel:+5521984679373",
};
