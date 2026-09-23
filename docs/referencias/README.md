# Referências de design

## Seção "O que chega até você" (home)

- Onde está: `components/Unboxing.tsx` (usada em `app/page.tsx`).
- Versão anterior: `o-que-chega-atual.webp`.
- Versão atual: mosaico 3×3 no estilo da referência enviada (seção de imprensa da Lucia):
  duas fotos altas nas laterais (Curva à esquerda embaixo, Linha à direita em cima), na linha de
  cima os desenhos da seda com adesivo e da caixa com cinta (do mockup), o manual de uso
  ("Como usar") no meio e, embaixo, a caixa de aliança verde aberta (ilustração inspirada numa
  foto de referência enviada, com a marca TANGÈ) e o detalhe ampliado das letras "CA" da Letra
  (`public/produtos/letra-detalhe.webp`). Fotos verticais em `public/produtos/*-vertical.webp`.
  Sem estrelas nem logos de imprensa: o briefing proíbe avaliação ou selo inventado.

## Mockup da embalagem

Arquivo: `embalagem-mockup.webp`. O bloco de custo estimado do mockup original foi retirado de propósito, porque este repositório é público.

### Conteúdo do mockup

**Rótulo:** Embalagem · **Título:** Sem caixa personalizada
**Texto lateral:** Caixa de papelão comum, comprada pronta. Tudo que carrega a marca é impresso em papel — adesivo, cinta e cartões. Trocar a identidade depois custa uma nova rodada de impressão, não um novo molde de caixa.

**Itens (painel branco, com ilustração de cada um):**
- **Caixa + cinta:** Papelão kraft pronto, 12×9×5 cm. A cinta de papel verde é o que faz a marca.
- **Caixa de aliança:** Verde, comprada pronta, sem nada impresso.
- **Seda + adesivo:** Papel seda creme, lacrado por um adesivo de 4 cm — só o símbolo, sem o nome.

**Cartão de garantia** (85 × 55 mm, frente e verso)
- Frente (verde): logo TANGÈ + "Garantia de um ano".
- Verso (creme): *O que cobre:* Solda, acabamento e qualquer defeito de fabricação. Ajuste de aro grátis nos primeiros 60 dias. *Pedido:* Nº ______ ___/___/______

**Manual de uso** (100 × 145 mm, uma folha)
- *Como usar:* Encoste uma na outra e gire até assentar. Existe uma posição em que elas param.
- *Cuidado:* Tire para dormir, nadar e treinar. Perfume e álcool escurecem a prata. Passe primeiro, vista depois. Escureceu? Flanela seca resolve. Não use pasta de dente.

**A abertura (painel verde):** Quatro camadas. Cada uma leva alguns segundos. É isso que faz o unboxing existir como vídeo.
1. **A cinta:** Faixa verde em volta da caixa. Rasga ou desliza.
2. **A seda:** Papel creme lacrado pelo adesivo redondo.
3. **A caixa verde:** As duas peças chegam encostadas, já assentadas.
4. **Os cartões:** Garantia e manual, embaixo da caixa verde.

### Divergências com o site atual (confirmar antes de aplicar)
- **Ajuste/troca de aro:** o cartão diz **60 dias**; o site diz **30 dias** (faixa da página de produto, garantias e `sizeExchangeDays` em `lib/products.ts`).
- **Estojo:** o site fala em "estojo verde garrafa, liso"; o mockup fala em "caixa de aliança verde, comprada pronta".
