import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthRouterRefresh } from "@/components/layout/AuthRouterRefresh";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeaderServer } from "@/components/layout/SiteHeaderServer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ArtNoCap — Community artwork requests",
    template: "%s · ArtNoCap",
  },
  description:
    "Post a design brief, collect community submissions, and vote on favorites. No payments—just creative collaboration.",
  metadataBase: new URL("https://www.ArtNoCap.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full scroll-smooth`}>
      <body className="flex min-h-full flex-col bg-white font-sans text-slate-900 antialiased">
        <AuthRouterRefresh />
        <SiteHeaderServer />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
