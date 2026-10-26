"use client";

import React, { useState } from "react";
import {
  PhoneCall,
  MapPin,
  Mail,
  Phone,
  Clock,
  Save,
  CheckCircle,
  ExternalLink,
  MessageSquare,
  Globe,
} from "lucide-react";

export default function AdminKontakSettingsPage() {
  const [whatsapp, setWhatsapp] = useState("0811-785-0008");
  const [telepon, setTelepon] = useState("(0711) 510042 / 510126");
  const [email, setEmail] = useState("bpom_palembang@pom.go.id");
  const [alamat, setAlamat] = useState(
    "Jl. Pangeran Ratu No. 1, Jakabaring, 15 Ulu, Kecamatan Seberang Ulu I, Kota Palembang, Sumatera Selatan 30252"
  );
  const [jamLayanan, setJamLayanan] = useState(
    "Senin - Kamis: 08.00 - 16.30 WIB | Jumat: 08.00 - 16.00 WIB"
  );
  const [instagram, setInstagram] = useState(
    "https://www.instagram.com/bpom.palembang/"
  );
  const [youtube, setYoutube] = useState(
    "https://www.youtube.com/@bbpomdipalembang"
  );
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-orange">
            <PhoneCall className="h-3.5 w-3.5" />
            <span>Website Settings</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white font-brand mt-1">
            Pengaturan Kontak & Lokasi Kantor
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Perbarui nomor WhatsApp hotline, alamat, jam kerja pelayanan, dan akun media sosial resmi.
          </p>
        </div>

        <button
          onClick={handleSave}
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] px-5 py-2.5 text-xs font-bold text-white shadow-cta hover:brightness-110 transition-all hover:-translate-y-0.5"
        >
          {isSaved ? (
            <>
              <CheckCircle className="h-4 w-4" />
              <span>Tersimpan!</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Simpan Perubahan</span>
            </>
          )}
        </button>
      </div>

      {/* Form Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Box 1: Layanan Hotline & WhatsApp */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <h2 className="text-sm font-bold text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-500" />
                <span>Hotline & Kontak Langsung</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nomor WhatsApp Pengaduan & Informasi
                  </label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Akan diarahkan ke tautan wa.me di landing page.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Telepon Kantor Resmi (PSTN)
                  </label>
                  <input
                    type="text"
                    value={telepon}
                    onChange={(e) => setTelepon(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Resmi BBPOM Palembang
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Box 2: Alamat & Jam Layanan */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <h2 className="text-sm font-bold text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-orange" />
                <span>Alamat Fisik & Jadwal Operasional</span>
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Alamat Kantor BBPOM di Palembang
                </label>
                <textarea
                  rows={3}
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Jam Pelayanan Publik
                </label>
                <input
                  type="text"
                  value={jamLayanan}
                  onChange={(e) => setJamLayanan(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Box 3: Media Sosial */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <h2 className="text-sm font-bold text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Globe className="h-4 w-4 text-sky-500" />
                <span>Tautan Saluran Media Sosial</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    YouTube URL
                  </label>
                  <input
                    type="url"
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Info Card di Sisi Kanan (4 Kolom) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl border border-sky-100 bg-gradient-to-br from-white via-sky-50/50 to-sky-100/50 p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-950 space-y-4">
            <h3 className="text-sm font-bold text-navy-900 dark:text-white font-brand flex items-center gap-2">
              <Clock className="h-4 w-4 text-brand-orange" />
              <span>Status Tampilan Kontak</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                <span className="font-medium">WhatsApp Link:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {whatsapp}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                <span className="font-medium">Telepon PTSP:</span>
                <span className="font-mono text-slate-800 dark:text-white font-semibold">
                  (0711) 510042
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                <span className="font-medium">Lokasi:</span>
                <span className="text-slate-800 dark:text-white font-semibold">
                  Jakabaring, Palembang
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div className="font-bold text-navy-900 dark:text-white flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-brand-orange" />
                <span>Peta Google Maps Terintegrasi</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Peta lokasi kantor BBPOM Palembang sudah disematkan (embed) interaktif di section Kontak landing page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
