import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "kerjaKU.click - Urusan Rumah Jadi Mudah",
  description: "Platform layanan jasa rumah tangga profesional di Kota Palu.",
  manifest: "/manifest.ts",
};

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn("font-sans", geist.variable)}>
      <body className={`${plusJakarta.variable} font-sans antialiased bg-slate-50 text-slate-900`}>
        {/* Global Providers akan disuntikkan di sini pada Sprint 4 */}
        {children}
      </body>
    </html>
  );
}
