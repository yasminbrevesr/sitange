import { RING_SIZES } from "./products";

// Numeração brasileira de aros: o número do aro é a volta interna do anel (em mm) menos 40.
// Ex.: aro 16 = 56 mm de volta = 17,8 mm de diâmetro interno.
export function circumferenceForSize(size: number): number {
  return size + 40;
}

export function diameterForSize(size: number): number {
  return circumferenceForSize(size) / Math.PI;
}

/** Aro mais próximo para uma volta interna (mm). Pode sair dos aros disponíveis. */
export function sizeForCircumference(mm: number): number {
  return Math.round(mm - 40);
}

export function sizeForDiameter(mm: number): number {
  return sizeForCircumference(mm * Math.PI);
}

export const MIN_SIZE = RING_SIZES[0];
export const MAX_SIZE = RING_SIZES[RING_SIZES.length - 1];

export const SIZE_TABLE = RING_SIZES.map((size) => ({
  size,
  circumference: circumferenceForSize(size),
  diameter: diameterForSize(size),
}));

export function formatMmValue(value: number, digits = 1): string {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
