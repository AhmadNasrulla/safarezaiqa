import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Safar-e-Zaiqa | AI Marketing Intelligence",
  description:
    "AI-powered customer intelligence, sales forecasting, competitive analysis, marketing automation and executive decision support for Safar-e-Zaiqa — a desi biryani & pulao food truck. Daig Se Dil Tak.",
  applicationName: "Safar-e-Zaiqa Intelligence",
  authors: [{ name: "Ahmad Nasrullah" }],
  keywords: [
    "Safar-e-Zaiqa",
    "food truck",
    "AI marketing",
    "customer personas",
    "sales forecasting",
    "competitive intelligence",
  ],
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
    >
      <body className="min-h-full flex flex-col bg-bg text-text">{children}</body>
    </html>
  );
}
