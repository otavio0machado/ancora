import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { Header } from "@/components/shared/header";
import { BottomNav } from "@/components/shared/bottom-nav";
import { RescueModeBanner } from "@/components/shared/rescue-mode-banner";
import { ServiceWorkerRegister } from "@/components/shared/sw-register";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Âncora",
    template: "%s | Âncora",
  },
  description:
    "Seu espaco de regulacao pessoal. Gerencie impulsos, foco, habitos e bem-estar com calma e intencionalidade.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Âncora",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAF8" },
    { media: "(prefers-color-scheme: dark)", color: "#141413" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-text-primary font-sans">
        <Header />
        <RescueModeBanner />

        <main className="flex-1 pt-14 pb-20">
          {children}
        </main>

        <BottomNav />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
