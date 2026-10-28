"use client";

import React from "react";
import { MapPin, Mail, Phone, ExternalLink } from "lucide-react";

export interface LandingContactData {
  id?: number;
  eyebrow: string;
  judul: string;
  deskripsi: string;
  labelSosmed: string;
  alamat: string;
  email1: string;
  email2?: string | null;
  telepon: string;
  whatsapp: string;
  whatsappPesan: string;
  mapsEmbedUrl: string;
  mapsLinkUrl: string;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  threadsUrl?: string | null;
  youtubeUrl?: string | null;
}

const DEFAULT_KONTAK: LandingContactData = {
  id: 1,
  eyebrow: "CONTACT DETAIL",
  judul: "Visit Our Office",
  deskripsi:
    "Balai Besar Pengawas Obat dan Makanan di Palembang siap melayani kebutuhan informasi, konsultasi izin edar produk, pengaduan konsumen, serta pengujian laboratorium terakreditasi.",
  labelSosmed: "Media Sosial Resmi BBPOM Palembang:",
  alamat: "Jl. Pangeran Ratu, Jakabaring, 15 Ulu, Palembang - Sumsel 30252",
  email1: "bpom_palembang@pom.go.id",
  email2: "ulpk_palembang@yahoo.com",
  telepon: "(0711) 510042",
  whatsapp: "0811-7850-008",
  whatsappPesan: "Halo Admin BBPOM Palembang, saya ingin berkonsultasi.",
  mapsEmbedUrl:
    "https://maps.google.com/maps?q=Balai+Besar+POM+di+Palembang,+Jl.+Pangeran+Ratu,+Jakabaring,+Palembang&t=&z=16&ie=UTF8&iwloc=&output=embed",
  mapsLinkUrl: "https://maps.google.com/?q=Balai+Besar+POM+di+Palembang",
  instagramUrl: "https://www.instagram.com/bpom.palembang/",
  facebookUrl: "https://www.facebook.com/bpom.palembang/",
  tiktokUrl: "https://www.tiktok.com/@bpom.palembang",
  threadsUrl: "https://www.threads.net/@bpom.palembang",
  youtubeUrl: "https://www.youtube.com/@bbpomdipalembang",
};

function getWhatsAppUrl(phone: string, message: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    digits = "62" + digits.slice(1);
  }
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

interface ContactSectionProps {
  initialData?: LandingContactData | null;
}

