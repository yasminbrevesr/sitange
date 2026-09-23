import type { ImageView, ProductImage as ProductImageData } from "@/lib/products";

// Ilustração provisória das peças, usada enquanto não houver foto (src null em lib/products.ts).
// Traço chapado, sem degradê. Em fundo verde o traço fica creme.

type Tone = "claro" | "escuro";
export type Surface = "creme-base" | "creme-claro" | "branco" | "verde-claro";

type RingProps = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rot?: number;
  band?: number;
  /** Face reta no topo (Plano) */
  flat?: boolean;
  /** Bloco da letra no topo (Letra) */
  letter?: boolean;
  tone: Tone;
};

function Ring({ cx, cy, rx, ry, rot = 0, band = 12, flat, letter, tone }: RingProps) {
  const line = tone === "claro" ? "#121212" : "#F2E9DA";
  const fill = tone === "claro" ? "#FFFFFF" : "#0F4629";
  return (
    <g transform={`rotate(${rot} ${cx} ${cy})`}>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={line} strokeOpacity={0.14} strokeWidth={band} />
      <ellipse cx={cx} cy={cy} rx={rx + band / 2} ry={ry + band / 2} fill="none" stroke={line} strokeOpacity={0.7} strokeWidth={1.5} />
      <ellipse cx={cx} cy={cy} rx={rx - band / 2} ry={ry - band / 2} fill="none" stroke={line} strokeOpacity={0.45} strokeWidth={1.2} />
      {flat && (
        <rect
          x={cx - rx * 0.55}
          y={cy - ry - band / 2 - 16}
          width={rx * 1.1}
          height={26}
          rx={4}
          fill={fill}
          stroke={line}
          strokeOpacity={0.7}
          strokeWidth={1.5}
        />
      )}
      {letter && (
        <rect
          x={cx - 14}
          y={cy - ry - band / 2 - 8}
          width={28}
          height={20}
          rx={3}
          fill={fill}
          stroke={line}
          strokeOpacity={0.7}
          strokeWidth={1.5}
        />
      )}
    </g>
  );
}

function Scene({ slug, view, tone }: { slug: string; view: ImageView; tone: Tone }) {
  const t = tone;
  const joined = view === "encaixadas" || view === "verde";
  switch (slug) {
    case "curva":
      if (joined)
        return (
          <>
            <Ring tone={t} cx={200} cy={150} rx={120} ry={88} rot={-18} band={14} />
            <Ring tone={t} cx={185} cy={158} rx={86} ry={62} rot={-18} band={10} />
          </>
        );
      if (view === "separadas")
        return (
          <>
            <Ring tone={t} cx={140} cy={150} rx={96} ry={72} rot={-14} band={13} />
            <Ring tone={t} cx={300} cy={160} rx={64} ry={48} rot={-14} band={9} />
          </>
        );
      return <Ring tone={t} cx={200} cy={150} rx={112} ry={84} rot={-16} band={14} />;

    case "letra":
      if (joined)
        return (
          <>
            <Ring tone={t} cx={155} cy={160} rx={96} ry={66} rot={-10} band={14} />
            <Ring tone={t} cx={250} cy={150} rx={80} ry={56} rot={-10} band={12} letter />
          </>
        );
      if (view === "separadas")
        return (
          <>
            <Ring tone={t} cx={120} cy={160} rx={82} ry={58} rot={-10} band={13} letter />
            <Ring tone={t} cx={295} cy={160} rx={68} ry={48} rot={-10} band={11} letter />
          </>
        );
      return <Ring tone={t} cx={200} cy={160} rx={100} ry={70} rot={-10} band={14} letter />;

    case "linha":
      if (joined)
        return (
          <>
            <Ring tone={t} cx={185} cy={145} rx={96} ry={72} rot={-20} band={6} />
            <Ring tone={t} cx={215} cy={160} rx={96} ry={72} rot={-20} band={6} />
          </>
        );
      if (view === "separadas")
        return (
          <>
            <Ring tone={t} cx={120} cy={150} rx={78} ry={60} rot={-18} band={6} />
            <Ring tone={t} cx={285} cy={150} rx={78} ry={60} rot={-18} band={6} />
          </>
        );
      return <Ring tone={t} cx={200} cy={150} rx={100} ry={76} rot={-20} band={6} />;

    case "plano":
      if (joined)
        return (
          <>
            <Ring tone={t} cx={200} cy={180} rx={84} ry={52} band={16} flat />
            <Ring tone={t} cx={200} cy={130} rx={84} ry={52} band={16} flat />
          </>
        );
      if (view === "separadas")
        return (
          <>
            <Ring tone={t} cx={120} cy={170} rx={70} ry={44} band={14} flat />
            <Ring tone={t} cx={285} cy={170} rx={70} ry={44} band={14} flat />
          </>
        );
      return <Ring tone={t} cx={200} cy={165} rx={90} ry={56} band={16} flat />;

    default:
      return null;
  }
}

type Props = {
  slug: string;
  image: ProductImageData;
  className?: string;
  /** Cor do traço da ilustração: "escuro" para usar sobre verde. */
  tone?: Tone;
  /** Fundo da área onde a foto aparece: escolhe a versão da foto com esse mesmo fundo. */
  surface?: Surface;
};

// Mostra a foto real quando existir; senão, a ilustração.
export function ProductImage({ slug, image, className = "", tone, surface }: Props) {
  const resolvedTone: Tone = tone ?? (image.view === "verde" ? "escuro" : "claro");
  if (image.src) {
    // Com "surface", usa a versão da foto com o fundo igual ao da área (ex.: curva-encaixadas-creme-base.webp)
    // e mostra a peça inteira, sem corte, porque o fundo se funde com a área.
    const path = surface ? image.src.replace(/-encaixadas\.webp$/, `-encaixadas-${surface}.webp`) : image.src;
    // Caminhos locais (public/) precisam do prefixo do GitHub Pages.
    const src = path.startsWith("/") ? `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}` : path;
    const fit = surface ? "object-contain" : "object-cover";
    return <img src={src} alt={image.alt} className={`h-full w-full ${fit} ${className}`} loading="lazy" />;
  }
  return (
    <svg viewBox="0 0 400 300" role="img" aria-label={image.alt} className={`h-full w-full ${className}`}>
      <Scene slug={slug} view={image.view} tone={resolvedTone} />
    </svg>
  );
}
