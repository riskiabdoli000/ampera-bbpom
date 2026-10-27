"use client";

import React, { useState, useTransition, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  PhoneCall,
  MapPin,
  Mail,
  Phone,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Globe,
  Sparkles,
  Loader2,
  Info,
  Check,
  XCircle,
} from "lucide-react";
import {
  saveKontakSettingsAction,
  KontakSettingsInput,
} from "@/app/actions/settings-kontak";
import {
  extractGoogleMapsEmbedUrl,
  buildWhatsAppLink,
} from "@/lib/maps";

// Brand SVG Icons untuk preview media sosial persis seperti di ContactSection landing page
function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TikTokIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
    </svg>
  );
}

function ThreadsIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.186 24C5.556 24 0 18.673 0 12.043 0 5.414 5.556.086 12.186.086c6.51 0 11.96 5.163 12.18 11.666h-2.585c-.21-5.06-4.43-9.08-9.595-9.08-5.285 0-9.6 4.316-9.6 9.37 0 5.056 4.315 9.372 9.6 9.372 4.417 0 8.083-2.906 9.208-7.078.29-1.077.44-2.222.44-3.407 0-.494-.03-.984-.087-1.468h-9.56v2.587h6.81c-.247 2.45-2.247 4.35-4.68 4.35-2.59 0-4.697-2.107-4.697-4.697 0-2.59 2.107-4.697 4.697-4.697 1.734 0 3.25.94 4.07 2.348l2.09-1.524C18.91 5.37 15.776 4 12.186 4 7.747 4 4.143 7.604 4.143 12.043c0 4.44 3.604 8.043 8.043 8.043 3.655 0 6.84-2.457 7.77-6.043H12.186v-2.586h10.364c.06.494.09.998.09 1.512 0 1.402-.18 2.766-.525 4.053C20.67 21.365 16.73 24 12.186 24z" />
    </svg>
  );
}

function YouTubeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.44 0-2.85-.38-4.08-1.1l-.29-.17-3.03.79.81-2.96-.19-.3a8.16 8.16 0 0 1-1.25-4.5c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.71 4.31 3.8.6.26 1.07.42 1.44.54.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29z" />
    </svg>
  );
}

interface KontakSettingsFormProps {
  initialData: {
    id: number;
    eyebrow: string;
    judul: string;
    deskripsi: string;
    labelSosmed: string;
    alamat: string;
    email1: string;
    email2: string | null;
    telepon: string;
    whatsapp: string;
    whatsappPesan: string;
    mapsEmbedUrl: string;
    mapsLinkUrl: string;
    instagramUrl: string | null;
    facebookUrl: string | null;
    tiktokUrl: string | null;
    threadsUrl: string | null;
    youtubeUrl: string | null;
  };
}

