import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CouponPopup } from "@/components/CouponPopup";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "TANGÈ", template: "%s · TANGÈ" },
  description:
    "Anéis em prata 925 maciça, feitos sob encomenda no Brasil. Toda peça é feita de duas partes que se encaixam.",
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
        <CartProvider>
          <Nav />
          <main id="conteudo">{children}</main>
          <Footer />
          <CouponPopup />
        </CartProvider>
      </body>
    </html>
  );
}
