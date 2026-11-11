"use client";

import React from "react";
import Image from "next/image";
import { User, Camera } from "lucide-react";

interface DeveloperProfile {
  id: string;
  name: string;
  alias?: string;
  fullName: string;
  role: string;
  imageSrc?: string; // Dapat diisi path seperti "/assets-developer/fatreisya.jpg" nanti
  instagramUrl?: string; // Tautan akun Instagram (misal: "https://instagram.com/username")
  linkedinUrl?: string; // Tautan akun LinkedIn (misal: "https://linkedin.com/in/username")
}

const DEVELOPERS: DeveloperProfile[] = [
  {
    id: "fatreisya",
    name: "Tea",
    alias: "Fatreisya Ayu Miranda",
    fullName: "Fatreisya Ayu Miranda",
    role: "Frontend Developer",
    imageSrc: "/assets-developer/fototea.jpg",
    instagramUrl: "https://www.instagram.com/fatreisyaa/", // Kosongkan dulu, siap diisi URL akun Instagram
    linkedinUrl: "https://www.linkedin.com/in/fatreisya/", // Kosongkan dulu, siap diisi URL akun LinkedIn
  },
  {
    id: "rizki",
    name: "Rizki",
    alias: "Riski Abdoli",
    fullName: "Riski Abdoli",
    role: "Backend Developer",
    imageSrc: "", // Kosongkan dulu sesuai instruksi, siap ditambahkan foto nanti
    instagramUrl: "https://www.instagram.com/riskiabdoli/", // Kosongkan dulu, siap diisi URL akun Instagram
    linkedinUrl: "https://www.linkedin.com/in/riski-abdoli/", // Kosongkan dulu, siap diisi URL akun LinkedIn
  },
];

