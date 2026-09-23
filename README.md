# Sitange: catálogo de produtos

Site estático (HTML, CSS e JavaScript puro) de catálogo, com busca, filtro por categoria e pedido pelo WhatsApp. Feito para publicar no GitHub Pages.

## Estrutura

```
index.html        Página principal
css/style.css     Visual do site (cores no topo do arquivo)
js/config.js      Número do WhatsApp e moeda
js/produtos.js    Lista de produtos
js/app.js         Lógica de busca, filtro e exibição
img/              Imagens dos produtos
```

## Como editar

- **Número do WhatsApp:** em `js/config.js`, troque `whatsapp` (DDI + DDD + número, só números, ex.: `5511999999999`).
- **Produtos:** em `js/produtos.js`, edite ou copie um bloco `{ ... }`. Coloque a foto na pasta `img/` e informe o caminho em `imagem`.
- **Cores:** em `css/style.css`, altere as variáveis no bloco `:root`.

## Como ver no computador

Abra o arquivo `index.html` no navegador (dois cliques). Não é necessário instalar nada.

## Como publicar no GitHub Pages

1. No GitHub, abra o repositório e vá em **Settings → Pages**.
2. Em **Source**, escolha **Deploy from a branch**.
3. Selecione a branch (ex.: `main`) e a pasta `/ (root)`, depois clique em **Save**.
4. Em cerca de 1 minuto o site fica disponível no endereço mostrado na mesma página.
