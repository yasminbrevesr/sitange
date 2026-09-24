"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { changeEmail, getProfile, saveProfile } from "@/lib/account";
import { AuthError, updatePassword, useSession } from "@/lib/auth";
import { formatCpf, formatPhone, isValidCpf, onlyDigits } from "@/lib/format";
import { RING_SIZES } from "@/lib/products";

const input = "mt-2 min-h-12 w-full rounded-none border border-tinta/30 bg-branco px-4 text-[15px] font-normal disabled:bg-creme-claro disabled:text-tinta/75";
const label = "block text-[14px] font-normal";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Message({ error, ok }: { error: string; ok: string }) {
  if (error) return <p role="alert" className="text-[14px] font-normal text-laranja-tinta">{error}</p>;
  if (ok) return <p role="status" className="text-[14px] font-normal text-verde">{ok}</p>;
  return null;
}

function PasswordPanel({ onClose }: { onClose: () => void }) {
  const id = useId();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    setOk("");
    if (password.length < 8) return setError("A senha precisa ter pelo menos 8 caracteres.");
    if (password !== confirm) return setError("As senhas não são iguais.");
    setError("");
    try {
      await updatePassword(password);
      setOk("Senha alterada.");
      setPassword("");
      setConfirm("");
    } catch (err) {
      setError(err instanceof AuthError ? err.message : "Não deu para alterar agora.");
    }
  }
  return (
    <form onSubmit={submit} noValidate className="grid gap-4 border border-tinta/15 p-5 sm:grid-cols-2">
      <h2 className="rotulo text-[11px] sm:col-span-2">Alterar senha</h2>
      <div>
        <label htmlFor={`${id}-s`} className={label}>Nova senha</label>
        <input id={`${id}-s`} type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
      </div>
      <div>
        <label htmlFor={`${id}-c`} className={label}>Confirmar nova senha</label>
        <input id={`${id}-c`} type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={input} />
      </div>
      <div className="sm:col-span-2"><Message error={error} ok={ok} /></div>
      <div className="flex gap-3 sm:col-span-2">
        <button type="submit" className="rotulo min-h-12 rounded-full bg-verde px-6 text-[11px] text-creme-claro hover:bg-verde-claro">Salvar senha</button>
        <button type="button" onClick={onClose} className="rotulo min-h-12 px-4 text-[11px] underline underline-offset-4">Fechar</button>
      </div>
    </form>
  );
}

function EmailPanel({ onClose }: { onClose: () => void }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    setOk("");
    if (!EMAIL_RE.test(email.trim())) return setError("Confira o e-mail.");
    setError("");
    try {
      await changeEmail(email.trim().toLowerCase());
      setOk("Enviamos um link de confirmação. A troca só vale depois que você confirmar.");
    } catch {
      setError("Não deu para alterar agora. Confira se esse e-mail já não está em uso.");
    }
  }
  return (
    <form onSubmit={submit} noValidate className="grid gap-4 border border-tinta/15 p-5">
      <h2 className="rotulo text-[11px]">Alterar e-mail</h2>
      <div>
        <label htmlFor={`${id}-e`} className={label}>Novo e-mail</label>
        <input id={`${id}-e`} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
      </div>
      <Message error={error} ok={ok} />
      <div className="flex gap-3">
        <button type="submit" className="rotulo min-h-12 rounded-full bg-verde px-6 text-[11px] text-creme-claro hover:bg-verde-claro">Enviar confirmação</button>
        <button type="button" onClick={onClose} className="rotulo min-h-12 px-4 text-[11px] underline underline-offset-4">Fechar</button>
      </div>
    </form>
  );
}

