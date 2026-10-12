import type { Metadata } from "next";
import { COMPANY } from "@/lib/site";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { MISSING, RING_SIZES, formatPrice, products } from "@/lib/products";
import { STORE } from "@/lib/store";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Termos de uso da loja TANGÈ: pedidos, pagamento, produção sob encomenda, entrega, troca e garantia.",
  alternates: { canonical: "termos/" },
};

const shared = products[0];
const PIX_VALIDADE_MIN = 30; // igual à função criar-pix

// Descreve como a loja funciona hoje (conta, pagamento, frete, cupom, produção e pedidos).
// O que depende de decisão da TANGÈ fica em [COLOCAR AQUI].
// Recomendado: revisão jurídica antes de abrir para clientes.
export default function TermosPage() {
  const whatsapp = (
    <a href={COMPANY.whatsappHref} target="_blank" rel="noopener noreferrer">
      WhatsApp {COMPANY.phone}
    </a>
  );

  return (
    <LegalPage title="Termos de Uso" updated="12 de outubro de 2026">
      <p>
        Estes termos valem para o uso do site da TANGÈ e para as compras feitas nele. Ao criar uma conta ou fazer um pedido,
        você concorda com eles. Razão social: {COMPANY.legalName} · CNPJ: {COMPANY.cnpj} · {COMPANY.city}.
      </p>

      <h2>Conta</h2>
      <p>
        Para comprar é preciso ter uma conta no site. Você é responsável pelas informações da conta e por manter a sua
        senha em segurança. Podemos suspender contas usadas de forma indevida.
      </p>

      <h2>Peças, aros e gravação</h2>
      <ul>
        <li>
          As peças são de {shared.material.toLowerCase()}, feitas sob encomenda, e ficam prontas em até{" "}
          {shared.productionDays} dias úteis depois que o pagamento é confirmado.
        </li>
        <li>
          Fazemos aros de {RING_SIZES[0]} a {RING_SIZES[RING_SIZES.length - 1]}. Nas peças Para dois, você escolhe um aro
          para cada parte. Para medir, use o <Link href="/aro">guia de aro</Link>.
        </li>
        <li>
          A gravação interna, de até {shared.engravingMaxChars} caracteres, está incluída no preço. Ela é feita exatamente
          como foi escrita no pedido: confira o texto antes de pagar.
        </li>
      </ul>

      <h2>Preços, cupons e pagamento</h2>
      <ul>
        <li>Vale o preço mostrado no site no momento do pedido. O total é conferido de novo na hora de pagar.</li>
        <li>
          O pagamento é processado pelo Mercado Pago, por PIX ou cartão de crédito. Os dados do cartão são digitados em
          campos do próprio Mercado Pago: a TANGÈ não recebe nem guarda esses dados.
        </li>
        <li>
          PIX: {STORE.pixDiscountPercent}% de desconto sobre as peças. O código PIX vale por {PIX_VALIDADE_MIN} minutos;
          se não for pago nesse prazo, o pedido é cancelado sem nenhuma cobrança.
        </li>
        <li>
          Cartão de crédito: em até {STORE.maxInstallmentsInterestFree}x sem juros. Se o cartão for recusado, o pedido fica
          cancelado e nada é cobrado.
        </li>
        <li>
          Cupons: um por pedido, com desconto sobre as peças (o frete não entra). Cada cupom pode ter validade e regras
          próprias, como valer só na primeira compra. No PIX, os {STORE.pixDiscountPercent}% são calculados depois do
          cupom.
        </li>
        <li>O pedido só é confirmado e entra em produção depois que o pagamento é aprovado.</li>
      </ul>

      <h2>Entrega</h2>
      <ul>
        <li>
          O frete é calculado na sacola pelo CEP, com as opções das transportadoras (como os Correios), o preço e o prazo
          de cada uma. O prazo de entrega começa a contar depois que a peça fica pronta.
        </li>
        <li>
          A partir de {formatPrice(STORE.freeShippingMinCents)} em peças, a opção de frete mais barata é grátis.
        </li>
        <li>
          Confira o endereço antes de pagar. Quando a peça é enviada, o código de rastreio aparece em{" "}
          <Link href="/minha-conta/">Minha conta → Meus pedidos</Link>, junto com cada etapa do pedido.
        </li>
      </ul>

      <h2>Trocas, devoluções e arrependimento</h2>
      <ul>
        <li>
          Troca de aro sem custo em até {shared.sizeExchangeDays} dias depois do recebimento. Para pedir, fale com a gente
          pelo {whatsapp}.
        </li>
        <li>
          Em compras pela internet, você pode desistir em até 7 dias depois do recebimento (art. 49 do Código de Defesa do
          Consumidor). Regras para peças com gravação: {MISSING}.
        </li>
      </ul>

      <h2>Garantia</h2>
      <p>
        Garantia de {STORE.warrantyMonths} meses contra defeitos de fabricação. Para acionar, fale com a gente pelo{" "}
        {whatsapp}. O escurecimento natural da prata não é defeito e sai com limpeza (veja os cuidados nas{" "}
        <Link href="/perguntas-frequentes">perguntas frequentes</Link>). Outros casos não cobertos: {MISSING}.
      </p>

      <h2>Contato</h2>
      <p>
        {whatsapp}. E-mail e horário de atendimento: {MISSING}.
      </p>

      <p>
        O uso dos seus dados está descrito na <Link href="/privacidade">Política de Privacidade</Link>.
      </p>
    </LegalPage>
  );
}
