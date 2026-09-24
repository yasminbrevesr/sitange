import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { MISSING } from "@/lib/products";

export const metadata: Metadata = { title: "Política de Privacidade" };

// Descreve o que o site realmente coleta hoje. Os dados da empresa e prazos ficam em [COLOCAR AQUI].
// Recomendado: revisão jurídica antes de abrir para clientes.
export default function PrivacidadePage() {
  return (
    <LegalPage title="Política de Privacidade" updated="24 de setembro de 2026">
      <p>
        Esta política explica quais dados a TANGÈ coleta no site, para que usa e quais são os seus direitos, conforme a
        Lei Geral de Proteção de Dados (Lei nº 13.709/2018, LGPD).
      </p>

      <h2>Quem somos</h2>
      <p>
        Razão social: {MISSING} · CNPJ: {MISSING} · Endereço: {MISSING}. Contato para assuntos de privacidade: {MISSING}{" "}
        (e-mail do encarregado de dados).
      </p>

      <h2>Quais dados coletamos</h2>
      <ul>
        <li>
          <strong>Conta no site:</strong> nome, e-mail e senha. A senha é guardada de forma protegida pelo nosso provedor
          de autenticação e nunca fica visível para a TANGÈ.
        </li>
        <li>
          <strong>Entrar com o Google:</strong> nome, e-mail e foto do perfil, fornecidos pelo Google quando você autoriza.
        </li>
        <li>
          <strong>Cadastro do cupom de primeira compra:</strong> e-mail e telefone.
        </li>
        <li>
          <strong>Sacola:</strong> as peças, aros e gravações escolhidos ficam salvos só no seu navegador, não em nossos
          servidores.
        </li>
        <li>
          <strong>Pedidos e pagamento:</strong> {MISSING} (dados de entrega e de pagamento, quando o checkout estiver
          ativo).
        </li>
      </ul>

      <h2>Para que usamos</h2>
      <ul>
        <li>Criar e manter a sua conta e permitir que você entre no site.</li>
        <li>Enviar o cupom de primeira compra.</li>
        <li>
          Enviar novidades e ofertas por e-mail e WhatsApp, somente se você autorizar. Você pode cancelar quando quiser.
        </li>
        <li>{MISSING} (processar pedidos, entregas, trocas e garantia, quando o checkout estiver ativo).</li>
      </ul>

      <h2>Com quem compartilhamos</h2>
      <p>
        Não vendemos seus dados. Eles são guardados pela Supabase, empresa que fornece o banco de dados e o login do
        site. Se você entrar com o Google, o Google também participa do login. Outros parceiros (pagamento, frete, envio de
        e-mails): {MISSING}.
      </p>

      <h2>Por quanto tempo guardamos</h2>
      <p>{MISSING} (prazo de guarda de cada tipo de dado).</p>

      <h2>Seus direitos</h2>
      <p>
        Você pode pedir a qualquer momento para confirmar se temos seus dados, acessar, corrigir, excluir, levar para outro
        serviço ou retirar o consentimento de marketing. Para isso, escreva para {MISSING}.
      </p>

      <h2>Cookies e armazenamento no navegador</h2>
      <p>
        O site usa o armazenamento do navegador para manter sua sessão ativa, lembrar da sacola e não mostrar o popup de
        cupom de novo. Não usamos cookies de publicidade. {MISSING} (atualizar se forem adicionadas ferramentas de
        análise ou anúncios).
      </p>

      <h2>Mudanças nesta política</h2>
      <p>
        Quando esta política mudar, a data no topo da página é atualizada. Veja também os{" "}
        <Link href="/termos">Termos de Uso</Link>.
      </p>
    </LegalPage>
  );
}
