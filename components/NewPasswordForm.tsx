"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { AuthError, updatePassword, useSession } from "@/lib/auth";
import { Container } from "./Container";

const MIN_PASSWORD = 8;
const field = "mt-2 min-h-12 w-full rounded-none border border-tinta/30 bg-branco px-4 text-[15px] font-normal";

// Página aberta pelo link de "Esqueceu a senha?" do e-mail. O Supabase lê o token do link
// e cria uma sessão temporária; com ela a pessoa define a senha nova.
export function NewPasswordForm() {
  const id = useId();
  const session = useSession();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < MIN_PASSWORD) return setError(`A senha precisa ter pelo menos ${MIN_PASSWORD} caracteres.`);
    if (password !== confirm) return setError("As senhas não são iguais.");
    setError("");
    setSending(true);
    try {
      await updatePassword(password);
      setDone(true);
    } catch (err) {
      setError(err instanceof AuthError ? err.message : "Não deu para salvar agora. Tente de novo em instantes.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="bg-creme-base py-16 md:py-24" aria-labelledby={`${id}-t`}>
      <Container className="max-w-[560px]">
        <div className="bg-branco p-6 md:p-12">
          <h1 id={`${id}-t`} className="display text-[34px] md:text-[44px]">
            Nova senha
          </h1>
          {done ? (
            <p role="status" className="mt-6 text-[15px] text-tinta/80">
              Senha atualizada.{" "}
              <Link href="/entrar" className="underline underline-offset-4">
                Ir para minha conta
              </Link>
            </p>
          ) : session === null ? (
            <p className="mt-6 text-[15px] text-tinta/80">
              Este link expirou ou já foi usado.{" "}
              <Link href="/entrar" className="underline underline-offset-4">
                Peça um novo em &quot;Esqueceu a senha?&quot;
              </Link>
            </p>
          ) : (
            <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-5">
              <div>
                <label htmlFor={`${id}-senha`} className="rotulo block text-[10px]">
                  Nova senha
                </label>
                <input
                  id={`${id}-senha`}
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={field}
                />
              </div>
              <div>
                <label htmlFor={`${id}-conf`} className="rotulo block text-[10px]">
                  Confirmar nova senha
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
              {error && (
                <p role="alert" className="text-[14px] font-normal text-laranja-tinta">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={sending || session === undefined}
                className="rotulo min-h-14 w-full rounded-full bg-verde px-8 text-[11px] text-creme-claro hover:bg-verde-claro disabled:opacity-80"
              >
                {sending ? "Salvando…" : "Salvar nova senha"}
              </button>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}