export function ContactSection({ initialData }: ContactSectionProps) {
  const kontak = initialData || DEFAULT_KONTAK;

  // Cek apakah Master Toggle Sosial Media aktif atau dinonaktifkan via prefix [NONAKTIF]
  const isSosmedActive = !(
    kontak.labelSosmed && kontak.labelSosmed.trim().startsWith("[NONAKTIF]")
  );

  // Bersihkan label dari prefix [NONAKTIF] jika ada
  const displayLabelSosmed = (
    kontak.labelSosmed || DEFAULT_KONTAK.labelSosmed
  ).replace(/^\[NONAKTIF\]\s*/, "");

  // Helper untuk memfilter URL media sosial individual yang tidak berstatus [NONAKTIF]
  const getActiveSocialUrl = (rawUrl?: string | null) => {
    if (!rawUrl) return null;
    const trimmed = rawUrl.trim();
    if (!trimmed || trimmed.startsWith("[NONAKTIF]")) return null;
    return trimmed;
  };

  interface ActiveSocialLink {
    name: string;
    href: string;
    color: string;
    icon: React.ReactNode;
  }

  const rawSocialLinks = [
    {
      name: "Instagram",
      href: getActiveSocialUrl(kontak.instagramUrl),
      color: "hover:bg-[#E1306C] hover:text-white hover:border-[#E1306C]",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
    },
    {
      name: "Facebook",
      href: getActiveSocialUrl(kontak.facebookUrl),
      color: "hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      name: "TikTok",
      href: getActiveSocialUrl(kontak.tiktokUrl),
      color: "hover:bg-black hover:text-white hover:border-black dark:hover:bg-white dark:hover:text-black",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/>
        </svg>
      ),
    },
    {
      name: "Threads",
      href: getActiveSocialUrl(kontak.threadsUrl),
      color: "hover:bg-slate-900 hover:text-white hover:border-slate-900 dark:hover:bg-white dark:hover:text-black",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.186 24C5.556 24 0 18.673 0 12.043 0 5.414 5.556.086 12.186.086c6.51 0 11.96 5.163 12.18 11.666h-2.585c-.21-5.06-4.43-9.08-9.595-9.08-5.285 0-9.6 4.316-9.6 9.37 0 5.056 4.315 9.372 9.6 9.372 4.417 0 8.083-2.906 9.208-7.078.29-1.077.44-2.222.44-3.407 0-.494-.03-.984-.087-1.468h-9.56v2.587h6.81c-.247 2.45-2.247 4.35-4.68 4.35-2.59 0-4.697-2.107-4.697-4.697 0-2.59 2.107-4.697 4.697-4.697 1.734 0 3.25.94 4.07 2.348l2.09-1.524C18.91 5.37 15.776 4 12.186 4 7.747 4 4.143 7.604 4.143 12.043c0 4.44 3.604 8.043 8.043 8.043 3.655 0 6.84-2.457 7.77-6.043H12.186v-2.586h10.364c.06.494.09.998.09 1.512 0 1.402-.18 2.766-.525 4.053C20.67 21.365 16.73 24 12.186 24z"/>
        </svg>
      ),
    },
    {
      name: "YouTube",
      href: getActiveSocialUrl(kontak.youtubeUrl),
      color: "hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000]",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
    },
    {
      name: "WhatsApp",
      href: kontak.whatsapp ? getWhatsAppUrl(kontak.whatsapp, kontak.whatsappPesan || DEFAULT_KONTAK.whatsappPesan) : null,
      color: "hover:bg-[#25D366] hover:text-white hover:border-[#25D366]",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.44 0-2.85-.38-4.08-1.1l-.29-.17-3.03.79.81-2.96-.19-.3a8.16 8.16 0 0 1-1.25-4.5c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.71 4.31 3.8.6.26 1.07.42 1.44.54.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29z"/>
        </svg>
      ),
    },
  ];

  const socialLinks: ActiveSocialLink[] = isSosmedActive
    ? (rawSocialLinks.filter((item) => Boolean(item.href)) as ActiveSocialLink[])
    : [];

  return (
    <section
      id="kontak"
      className="relative w-full py-12 sm:py-16 lg:py-20 bg-slate-50/60 dark:bg-slate-950 transition-colors scroll-mt-20"
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-14">
        {/* Main Card with Split Layout (Map on Left, Info on Right) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-[0_15px_45px_-15px_rgba(11,42,107,0.08)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all">
          {/* ========================================================= */}
          {/* SISI KIRI: Interactive Google Map                         */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 relative w-full min-h-[320px] sm:min-h-[380px] lg:min-h-full bg-slate-100 dark:bg-slate-800">
            <iframe
              title="Peta Lokasi Kantor Balai Besar POM di Palembang"
              src={kontak.mapsEmbedUrl || DEFAULT_KONTAK.mapsEmbedUrl}
              className="w-full h-full min-h-[320px] sm:min-h-[380px] lg:min-h-[460px] border-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />

            {/* Floating Quick Action: Open in Google Maps */}
            <div className="absolute top-4 left-4 z-10 pointer-events-auto">
              <a
                href={kontak.mapsLinkUrl || DEFAULT_KONTAK.mapsLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm text-xs font-semibold text-navy-900 dark:text-white shadow-md hover:bg-brand-orange hover:text-white transition-all duration-200 border border-slate-200/80 dark:border-slate-700"
              >
                <span>Buka di Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SISI KANAN: Detail Kontak & Media Sosial                  */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
            <div>
              {/* Eyebrow with Double Orange Slashes */}
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex gap-1" aria-hidden="true">
                  <span className="w-1.5 h-3.5 bg-brand-orange -skew-x-[20deg] rounded-xs" />
                  <span className="w-1.5 h-3.5 bg-brand-orange -skew-x-[20deg] rounded-xs" />
                </span>
                <span className="text-[11px] sm:text-xs font-bold tracking-[0.2em] text-navy-900 dark:text-orange-400 uppercase">
                  {kontak.eyebrow || DEFAULT_KONTAK.eyebrow}
                </span>
              </div>

              {/* Main Heading */}
              <h2 className="font-brand font-extrabold text-2xl sm:text-3xl lg:text-4xl text-navy-900 dark:text-white leading-tight">
                {kontak.judul || DEFAULT_KONTAK.judul}
              </h2>

              {/* Sub-description */}
              <p className="mt-3 text-xs sm:text-sm text-ink-soft dark:text-slate-400 leading-relaxed max-w-xl font-normal">
                {kontak.deskripsi || DEFAULT_KONTAK.deskripsi}
              </p>

              {/* 3 Contact Columns (Address, Email, Phone) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                {/* 1. Address */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-500/15 border border-orange-100 dark:border-orange-500/20 text-brand-orange dark:text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-navy-900 dark:text-white">
                      Address
                    </h3>
                    <p className="text-[11px] sm:text-xs text-ink-soft dark:text-slate-400 mt-1 leading-relaxed">
                      {kontak.alamat || DEFAULT_KONTAK.alamat}
                    </p>
                  </div>
                </div>

                {/* 2. Email */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-500/15 border border-orange-100 dark:border-orange-500/20 text-brand-orange dark:text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-navy-900 dark:text-white">
                      Email
                    </h3>
                    <div className="text-[11px] sm:text-xs text-ink-soft dark:text-slate-400 mt-1 space-y-0.5">
                      <a
                        href={`mailto:${kontak.email1 || DEFAULT_KONTAK.email1}`}
                        className="block hover:text-brand-orange transition-colors truncate"
                      >
                        {kontak.email1 || DEFAULT_KONTAK.email1}
                      </a>
                      {kontak.email2 && (
                        <a
                          href={`mailto:${kontak.email2}`}
                          className="block hover:text-brand-orange transition-colors truncate"
                        >
                          {kontak.email2}
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Phone */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-500/15 border border-orange-100 dark:border-orange-500/20 text-brand-orange dark:text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-navy-900 dark:text-white">
                      Phone
                    </h3>
                    <div className="text-[11px] sm:text-xs text-ink-soft dark:text-slate-400 mt-1 space-y-0.5">
                      <p>{kontak.telepon || DEFAULT_KONTAK.telepon}</p>
                      {kontak.whatsapp && (
                        <a
                          href={getWhatsAppUrl(kontak.whatsapp, kontak.whatsappPesan || DEFAULT_KONTAK.whatsappPesan)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block hover:text-brand-orange transition-colors truncate"
                        >
                          {kontak.whatsapp} (WA)
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* BAGIAN BAWAH KANAN: Ikon-Ikon Sosial Media               */}
            {/* (Hanya tampil jika Master Toggle Sosial Media Aktif & ada minimal 1 akun aktif) */}
            {/* ========================================================= */}
            {isSosmedActive && socialLinks.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="text-xs font-semibold text-ink-soft dark:text-slate-400">
                  {displayLabelSosmed}
                </span>

                {/* Deretan Icon Sosial Media di Kanan Bawah */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Buka akun resmi ${social.name} BBPOM Palembang`}
                      className={`w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-all duration-200 active:scale-95 shadow-2xs hover:scale-105 ${social.color}`}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