export function ProfileForm() {
  const id = useId();
  const session = useSession();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [birth, setBirth] = useState("");
  const [ring, setRing] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [saving, setSaving] = useState(false);
  const [panel, setPanel] = useState<"senha" | "email" | null>(null);

  // Carrega uma vez por pessoa (não a cada renovação da sessão, para não apagar o que está sendo editado)
  const userId = session?.user.id;
  const metaName = session?.user.user_metadata?.name as string | undefined;
  useEffect(() => {
    if (!userId) return;
    getProfile()
      .then((p) => {
        setName(p?.name ?? metaName ?? "");
        setCpf(p?.cpf ? formatCpf(p.cpf) : "");
        setPhone(p?.phone ? formatPhone(p.phone.replace(/^\+55/, "")) : "");
        setBirth(p?.birth_date ?? "");
        setRing(p?.ring_size ? String(p.ring_size) : "");
      })
      .catch(() => setError("Não deu para carregar seus dados agora."))
      .finally(() => setLoading(false));
  }, [userId]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setOk("");
    const cpfDigits = onlyDigits(cpf);
    const phoneDigits = onlyDigits(phone);
    if (name.trim().length < 2) return setError("Digite seu nome completo.");
    if (cpfDigits && !isValidCpf(cpfDigits)) return setError("Confira o CPF.");
    if (phoneDigits && (phoneDigits.length < 10 || phoneDigits.length > 11)) return setError("Confira o telefone, com DDD.");
    setError("");
    setSaving(true);
    try {
      await saveProfile({
        name: name.trim(),
        cpf: cpfDigits || null,
        phone: phoneDigits ? `+55${phoneDigits}` : null,
        birth_date: birth || null,
        ring_size: ring ? Number(ring) : null,
      });
      setOk("Dados salvos.");
    } catch {
      setError("Não deu para salvar agora. Tente de novo em instantes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="display text-[34px] md:text-[40px]">Meus dados</h1>
      {loading ? (
        <p className="mt-8 text-[15px] text-tinta/75" role="status">Carregando…</p>
      ) : (
        <form onSubmit={submit} noValidate className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor={`${id}-nome`} className={label}>Nome completo</label>
            <input id={`${id}-nome`} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={input} />
          </div>
          <div>
            <label htmlFor={`${id}-cpf`} className={label}>CPF</label>
            <input id={`${id}-cpf`} inputMode="numeric" autoComplete="off" value={cpf} onChange={(e) => setCpf(formatCpf(e.target.value))} className={input} />
          </div>
          <div>
            <label htmlFor={`${id}-nasc`} className={label}>Data de nascimento</label>
            <input id={`${id}-nasc`} type="date" autoComplete="bday" value={birth} onChange={(e) => setBirth(e.target.value)} className={input} />
          </div>
          <div>
            <label htmlFor={`${id}-tel`} className={label}>Telefone</label>
            <input id={`${id}-tel`} type="tel" inputMode="numeric" autoComplete="tel-national" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} className={input} />
          </div>
          <div>
            <label htmlFor={`${id}-aro`} className={label}>Seu aro</label>
            <select id={`${id}-aro`} value={ring} onChange={(e) => setRing(e.target.value)} className={input}>
              <option value="">Ainda não sei</option>
              {RING_SIZES.map((s) => <option key={s} value={s}>Aro {s}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor={`${id}-email`} className={label}>E-mail</label>
            <input id={`${id}-email`} type="email" value={session?.user.email ?? ""} disabled className={input} />
          </div>
          <div className="md:col-span-2"><Message error={error} ok={ok} /></div>
          <div className="flex flex-wrap justify-end gap-3 md:col-span-2">
            <button type="button" onClick={() => setPanel(panel === "senha" ? null : "senha")} aria-expanded={panel === "senha"} className="rotulo min-h-12 border border-tinta/30 px-5 text-[11px] hover:border-tinta">
              Alterar senha
            </button>
            <button type="button" onClick={() => setPanel(panel === "email" ? null : "email")} aria-expanded={panel === "email"} className="rotulo min-h-12 border border-tinta/30 px-5 text-[11px] hover:border-tinta">
              Alterar e-mail
            </button>
            <button type="submit" disabled={saving} className="rotulo min-h-12 bg-verde px-8 text-[11px] text-creme-claro hover:bg-verde-claro disabled:opacity-80">
              {saving ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </form>
      )}
      <div className="mt-6">
        {panel === "senha" && <PasswordPanel onClose={() => setPanel(null)} />}
        {panel === "email" && <EmailPanel onClose={() => setPanel(null)} />}
      </div>
    </div>
  );
}
