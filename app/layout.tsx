import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://stuviora.com"),
  title: {
    default: "Stuviora: Hire students. Trust the platform.",
    template: "%s · Stuviora",
  },
  description:
    "India's first AI-powered student freelancing platform. Every deliverable passes an AI quality check before it reaches the client, making student talent safe to hire.",
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
      "AI-reviewed student freelancing for India. Escrow-protected, quality-gated, college-verified.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
