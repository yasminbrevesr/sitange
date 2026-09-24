"use client";

import { useId, useState, type FormEvent } from "react";
import { AUTH_ENABLED, AuthNotConfiguredError, signIn, signUp } from "@/lib/auth";
import { MISSING } from "@/lib/products";
import { Container } from "./Container";

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

function SignInForm() {
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
    <form onSubmit={onSubmit} noValidate aria-labelledby={`${id}-t`} className="flex flex-col gap-5 bg-branco p-6 md:p-10">
      <div>
        <p className="rotulo text-[10px] text-laranja-tinta">Já tenho conta</p>
        <h2 id={`${id}-t`} className="display mt-3 text-[34px]">
          Entrar
        </h2>
      </div>
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
    </form>
  );
}

function SignUpForm() {
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
    <form onSubmit={onSubmit} noValidate aria-labelledby={`${id}-t`} className="flex flex-col gap-5 bg-branco p-6 md:p-10">
      <div>
        <p className="rotulo text-[10px] text-laranja-tinta">Primeira vez aqui</p>
        <h2 id={`${id}-t`} className="display mt-3 text-[34px]">
          Criar conta
        </h2>
      </div>
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
    </form>
  );
}

export function AuthForms() {
  return (
    <section className="bg-creme-base py-16 md:py-24" aria-labelledby="conta-titulo">
      <Container className="max-w-[1100px]">
        <h1 id="conta-titulo" className="display text-[46px] md:text-[62px]">
          Sua conta
        </h1>
        <p className="corpo mt-4 max-w-xl text-tinta/80">
          Acompanhe seus pedidos, guarde seu aro e compre mais rápido.
        </p>
        {!AUTH_ENABLED && (
          <p className="mt-6 border border-tinta/20 bg-creme-claro p-4 text-[14px] text-tinta/80">
            As contas de cliente ainda não estão ativas.
          </p>
        )}
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <SignInForm />
          <SignUpForm />
        </div>
      </Container>
    </section>
  );
}
