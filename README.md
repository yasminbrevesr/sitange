# TANGÈ: loja online

Loja da TANGÈ, anéis em prata 925 feitos de duas partes que se encaixam.
Feita com Next.js (App Router), TypeScript e Tailwind CSS. É exportada como site estático e publicada no GitHub Pages.

## Rodar no computador

Precisa do [Node.js](https://nodejs.org) 22 ou mais novo.

```bash
npm install
npm run dev
```

Depois, abra http://localhost:3000.

## Onde editar

| O quê | Arquivo |
|---|---|
| Produtos: nome, preço, peso, descrição e fotos | `lib/products.ts` |
| Cores da marca (tokens) | `app/globals.css` |
| Textos da home | `app/page.tsx` |
| Página de produto | `app/pecas/[slug]/page.tsx`, `components/BuyBox.tsx`, `components/Gallery.tsx` |
| Menu e rodapé | `components/Nav.tsx`, `components/Footer.tsx` |

### Fotos dos produtos
Enquanto não houver fotos, o site mostra uma ilustração de cada peça.
Para usar fotos reais:

1. Coloque os arquivos em `public/produtos/` (por exemplo, `public/produtos/curva-encaixadas.jpg`).
2. Em `lib/products.ts`, troque `src: null` pelo caminho da foto (por exemplo, `src: "/produtos/curva-encaixadas.jpg"`).

### Informação pendente
Todo texto marcado como `[COLOCAR AQUI]` aparece no site e precisa ser preenchido. Para encontrar todos:

```bash
grep -rn "COLOCAR AQUI\|null" lib/ app/ components/
```

## Publicar (GitHub Pages)

A configuração é feita uma vez só:

1. No GitHub, abra o repositório e vá em **Settings → Pages**.
2. Em **Build and deployment → Source**, escolha **GitHub Actions**.

Depois disso, cada alteração enviada para a branch `main` publica o site sozinha, em cerca de 2 minutos.
O endereço aparece em **Settings → Pages** e em **Actions**.

## Sacola e pagamento
Por enquanto, a sacola fica salva só no navegador de quem está comprando. Ainda não existe checkout nem pagamento.
Quando a plataforma de e-commerce for escolhida (Shopify, Nuvemshop, Stripe etc.), a integração entra em
`components/CartProvider.tsx` e `components/CartView.tsx`, e os produtos passam a vir da API em `lib/products.ts`.
