"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  ArrowLeft,
  X,
  Sparkles,
  BookOpen,
  HelpCircle,
  FileText,
} from "lucide-react";
import {
  MateriEdukasiCard,
  MateriEdukasiItem,
  KomoditasType,
} from "./MateriEdukasiCard";
import { EducationPdfModal } from "@/components/landing/EducationPdfModal";

const KOMODITAS_LIST: { key: string; label: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "pangan", label: "Pangan" },
  { key: "kosmetik", label: "Kosmetik" },
  { key: "obat", label: "Obat" },
  { key: "obat-tradisional", label: "Obat Tradisional" },
];

// Data awal tampilan kartu materi edukasi per komoditas
const INITIAL_MATERI_ITEMS: MateriEdukasiItem[] = [
  {
    id: "pangan-1",
    judul: "Kenali Bahaya Bahan Berbahaya pada Pangan",
    komoditas: "Pangan",
    deskripsi:
      "Pelajari ciri-ciri pangan yang mengandung bahan berbahaya seperti formalin, boraks, rhodamin B, dan metanil yellow.",
    imageUrl: "/assets-landingpage/layanan/pengujian-cepat-hero.jpg",
    pdfUrl: "/documents/materi-edukasi-bbpom.pdf",
    pdfFilename: "Panduan-Keamanan-Pangan-BBPOM.pdf",
  },
  {
    id: "pangan-2",
    judul: "Tips Memilih Pangan yang Aman dan Bermutu",
    komoditas: "Pangan",
    deskripsi:
      "Ketahui tips mudah memilih pangan segar, sayuran, dan produk olahan yang aman, higienis, dan sehat untuk keluarga.",
    imageUrl: "/assets-landingpage/layanan/1.jpg",
    pdfUrl: "/documents/materi-edukasi-bbpom.pdf",
    pdfFilename: "Panduan-Keamanan-Pangan-BBPOM.pdf",
  },
  {
    id: "pangan-3",
    judul: "Cara Menyimpan Pangan dengan Benar",
    komoditas: "Pangan",
    deskripsi:
      "Simpan pangan dengan cara yang tepat di kulkas maupun wadah tertutup agar mutu nutrisi terjaga dan tidak mudah rusak.",
    imageUrl: "/assets-landingpage/layanan/2.jpg",
    pdfUrl: "/documents/materi-edukasi-bbpom.pdf",
    pdfFilename: "Panduan-Keamanan-Pangan-BBPOM.pdf",
  },
  {
    id: "pangan-4",
    judul: "5 Kunci Keamanan Pangan Menurut BPOM",
    komoditas: "Pangan",
    deskripsi:
      "Kenali 5 kunci penting keamanan pangan untuk menjaga kebersihan diri, pemisahan bahan pangan, dan pengolahan bersuhu aman.",
    imageUrl: "/documents/materi-edukasi-page-1.png",
    pdfUrl: "/documents/materi-edukasi-bbpom.pdf",
    pdfFilename: "Panduan-Keamanan-Pangan-BBPOM.pdf",
  },
  {
    id: "pangan-5",
    judul: "Waspada Pangan Kedaluwarsa & Rusak",
    komoditas: "Pangan",
    deskripsi:
      "Simak panduan penting mengenali kemasan kaleng kembung, penyok, bocor, serta membaca tanggal kedaluwarsa secara teliti.",
    imageUrl: "/assets-landingpage/layanan/3.jpg",
    pdfUrl: "/documents/materi-edukasi-bbpom.pdf",
    pdfFilename: "Panduan-Keamanan-Pangan-BBPOM.pdf",
  },
  {
    id: "pangan-6",
    judul: "Tips Menghindari Pangan Tidak Aman",
    komoditas: "Pangan",
    deskripsi:
      "Langkah-langkah sederhana membiasakan Cek KLIK (Kemasan, Label, Izin Edar, Kedaluwarsa) sebelum membeli makanan.",
    imageUrl: "/assets-landingpage/layanan/4.jpg",
    pdfUrl: "/documents/materi-edukasi-bbpom.pdf",
    pdfFilename: "Panduan-Keamanan-Pangan-BBPOM.pdf",
  },
  {
    id: "kosmetik-1",
    judul: "Waspada Merkuri & Hidrokuinon pada Kosmetik",
    komoditas: "Kosmetik",
    deskripsi:
      "Kenali bahaya efek samping zat pemutih berbahaya yang berisiko merusak kulit, memicu iritasi kronis, hingga kanker kulit.",
    imageUrl: "/assets-landingpage/layanan/pengujian-cepat-hero.jpg",
    pdfUrl: "/documents/materi-edukasi-bbpom.pdf",
    pdfFilename: "Panduan-Keamanan-Pangan-BBPOM.pdf",
  },
  {
    id: "kosmetik-2",
    judul: "Tips Cerdas Memilih Kosmetik Berizin Edar",
    komoditas: "Kosmetik",
    deskripsi:
      "Pastikan kosmetik yang Anda gunakan memiliki nomor notifikasi BPOM resmi dengan kode NA melalui aplikasi BPOM Mobile.",
    imageUrl: "/documents/materi-edukasi-page-2.png",
    pdfUrl: "/documents/materi-edukasi-bbpom.pdf",
    pdfFilename: "Panduan-Keamanan-Pangan-BBPOM.pdf",
  },
  {
    id: "obat-1",
    judul: "Pahami Golongan Obat & Logo Lingkaran Warna",
    komoditas: "Obat",
    deskripsi:
      "Panduan mengenali arti lingkaran hijau (obat bebas), biru (obat bebas terbatas), merah bertanda K (obat keras), dan palang merah.",
    imageUrl: "/assets-landingpage/layanan/3.jpg",
    pdfUrl: "/documents/materi-edukasi-bbpom.pdf",
    pdfFilename: "Panduan-Keamanan-Pangan-BBPOM.pdf",
  },
  {
    id: "obat-2",
    judul: "Tanya 5 O: Gunakan Obat dengan Bijak & Benar",
    komoditas: "Obat",
    deskripsi:
      "Prinsip penting sebelum mengonsumsi obat: Pastikan Obatnya Benar, Dosisnya Benar, Caranya Benar, Waktunya Benar, Waspada Efeknya.",
    imageUrl: "/assets-landingpage/layanan/1.jpg",
    pdfUrl: "/documents/materi-edukasi-bbpom.pdf",
    pdfFilename: "Panduan-Keamanan-Pangan-BBPOM.pdf",
  },
  {
    id: "tradisional-1",
    judul: "Cek BKO pada Jamu & Obat Tradisional",
    komoditas: "Obat Tradisional",
    deskripsi:
      "Waspadai jamu instan atau ramuan herbal yang dicampuri Bahan Kimia Obat (BKO) seperti parasetamol atau sildenafil ilegal.",
    imageUrl: "/assets-landingpage/layanan/2.jpg",
    pdfUrl: "/documents/materi-edukasi-bbpom.pdf",
    pdfFilename: "Panduan-Keamanan-Pangan-BBPOM.pdf",
  },
  {
    id: "tradisional-2",
    judul: "Mengenal Jamu, OHT, dan Fitofarmaka",
    komoditas: "Obat Tradisional",
    deskripsi:
      "Pahami tiga tingkatan logo obat bahan alam asli Indonesia yang telah teruji klinis keamanan dan khasiatnya oleh BPOM.",
    imageUrl: "/assets-landingpage/layanan/4.jpg",
    pdfUrl: "/documents/materi-edukasi-bbpom.pdf",
    pdfFilename: "Panduan-Keamanan-Pangan-BBPOM.pdf",
  },
];

