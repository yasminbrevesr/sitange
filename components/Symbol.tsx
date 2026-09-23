type Props = { className?: string; decorative?: boolean };

// Símbolo TANGÈ: círculo aberto com o ponto laranja no vão. O ponto é sempre laranja.
export function Symbol({ className, decorative = false }: Props) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-label": "Símbolo TANGÈ" })}
    >
      <path
        d="M68 16 A40 40 0 1 0 68 84"
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <circle cx="82" cy="50" r="10" fill="#FF6B35" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Symbol className="h-5 w-5" decorative />
      <span className="text-[15px] font-medium uppercase tracking-[0.34em]">Tangè</span>
    </span>
  );
}
