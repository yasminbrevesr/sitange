// Envio do cadastro do popup de cupom para a tabela "leads" do Supabase
// (criada por supabase/schema.sql). Sem Supabase configurado, nada é salvo.
import { supabase } from "./supabase";

export type Lead = {
  email: string;
  phone: string; // formato E.164, ex.: +5511912345678
  source: "popup-cupom-10";
  consent: true;
};

export async function saveLead(lead: Lead): Promise<void> {
  if (!supabase) {
    console.warn("[leads] Supabase não configurado: cadastro não foi salvo.");
    return;
  }
  const { error } = await supabase.from("leads").insert(lead);
  // 23505 = e-mail já cadastrado neste formulário: não é erro para o cliente
  if (error && error.code !== "23505") throw new Error(`Falha ao salvar cadastro: ${error.message}`);
}

export const COUPON_CODE: string | null = "BREVESCOMPRA10"; // cupom de 10% na primeira compra
