import type { Metadata } from "next";
import { AccountShell } from "@/components/conta/AccountShell";

export const metadata: Metadata = { title: "Minha conta", robots: { index: false } };

export default function MinhaContaLayout({ children }: { children: React.ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}
