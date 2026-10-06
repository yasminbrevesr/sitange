import type { Metadata } from "next";
import { AuthForms } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Entre ou cadastre-se", robots: { index: false } };

export default function EntrarPage() {
  return <AuthForms />;
}
