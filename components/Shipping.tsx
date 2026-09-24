"use client";

import { useEffect, useId, useState } from "react";
import { listAddresses, lookupCep, type Address } from "@/lib/account";
import { useSession } from "@/lib/auth";
import { UFS, formatCep, onlyDigits } from "@/lib/format";
import { formatPrice } from "@/lib/products";
import { chargedPrice, quoteShipping, type ShippingQuote } from "@/lib/shipping";

const input = "mt-2 min-h-12 w-full rounded-none border border-tinta/30 bg-branco px-4 text-[15px] font-normal focus:border-verde";
const label = "block text-[14px] font-normal";

type Form = {
  recipient: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
};

const EMPTY: Form = { recipient: "", cep: "", street: "", number: "", complement: "", district: "", city: "", state: "" };

function formReady(f: Form) {
  return (
    f.recipient.trim().length >= 2 &&
    onlyDigits(f.cep).length === 8 &&
    !!f.street.trim() &&
    !!f.number.trim() &&
    !!f.district.trim() &&
    !!f.city.trim() &&
    !!f.state
  );
}

function AddressFields({ f, setF }: { f: Form; setF: (fn: (p: Form) => Form) => void }) {
  const id = useId();
  const [cepInfo, setCepInfo] = useState("");
  const set = (k: keyof Form) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  async function onCep(v: string) {
    const masked = formatCep(v);
    set("cep")(masked);
    const d = onlyDigits(masked);
    if (d.length !== 8) return setCepInfo("");
    setCepInfo("Buscando endereço…");
    const r = await lookupCep(d);
    if (!r) return setCepInfo("CEP não encontrado. Preencha o endereço abaixo.");
    setF((p) => ({ ...p, street: r.street || p.street, district: r.district || p.district, city: r.city || p.city, state: r.state || p.state }));
    setCepInfo("");
  }

  const field = (k: keyof Form, text: string, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={`${id}-${k}`} className={label}>{text}</label>
      <input id={`${id}-${k}`} value={f[k]} onChange={(e) => set(k)(e.target.value)} className={input} {...extra} />
    </div>
  );

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div>
        <label htmlFor={`${id}-cep`} className={label}>CEP</label>
        <input
          id={`${id}-cep`}
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="00000-000"
          value={f.cep}
          onChange={(e) => onCep(e.target.value)}
          aria-describedby={`${id}-cepinfo`}
          className={input}
        />
        <p id={`${id}-cepinfo`} aria-live="polite" className="mt-1 text-[13px] text-tinta/75">{cepInfo}</p>
      </div>
      {field("recipient", "Quem vai receber", { autoComplete: "name" })}
      <div className="sm:col-span-2">{field("street", "Rua", { autoComplete: "address-line1" })}</div>
      {field("number", "Número", { autoComplete: "off", inputMode: "numeric" })}
      {field("complement", "Complemento (opcional)", { autoComplete: "address-line2" })}
      {field("district", "Bairro", { autoComplete: "off" })}
      {field("city", "Cidade", { autoComplete: "address-level2" })}
      <div>
        <label htmlFor={`${id}-uf`} className={label}>Estado</label>
        <select id={`${id}-uf`} value={f.state} onChange={(e) => set("state")(e.target.value)} autoComplete="address-level1" className={input}>
          <option value="">Escolher</option>
          {UFS.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>
    </div>
  );
}

function Choice({
  name,
  checked,
  onSelect,
  children,
  aside,
}: {
  name: string;
  checked: boolean;
  onSelect: () => void;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={`flex min-h-16 cursor-pointer items-center gap-4 bg-branco px-5 py-4 ${checked ? "border-2 border-verde" : "border border-tinta/15"}`}
    >
      <input id={id} type="radio" name={name} checked={checked} onChange={onSelect} className="h-5 w-5 shrink-0 accent-verde" />
      <span className="min-w-0 flex-1">{children}</span>
      {aside && <span className="shrink-0 text-right text-[15px]">{aside}</span>}
    </label>
  );
}

export type ShippingSelection = { label: string; priceCents: number };

