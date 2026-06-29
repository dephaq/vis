import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { OfflineBanner } from "@/components/offline-banner";
import { InstallPrompt } from "@/components/install-prompt";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Interior Visualization",
  description: "PWA workspace for interior visualization briefs, prompts, and generated results.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-stone-50 text-neutral-950">
        <OfflineBanner />
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}
