import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { MISSING } from "@/lib/products";
import { STORE } from "@/lib/store";
import { formatPrice } from "@/lib/products";

export const metadata: Metadata = { title: "Termos de Uso" };

// Regras da loja que já estão definidas no site; o restante fica em [COLOCAR AQUI].
// Recomendado: revisão jurídica antes de abrir para clientes.
export default function TermosPage() {
  return (
    <LegalPage title="Termos de Uso" updated="24 de setembro de 2026">
      <p>
        Estes termos valem para o uso do site da TANGÈ e para as compras feitas nele. Ao criar uma conta ou fazer um pedido,
        você concorda com eles. Razão social: {MISSING} · CNPJ: {MISSING}.
      </p>

      <h2>Conta</h2>
      <p>
        Você é responsável pelas informações da sua conta e por manter a sua senha em segurança. Podemos suspender contas
        usadas de forma indevida.
      </p>

      <h2>Produtos e preços</h2>
      <ul>
        <li>As peças são de prata 925 maciça, feitas sob encomenda, e ficam prontas em até 10 dias úteis.</li>
        <li>Os preços são os mostrados no site no momento da compra. Parcelamento em até {STORE.maxInstallmentsInterestFree}x sem juros.</li>
        <li>{STORE.pixDiscountPercent}% de desconto pagando no Pix.</li>
        <li>Gravação interna de até 12 caracteres incluída no preço.</li>
      </ul>

      <h2>Entrega</h2>
      <p>
        Frete grátis em compras a partir de {formatPrice(STORE.freeShippingMinCents)}. Prazos, regiões atendidas e envio
        expresso: {MISSING}.
      </p>

      <h2>Trocas, devoluções e arrependimento</h2>
      <p>
        Troca de aro sem custo {MISSING} (confirmar o prazo: 30 ou 60 dias). Direito de arrependimento em compras online e
        regras para peças com gravação: {MISSING}.
      </p>

      <h2>Garantia</h2>
      <p>
        Garantia de {STORE.warrantyMonths / 12} ano contra defeitos de fabricação. O que não é coberto e como acionar:{" "}
        {MISSING}.
      </p>

      <h2>Contato</h2>
      <p>{MISSING} (e-mail, WhatsApp e horário de atendimento).</p>

      <p>
        O uso dos seus dados está descrito na <Link href="/privacidade">Política de Privacidade</Link>.
      </p>
    </LegalPage>
  );
}
