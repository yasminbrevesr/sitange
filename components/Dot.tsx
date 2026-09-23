// Ponto final decorativo dos títulos grandes (46px ou mais).
export function Dot({ className = "text-laranja" }: { className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      .
    </span>
  );
}
