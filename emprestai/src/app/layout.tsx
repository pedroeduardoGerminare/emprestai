import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { ApiProvider } from "@/lib/trpc";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-open-sans",
});

export const metadata: Metadata = {
  title: "EmpresTI — Empréstimo de equipamentos",
  description: "Pedido e devolução de equipamentos internos sem planilha.",
  robots: { index: false, follow: false },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Request rendering lets Next attach the proxy's nonce to its own inline scripts.
  await headers();
  return (
    <html lang="pt-BR" className={openSans.variable}>
      <body><ApiProvider>{children}</ApiProvider></body>
    </html>
  );
}
