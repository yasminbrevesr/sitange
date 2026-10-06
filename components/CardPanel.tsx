"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { getProfile } from "@/lib/account";
import { useSession } from "@/lib/auth";
import { formatCpf, isValidCpf, onlyDigits } from "@/lib/format";
import { loadMercadoPago, type MP } from "@/lib/mercadopago";
import { OrderError, createCardOrder } from "@/lib/orders";
import { formatPrice } from "@/lib/products";
import { STORE } from "@/lib/store";
import { useCart } from "./CartProvider";
import type { ShippingSelection } from "./Shipping";

const button =
  "rotulo min-h-14 w-full rounded-full bg-laranja px-8 text-[11px] text-tinta hover:bg-verde hover:text-creme-claro disabled:opacity-80";
const label = "block text-[14px] font-normal";
const box = "mt-2 h-12 w-full border border-tinta/30 bg-branco px-4";
const input = "mt-2 min-h-12 w-full rounded-none border border-tinta/30 bg-branco px-4 text-[15px] font-normal focus:border-verde";

// Estilo do texto dentro dos campos seguros (iframes do Mercado Pago).
const FIELD_STYLE = { fontSize: "15px", color: "#121212", placeholderColor: "#12121280" };

// Cartão de crédito: número, validade e CVV são digitados em campos do Mercado Pago (iframes).
// O site só recebe um token de uso único e manda para a função criar-pix, que faz a cobrança.
export function CardPanel({
  amountCents,
  shipping,
  couponCode,
}: {
  amountCents: number;
  shipping: ShippingSelection | null;
  couponCode: string | null;
}) {
  const id = useId();
  const session = useSession();
  const router = useRouter();
  const { items, clear } = useCart();
  const mpRef = useRef<MP>(null);
  const [sdk, setSdk] = useState<"loading" | "ready" | "error">("loading");
  const [method, setMethod] = useState<{ id: string; issuerId?: string; name: string } | null>(null);
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [profileCpf, setProfileCpf] = useState("");
  const [installments, setInstallments] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // CPF do titular: usa o de "Meus dados" se houver.
  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) return;
    getProfile()
      .then((p) => {
        if (p?.cpf && isValidCpf(p.cpf)) setProfileCpf(onlyDigits(p.cpf));
        if (p?.name) setName((n) => n || p.name!.toUpperCase());
      })
      .catch(() => undefined);
  }, [userId]);

  // Monta os campos seguros do Mercado Pago.
  const ids = { number: `${id}-numero`.replace(/:/g, ""), expiry: `${id}-validade`.replace(/:/g, ""), cvv: `${id}-cvv`.replace(/:/g, "") };
  useEffect(() => {
    if (!session) return;
    let alive = true;
    const fields: { unmount: () => void }[] = [];
    loadMercadoPago()
      .then((mp) => {
        if (!alive) return;
        mpRef.current = mp;
        const number = mp.fields.create("cardNumber", { placeholder: "0000 0000 0000 0000", style: FIELD_STYLE }).mount(ids.number);
        const expiry = mp.fields.create("expirationDate", { placeholder: "MM/AA", style: FIELD_STYLE }).mount(ids.expiry);
        const cvv = mp.fields.create("securityCode", { placeholder: "CVV", style: FIELD_STYLE }).mount(ids.cvv);
        fields.push(number, expiry, cvv);
        // Pelos primeiros dígitos, descobre a bandeira (visa, master, elo...) e o banco emissor.
        number.on("binChange", async ({ bin }: { bin?: string }) => {
          if (!bin) return setMethod(null);
          try {
            const { results } = await mp.getPaymentMethods({ bin });
            const pm = results?.[0];
            setMethod(pm ? { id: pm.id, issuerId: pm.issuer?.id ? String(pm.issuer.id) : undefined, name: pm.name } : null);
          } catch {
            setMethod(null);
          }
        });
        setSdk("ready");
      })
      .catch(() => alive && setSdk("error"));
    return () => {
      alive = false;
      fields.forEach((f) => {
        try {
          f.unmount();
        } catch {
          // campo já desmontado
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!session]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!shipping) return setError("Preencha o endereço de entrega e escolha o frete antes de pagar.");
    if (name.trim().length < 3) return setError("Digite o nome como está impresso no cartão.");
    const holderCpf = profileCpf || onlyDigits(cpf);
    if (!isValidCpf(holderCpf)) return setError("Informe um CPF válido.");
    if (!method) return setError("Confira o número do cartão.");
    const mp = mpRef.current;
    if (!mp) return setError("O pagamento com cartão ainda está carregando. Tente de novo em instantes.");

    setBusy(true);
    try {
      let token: string;
      try {
        const t = await mp.fields.createCardToken({
          cardholderName: name.trim(),
          identificationType: "CPF",
          identificationNumber: holderCpf,
        });
        token = t.id;
      } catch {
        throw new OrderError("Confira o número, a validade e o CVV do cartão.", "cartao");
      }
      const order = await createCardOrder({
        items,
        address: shipping.address,
        serviceId: shipping.serviceId,
        cpf: profileCpf ? undefined : holderCpf,
        coupon: couponCode ?? undefined,
        card: { token, paymentMethodId: method.id, issuerId: method.issuerId, installments },
      });
      clear();
      router.push(`/minha-conta/?pago=${order.numero}`);
    } catch (err) {
      setError(err instanceof OrderError ? err.message : "Não deu para processar o cartão agora. Tente de novo ou pague com PIX.");
    } finally {
      setBusy(false);
    }
  }

  if (session === null) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-[15px] text-tinta/80">Para pagar, entre na sua conta ou crie uma. Sua sacola continua aqui.</p>
        <Link href="/entrar?voltar=/sacola/" className={`${button} flex items-center justify-center`}>
          Entrar para pagar
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-2">
      {sdk === "error" && (
        <p role="alert" className="text-[14px] text-laranja-tinta sm:col-span-2">
          Não deu para carregar o pagamento com cartão. Recarregue a página ou pague com PIX.
        </p>
      )}
      <div className="sm:col-span-2">
        <p className={label}>
          Número do cartão {method && <span className="text-tinta/75">· {method.name}</span>}
        </p>
        <div id={ids.number} className={box} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={`${id}-nome`} className={label}>
          Nome impresso no cartão
        </label>
        <input id={`${id}-nome`} autoComplete="cc-name" value={name} onChange={(e) => setName(e.target.value.toUpperCase())} className={input} />
      </div>
      <div>
        <p className={label}>
          Validade
        </p>
        <div id={ids.expiry} className={box} />
      </div>
      <div>
        <p className={label}>
          CVV
        </p>
        <div id={ids.cvv} className={box} />
      </div>
      {!profileCpf && (
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-cpf`} className={label}>
            CPF do titular
          </label>
          <input
            id={`${id}-cpf`}
            inputMode="numeric"
            value={cpf}
            onChange={(e) => setCpf(formatCpf(e.target.value))}
            placeholder="000.000.000-00"
            className={input}
          />
        </div>
      )}
      <div className="sm:col-span-2">
        <label htmlFor={`${id}-parc`} className={label}>
          Parcelas
        </label>
        <select id={`${id}-parc`} value={installments} onChange={(e) => setInstallments(Number(e.target.value))} className={input}>
          {Array.from({ length: STORE.maxInstallmentsInterestFree }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n === 1 ? `À vista · ${formatPrice(amountCents)}` : `${n}x de ${formatPrice(Math.round(amountCents / n))} sem juros`}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p role="alert" className="text-[14px] font-normal text-laranja-tinta sm:col-span-2">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy || sdk !== "ready"} className={`${button} sm:col-span-2`}>
        {busy ? "Processando…" : `Pagar ${formatPrice(amountCents)}`}
      </button>
      <p className="flex items-center gap-2 text-[13px] text-tinta/75 sm:col-span-2">
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="10.5" width="14" height="10" rx="1.5" />
            <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
          </g>
        </svg>
        Os dados do cartão vão direto para o Mercado Pago. A TANGÈ não vê nem guarda esses dados.
      </p>
    </form>
  );
}
