import type { Metadata } from "next";
import { NewPasswordForm } from "@/components/NewPasswordForm";

export const metadata: Metadata = { title: "Nova senha", robots: { index: false } };

export default function NovaSenhaPage() {
  return <NewPasswordForm />;
}
