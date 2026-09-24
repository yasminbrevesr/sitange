import type { Metadata } from "next";
import { NewPasswordForm } from "@/components/NewPasswordForm";

export const metadata: Metadata = { title: "Nova senha" };

export default function NovaSenhaPage() {
  return <NewPasswordForm />;
}
