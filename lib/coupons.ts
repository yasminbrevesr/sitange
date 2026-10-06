"use client";

// Cupons: o código é conferido no banco (função validar_cupom). O desconto final é recalculado
// pela função criar-pix na hora de pagar; aqui é só para mostrar o valor na sacola.
import { supabase } from "./supabase";

export type Coupon = { code: string; percent: number };

/** Cupom guardado no navegador (vem do pop-up ou de um cupom já aplicado na sacola). */
export const COUPON_STORAGE_KEY = "tange:cupom";

export async function validateCoupon(code: string): Promise<Coupon> {
  if (!supabase) throw new Error("Não deu para conferir o cupom agora.");
  const { data, error } = await supabase.rpc("validar_cupom", { p_code: code.trim() });
  if (error) {
    if (error.message.includes("cupom_primeira_compra")) throw new Error("Esse cupom vale só na primeira compra.");
    if (error.message.includes("cupom_invalido")) throw new Error("Cupom não encontrado ou fora do prazo.");
    throw new Error("Não deu para conferir o cupom agora. Tente de novo em instantes.");
  }
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("Cupom não encontrado ou fora do prazo.");
  return { code: row.code as string, percent: row.percent as number };
}
