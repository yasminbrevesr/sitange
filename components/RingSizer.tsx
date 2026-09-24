"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  MAX_SIZE,
  MIN_SIZE,
  diameterForSize,
  formatMmValue,
  sizeForCircumference,
  sizeForDiameter,
} from "@/lib/ringSizes";

// Medidor virtual de aro.
// 1) Calibra a tela com um cartão de tamanho padrão (crédito, débito, transporte: 85,6 × 54 mm).
// 2) A pessoa apoia um anel que já usa sobre o círculo e ajusta até o círculo preencher o furo do anel.
// A calibração fica salva só no navegador de quem usa.

const CARD_W = 53.98; // lado menor do cartão, em mm
const CARD_H = 85.6; // lado maior do cartão, em mm
const DEFAULT_PPM = 96 / 25.4; // pixels por mm de uma tela "padrão"
const PPM_MIN = 2.5;
const PPM_MAX = 9;
const D_MIN = 14.5;
const D_MAX = 22.5;
const STORAGE_KEY = "tange-aro-calibracao";

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function Stepper({
  label,
  onStep,
}: {
  label: [string, string];
  onStep: (dir: -1 | 1) => void;
}) {
  const cls =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-tinta/40 text-[20px] leading-none text-tinta hover:border-verde hover:text-verde";
  return (
    <>
      <button type="button" className={cls} aria-label={label[0]} onClick={() => onStep(-1)}>
        −
      </button>
      <button type="button" className={cls} aria-label={label[1]} onClick={() => onStep(1)}>
        +
      </button>
    </>
  );
}

function SizeResult({ size, detail }: { size: number; detail: string }) {
  const available = size >= MIN_SIZE && size <= MAX_SIZE;
  return (
    <div className="bg-verde p-6 text-creme-claro" aria-live="polite">
      <p className="rotulo text-[10px] text-creme-claro/80">Seu aro</p>
      <p className="mt-1 text-[64px] font-light leading-none">{size}</p>
      <p className="mt-3 text-[14px] text-creme-claro/85">{detail}</p>
      {!available && (
        <p className="mt-3 text-[14px]">
          Esse aro fica fora dos que fazemos hoje ({MIN_SIZE} a {MAX_SIZE}). Confira a medida de novo antes de comprar.
        </p>
      )}
    </div>
  );
}

