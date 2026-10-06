import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { PricesProvider } from "@/components/PricesProvider";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
  variable: "--font-jakarta",
  display: "swap",
});

// Base dos links para Google e redes sociais. Caminhos relativos (sem "/" no começo) para manter o /sitange.
export const metadata: Metadata = {
  metadataBase: new URL(`${SITE_URL}/`),
  title: { default: "TANGÈ · Anéis em prata que se encaixam", template: "%s · TANGÈ" },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: SITE_NAME,
    title: "TANGÈ · Toda peça é duas",
    description: SITE_DESCRIPTION,
    images: [{ url: "og.jpg", width: 1200, height: 630, alt: "TANGÈ: anel Curva em prata, duas partes encaixadas" }],
  },
  twitter: { card: "summary_large_image", images: ["og.jpg"] },
};

export const viewport: Viewport = { themeColor: "#0C3A21" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={jakarta.variable}>
      <body>
        <a
          href="#conteudo"
          className="rotulo sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-branco focus:px-4 focus:py-3"
        >
          Pular para o conteúdo
        </a>
        <PricesProvider>
          <CartProvider>{children}</CartProvider>
        </PricesProvider>
      </body>
    </html>
  );
}