export function KontakSettingsForm({ initialData }: KontakSettingsFormProps) {
  // 1. Header Section
  const [eyebrow, setEyebrow] = useState(initialData.eyebrow);
  const [judul, setJudul] = useState(initialData.judul);
  const [deskripsi, setDeskripsi] = useState(initialData.deskripsi);

  // 2. Kontak Info
  const [alamat, setAlamat] = useState(initialData.alamat);
  const [email1, setEmail1] = useState(initialData.email1);
  const [email2, setEmail2] = useState(initialData.email2 || "");
  const [telepon, setTelepon] = useState(initialData.telepon);
  const [whatsapp, setWhatsapp] = useState(initialData.whatsapp);
  const [whatsappPesan, setWhatsappPesan] = useState(initialData.whatsappPesan);

  // 3. Google Maps
  const [mapsEmbedUrl, setMapsEmbedUrl] = useState(initialData.mapsEmbedUrl);
  const [mapsLinkUrl, setMapsLinkUrl] = useState(initialData.mapsLinkUrl);

  // 4. Media Sosial (dengan dukungan Toggle Aktif / Nonaktif)
  const parseSocialUrl = (rawUrl: string | null | undefined) => {
    if (!rawUrl) return { isActive: true, url: "" };
    if (rawUrl.startsWith("[NONAKTIF]")) {
      return { isActive: false, url: rawUrl.replace("[NONAKTIF]", "") };
    }
    return { isActive: true, url: rawUrl };
  };

  const parseLabelSosmed = (rawLabel: string | null | undefined) => {
    if (!rawLabel) return { isSosmedActive: true, label: "Media Sosial Resmi BBPOM Palembang:" };
    if (rawLabel.startsWith("[NONAKTIF]")) {
      return { isSosmedActive: false, label: rawLabel.replace(/^\[NONAKTIF\]\s*/, "") };
    }
    return { isSosmedActive: true, label: rawLabel };
  };

  const initialSosmed = parseLabelSosmed(initialData.labelSosmed);
  const [isSosmedActive, setIsSosmedActive] = useState(initialSosmed.isSosmedActive);
  const [labelSosmed, setLabelSosmed] = useState(initialSosmed.label);

  const initialInstagram = parseSocialUrl(initialData.instagramUrl);
  const [isInstagramActive, setIsInstagramActive] = useState(initialInstagram.isActive);
  const [instagramUrl, setInstagramUrl] = useState(initialInstagram.url);

  const initialFacebook = parseSocialUrl(initialData.facebookUrl);
  const [isFacebookActive, setIsFacebookActive] = useState(initialFacebook.isActive);
  const [facebookUrl, setFacebookUrl] = useState(initialFacebook.url);

  const initialTiktok = parseSocialUrl(initialData.tiktokUrl);
  const [isTiktokActive, setIsTiktokActive] = useState(initialTiktok.isActive);
  const [tiktokUrl, setTiktokUrl] = useState(initialTiktok.url);

  const initialThreads = parseSocialUrl(initialData.threadsUrl);
  const [isThreadsActive, setIsThreadsActive] = useState(initialThreads.isActive);
  const [threadsUrl, setThreadsUrl] = useState(initialThreads.url);

  const initialYoutube = parseSocialUrl(initialData.youtubeUrl);
  const [isYoutubeActive, setIsYoutubeActive] = useState(initialYoutube.isActive);
  const [youtubeUrl, setYoutubeUrl] = useState(initialYoutube.url);

  // Feedback & Transition State
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Auto-close feedback banner setelah 5 detik
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        setFeedback(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const [isPending, startTransition] = useTransition();

  // Bersihkan Embed URL secara real-time
  const cleanEmbedUrl = useMemo(() => {
    return extractGoogleMapsEmbedUrl(mapsEmbedUrl);
  }, [mapsEmbedUrl]);

  // Live WhatsApp Link Generator
  const previewWhatsAppLink = useMemo(() => {
    return buildWhatsAppLink(whatsapp, whatsappPesan);
  }, [whatsapp, whatsappPesan]);

  // Handle otomatis saat user paste tag <iframe> ke input Embed Maps
  const handleMapsEmbedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    const extracted = extractGoogleMapsEmbedUrl(val);
    setMapsEmbedUrl(extracted);
  };

  // Simpan ke Database
  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      // Helper untuk format URL tersimpan (jika nonaktif diberi prefix [NONAKTIF])
      const formatSocialSave = (isActive: boolean, url: string) => {
        const trimmed = url.trim();
        if (!trimmed) return null;
        return isActive ? trimmed : `[NONAKTIF]${trimmed}`;
      };

      const payload: KontakSettingsInput = {
        eyebrow,
        judul,
        deskripsi,
        labelSosmed: isSosmedActive
          ? (labelSosmed.trim() || "Media Sosial Resmi BBPOM Palembang:")
          : `[NONAKTIF] ${labelSosmed.trim() || "Media Sosial Resmi BBPOM Palembang:"}`,
        alamat,
        email1,
        email2: email2.trim() ? email2.trim() : null,
        telepon,
        whatsapp,
        whatsappPesan,
        mapsEmbedUrl: cleanEmbedUrl,
        mapsLinkUrl,
        instagramUrl: formatSocialSave(isInstagramActive, instagramUrl),
        facebookUrl: formatSocialSave(isFacebookActive, facebookUrl),
        tiktokUrl: formatSocialSave(isTiktokActive, tiktokUrl),
        threadsUrl: formatSocialSave(isThreadsActive, threadsUrl),
        youtubeUrl: formatSocialSave(isYoutubeActive, youtubeUrl),
      };

      const res = await saveKontakSettingsAction(payload);

      if (res.success) {
        setFeedback({
          type: "success",
          message:
            "Pengaturan Kontak & Lokasi Kantor berhasil disimpan ke database dan diperbarui di landing page!",
        });
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Gagal menyimpan pengaturan kontak.",
        });
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6 dark:border-slate-800">
        <div className="min-w-0 flex-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-orange">
            <PhoneCall className="h-3.5 w-3.5" />
            <span>Website Settings &bull; Kontak & Lokasi</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white font-brand mt-1">
            Pengaturan Kontak & Lokasi Kantor
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Sesuaikan teks judul, alamat, 2 email resmi, hotline WhatsApp, Google Maps, dan 5 akun media sosial persis seperti di Landing Page.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* <Link
            href="/#kontak"
            target="_blank"
            className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:border-brand-orange hover:text-brand-orange transition-all shadow-2xs whitespace-nowrap"
          >
            <ExternalLink className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Lihat di Landing Page</span>
          </Link> */}

          <button
            onClick={handleSave}
            disabled={isPending}
            type="button"
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] text-xs sm:text-sm font-bold text-white shadow-cta hover:brightness-110 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                <span>Menyimpan ke DB...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 shrink-0" />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Feedback Toast Banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between p-4 rounded-2xl border text-xs sm:text-sm font-medium animate-fade-in ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
              : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-bold opacity-60 hover:opacity-100 transition-opacity ml-4 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}


      {/* ========================================================================= */}
      {/* FORMULIR EDITOR PENGATURAN                                                */}
      {/* ========================================================================= */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* CARD 1: Header Section (Eyebrow, Judul, Deskripsi) */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-500/15 text-brand-orange flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-navy-900 dark:text-white uppercase tracking-wider font-brand">
                1. Header & Deskripsi Section
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Judul dan kalimat pengantar yang tampil di atas kolom kontak.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Tagline Atas (Eyebrow)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={eyebrow}
                  onChange={(e) => setEyebrow(e.target.value)}
                  placeholder="CONTACT DETAIL"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-bold tracking-wider uppercase text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Akan otomatis diberi aksen garis oranye ganda // di landing page.
              </p>
            </div>

            <div className="md:col-span-8">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Judul Utama Section (Visit Our Office)
              </label>
              <input
                type="text"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Visit Our Office"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-navy-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="md:col-span-12">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Deskripsi / Sub-heading Pengantar
              </label>
              <textarea
                rows={2}
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Balai Besar Pengawas Obat dan Makanan di Palembang siap melayani kebutuhan informasi..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* CARD 2: Informasi Kontak Utama (3 Kolom Landing: Address, Email, Phone) */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-blue-600 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-navy-900 dark:text-white uppercase tracking-wider font-brand">
                2. Detail Kontak 3 Kolom (Alamat, Email & Telepon/WA)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sesuai dengan 3 kolom kartu kontak di landing page: Address, Email, dan Phone.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Kolom 1: Alamat Kantor */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-orange" />
                <span>Alamat Kantor Resmi (Kolom Address)</span>
              </label>
              <textarea
                rows={2}
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                placeholder="Jl. Pangeran Ratu, Jakabaring, 15 Ulu, Palembang - Sumsel 30252"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white leading-relaxed"
              />
            </div>

            {/* Kolom 2: Email Resmi (2 Email Sesuai Landing) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-brand-orange" />
                  <span>Email 1: Utama BBPOM</span>
                </label>
                <input
                  type="email"
                  value={email1}
                  onChange={(e) => setEmail1(e.target.value)}
                  placeholder="bpom_palembang@pom.go.id"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email 2: Unit Layanan Pengaduan (ULPK)</span>
                </label>
                <input
                  type="email"
                  value={email2}
                  onChange={(e) => setEmail2(e.target.value)}
                  placeholder="ulpk_palembang@yahoo.com (opsional)"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Kolom 3: Telepon PSTN & Nomor WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-brand-orange" />
                  <span>Telepon PSTN Kantor Resmi</span>
                </label>
                <input
                  type="text"
                  value={telepon}
                  onChange={(e) => setTelepon(e.target.value)}
                  placeholder="(0711) 510042"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Tampil pada baris pertama kolom Phone.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-lg bg-[#25D366]/10 text-[#25D366] flex items-center justify-center">
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                  </span>
                  <span>Nomor WhatsApp Konsultasi & Pengaduan</span>
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="0811-7850-008"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Tampil dengan format otomatis &bull; (WA) dan mengaktifkan tautan wa.me.
                </p>
              </div>
            </div>

            {/* Template Pesan Konsultasi WhatsApp */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Template Pesan Awal WhatsApp (Otomatis saat pemohon klik chat WA)
              </label>
              <input
                type="text"
                value={whatsappPesan}
                onChange={(e) => setWhatsappPesan(e.target.value)}
                placeholder="Halo Admin BBPOM Palembang, saya ingin berkonsultasi."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              {/* <p className="mt-1 text-[11px] text-slate-400">
                Tautan yang dihasilkan: <code className="text-emerald-600 dark:text-emerald-400 font-mono">{previewWhatsAppLink}</code>
              </p> */}
            </div>
          </div>
        </div>

        {/* CARD 3: Peta Lokasi Google Maps Interaktif */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-navy-900 dark:text-white uppercase tracking-wider font-brand">
                3. Integrasi Peta Google Maps (Sisi Kiri Kartu)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Peta interaktif dan tombol cepat &quot;Buka di Google Maps&quot;.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                URL Google Maps (atau tempel kode &lt;iframe ...&gt;&lt;/iframe&gt;)
              </label>
              <textarea
                rows={2}
                value={mapsEmbedUrl}
                onChange={handleMapsEmbedChange}
                placeholder="https://maps.google.com/maps?q=Balai+Besar+POM+di+Palembang...&output=embed"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-mono text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <Info className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                <span>
                  Tip: Anda dapat langsung menempelkan seluruh kode &lt;iframe&gt; dari fitur Google Maps &quot;Sematkan Peta&quot;. Sistem akan otomatis mengambil URL src-nya.
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Tautan Tombol &quot;Buka di Google Maps&quot; (Direct Link)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={mapsLinkUrl}
                  onChange={(e) => setMapsLinkUrl(e.target.value)}
                  placeholder="https://maps.google.com/?q=Balai+Besar+POM+di+Palembang"
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <a
                  href={mapsLinkUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-brand-orange transition-colors flex items-center gap-1.5"
                >
                  <span>Uji Buka</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 4: Media Sosial Resmi BBPOM Palembang */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
          {/* Header Card 4 dengan Master Toggle Switch */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-500/15 text-purple-600 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-navy-900 dark:text-white uppercase tracking-wider font-brand">
                  4. Saluran Media Sosial Resmi (Sisi Kanan Bawah)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Kelola tautan akun media sosial serta atur apakah tampil atau disembunyikan di website.
                </p>
              </div>
            </div>

            {/* Master Toggle Switch: Tampilkan / Sembunyikan Seluruh Bagian Medsos */}
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-200/80 dark:border-slate-700 shrink-0">
              <div className="text-left sm:text-right">
                <span className="block text-xs font-bold text-navy-900 dark:text-white">
                  Tampilkan di Website
                </span>
                <span className={`text-[10px] font-semibold ${isSosmedActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                  {isSosmedActive ? "● Aktif (Tampil)" : "○ Nonaktif (Sembunyi)"}
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isSosmedActive}
                onClick={() => setIsSosmedActive(!isSosmedActive)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isSosmedActive ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                }`}
                title={isSosmedActive ? "Klik untuk menonaktifkan seluruh bagian media sosial" : "Klik untuk mengaktifkan bagian media sosial"}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isSosmedActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Banner Peringatan jika Master Toggle Nonaktif */}
          {!isSosmedActive && (
            <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-4 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold">Bagian Media Sosial Sedang Dinonaktifkan</p>
                <p className="text-amber-700 dark:text-amber-300/90 text-[11px] leading-relaxed">
                  Seluruh deretan ikon media sosial dan labelnya tidak akan dimunculkan di landing page website. Data tautan yang Anda simpan di bawah ini tetap aman dan tidak akan hilang.
                </p>
              </div>
            </div>
          )}

          <div className={`space-y-4 transition-opacity duration-200 ${!isSosmedActive ? "opacity-60" : "opacity-100"}`}>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Label Teks Pengantar Media Sosial
              </label>
              <input
                type="text"
                value={labelSosmed}
                onChange={(e) => setLabelSosmed(e.target.value)}
                placeholder="Media Sosial Resmi BBPOM Palembang:"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Instagram */}
              <div className={`p-3.5 rounded-2xl border transition-all ${isInstagramActive ? "bg-white border-slate-200 dark:bg-slate-800/60 dark:border-slate-700" : "bg-slate-50 border-slate-200/60 dark:bg-slate-900/40 dark:border-slate-800"}`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-lg bg-[#E1306C]/10 text-[#E1306C] flex items-center justify-center">
                      <InstagramIcon className="w-3.5 h-3.5" />
                    </span>
                    <span>Instagram</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold ${isInstagramActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                      {isInstagramActive ? "Aktif" : "Nonaktif"}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isInstagramActive}
                      onClick={() => setIsInstagramActive(!isInstagramActive)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isInstagramActive ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                      title={isInstagramActive ? "Klik untuk menonaktifkan Instagram" : "Klik untuk mengaktifkan Instagram"}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          isInstagramActive ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder={isInstagramActive ? "https://www.instagram.com/bpom.palembang/" : "Nonaktif - URL tetap tersimpan"}
                  className={`w-full rounded-xl border px-3.5 py-2 text-xs transition-all ${
                    isInstagramActive
                      ? "border-slate-200 bg-slate-50 text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      : "border-slate-200/60 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-500"
                  }`}
                />
                {!isInstagramActive && (
                  <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 italic">
                    Ikon disembunyikan di landing page.
                  </p>
                )}
              </div>

              {/* 2. Facebook */}
              <div className={`p-3.5 rounded-2xl border transition-all ${isFacebookActive ? "bg-white border-slate-200 dark:bg-slate-800/60 dark:border-slate-700" : "bg-slate-50 border-slate-200/60 dark:bg-slate-900/40 dark:border-slate-800"}`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-lg bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center">
                      <FacebookIcon className="w-3.5 h-3.5" />
                    </span>
                    <span>Facebook</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold ${isFacebookActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                      {isFacebookActive ? "Aktif" : "Nonaktif"}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isFacebookActive}
                      onClick={() => setIsFacebookActive(!isFacebookActive)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isFacebookActive ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                      title={isFacebookActive ? "Klik untuk menonaktifkan Facebook" : "Klik untuk mengaktifkan Facebook"}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          isFacebookActive ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <input
                  type="url"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder={isFacebookActive ? "https://www.facebook.com/bpom.palembang/" : "Nonaktif - URL tetap tersimpan"}
                  className={`w-full rounded-xl border px-3.5 py-2 text-xs transition-all ${
                    isFacebookActive
                      ? "border-slate-200 bg-slate-50 text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      : "border-slate-200/60 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-500"
                  }`}
                />
                {!isFacebookActive && (
                  <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 italic">
                    Ikon disembunyikan di landing page.
                  </p>
                )}
              </div>

              {/* 3. TikTok */}
              <div className={`p-3.5 rounded-2xl border transition-all ${isTiktokActive ? "bg-white border-slate-200 dark:bg-slate-800/60 dark:border-slate-700" : "bg-slate-50 border-slate-200/60 dark:bg-slate-900/40 dark:border-slate-800"}`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-lg bg-black/10 dark:bg-white/10 text-black dark:text-white flex items-center justify-center">
                      <TikTokIcon className="w-3.5 h-3.5" />
                    </span>
                    <span>TikTok</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold ${isTiktokActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                      {isTiktokActive ? "Aktif" : "Nonaktif"}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isTiktokActive}
                      onClick={() => setIsTiktokActive(!isTiktokActive)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isTiktokActive ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                      title={isTiktokActive ? "Klik untuk menonaktifkan TikTok" : "Klik untuk mengaktifkan TikTok"}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          isTiktokActive ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <input
                  type="url"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  placeholder={isTiktokActive ? "https://www.tiktok.com/@bpom.palembang" : "Nonaktif - URL tetap tersimpan"}
                  className={`w-full rounded-xl border px-3.5 py-2 text-xs transition-all ${
                    isTiktokActive
                      ? "border-slate-200 bg-slate-50 text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      : "border-slate-200/60 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-500"
                  }`}
                />
                {!isTiktokActive && (
                  <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 italic">
                    Ikon disembunyikan di landing page.
                  </p>
                )}
              </div>

              {/* 4. Threads */}
              <div className={`p-3.5 rounded-2xl border transition-all ${isThreadsActive ? "bg-white border-slate-200 dark:bg-slate-800/60 dark:border-slate-700" : "bg-slate-50 border-slate-200/60 dark:bg-slate-900/40 dark:border-slate-800"}`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-lg bg-slate-800/10 dark:bg-white/10 text-slate-800 dark:text-white flex items-center justify-center">
                      <ThreadsIcon className="w-3.5 h-3.5" />
                    </span>
                    <span>Threads</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold ${isThreadsActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                      {isThreadsActive ? "Aktif" : "Nonaktif"}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isThreadsActive}
                      onClick={() => setIsThreadsActive(!isThreadsActive)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isThreadsActive ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                      title={isThreadsActive ? "Klik untuk menonaktifkan Threads" : "Klik untuk mengaktifkan Threads"}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          isThreadsActive ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <input
                  type="url"
                  value={threadsUrl}
                  onChange={(e) => setThreadsUrl(e.target.value)}
                  placeholder={isThreadsActive ? "https://www.threads.net/@bpom.palembang" : "Nonaktif - URL tetap tersimpan"}
                  className={`w-full rounded-xl border px-3.5 py-2 text-xs transition-all ${
                    isThreadsActive
                      ? "border-slate-200 bg-slate-50 text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      : "border-slate-200/60 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-500"
                  }`}
                />
                {!isThreadsActive && (
                  <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 italic">
                    Ikon disembunyikan di landing page.
                  </p>
                )}
              </div>

              {/* 5. YouTube */}
              <div className={`sm:col-span-2 p-3.5 rounded-2xl border transition-all ${isYoutubeActive ? "bg-white border-slate-200 dark:bg-slate-800/60 dark:border-slate-700" : "bg-slate-50 border-slate-200/60 dark:bg-slate-900/40 dark:border-slate-800"}`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-lg bg-[#FF0000]/10 text-[#FF0000] flex items-center justify-center">
                      <YouTubeIcon className="w-3.5 h-3.5" />
                    </span>
                    <span>YouTube Channel</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold ${isYoutubeActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                      {isYoutubeActive ? "Aktif" : "Nonaktif"}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isYoutubeActive}
                      onClick={() => setIsYoutubeActive(!isYoutubeActive)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isYoutubeActive ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                      title={isYoutubeActive ? "Klik untuk menonaktifkan YouTube" : "Klik untuk mengaktifkan YouTube"}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          isYoutubeActive ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder={isYoutubeActive ? "https://www.youtube.com/@bbpomdipalembang" : "Nonaktif - URL tetap tersimpan"}
                  className={`w-full rounded-xl border px-3.5 py-2 text-xs transition-all ${
                    isYoutubeActive
                      ? "border-slate-200 bg-slate-50 text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      : "border-slate-200/60 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-500"
                  }`}
                />
                {!isYoutubeActive && (
                  <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 italic">
                    Ikon disembunyikan di landing page.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