interface MateriEdukasiViewProps {
  initialItems?: MateriEdukasiItem[];
}

export function MateriEdukasiView({ initialItems }: MateriEdukasiViewProps) {
  const allItems = initialItems && initialItems.length > 0 ? initialItems : INITIAL_MATERI_ITEMS;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKomoditas, setSelectedKomoditas] = useState("semua");
  const [selectedPdfItem, setSelectedPdfItem] = useState<MateriEdukasiItem | null>(null);

  // Filter materi berdasarkan input pencarian dan komoditas
  const filteredMateri = useMemo(() => {
    return allItems.filter((item) => {
      // 1. Filter Komoditas
      if (selectedKomoditas !== "semua") {
        const itemKomoditasSlug = item.komoditas.toLowerCase().replace(/\s+/g, "-");
        if (itemKomoditasSlug !== selectedKomoditas) {
          return false;
        }
      }

      // 2. Filter Pencarian Teks
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = item.judul.toLowerCase().includes(query);
        const matchDesc = item.deskripsi.toLowerCase().includes(query);
        const matchCommodity = item.komoditas.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchCommodity) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, selectedKomoditas]);

  return (
    <div className="w-full">
      {/* ========================================================= */}
      {/* 1. TOMBOL KEMBALI KE MENU EDUKASI (BREADCRUMB)            */}
      {/* ========================================================= */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-10 lg:px-14 pt-4 sm:pt-6 mb-4 sm:mb-6">
        <Link
          href="/#edukasi"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-brand-orange transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Kembali ke Menu Edukasi</span>
        </Link>
      </div>

      {/* ========================================================= */}
      {/* 2. HERO HEADER SECTION JEMBATAN AMPERA                    */}
      {/* ========================================================= */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-10 lg:px-14">
        <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-[#eef5ff] via-[#f7faff] to-[#f0f6ff] dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 lg:p-12 shadow-xs">
          {/* Foto Panorama Jembatan Ampera di Kanan Menyatu Lembut */}
          <div className="absolute right-0 top-0 w-full sm:w-[55%] lg:w-[48%] h-full z-0 select-none opacity-40 sm:opacity-90">
            <Image
              src="/assets-landingpage/ampera-new.png"
              alt="Jembatan Ampera Palembang"
              fill
              sizes="(max-width: 640px) 100vw, 48vw"
              className="object-cover object-[70%_center]"
              priority
            />
            {/* Gradien Fade Halus dari Kiri */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#eef5ff] via-[#eef5ff]/80 to-transparent dark:from-slate-900 dark:via-slate-900/85 dark:to-transparent pointer-events-none" />
          </div>

          {/* Konten Teks Hero di Kiri */}
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-[11px] font-bold uppercase tracking-widest mb-3">
              <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
              PORTAL MATERI EDUKASI BBPOM
            </div>

            <h1 className="font-brand font-extrabold text-2xl sm:text-3xl lg:text-[44px] leading-tight text-navy-900 dark:text-white tracking-tight">
              Materi Edukasi{" "}
              <span className="block text-brand-orange">
                Keamanan Obat &amp; Pangan
              </span>
            </h1>

            <p className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
              Yuk, pelajari lebih lanjut tentang keamanan pangan, kosmetik, obat,
              dan obat tradisional agar kita terhindar dari produk berbahaya!
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. SEARCH BAR & FILTER TABS PER KOMODITAS                 */}
      {/* ========================================================= */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-10 lg:px-14 mt-8 sm:mt-10">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Bar Input */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari materi edukasi..."
              className="w-full pl-11 pr-10 py-3 sm:py-3.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-xs sm:text-sm text-navy-900 dark:text-white placeholder:text-slate-400 shadow-xs focus:outline-hidden focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills Komoditas */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {KOMODITAS_LIST.map((kom) => {
              const isActive = selectedKomoditas === kom.key;
              return (
                <button
                  key={kom.key}
                  type="button"
                  onClick={() => setSelectedKomoditas(kom.key)}
                  className={`shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-[13px] font-bold transition-all cursor-pointer shadow-2xs ${
                    isActive
                      ? "bg-navy-900 dark:bg-blue-600 text-white shadow-md scale-102"
                      : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-brand-orange/50 hover:text-brand-orange"
                  }`}
                >
                  {kom.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Ringkasan Hasil Pencarian / Filter */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Menampilkan <strong>{filteredMateri.length}</strong> materi edukasi
            {selectedKomoditas !== "semua" && (
              <>
                {" "}
                pada komoditas{" "}
                <strong className="text-brand-orange capitalize">
                  {KOMODITAS_LIST.find((k) => k.key === selectedKomoditas)?.label}
                </strong>
              </>
            )}
            {searchQuery && (
              <>
                {" "}
                dengan kata kunci &ldquo;<strong>{searchQuery}</strong>&rdquo;
              </>
            )}
          </span>

          {(selectedKomoditas !== "semua" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedKomoditas("semua");
                setSearchQuery("");
              }}
              className="text-xs font-bold text-brand-orange hover:underline cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. GRID KARTU MATERI EDUKASI                              */}
      {/* ========================================================= */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-10 lg:px-14 mt-6 sm:mt-8 pb-16 sm:pb-24">
        {filteredMateri.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredMateri.map((item) => (
              <MateriEdukasiCard
                key={item.id}
                item={item}
                onSelect={(selected) => setSelectedPdfItem(selected)}
              />
            ))}
          </div>
        ) : (
          /* Empty State jika hasil pencarian / filter kosong */
          <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-slate-50/60 dark:bg-slate-900/40 max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
              <HelpCircle className="w-7 h-7" />
            </div>
            <h3 className="font-brand font-bold text-base text-navy-900 dark:text-white">
              Materi Tidak Ditemukan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Tidak ada materi edukasi yang cocok dengan pencarian atau filter
              komoditas yang dipilih.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedKomoditas("semua");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 rounded-full bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Tampilkan Semua Materi
            </button>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 5. MODAL PREVIEW & UNDUH MATERI PDF                       */}
      {/* ========================================================= */}
      <EducationPdfModal
        isOpen={Boolean(selectedPdfItem)}
        onClose={() => setSelectedPdfItem(null)}
        title={selectedPdfItem?.judul}
        badge={`Materi Edukasi • ${selectedPdfItem?.komoditas}`}
        pdfUrl={selectedPdfItem?.pdfUrl || "/documents/materi-edukasi-bbpom.pdf"}
        filename={selectedPdfItem?.pdfFilename || "Materi-Edukasi-BBPOM.pdf"}
      />
    </div>
  );
}

