import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "AMPERA BBPOM - Portal Layanan & Pendampingan Regulasi BBPOM Palembang",
  description:
    "Portal resmi pelayanan publik, pendaftaran sertifikasi CPPOB, CDOB, pengujian laboratorium, dan pendampingan UMKM BBPOM di Palembang.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${jakarta.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
