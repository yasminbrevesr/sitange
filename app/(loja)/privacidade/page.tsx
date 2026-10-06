import type { Metadata } from "next";
import { COMPANY } from "@/lib/site";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { MISSING } from "@/lib/products";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como a TANGÈ coleta, usa e protege seus dados pessoais, de acordo com a LGPD.",
  alternates: { canonical: "privacidade/" },
};

// Descreve o que o site realmente coleta hoje. Os dados da empresa e prazos ficam em [COLOCAR AQUI].
// Recomendado: revisão jurídica antes de abrir para clientes.
export default function PrivacidadePage() {
  return (
    <LegalPage title="Política de Privacidade" updated="6 de outubro de 2026">
      <p>
        Esta política explica quais dados a TANGÈ coleta no site, para que usa e quais são os seus direitos, conforme a
        Lei Geral de Proteção de Dados (Lei nº 13.709/2018, LGPD).
      </p>

      <h2>Quem somos</h2>
      <p>
        Razão social: {MISSING} · CNPJ: {COMPANY.cnpj} · Endereço: {MISSING}. Contato para assuntos de privacidade:{" "}
        <a href={COMPANY.whatsappHref} target="_blank" rel="noopener noreferrer">
          WhatsApp {COMPANY.phone}
        </a>
        .
      </p>

      <h2>Quais dados coletamos</h2>
      <ul>
        <li>
          <strong>Conta no site:</strong> nome, e-mail e senha. A senha é guardada de forma protegida pelo nosso provedor
          de autenticação e nunca fica visível para a TANGÈ.
        </li>
        <li>
          <strong>Meus dados:</strong> CPF, telefone, data de nascimento e aro, se você preencher. O CPF é pedido também na
          hora de pagar, porque o Mercado Pago exige.
        </li>
        <li>
          <strong>Endereços:</strong> os endereços de entrega que você salvar na sua conta.
        </li>
        {/* Se o login com Google for ativado (lib/auth.ts), incluir: nome, e-mail e foto do perfil fornecidos pelo Google. */}
        <li>
          <strong>Cadastro do cupom de primeira compra:</strong> e-mail e telefone.
        </li>
        <li>
          <strong>Sacola:</strong> as peças, aros e gravações escolhidos ficam salvos só no seu navegador até você fazer o
          pedido.
        </li>
        <li>
          <strong>Pedidos:</strong> peças, aros, gravação, endereço de entrega, opção de frete, cupom usado, valores, forma
          de pagamento, situação do pedido e código de rastreio.
        </li>
        <li>
          <strong>Cartão de crédito:</strong> o número, a validade e o código de segurança são digitados em campos do
          próprio Mercado Pago. A TANGÈ não recebe nem guarda esses dados.
        </li>
      </ul>

      <h2>Para que usamos</h2>
      <ul>
        <li>Criar e manter a sua conta e permitir que você entre no site.</li>
        <li>Calcular o frete, receber o pagamento, produzir a peça, enviar e acompanhar a entrega.</li>
        <li>Fazer trocas de aro, atender a garantia e responder quando você falar com a gente.</li>
        <li>Enviar o cupom de primeira compra.</li>
        <li>
          Enviar novidades e ofertas por e-mail e WhatsApp, somente se você autorizar. Você pode cancelar quando quiser.
        </li>
      </ul>

      <h2>Com quem compartilhamos</h2>
      <p>Não vendemos seus dados. Compartilhamos só o necessário com as empresas que fazem o site e a loja funcionarem:</p>
      <ul>
        <li>
          <strong>Supabase:</strong> guarda o banco de dados (conta, endereços e pedidos) e cuida do login.
        </li>
        <li>
          <strong>Mercado Pago:</strong> processa o pagamento por PIX e cartão. Recebe seu nome, e-mail, CPF e o valor da
          compra.
        </li>
        <li>
          <strong>SuperFrete e Correios:</strong> calculam o frete (com o CEP) e fazem a entrega (com nome e endereço).
        </li>
        <li>
          <strong>ViaCEP:</strong> recebe o CEP digitado para preencher rua, bairro e cidade automaticamente.
        </li>
        {/* Se o login com Google for ativado, incluir o Google nesta lista. */}
      </ul>

      <h2>Por quanto tempo guardamos</h2>
      <p>{MISSING} (prazo de guarda de cada tipo de dado).</p>

      <h2>Seus direitos</h2>
      <p>
        Você pode pedir a qualquer momento para confirmar se temos seus dados, acessar, corrigir, excluir, levar para outro
        serviço ou retirar o consentimento de marketing. Para isso, fale com a gente pelo{" "}
        <a href={COMPANY.whatsappHref} target="_blank" rel="noopener noreferrer">
          WhatsApp {COMPANY.phone}
        </a>
        .
      </p>

      <h2>Cookies e armazenamento no navegador</h2>
      <p>
        O site usa o armazenamento do navegador para manter sua sessão ativa, lembrar da sacola e do cupom e não mostrar
        o popup de cupom de novo. Na hora de pagar, o Mercado Pago pode usar cookies próprios para prevenir fraudes. Não
        usamos cookies de publicidade.
        {/* Atualizar este parágrafo se forem adicionadas ferramentas de análise (ex.: Google Analytics) ou anúncios. */}
      </p>

      <h2>Mudanças nesta política</h2>
      <p>
        Quando esta política mudar, a data no topo da página é atualizada. Veja também os{" "}
        <Link href="/termos">Termos de Uso</Link>.
      </p>
    </LegalPage>
  );
}
