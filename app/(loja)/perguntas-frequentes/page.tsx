import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY } from "@/lib/site";
import { Container } from "@/components/Container";
import { Dot } from "@/components/Dot";
import { MISSING, RING_SIZES, formatPrice, products } from "@/lib/products";
import { STORE } from "@/lib/store";

export const metadata: Metadata = {
  title: "Perguntas frequentes",
  description:
    "Prazo de produção, entrega, troca de aro, garantia, gravação, pagamento e cuidados com a prata 950 das peças TANGÈ.",
  alternates: { canonical: "perguntas-frequentes/" },
};

const shared = products[0];

type QA = { q: string; a: React.ReactNode; text: string };

// Respostas a partir das regras da loja (lib/store.ts e lib/products.ts). [COLOCAR AQUI] = informação que falta.
const GROUPS: { title: string; items: QA[] }[] = [
  {
    title: "Prazo e entrega",
    items: [
      {
        q: "Quanto tempo leva para a peça ficar pronta?",
        text: `Cada peça é feita sob encomenda e fica pronta em até ${shared.productionDays} dias úteis depois da confirmação do pagamento. O prazo de entrega começa a contar depois disso.`,
        a: null,
      },
      {
        q: "Quanto custa o frete e quanto tempo demora?",
        text: `O frete é calculado na sacola pelo CEP, com as opções dos Correios e o prazo de cada uma. Acima de ${formatPrice(STORE.freeShippingMinCents)} em peças, a opção mais barata é grátis.`,
        a: null,
      },
      {
        q: "Como acompanho meu pedido?",
        text: "Em Minha conta, na parte Meus pedidos, aparece cada etapa: pago, em produção, enviado e entregue. Quando a peça sai, o código de rastreio dos Correios aparece ali.",
        a: (
          <>
            Em <Link href="/minha-conta/" className="underline underline-offset-4">Minha conta</Link>, na parte Meus pedidos,
            aparece cada etapa: pago, em produção, enviado e entregue. Quando a peça sai, o código de rastreio dos Correios aparece ali.
          </>
        ),
      },
    ],
  },
  {
    title: "Aro e troca",
    items: [
      {
        q: "Como descubro meu aro?",
        text: `No guia de aro tem um medidor na tela, uma calculadora com barbante e a tabela de medidas. Fazemos aros de ${RING_SIZES[0]} a ${RING_SIZES[RING_SIZES.length - 1]}.`,
        a: (
          <>
            No <Link href="/aro" className="underline underline-offset-4">guia de aro</Link> tem um medidor na tela, uma
            calculadora com barbante e a tabela de medidas. Fazemos aros de {RING_SIZES[0]} a {RING_SIZES[RING_SIZES.length - 1]}.
          </>
        ),
      },
      {
        q: "E se o aro não servir?",
        text: `A troca de aro é sem custo nos primeiros ${shared.sizeExchangeDays} dias depois do recebimento. Como fazer a troca: ${MISSING}.`,
        a: null,
      },
      {
        q: "Nas peças Para dois, cada parte tem um aro?",
        text: "Sim. As duas partes têm tamanhos diferentes e foram feitas para mãos diferentes, então você escolhe um aro para cada uma.",
        a: null,
      },
    ],
  },
  {
    title: "Gravação",
    items: [
      {
        q: "A gravação tem custo?",
        text: `Não. A gravação está incluída, com até ${shared.engravingMaxChars} caracteres por peça. É só escrever o texto na página da peça antes de colocar na sacola.`,
        a: null,
      },
    ],
  },
  {
    title: "Pagamento",
    items: [
      {
        q: "Quais são as formas de pagamento?",
        text: `PIX, com ${STORE.pixDiscountPercent}% de desconto nas peças, ou cartão de crédito em até ${STORE.maxInstallmentsInterestFree}x sem juros. O pagamento é processado pelo Mercado Pago.`,
        a: null,
      },
      {
        q: "Preciso ter conta para comprar?",
        text: "Sim. Com a conta, você acompanha o pedido, guarda endereços e não precisa preencher tudo de novo na próxima compra.",
        a: null,
      },
      {
        q: "Tenho um cupom. Onde uso?",
        text: "Na sacola, no campo Cupom de desconto. O desconto do cupom vale sobre as peças. No PIX, os 5% entram depois do cupom.",
        a: null,
      },
    ],
  },
  {
    title: "Garantia e cuidados",
    items: [
      {
        q: "As peças têm garantia?",
        text: `Sim, ${STORE.warrantyMonths} meses. O que a garantia cobre: ${MISSING}.`,
        a: null,
      },
      {
        q: "A prata escurece?",
        text: "Pode escurecer com o tempo. É a reação natural da prata 950 com o ar, o suor e alguns produtos. Não é defeito e sai com limpeza.",
        a: null,
      },
      {
        q: "Como cuidar da peça?",
        text: "Tire a peça para entrar no mar, na piscina e no banho, e para usar produtos de limpeza. Passe perfume e creme antes de colocar a peça. Para limpar, use um pano macio próprio para prata. Guarde seca, separada de outras joias.",
        a: null,
      },
    ],
  },
  {
    title: "Contato",
    items: [
      {
        q: "Como falo com a TANGÈ?",
        text: `Pelo WhatsApp ${COMPANY.phone}.`,
        a: (
          <>
            Pelo WhatsApp{" "}
            <a href={COMPANY.whatsappHref} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
              {COMPANY.phone}
            </a>
            .
          </>
        ),
      },
    ],
  },
];

export default function PerguntasPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: GROUPS.flatMap((g) => g.items)
      .filter((i) => !i.text.includes(MISSING))
      .map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.text } })),
  };

  return (
    <section className="bg-creme-claro py-16 md:py-24" aria-labelledby="faq-titulo">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Container className="max-w-[960px]">
        <p className="rotulo text-[10px] text-laranja-tinta">Ajuda</p>
        <h1 id="faq-titulo" className="display mt-3 text-[46px] md:text-[62px]">
          Perguntas frequentes
          <Dot />
        </h1>

        <div className="mt-12 flex flex-col gap-10">
          {GROUPS.map((g) => (
            <section key={g.title} aria-labelledby={`faq-${g.title}`}>
              <h2 id={`faq-${g.title}`} className="rotulo mb-4 text-[11px]">
                {g.title}
              </h2>
              <div className="divide-y divide-tinta/10 border border-tinta/15 bg-branco">
                {g.items.map((i) => (
                  <details key={i.q} className="group">
                    <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[16px] text-verde hover:bg-creme-claro/50 md:px-6 [&::-webkit-details-marker]:hidden">
                      {i.q}
                      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 transition-transform group-open:rotate-45" aria-hidden="true">
                        <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </summary>
                    <p className="px-5 pb-5 text-[15px] leading-relaxed text-tinta/80 md:px-6">{i.a ?? i.text}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Container>
    </section>
  );
}
