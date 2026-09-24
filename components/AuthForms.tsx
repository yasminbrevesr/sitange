"use client";

import { useId, useState, type FormEvent } from "react";
import { AUTH_ENABLED, AuthNotConfiguredError, signIn, signUp } from "@/lib/auth";
import { MISSING } from "@/lib/products";
import { Container } from "./Container";
import { Symbol } from "./Symbol";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

const field = "mt-2 min-h-12 w-full rounded-none border border-tinta/30 bg-branco px-4 text-[15px] font-normal";
const label = "rotulo block text-[10px]";

function Feedback({ id, error, info }: { id: string; error: string; info: string }) {
  if (error)
    return (
      <p id={id} role="alert" className="text-[14px] font-normal text-laranja-tinta">
        {error}
      </p>
    );
  if (info)
    return (
      <p id={id} role="status" className="border border-tinta/20 bg-creme-claro p-4 text-[14px] text-tinta/80">
        {info}
      </p>
    );
  return null;
}

function notReadyMessage(err: unknown) {
  return err instanceof AuthNotConfiguredError
    ? `O login ainda não está ativo. ${MISSING} (integração de contas com a plataforma de e-commerce)`
    : "Não deu para continuar agora. Tente de novo em instantes.";
}

function SignInForm({ onSwitch }: { onSwitch: () => void }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [sending, setSending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setInfo("");
    if (!EMAIL_RE.test(email.trim())) return setError("Confira o e-mail.");
    if (!password) return setError("Digite sua senha.");
    setError("");
    setSending(true);
    try {
      await signIn({ email: email.trim().toLowerCase(), password });
    } catch (err) {
      setInfo(notReadyMessage(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <label htmlFor={`${id}-email`} className={label}>
          E-mail
        </label>
        <input id={`${id}-email`} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
      </div>
      <div>
        <label htmlFor={`${id}-senha`} className={label}>
          Senha
        </label>
        <input
          id={`${id}-senha`}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={field}
        />
      </div>
      <Feedback id={`${id}-msg`} error={error} info={info} />
      <button
        type="submit"
        disabled={sending}
        className="rotulo min-h-14 w-full rounded-full bg-verde px-8 text-[11px] text-creme-claro hover:bg-verde-claro disabled:opacity-80"
      >
        {sending ? "Entrando…" : "Entrar"}
      </button>
      <p className="text-[14px] text-tinta/80">Esqueceu a senha? {MISSING}</p>
      <p className="border-t border-tinta/10 pt-5 text-center text-[14px] text-tinta/80">
        Ainda não tem conta?{" "}
        <button type="button" onClick={onSwitch} className="min-h-11 font-medium text-verde underline underline-offset-4">
          Criar conta
        </button>
      </p>
    </form>
  );
}

function SignUpForm({ onSwitch }: { onSwitch: () => void }) {
  const id = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [sending, setSending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setInfo("");
    if (name.trim().length < 2) return setError("Digite seu nome.");
    if (!EMAIL_RE.test(email.trim())) return setError("Confira o e-mail.");
    if (password.length < MIN_PASSWORD) return setError(`A senha precisa ter pelo menos ${MIN_PASSWORD} caracteres.`);
    if (password !== confirm) return setError("As senhas não são iguais.");
    setError("");
    setSending(true);
    try {
      await signUp({ name: name.trim(), email: email.trim().toLowerCase(), password, marketingConsent: consent });
    } catch (err) {
      setInfo(notReadyMessage(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <label htmlFor={`${id}-nome`} className={label}>
          Nome
        </label>
        <input id={`${id}-nome`} type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={field} />
      </div>
      <div>
        <label htmlFor={`${id}-email`} className={label}>
          E-mail
        </label>
        <input id={`${id}-email`} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-senha`} className={label}>
            Senha
          </label>
          <input
            id={`${id}-senha`}
            type="password"
            autoComplete="new-password"
            aria-describedby={`${id}-dica`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={field}
          />
        </div>
        <div>
          <label htmlFor={`${id}-conf`} className={label}>
            Confirmar senha
          </label>
          <input
            id={`${id}-conf`}
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={field}
          />
        </div>
      </div>
      <p id={`${id}-dica`} className="-mt-2 text-[13px] text-tinta/75">
        Pelo menos {MIN_PASSWORD} caracteres.
      </p>
      <label className="flex min-h-11 cursor-pointer items-start gap-3 text-[14px] text-tinta/80">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-5 w-5 accent-verde" />
        Quero receber novidades e ofertas por e-mail e WhatsApp.
      </label>
      <Feedback id={`${id}-msg`} error={error} info={info} />
      <button
        type="submit"
        disabled={sending}
        className="rotulo min-h-14 w-full rounded-full bg-verde px-8 text-[11px] text-creme-claro hover:bg-verde-claro disabled:opacity-80"
      >
        {sending ? "Criando…" : "Criar conta"}
      </button>
      <p className="border-t border-tinta/10 pt-5 text-center text-[14px] text-tinta/80">
        Já tem conta?{" "}
        <button type="button" onClick={onSwitch} className="min-h-11 font-medium text-verde underline underline-offset-4">
          Entrar
        </button>
      </p>
    </form>
  );
}

type Mode = "entrar" | "criar";

const TABS: { mode: Mode; label: string }[] = [
  { mode: "entrar", label: "Entrar" },
  { mode: "criar", label: "Criar conta" },
];

export function AuthForms() {
  const id = useId();
  const [mode, setMode] = useState<Mode>("entrar");

  return (
    <section className="bg-creme-base py-12 md:py-20" aria-labelledby="conta-titulo">
      <Container className="max-w-[1100px]">
        <div className="grid overflow-hidden lg:grid-cols-[1fr_1.05fr]">
          {/* painel da marca */}
          <div className="relative flex flex-col justify-between gap-8 bg-verde-claro p-8 text-creme-claro md:p-12">
            <div>
              <Symbol className="h-10 w-10" />
              <p className="rotulo mt-8 text-[10px] text-creme-claro/85">Sua conta</p>
              <h1 id="conta-titulo" className="display mt-3 text-[44px] leading-[1.08] md:text-[56px]">
                Toda peça
                <br />é duas
                <span className="text-laranja" aria-hidden="true">
                  .
                </span>
              </h1>
              <p className="corpo mt-5 max-w-sm text-creme-claro/85">
                Entre para acompanhar seus pedidos, guardar o seu aro e comprar mais rápido.
              </p>
            </div>
            <img
              src={`${base}/produtos/curva-encaixadas-verde-claro.webp`}
              alt="Anel Curva em prata polida, com o aro menor encaixado dentro do maior"
              className="mx-auto hidden w-full max-w-[360px] lg:block"
            />
            <ul className="rotulo flex flex-wrap gap-x-6 gap-y-2 text-[10px] text-creme-claro/85">
              <li>Prata 925</li>
              <li>Gravação incluída</li>
              <li>Garantia de 1 ano</li>
            </ul>
          </div>

          {/* formulário */}
          <div className="bg-branco p-6 md:p-12">
            <div role="tablist" aria-label="Acesso à conta" className="flex border-b border-tinta/15">
              {TABS.map((t) => {
                const active = mode === t.mode;
                return (
                  <button
                    key={t.mode}
                    type="button"
                    role="tab"
                    id={`${id}-tab-${t.mode}`}
                    aria-selected={active}
                    aria-controls={`${id}-panel`}
                    onClick={() => setMode(t.mode)}
                    className={`rotulo -mb-px min-h-12 flex-1 border-b-2 text-[11px] ${
                      active ? "border-verde text-verde" : "border-transparent text-tinta/75 hover:text-tinta"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${mode}`} className="pt-8">
              <h2 className="display text-[30px] md:text-[34px]">
                {mode === "entrar" ? "Bom te ver de novo" : "Criar sua conta"}
              </h2>
              <p className="mt-2 text-[14px] text-tinta/75">
                {mode === "entrar"
                  ? "Use o e-mail do seu pedido."
                  : "Leva menos de um minuto."}
              </p>
              {!AUTH_ENABLED && (
                <p className="mt-5 bg-creme-claro px-4 py-3 text-[13px] text-tinta/80">
                  As contas de cliente ainda não estão ativas.
                </p>
              )}
              <div className="mt-6">
                {mode === "entrar" ? (
                  <SignInForm key="entrar" onSwitch={() => setMode("criar")} />
                ) : (
                  <SignUpForm key="criar" onSwitch={() => setMode("entrar")} />
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
