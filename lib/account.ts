"use client";

// Dados da área "Minha conta" no Supabase (tabelas profiles e addresses, ver supabase/schema.sql).
// As regras de RLS garantem que cada cliente só lê e altera o que é dele.
import { supabase } from "./supabase";

export type Profile = {
  id: string;
  email: string | null;
  name: string | null;
  cpf: string | null;
  phone: string | null; // +55DDDNUMERO
  birth_date: string | null; // AAAA-MM-DD
  ring_size: number | null;
};

export type Address = {
  id: string;
  label: string | null;
  recipient: string;
  cep: string;
  street: string;
  number: string;
  complement: string | null;
  district: string;
  city: string;
  state: string;
  is_default: boolean;
};

export type AddressInput = Omit<Address, "id" | "is_default">;

function db() {
  if (!supabase) throw new Error("Supabase não configurado.");
  return supabase;
}

async function userId(): Promise<string> {
  const { data } = await db().auth.getUser();
  if (!data.user) throw new Error("Sessão expirada. Entre de novo.");
  return data.user.id;
}

export async function getProfile(): Promise<Profile | null> {
  const id = await userId();
  const { data, error } = await db()
    .from("profiles")
    .select("id,email,name,cpf,phone,birth_date,ring_size")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveProfile(p: Omit<Profile, "id" | "email">): Promise<void> {
  const id = await userId();
  const { data: u } = await db().auth.getUser();
  const { error } = await db()
    .from("profiles")
    .upsert({ id, email: u.user?.email ?? null, ...p, updated_at: new Date().toISOString() });
  if (error) throw error;
  // mantém o nome da sessão igual ao do perfil (aparece no menu)
  if (p.name) await db().auth.updateUser({ data: { name: p.name } });
}

export async function changeEmail(email: string): Promise<void> {
  const { error } = await db().auth.updateUser({ email });
  if (error) throw error;
}

export async function listAddresses(): Promise<Address[]> {
  const { data, error } = await db()
    .from("addresses")
    .select("id,label,recipient,cep,street,number,complement,district,city,state,is_default")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function saveAddress(input: AddressInput, id?: string): Promise<void> {
  const row = { ...input, updated_at: new Date().toISOString() };
  const { error } = id
    ? await db().from("addresses").update(row).eq("id", id)
    : await db().from("addresses").insert(row);
  if (error) throw error;
}

export async function deleteAddress(id: string): Promise<void> {
  const { error } = await db().from("addresses").delete().eq("id", id);
  if (error) throw error;
}

export async function setDefaultAddress(id: string): Promise<void> {
  const uid = await userId();
  // primeiro tira o principal atual (só pode haver um), depois marca o novo
  const off = await db().from("addresses").update({ is_default: false }).eq("user_id", uid).eq("is_default", true);
  if (off.error) throw off.error;
  const on = await db().from("addresses").update({ is_default: true }).eq("id", id);
  if (on.error) throw on.error;
}

/** Busca rua, bairro, cidade e UF pelo CEP (ViaCEP). Retorna null se não achar. */
export async function lookupCep(cep: string) {
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!res.ok) return null;
    const j = await res.json();
    if (j.erro) return null;
    return { street: j.logradouro ?? "", district: j.bairro ?? "", city: j.localidade ?? "", state: j.uf ?? "" };
  } catch {
    return null;
  }
}
