import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CouponPopup } from "@/components/CouponPopup";

// Páginas da loja: menu, rodapé e popup de cupom.
export default function LojaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main id="conteudo">{children}</main>
      <Footer />
      <CouponPopup />
    </>
  );
}
