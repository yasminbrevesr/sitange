import type { Metadata } from "next";
import { CartView } from "@/components/CartView";

export const metadata: Metadata = { title: "Sacola" };

export default function SacolaPage() {
  return <CartView />;
}