// Entrega na sacola: endereço (salvo na conta ou digitado) e opção de frete.
// Avisa a sacola quando está tudo preenchido, para liberar o pagamento.
export function Shipping({
  subtotalCents,
  productionDays,
  onChange,
}: {
  subtotalCents: number;
  productionDays: number;
  /** Frete escolhido com endereço completo; null enquanto falta algo (bloqueia o pagamento). */
  onChange: (selection: ShippingSelection | null) => void;
}) {
  const session = useSession();
  const [saved, setSaved] = useState<Address[]>([]);
  const [choice, setChoice] = useState<string>("novo"); // id do endereço salvo ou "novo"
  const [f, setF] = useState<Form>(EMPTY);
  const [quotes, setQuotes] = useState<ShippingQuote[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [selectedId, setSelectedId] = useState("");

  // Com login, carrega os endereços salvos e já seleciona o principal.
  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) return;
    listAddresses()
      .then((list) => {
        setSaved(list);
        const main = list.find((a) => a.is_default) ?? list[0];
        if (main) setChoice(main.id);
      })
      .catch(() => setSaved([]));
  }, [userId]);

  const savedAddress = saved.find((a) => a.id === choice);
  const addressReady = choice !== "novo" ? !!savedAddress : formReady(f);
  const cepDigits = savedAddress ? onlyDigits(savedAddress.cep) : onlyDigits(f.cep);
  const cep = cepDigits.length === 8 ? cepDigits : "";

  // Cota o frete sempre que o CEP (ou o valor da sacola) muda.
  useEffect(() => {
    if (!cep) {
      setQuotes([]);
      setStatus("idle");
      return;
    }
    let alive = true;
    setStatus("loading");
    quoteShipping(cep, subtotalCents)
      .then((q) => {
        if (!alive) return;
        setQuotes(q);
        setStatus(q.length ? "idle" : "error");
        setSelectedId((cur) => (q.some((x) => x.id === cur) ? cur : q[0]?.id ?? ""));
      })
      .catch(() => alive && (setQuotes([]), setStatus("error")));
    return () => {
      alive = false;
    };
  }, [cep, subtotalCents]);

  const selected = quotes.find((q) => q.id === selectedId);
  const selection: ShippingSelection | null =
    addressReady && selected && status !== "loading"
      ? { label: selected.nome, priceCents: chargedPrice(selected, quotes, subtotalCents) }
      : null;
  const key = selection ? `${selection.label}|${selection.priceCents}` : "";
  useEffect(() => onChange(selection), [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section aria-labelledby="entrega-titulo">
      <h2 id="entrega-titulo" className="display text-[30px] text-verde md:text-[34px]">
        Entrega
      </h2>

      <h3 className="rotulo mt-6 text-[11px]">Endereço</h3>
      <div className="mt-3 flex flex-col gap-3" role="radiogroup" aria-label="Endereço de entrega">
        {saved.map((a) => (
          <Choice key={a.id} name="endereco" checked={choice === a.id} onSelect={() => setChoice(a.id)}>
            <span className="block text-[15px] text-verde">
              {a.label || a.recipient}
              {a.is_default && <span className="rotulo ml-2 rounded-full bg-laranja px-2 py-0.5 text-[9px] text-tinta">Principal</span>}
            </span>
            <span className="mt-1 block text-[14px] text-tinta/75">
              {a.street}, {a.number}
              {a.complement ? `, ${a.complement}` : ""} · {a.district} · {a.city}/{a.state} · {formatCep(a.cep)}
            </span>
          </Choice>
        ))}
        {saved.length > 0 && (
          <Choice name="endereco" checked={choice === "novo"} onSelect={() => setChoice("novo")}>
            <span className="block text-[15px] text-verde">Outro endereço</span>
          </Choice>
        )}
        {choice === "novo" && (
          <div className="border border-tinta/15 bg-branco p-5">
            <AddressFields f={f} setF={setF} />
          </div>
        )}
      </div>

      <h3 className="rotulo mt-8 text-[11px]">Frete</h3>
      <div className="mt-3 flex flex-col gap-3" role="radiogroup" aria-label="Opção de frete" aria-busy={status === "loading"}>
        {!cep && <p className="text-[14px] text-tinta/75">Informe o CEP para ver as opções de frete.</p>}
        {cep && status === "loading" && <p role="status" className="text-[14px] text-tinta/75">Calculando frete…</p>}
        {cep && status === "error" && (
          <p role="alert" className="text-[14px] text-laranja-tinta">
            Não deu para calcular o frete para esse CEP agora. Confira o CEP ou tente de novo em instantes.
          </p>
        )}
        {cep &&
          status === "idle" &&
          quotes.map((q) => {
            const price = chargedPrice(q, quotes, subtotalCents);
            return (
              <Choice
                key={q.id}
                name="frete"
                checked={selectedId === q.id}
                onSelect={() => setSelectedId(q.id)}
                aside={price === 0 ? <span className="text-verde">Grátis</span> : formatPrice(price)}
              >
                <span className="rotulo block text-[12px] text-verde">
                  {q.nome}
                  {q.transportadora && q.transportadora !== q.nome ? ` · ${q.transportadora}` : ""}
                </span>
                <span className="mt-1 block text-[14px] text-tinta/75">
                  Produção em até {productionDays} dias úteis
                  {q.prazo ? ` + entrega em até ${q.prazo} ${q.prazo === 1 ? "dia útil" : "dias úteis"}` : ""}
                </span>
              </Choice>
            );
          })}
      </div>
    </section>
  );
}
