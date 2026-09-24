import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente do Supabase para o navegador. Usa só a chave pública (anon/publishable),
// que é feita para ficar no site; a segurança vem das regras (RLS) do projeto.
// NUNCA colocar a chave service_role aqui.
// Os valores vêm das variáveis do GitHub Actions (Settings → Secrets and variables → Actions → Variables).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
    : null;
