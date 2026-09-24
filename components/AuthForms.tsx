"use client";

import { useId, useState, type FormEvent } from "react";
import {
  AUTH_ENABLED,
  AuthError,
  AuthNotConfiguredError,
  displayName,
  sendPasswordReset,
  signIn,
  signInWithGoogle,
  signOut,
  signUp,
  useSession,
} from "@/lib/auth";
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

function errorMessage(err: unknown) {
  if (err instanceof AuthNotConfiguredError) return "O login ainda não está ativo.";
  if (err instanceof AuthError) return err.message;
  return "Não deu para continuar agora. Tente de novo em instantes.";
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
      // a sessão nova troca a tela para "Minha conta" sozinha (useSession)
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSending(false);
    }
  }

  async function onForgot() {
    setInfo("");
    if (!EMAIL_RE.test(email.trim())) return setError("Digite seu e-mail acima para receber o link de nova senha.");
    setError("");
    try {
      await sendPasswordReset(email.trim().toLowerCase());
      setInfo("Se existir uma conta com esse e-mail, enviamos um link para criar uma nova senha.");
    } catch (err) {
      setError(errorMessage(err));
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
      <button
        type="button"
        onClick={onForgot}
        className="min-h-11 self-start text-[14px] text-tinta/80 underline underline-offset-4 hover:text-tinta"
      >
        Esqueceu a senha?
      </button>
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
      const needsConfirmation = await signUp({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        marketingConsent: consent,
      });
      if (needsConfirmation)
        setInfo(`Conta criada. Enviamos um link de confirmação para ${email.trim()}: confirme para poder entrar.`);
    } catch (err) {
      setError(errorMessage(err));
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

function AccountPanel({ name, email }: { name: string; email: string }) {
  const [leaving, setLeaving] = useState(false);
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="display text-[30px] md:text-[34px]">Olá, {name}</h2>
        <p className="mt-2 text-[14px] text-tinta/75">Você entrou com {email}.</p>
      </div>
      <div className="bg-creme-claro p-5">
        <h3 className="rotulo text-[11px]">Seus pedidos</h3>
        <p className="mt-2 text-[14px] text-tinta/80">Nenhum pedido por aqui ainda.</p>
      </div>
      <button
        type="button"
        disabled={leaving}
        onClick={async () => {
          setLeaving(true);
          await signOut();
          setLeaving(false);
        }}
        className="rotulo min-h-14 w-full rounded-full border border-verde px-8 text-[11px] text-verde hover:bg-creme-claro disabled:opacity-80"
      >
        {leaving ? "Saindo…" : "Sair da conta"}
      </button>
    </div>
  );
}

// Logo oficial do Google, conforme as regras de marca do botão "Continuar com o Google"
function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function GoogleButton() {
  const [error, setError] = useState("");
  const [going, setGoing] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        disabled={going}
        onClick={async () => {
          setError("");
          setGoing(true);
          try {
            await signInWithGoogle(); // o navegador sai do site e vai para o Google
          } catch (err) {
            setError(errorMessage(err));
            setGoing(false);
          }
        }}
        className="flex min-h-14 w-full items-center justify-center gap-3 rounded-full border border-tinta/30 bg-branco px-6 text-[15px] font-medium text-tinta hover:border-tinta disabled:opacity-80"
      >
        <GoogleLogo />
        {going ? "Abrindo o Google…" : "Continuar com o Google"}
      </button>
      {error && (
        <p role="alert" className="text-[14px] font-normal text-laranja-tinta">
          {error}
        </p>
      )}
      <div className="flex items-center gap-4 text-[12px] text-tinta/75" aria-hidden="true">
        <span className="h-px flex-1 bg-tinta/15" />
        ou com e-mail
        <span className="h-px flex-1 bg-tinta/15" />
      </div>
    </div>
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
  const session = useSession();

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

          {/* formulário ou área de quem já entrou */}
          {session ? (
            <div className="bg-branco p-6 md:p-12">
              <AccountPanel name={displayName(session)} email={session.user.email ?? ""} />
            </div>
          ) : (
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
                <GoogleButton />
              </div>
              <div className="mt-5">
                {mode === "entrar" ? (
                  <SignInForm key="entrar" onSwitch={() => setMode("criar")} />
                ) : (
                  <SignUpForm key="criar" onSwitch={() => setMode("entrar")} />
                )}
              </div>
            </div>
          </div>
          )}
        </div>
      </Container>
    </section>
  );
}
