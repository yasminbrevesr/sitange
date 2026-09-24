"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

// Contas de cliente via Supabase Auth. Sem as variáveis do Supabase, a tela de conta
// continua aparecendo e avisa que o login não está ativo.

export type SignInInput = { email: string; password: string };
export type SignUpInput = { name: string; email: string; password: string; marketingConsent: boolean };

export const AUTH_ENABLED = supabase !== null;

/** Login com o Google: deixar false até configurar o Google Cloud e o provedor no Supabase. */
export const GOOGLE_LOGIN_ENABLED = false;

export class AuthNotConfiguredError extends Error {
  constructor() {
    super("Contas de cliente ainda não estão ativas.");
  }
}

/** Erro com mensagem já pronta para mostrar ao cliente. */
export class AuthError extends Error {}

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const siteUrl = (path: string) => `${window.location.origin}${base}${path}`;

function client() {
  if (!supabase) throw new AuthNotConfiguredError();
  return supabase;
}

// Traduz as mensagens do Supabase para o cliente
function friendly(message: string): AuthError {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return new AuthError("E-mail ou senha incorretos.");
  if (m.includes("email not confirmed")) return new AuthError("Confirme seu e-mail pelo link que enviamos antes de entrar.");
  if (m.includes("already registered") || m.includes("already been registered"))
    return new AuthError("Já existe uma conta com esse e-mail. Tente entrar.");
  // Limite de envio de e-mails do Supabase (o servidor de e-mail padrão manda poucos e-mails por hora).
  if (m.includes("email rate limit"))
    return new AuthError("Não conseguimos enviar o e-mail de confirmação agora. Tente de novo em alguns minutos.");
  // Pedido repetido para o mesmo e-mail em menos de 60 segundos.
  if (m.includes("security purposes"))
    return new AuthError("Acabamos de enviar um e-mail para esse endereço. Espere 1 minuto antes de pedir de novo.");
  if (m.includes("rate limit") || m.includes("too many")) return new AuthError("Muitas tentativas. Espere alguns minutos e tente de novo.");
  if (m.includes("password")) return new AuthError("Essa senha não foi aceita. Use pelo menos 8 caracteres.");
  return new AuthError("Não deu para continuar agora. Tente de novo em instantes.");
}

export async function signIn({ email, password }: SignInInput): Promise<void> {
  const { error } = await client().auth.signInWithPassword({ email, password });
  if (error) throw friendly(error.message);
}

/** Retorna true quando o Supabase pede confirmação por e-mail antes do primeiro acesso. */
export async function signUp({ name, email, password, marketingConsent }: SignUpInput): Promise<boolean> {
  const { data, error } = await client().auth.signUp({
    email,
    password,
    options: {
      data: { name, marketing_consent: marketingConsent },
      emailRedirectTo: siteUrl("/entrar/"),
    },
  });
  if (error) throw friendly(error.message);
  // Com confirmação ligada, o Supabase não devolve sessão; e devolve identities vazio se o e-mail já existe.
  if (data.user && data.user.identities && data.user.identities.length === 0)
    throw new AuthError("Já existe uma conta com esse e-mail. Tente entrar.");
  return !data.session;
}

/** Leva a pessoa para o login do Google e depois de volta para /entrar/. */
export async function signInWithGoogle(): Promise<void> {
  const { error } = await client().auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: siteUrl("/entrar/") },
  });
  if (error) throw friendly(error.message);
}

export async function sendPasswordReset(email: string): Promise<void> {
  const { error } = await client().auth.resetPasswordForEmail(email, { redirectTo: siteUrl("/conta/nova-senha/") });
  if (error) throw friendly(error.message);
}

export async function updatePassword(password: string): Promise<void> {
  const { error } = await client().auth.updateUser({ password });
  if (error) throw friendly(error.message);
}

export async function signOut(): Promise<void> {
  await client().auth.signOut();
}

/** Sessão atual, atualizada quando a pessoa entra ou sai. undefined = ainda carregando. */
export function useSession(): Session | null | undefined {
  const [session, setSession] = useState<Session | null | undefined>(supabase ? undefined : null);
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  return session;
}

export function displayName(session: Session): string {
  const name = (session.user.user_metadata?.name as string | undefined)?.trim();
  return name ? name.split(" ")[0] : session.user.email ?? "";
}
