"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUp,
  Clock,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import type { LandingContactData } from "./ContactSection";

const QUICK_LINKS = [
  { label: "Beranda", href: "#beranda" },
  { label: "Layanan AMPERA", href: "#layanan" },
  { label: "Pusat Edukasi", href: "#edukasi" },
  { label: "Video Profil", href: "#video" },
  { label: "Kontak & Peta Kantor", href: "#kontak" },
];

function getWhatsAppUrl(phone: string, message: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    digits = "62" + digits.slice(1);
  }
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

interface FooterProps {
  contactData?: LandingContactData | null;
}

export function Footer({ contactData }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isSosmedActive = contactData
    ? !(contactData.labelSosmed && contactData.labelSosmed.trim().startsWith("[NONAKTIF]"))
    : true;

  const getActiveSocialUrl = (rawUrl?: string | null) => {
    if (!rawUrl) return null;
    const trimmed = rawUrl.trim();
    if (!trimmed || trimmed.startsWith("[NONAKTIF]")) return null;
    return trimmed;
  };

  interface ActiveFooterSocialLink {
    name: string;
    href: string;
    icon: React.ReactNode;
  }

  const rawFooterSocial = [
    {
      name: "Instagram",
      href: contactData ? getActiveSocialUrl(contactData.instagramUrl) : "https://www.instagram.com/bpom.palembang/",
      icon: (
        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
    },
    {
      name: "Facebook",
      href: contactData ? getActiveSocialUrl(contactData.facebookUrl) : "https://www.facebook.com/bpom.palembang/",
      icon: (
        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      name: "TikTok",
      href: contactData ? getActiveSocialUrl(contactData.tiktokUrl) : "https://www.tiktok.com/@bpom.palembang",
      icon: (
        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/>
        </svg>
      ),
    },
    {
      name: "Threads",
      href: contactData ? getActiveSocialUrl(contactData.threadsUrl) : "https://www.threads.net/@bpom.palembang",
      icon: (
        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.186 24C5.556 24 0 18.673 0 12.043 0 5.414 5.556.086 12.186.086c6.51 0 11.96 5.163 12.18 11.666h-2.585c-.21-5.06-4.43-9.08-9.595-9.08-5.285 0-9.6 4.316-9.6 9.37 0 5.056 4.315 9.372 9.6 9.372 4.417 0 8.083-2.906 9.208-7.078.29-1.077.44-2.222.44-3.407 0-.494-.03-.984-.087-1.468h-9.56v2.587h6.81c-.247 2.45-2.247 4.35-4.68 4.35-2.59 0-4.697-2.107-4.697-4.697 0-2.59 2.107-4.697 4.697-4.697 1.734 0 3.25.94 4.07 2.348l2.09-1.524C18.91 5.37 15.776 4 12.186 4 7.747 4 4.143 7.604 4.143 12.043c0 4.44 3.604 8.043 8.043 8.043 3.655 0 6.84-2.457 7.77-6.043H12.186v-2.586h10.364c.06.494.09.998.09 1.512 0 1.402-.18 2.766-.525 4.053C20.67 21.365 16.73 24 12.186 24z"/>
        </svg>
      ),
    },
    {
      name: "YouTube",
      href: contactData ? getActiveSocialUrl(contactData.youtubeUrl) : "https://www.youtube.com/@bbpomdipalembang",
      icon: (
        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
    },
  ];

  const socialLinks: ActiveFooterSocialLink[] = isSosmedActive
    ? (rawFooterSocial.filter((item) => Boolean(item.href)) as ActiveFooterSocialLink[])
    : [];

  return (
    <footer className="w-full bg-[#061433] dark:bg-[#020716] text-slate-300 border-t border-white/10 transition-colors">
      {/* Konten Utama Footer (3 Kolom Proporsional) */}
      <div className="max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-14 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* ========================================================= */}
          {/* KOLOM 1: Profil & Identitas Lembaga (lg:col-span-5)       */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3.5 group focus:outline-hidden"
              aria-label="Balai Besar POM di Palembang"
            >
              <div className="relative w-11 h-11 transition-transform duration-300 group-hover:scale-105 shrink-0">
                <Image
                  src="/assets-landingpage/logo-bpom-footer.png"
                  alt="Logo Resmi BPOM RI"
                  width={44}
                  height={44}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-brand font-extrabold text-lg sm:text-xl text-white tracking-tight leading-tight">
                  BBPOM di Palembang
                </span>
                <span className="text-[11px] font-medium text-brand-orange tracking-wide">
                  Badan Pengawas Obat dan Makanan RI
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
              Balai Besar Pengawas Obat dan Makanan di Palembang berkomitmen mengawal keamanan,
              mutu, dan khasiat produk obat serta makanan demi melindungi kesehatan masyarakat Sumatera Selatan.
            </p>

            {/* Jam Layanan */}
            <div className="pt-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-xs text-slate-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Senin – Jumat, 08.00 – 16.30 WIB</span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* KOLOM 2: Navigasi Cepat Portal (lg:col-span-3)           */}
          {/* ========================================================= */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-brand font-bold text-sm uppercase tracking-wider text-white flex items-center gap-2">
              Navigasi Portal
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-[13px]">
              {QUICK_LINKS.map((item, idx) => (
                <li key={idx}>
                  <a
                    href={item.href}
                    className="group inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-brand-orange/60 group-hover:text-brand-orange group-hover:translate-x-0.5 transition-all" />
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ========================================================= */}
          {/* KOLOM 3: Hubungi Kami & Media Sosial (lg:col-span-4)      */}
          {/* ========================================================= */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="font-brand font-bold text-sm uppercase tracking-wider text-white flex items-center gap-2">
              Hubungi Kami
            </h3>

            {/* Informasi Kontak Singkat */}
            <div className="space-y-2.5 text-xs sm:text-[13px] text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                <span className="text-slate-400 leading-relaxed">
                  {contactData?.alamat || "Jl. Pangeran Ratu, Jakabaring, 15 Ulu, Palembang, Sumatera Selatan 30252"}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-orange shrink-0" />
                <span className="text-slate-300">
                  {contactData
                    ? `${contactData.telepon} • WA: ${contactData.whatsapp}`
                    : "(0711) 510042 • WA: 0811-7850-008"}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-orange shrink-0" />
                <a
                  href={`mailto:${contactData?.email1 || "bpom_palembang@pom.go.id"}`}
                  className="text-slate-300 hover:text-white transition-colors truncate"
                >
                  {contactData?.email1 || "bpom_palembang@pom.go.id"}
                </a>
              </div>
            </div>

            {/* Deretan Ikon Sosial Media (Hanya tampil jika Master Toggle Aktif & ada akun aktif) */}
            {isSosmedActive && socialLinks.length > 0 && (
              <div className="pt-2">
                <span className="block text-[11px] font-medium text-slate-400 mb-2.5">
                  Media Sosial Resmi:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Buka akun ${social.name} resmi BBPOM Palembang`}
                      className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-2xs"
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* BARIS BAWAH: Copyright & Tombol Kembali ke Atas           */}
        {/* ========================================================= */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} Balai Besar Pengawas Obat dan Makanan di Palembang. Hak Cipta Dilindungi.
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition-all active:scale-95 cursor-pointer"
          >
            <span>Kembali ke Atas</span>
            <ArrowUp className="w-3.5 h-3.5 text-brand-orange" />
          </button>
        </div>
      </div>
    </footer>
  );
}
