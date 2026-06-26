import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ConsentBanner } from "@/components/feature/consent-banner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://stuviora.com"),
  title: {
    default: "Stuviora: Hire students. Trust the platform.",
    template: "%s · Stuviora",
  },
  description:
    "India's trust-first student freelancing platform. Escrow holds the payment until you approve, students are college-verified, and an AI quality check backs every delivery, making student talent safe to hire.",
  keywords: [
    "student freelancing",
    "hire students India",
    "AI quality gate",
    "college freelancers",
    "Stuviora",
  ],
  openGraph: {
    title: "Stuviora: Hire students. Trust the platform.",
    description:
      "Trust-first student freelancing for India. Escrow-protected, college-verified, quality-checked.",
    url: "https://stuviora.com",
    siteName: "Stuviora",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
        <ConsentBanner />
      </body>
    </html>
  );
}