export function DeveloperView() {
  return (
    <div className="w-full relative pt-1 sm:pt-2 pb-10 sm:pb-16">
      {/* Ambient background decorative glow */}
      <div className="absolute top-0 left-0 w-80 sm:w-96 h-80 sm:h-96 bg-amber-200/40 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mt-10" />
      <div className="absolute bottom-10 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-orange-200/40 dark:bg-orange-600/10 rounded-full blur-3xl pointer-events-none -mr-20" />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ========================================================= */}
        {/* HEADER SECTION (Sesuai Referensi Gambar)                  */}
        {/* ========================================================= */}
        <div className="text-center max-w-2xl mx-auto pt-0">
          {/* Label OUR DEVELOPERS dengan Garis Aksen */}
          <div className="flex items-center justify-center gap-2.5 mb-1.5">
            <span className="h-[2px] w-8 sm:w-14 bg-gradient-to-r from-transparent to-amber-500 rounded-full" />
            <span className="text-[11px] sm:text-xs font-black tracking-[0.22em] text-amber-600 dark:text-amber-400 uppercase font-sans">
              OUR DEVELOPERS
            </span>
            <span className="h-[2px] w-8 sm:w-14 bg-gradient-to-l from-transparent to-amber-500 rounded-full" />
          </div>

          {/* Judul Utama: Rizki & Tea */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-navy-950 dark:text-white leading-tight">
            Rizki &amp; <span className="text-amber-500 dark:text-amber-400">Tea</span>
          </h1>

          {/* Subtitle / Deskripsi Singkat */}
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
            Dua developer di balik karya ini, dengan semangat menghadirkan solusi digital yang inovatif dan berdampak.
          </p>
        </div>

        {/* ========================================================= */}
        {/* STAGE ORANYE & KARTU DEVELOPER (Sesuai Referensi Gambar)   */}
        {/* ========================================================= */}
        <div className="relative max-w-[720px] mx-auto mt-4 sm:mt-6">
          {/* Latar Belakang Kotak Oranye Melengkung (Curved Orange Banner) */}
          <div className="absolute inset-x-0 bottom-0 top-10 sm:top-14 rounded-[24px] sm:rounded-[36px] bg-gradient-to-r from-[#f59e0b] via-[#f97316] to-[#f59e0b] shadow-xl shadow-orange-500/20 overflow-hidden">
            {/* Pola Garis Gelombang Oranye Organik Halus */}
            <svg
              className="absolute inset-0 w-full h-full object-cover opacity-35 pointer-events-none"
              viewBox="0 0 900 450"
              preserveAspectRatio="none"
              fill="none"
            >
              <path
                d="M-50 220 C 150 90, 400 380, 950 140 L 950 450 L -50 450 Z"
                fill="white"
                opacity="0.25"
              />
              <path
                d="M-50 300 C 220 160, 500 410, 950 260 L 950 450 L -50 450 Z"
                fill="white"
                opacity="0.35"
              />
              <circle cx="100" cy="80" r="140" fill="white" opacity="0.08" />
              <circle cx="850" cy="380" r="180" fill="white" opacity="0.1" />
            </svg>
          </div>

          {/* Grid Dua Kartu Developer Berwarna Putih Bersih */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 px-3 sm:px-6 pb-5 sm:pb-7 pt-1">
            {DEVELOPERS.map((dev) => (
              <div
                key={dev.id}
                className="group bg-white dark:bg-slate-900 rounded-[22px] sm:rounded-[26px] shadow-xl shadow-slate-900/10 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 p-3 sm:p-4 flex flex-col items-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-orange-500/20"
              >
                {/* Area Foto (Placeholder estetis bernuansa oranye) */}
                <div className="relative w-full h-36 sm:h-44 rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-tr from-amber-400 via-orange-400 to-amber-500 flex items-center justify-center shadow-inner">
                  {/* Dekorasi lingkaran halus pada background foto */}
                  <svg
                    className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
                    viewBox="0 0 300 200"
                    fill="none"
                  >
                    <circle cx="150" cy="100" r="75" stroke="white" strokeWidth="18" />
                    <circle cx="150" cy="100" r="40" stroke="white" strokeWidth="10" opacity="0.5" />
                  </svg>

                  {dev.imageSrc ? (
                    <Image
                      src={dev.imageSrc}
                      alt={dev.name}
                      fill
                      priority
                      sizes="(max-width: 640px) 100vw, 350px"
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    /* Placeholder Foto Kosong (Siap ditambahkan nanti) */
                    <div className="flex flex-col items-center justify-center text-white p-3 text-center z-10">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center mb-1.5 shadow-md shadow-black/10 transition-transform duration-300 group-hover:scale-105">
                        <User className="w-7 h-7 sm:w-8 sm:h-8 text-white stroke-[1.8]" />
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold bg-black/25 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-white/95 border border-white/20">
                        <Camera className="w-3 h-3" />
                        Foto Pengembang
                      </span>
                    </div>
                  )}
                </div>

                {/* Konten Nama, Peran & Rating Bintang */}
                <div className="pt-2.5 sm:pt-3 pb-1 text-center w-full">
                  <h3 className="font-brand font-black text-lg sm:text-xl text-navy-950 dark:text-white tracking-tight">
                    {dev.name}
                  </h3>

                  {/* Keterangan Nama Lengkap Asli */}
                  <p className="text-[11px] sm:text-xs font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                    {dev.fullName}
                  </p>

                  {/* Peran / Role */}
                  <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    {dev.role}
                  </p>

                  {/* Icon Sosial Media (Instagram & LinkedIn) */}
                  <div className="mt-2.5 flex items-center justify-center gap-2.5">
                    {/* Instagram */}
                    <a
                      href={dev.instagramUrl || "#"}
                      target={dev.instagramUrl ? "_blank" : undefined}
                      rel={dev.instagramUrl ? "noopener noreferrer" : undefined}
                      title={dev.instagramUrl ? `Instagram ${dev.name}` : `Instagram ${dev.name} (Tautan belum diisi)`}
                      className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-slate-50 hover:bg-pink-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-xs active:scale-95 cursor-pointer"
                      aria-label={`Instagram ${dev.name}`}
                    >
                      <div className="relative w-4 h-4 sm:w-4.5 sm:h-4.5">
                        <Image
                          src="/assets-developer/instagram.png"
                          alt="Instagram"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </a>

                    {/* LinkedIn */}
                    <a
                      href={dev.linkedinUrl || "#"}
                      target={dev.linkedinUrl ? "_blank" : undefined}
                      rel={dev.linkedinUrl ? "noopener noreferrer" : undefined}
                      title={dev.linkedinUrl ? `LinkedIn ${dev.name}` : `LinkedIn ${dev.name} (Tautan belum diisi)`}
                      className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-slate-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-xs active:scale-95 cursor-pointer"
                      aria-label={`LinkedIn ${dev.name}`}
                    >
                      <div className="relative w-4 h-4 sm:w-4.5 sm:h-4.5">
                        <Image
                          src="/assets-developer/linkedin.png"
                          alt="LinkedIn"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pesan Ajakan Kolaborasi & Diskusi */}
        <div className="mt-8 sm:mt-10 text-center max-w-xl mx-auto px-4">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Apakah Anda punya ide luar biasa atau butuh bantuan untuk mewujudkan proyek digital Anda? Jangan ragu untuk menyapa kami melalui sosial media di atas. Kami selalu terbuka untuk diskusi dan kolaborasi baru!
          </p>
        </div>
      </div>
    </div>
  );
}