export function RingSizer() {
  const [step, setStep] = useState<1 | 2>(1);
  const [ppm, setPpm] = useState(DEFAULT_PPM);
  const [diameter, setDiameter] = useState(() => diameterForSize(16));

  // Recupera a calibração salva (se houver) e vai direto para a medição.
  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(STORAGE_KEY));
      if (saved >= PPM_MIN && saved <= PPM_MAX) {
        setPpm(saved);
        setStep(2);
      }
    } catch {
      // sem acesso ao armazenamento: segue com o padrão
    }
  }, []);

  function confirmCalibration() {
    try {
      localStorage.setItem(STORAGE_KEY, String(ppm));
    } catch {
      // ignora: a calibração vale só nesta visita
    }
    setStep(2);
  }

  const size = sizeForDiameter(diameter);
  const circlePx = diameter * ppm;
  const box = Math.ceil(D_MAX * PPM_MAX * 0.75);

  return (
    <div className="border border-tinta/30 bg-branco">
      <div className="grid grid-cols-2 border-b border-tinta/30" role="tablist" aria-label="Etapas do medidor">
        {([1, 2] as const).map((n) => (
          <button
            key={n}
            type="button"
            role="tab"
            aria-selected={step === n}
            className={`rotulo min-h-12 px-4 text-left text-[10px] md:px-6 ${
              step === n ? "bg-verde text-creme-claro" : "text-tinta/75 hover:text-verde"
            }`}
            onClick={() => setStep(n)}
          >
            {n}. {n === 1 ? "Ajustar a tela" : "Medir com um anel"}
          </button>
        ))}
      </div>

      {step === 1 ? (
        <div className="grid gap-8 p-6 md:grid-cols-[1fr_auto] md:p-8" role="tabpanel">
          <div className="flex flex-col gap-4">
            <h3 className="text-[22px] font-light text-verde">Primeiro, ajuste a tela</h3>
            <p className="text-[15px] text-tinta/80">
              Cada tela mostra os tamanhos de um jeito. Para o medidor ficar certo, pegue um cartão de tamanho padrão
              (crédito, débito ou de transporte), encoste o lado menor dele na tela, em pé, e ajuste até o retângulo
              ficar exatamente do tamanho do cartão.
            </p>
            <div className="flex items-center gap-3">
              <Stepper
                label={["Diminuir o retângulo", "Aumentar o retângulo"]}
                onStep={(d) => setPpm((v) => clamp(v + d * 0.02, PPM_MIN, PPM_MAX))}
              />
              <label className="flex-1">
                <span className="sr-only">Tamanho do retângulo</span>
                <input
                  type="range"
                  min={PPM_MIN}
                  max={PPM_MAX}
                  step={0.01}
                  value={ppm}
                  onChange={(e) => setPpm(Number(e.target.value))}
                  aria-valuetext={`${Math.round((ppm / DEFAULT_PPM) * 100)}%`}
                  className="w-full accent-verde"
                />
              </label>
            </div>
            <p className="text-[13px] text-tinta/70">Não use zoom no navegador enquanto mede.</p>
            <button
              type="button"
              onClick={confirmCalibration}
              className="rotulo mt-2 inline-flex min-h-12 items-center justify-center self-start rounded-full bg-laranja px-8 text-[11px] text-tinta hover:bg-verde hover:text-creme-claro"
            >
              Pronto, o cartão bateu
            </button>
          </div>
          <div className="order-first flex justify-center overflow-hidden md:order-none">
            <div
              className="flex items-end justify-center rounded-[3px] border-2 border-verde bg-creme-claro"
              style={{ width: CARD_W * ppm, height: CARD_H * ppm }}
              aria-hidden="true"
            >
              <span className="rotulo mb-3 text-[9px] text-verde">Cartão aqui</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-8 p-6 md:grid-cols-[1fr_auto] md:p-8" role="tabpanel">
          <div className="flex flex-col gap-4">
            <h3 className="text-[22px] font-light text-verde">Agora, use um anel que já serve</h3>
            <p className="text-[15px] text-tinta/80">
              Deite sobre o círculo um anel que você usa no dedo onde vai usar a peça. Ajuste até o círculo verde
              preencher exatamente a parte de dentro do anel, sem sobrar nem faltar.
            </p>
            <div className="flex items-center gap-3">
              <Stepper
                label={["Diminuir o círculo", "Aumentar o círculo"]}
                onStep={(d) => setDiameter((v) => clamp(v + d * 0.1, D_MIN, D_MAX))}
              />
              <label className="flex-1">
                <span className="sr-only">Tamanho do círculo</span>
                <input
                  type="range"
                  min={D_MIN}
                  max={D_MAX}
                  step={0.05}
                  value={diameter}
                  onChange={(e) => setDiameter(Number(e.target.value))}
                  aria-valuetext={`${formatMmValue(diameter)} milímetros, aro ${size}`}
                  className="w-full accent-verde"
                />
              </label>
            </div>
            <SizeResult
              size={size}
              detail={`Diâmetro interno de ${formatMmValue(diameter)} mm · volta de ${formatMmValue(diameter * Math.PI, 0)} mm`}
            />
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <Link
                href="/#as-pecas"
                className="rotulo inline-flex min-h-12 items-center justify-center rounded-full bg-laranja px-8 text-[11px] text-tinta hover:bg-verde hover:text-creme-claro"
              >
                Ver as peças
              </Link>
              <button
                type="button"
                className="min-h-11 text-[14px] text-tinta/80 underline hover:text-verde"
                onClick={() => setStep(1)}
              >
                Ajustar a tela de novo
              </button>
            </div>
          </div>
          <div className="order-first flex items-center justify-center md:order-none" style={{ minHeight: box }} aria-hidden="true">
            <svg width={circlePx + 2} height={circlePx + 2} viewBox={`0 0 ${circlePx + 2} ${circlePx + 2}`}>
              <circle cx={circlePx / 2 + 1} cy={circlePx / 2 + 1} r={circlePx / 2} fill="#0C3A21" />
              <path
                d={`M${circlePx / 2 + 1} ${circlePx * 0.3}V${circlePx * 0.7 + 2}M${circlePx * 0.3} ${circlePx / 2 + 1}H${circlePx * 0.7 + 2}`}
                stroke="#F2E9DA"
                strokeWidth={1}
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

// Calculadora para quem mediu a volta do dedo com barbante ou tira de papel.
export function StringCalculator() {
  const [value, setValue] = useState("");
  const mm = Number(value.replace(",", "."));
  const valid = value.trim() !== "" && mm >= 40 && mm <= 90;

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-[14px] text-tinta">Volta do dedo, em milímetros</span>
        <input
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/[^\d,.]/g, "").slice(0, 5))}
          placeholder="Ex.: 56"
          className="min-h-12 max-w-[200px] border border-tinta/40 bg-branco px-4 text-[16px] text-tinta outline-none focus:border-verde"
        />
      </label>
      {value.trim() !== "" && !valid && (
        <p className="text-[14px] text-laranja-tinta">Confira a medida: ela costuma ficar entre 45 e 70 mm.</p>
      )}
      {valid && (
        <SizeResult
          size={sizeForCircumference(mm)}
          detail={`Volta de ${formatMmValue(mm, 0)} mm · diâmetro interno de ${formatMmValue(mm / Math.PI)} mm`}
        />
      )}
    </div>
  );
}
