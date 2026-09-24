"use client";

import { useCallback, useEffect, useId, useState, type FormEvent } from "react";
import {
  deleteAddress,
  listAddresses,
  lookupCep,
  saveAddress,
  setDefaultAddress,
  type Address,
  type AddressInput,
} from "@/lib/account";
import { formatCep, onlyDigits, UFS } from "@/lib/format";

const input = "mt-2 min-h-12 w-full rounded-none border border-tinta/30 bg-branco px-4 text-[15px] font-normal";
const label = "block text-[14px] font-normal";

const EMPTY: AddressInput = {
  label: "", recipient: "", cep: "", street: "", number: "", complement: "", district: "", city: "", state: "",
};

function AddressForm({ initial, onDone, onCancel }: { initial?: Address; onDone: () => void; onCancel: () => void }) {
  const id = useId();
  const [f, setF] = useState<AddressInput>(initial ? { ...initial } : EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [cepInfo, setCepInfo] = useState("");
  const set = (k: keyof AddressInput) => (v: string) => setF((p) => ({ ...p, [k]: v }));

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

  async function submit(e: FormEvent) {
    e.preventDefault();
    const cep = onlyDigits(f.cep);
    if (f.recipient.trim().length < 2) return setError("Digite o nome de quem vai receber.");
    if (cep.length !== 8) return setError("Confira o CEP.");
    if (!f.street.trim() || !f.number.trim() || !f.district.trim() || !f.city.trim() || !f.state)
      return setError("Preencha rua, número, bairro, cidade e estado.");
    setError("");
    setSaving(true);
    try {
      await saveAddress(
        {
          label: f.label?.trim() || null,
          recipient: f.recipient.trim(),
          cep,
          street: f.street.trim(),
          number: f.number.trim(),
          complement: f.complement?.trim() || null,
          district: f.district.trim(),
          city: f.city.trim(),
          state: f.state,
        },
        initial?.id,
      );
      onDone();
    } catch {
      setError("Não deu para salvar agora. Tente de novo em instantes.");
    } finally {
      setSaving(false);
    }
  }

  const field = (k: keyof AddressInput, text: string, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={`${id}-${k}`} className={label}>{text}</label>
      <input id={`${id}-${k}`} value={(f[k] as string) ?? ""} onChange={(e) => set(k)(e.target.value)} className={input} {...extra} />
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="grid gap-5 border border-tinta/15 p-5 md:grid-cols-2 md:p-8">
      <h2 className="rotulo text-[11px] md:col-span-2">{initial ? "Editar endereço" : "Novo endereço"}</h2>
      {field("label", "Apelido (opcional, ex.: Casa)", { autoComplete: "off" })}
      {field("recipient", "Quem vai receber", { autoComplete: "name" })}
      <div>
        <label htmlFor={`${id}-cep`} className={label}>CEP</label>
        <input id={`${id}-cep`} inputMode="numeric" autoComplete="postal-code" value={f.cep.length === 8 && !f.cep.includes("-") ? formatCep(f.cep) : f.cep} onChange={(e) => onCep(e.target.value)} aria-describedby={`${id}-cepinfo`} className={input} />
        <p id={`${id}-cepinfo`} aria-live="polite" className="mt-1 text-[13px] text-tinta/75">{cepInfo}</p>
      </div>
      {field("street", "Rua", { autoComplete: "address-line1" })}
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
      {error && <p role="alert" className="text-[14px] font-normal text-laranja-tinta md:col-span-2">{error}</p>}
      <div className="flex flex-wrap gap-3 md:col-span-2">
        <button type="submit" disabled={saving} className="rotulo min-h-12 bg-verde px-8 text-[11px] text-creme-claro hover:bg-verde-claro disabled:opacity-80">
          {saving ? "Salvando…" : "Salvar endereço"}
        </button>
        <button type="button" onClick={onCancel} className="rotulo min-h-12 px-4 text-[11px] underline underline-offset-4">Cancelar</button>
      </div>
    </form>
  );
}

export function Addresses() {
  const [items, setItems] = useState<Address[] | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Address | "novo" | null>(null);

  const load = useCallback(() => {
    listAddresses()
      .then((a) => {
        setItems(a);
        setError("");
      })
      .catch(() => setError("Não deu para carregar seus endereços agora."));
  }, []);

  useEffect(load, [load]);

  async function run(action: () => Promise<void>) {
    try {
      await action();
      load();
    } catch {
      setError("Não deu para concluir agora. Tente de novo em instantes.");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-[34px] md:text-[40px]">Meus endereços</h1>
        {editing === null && (
          <button type="button" onClick={() => setEditing("novo")} className="rotulo min-h-12 bg-verde px-6 text-[11px] text-creme-claro hover:bg-verde-claro">
            Adicionar endereço
          </button>
        )}
      </div>

      {error && <p role="alert" className="mt-6 text-[14px] text-laranja-tinta">{error}</p>}

      {editing !== null && (
        <div className="mt-8">
          <AddressForm
            initial={editing === "novo" ? undefined : editing}
            onCancel={() => setEditing(null)}
            onDone={() => {
              setEditing(null);
              load();
            }}
          />
        </div>
      )}

      {items === null ? (
        <p className="mt-8 text-[15px] text-tinta/75" role="status">Carregando…</p>
      ) : items.length === 0 && editing === null ? (
        <p className="mt-8 bg-creme-claro p-8 text-[15px] text-tinta/80">Você ainda não cadastrou nenhum endereço.</p>
      ) : (
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {items.map((a) => (
            <li key={a.id} className={`flex flex-col gap-3 border p-5 ${a.is_default ? "border-verde" : "border-tinta/15"}`}>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-[16px] font-medium">{a.label || a.recipient}</h2>
                {a.is_default && <span className="rotulo text-[10px] text-verde">Principal</span>}
              </div>
              <p className="text-[14px] leading-[1.6] text-tinta/80">
                {a.recipient}
                <br />
                {a.street}, {a.number}
                {a.complement ? ` · ${a.complement}` : ""}
                <br />
                {a.district} · {a.city}/{a.state} · CEP {formatCep(a.cep)}
              </p>
              <div className="mt-auto flex flex-wrap gap-x-5 gap-y-1">
                <button type="button" onClick={() => setEditing(a)} className="min-h-11 text-[14px] underline underline-offset-4">Editar</button>
                {!a.is_default && (
                  <button type="button" onClick={() => run(() => setDefaultAddress(a.id))} className="min-h-11 text-[14px] underline underline-offset-4">
                    Tornar principal
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Apagar este endereço?")) run(() => deleteAddress(a.id));
                  }}
                  className="min-h-11 text-[14px] text-laranja-tinta underline underline-offset-4"
                >
                  Apagar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
