"use client";

import React, { useState } from "react";
import {
  ClipboardList,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Eye,
  X,
  Printer,
  ChevronDown,
  Download,
  Calendar,
  User,
  Phone,
  FileText,
  ShieldAlert,
} from "lucide-react";

interface SubmissionItem {
  id: string;
  kode: string;
  nama: string;
  nik: string;
  telepon: string;
  asalInstansi: string;
  layananKode: "UJI_CEPAT" | "INFO" | "ADUAN" | "KIP";
  layananNama: string;
  rincian: string;
  tanggal: string;
  status: "MENUNGGU_VERIFIKASI" | "DIPROSES" | "SELESAI" | "DITOLAK";
  catatanPetugas?: string;
}

const INITIAL_SUBMISSIONS: SubmissionItem[] = [
  {
    id: "1",
    kode: "AMP-UJI-202610-0042",
    nama: "Siti Rahmawati",
    nik: "1671015509920003",
    telepon: "081271889920",
    asalInstansi: "Masyarakat Umum (Ibu Rumah Tangga)",
    layananKode: "UJI_CEPAT",
    layananNama: "Pengujian Cepat Ampera",
    rincian: "Sampel Pempek & Kuah Cuko dibeli dari Pasar Cinde. Dicurigai tekstur terlalu kenyal dan bau menyengat (uji formalin & boraks).",
    tanggal: "26 Okt 2026, 14:20",
    status: "MENUNGGU_VERIFIKASI",
  },
  {
    id: "2",
    kode: "AMP-INF-202610-0041",
    nama: "Ahmad Fauzan",
    nik: "1671041203880002",
    telepon: "085268001122",
    asalInstansi: "UMKM Pempek Sriwijaya Rasa",
    layananKode: "INFO",
    layananNama: "Permintaan Informasi",
    rincian: "Konsultasi kelengkapan dokumen Cara Produksi Pangan Olahan yang Baik (CPPOB) untuk pendaftaran izin edar BPOM MD.",
    tanggal: "26 Okt 2026, 11:45",
    status: "DIPROSES",
    catatanPetugas: "Petugas telah menjadwalkan bimbingan teknis via zoom pada 28 Okt 2026.",
  },
  {
    id: "3",
    kode: "AMP-ADU-202610-0040",
    nama: "Hendra Wijaya",
    nik: "1671082507850001",
    telepon: "081367890044",
    asalInstansi: "Konsumen",
    layananKode: "ADUAN",
    layananNama: "Pengaduan Konsumen",
    rincian: "Dugaan peredaran kosmetik pemutih tanpa izin edar (tanpa nomor NA) yang dijual bebas di toko kelontong Ilir Barat.",
    tanggal: "26 Okt 2026, 09:10",
    status: "DIPROSES",
    catatanPetugas: "Laporan diteruskan ke Bidang Penindakan BBPOM Palembang.",
  },
  {
    id: "4",
    kode: "AMP-KIP-202610-0039",
    nama: "Dr. Ir. Budi Santoso",
    nik: "1671021406730005",
    telepon: "08117123344",
    asalInstansi: "Fakultas Pertanian Universitas Sriwijaya",
    layananKode: "KIP",
    layananNama: "Keterbukaan Informasi Publik",
    rincian: "Permohonan data publikasi rekapitulasi hasil pengawasan pangan segar dan olahan periode tahun 2025 untuk penelitian akademis.",
    tanggal: "25 Okt 2026, 15:30",
    status: "SELESAI",
    catatanPetugas: "Dokumen PDF rekapitulasi pengawasan telah dikirim via email pemohon.",
  },
  {
    id: "5",
    kode: "AMP-UJI-202610-0038",
    nama: "M. Rizky Pratama",
    nik: "1671091811950007",
    telepon: "082188994433",
    asalInstansi: "Pedagang Kuliner",
    layananKode: "UJI_CEPAT",
    layananNama: "Pengujian Cepat Ampera",
    rincian: "Uji sampel tahu putih dan mie basah dari pasar 16 Ilir sebelum diolah menjadi bahan baku jualan.",
    tanggal: "25 Okt 2026, 13:00",
    status: "SELESAI",
    catatanPetugas: "Hasil uji rapid test kit BBPOM: NEGATIF (Bebas formalin, boraks, metanil yellow, dan rhodamin B). Tahu aman.",
  },
];

export default function AdminLayananPage() {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>(INITIAL_SUBMISSIONS);
  const [selectedLayanan, setSelectedLayanan] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeModalItem, setActiveModalItem] = useState<SubmissionItem | null>(null);
  const [petugasNote, setPetugasNote] = useState<string>("");

  // Filter Submissions
  const filteredSubmissions = submissions.filter((item) => {
    const matchesLayanan =
      selectedLayanan === "ALL" || item.layananKode === selectedLayanan;
    const matchesStatus =
      selectedStatus === "ALL" || item.status === selectedStatus;
    const matchesSearch =
      item.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nik.includes(searchQuery) ||
      item.rincian.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesLayanan && matchesStatus && matchesSearch;
  });

  const handleUpdateStatus = (
    newStatus: "MENUNGGU_VERIFIKASI" | "DIPROSES" | "SELESAI" | "DITOLAK"
  ) => {
    if (!activeModalItem) return;

    setSubmissions((prev) =>
      prev.map((item) =>
        item.id === activeModalItem.id
          ? {
              ...item,
              status: newStatus,
              catatanPetugas: petugasNote || item.catatanPetugas,
            }
          : item
      )
    );

    setActiveModalItem((prev) =>
      prev ? { ...prev, status: newStatus, catatanPetugas: petugasNote } : null
    );
  };

  const getStatusBadge = (status: SubmissionItem["status"]) => {
    switch (status) {
      case "MENUNGGU_VERIFIKASI":
        return {
          label: "Menunggu Verifikasi",
          className:
            "bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300 ring-1 ring-orange-400/30",
          icon: AlertCircle,
        };
      case "DIPROSES":
        return {
          label: "Sedang Diproses",
          className:
            "bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 ring-1 ring-sky-400/30",
          icon: Clock,
        };
      case "SELESAI":
        return {
          label: "Selesai",
          className:
            "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 ring-1 ring-emerald-400/30",
          icon: CheckCircle2,
        };
      case "DITOLAK":
        return {
          label: "Ditolak",
          className:
            "bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300 ring-1 ring-red-400/30",
          icon: XCircle,
        };
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-orange">
            <ClipboardList className="h-3.5 w-3.5" />
            <span>Pelayanan Publik</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white font-brand mt-1">
            Data Pengajuan Layanan Masyarakat
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pantau tiket masuk permohonan pengujian cepat, informasi publik, aduan, dan KIP.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak Rekap</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-bold text-slate-400 uppercase">
            Total Masuk
          </span>
          <div className="text-xl font-extrabold text-navy-900 dark:text-white font-brand">
            {submissions.length}
          </div>
        </div>
        <div className="rounded-2xl border border-orange-200 bg-orange-50/50 p-3.5 dark:border-orange-900/50 dark:bg-orange-950/20">
          <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 uppercase">
            Verifikasi
          </span>
          <div className="text-xl font-extrabold text-orange-700 dark:text-orange-300 font-brand">
            {submissions.filter((s) => s.status === "MENUNGGU_VERIFIKASI").length}
          </div>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-3.5 dark:border-sky-900/50 dark:bg-sky-950/20">
          <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase">
            Diproses
          </span>
          <div className="text-xl font-extrabold text-sky-700 dark:text-sky-300 font-brand">
            {submissions.filter((s) => s.status === "DIPROSES").length}
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3.5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
            Selesai
          </span>
          <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300 font-brand">
            {submissions.filter((s) => s.status === "SELESAI").length}
          </div>
        </div>
      </div>

      {/* Filter Bar & Tabs */}
      <div className="space-y-3">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
          {[
            { id: "ALL", label: "Semua Layanan" },
            { id: "UJI_CEPAT", label: "Pengujian Cepat Ampera" },
            { id: "INFO", label: "Permintaan Informasi" },
            { id: "ADUAN", label: "Pengaduan Konsumen" },
            { id: "KIP", label: "Keterbukaan Informasi (KIP)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedLayanan(tab.id)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                selectedLayanan === tab.id
                  ? "bg-navy-900 text-white shadow-sm dark:bg-sky-600"
                  : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Status Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode tiket, nama, atau NIK..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:border-brand-orange focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-brand-orange focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="ALL">Semua Status</option>
              <option value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi</option>
              <option value="DIPROSES">Sedang Diproses</option>
              <option value="SELESAI">Selesai</option>
              <option value="DITOLAK">Ditolak</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="px-5 py-4">Kode Tiket & Waktu</th>
                <th className="px-5 py-4">Pemohon & NIK</th>
                <th className="px-5 py-4">Jenis Layanan</th>
                <th className="px-5 py-4">Rincian Permohonan</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    Tidak ditemukan data pengajuan yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((row) => {
                  const badge = getStatusBadge(row.status);
                  const BadgeIcon = badge.icon;
                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="font-mono font-bold text-navy-900 dark:text-sky-300">
                          {row.kode}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="h-3 w-3" />
                          <span>{row.tanggal}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-800 dark:text-white">
                          {row.nama}
                        </div>
                        <div className="font-mono text-[11px] text-slate-400">
                          NIK: {row.nik}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {row.asalInstansi}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-block rounded-lg bg-sky-50 px-2.5 py-1 font-bold text-navy-900 dark:bg-sky-950/60 dark:text-sky-300">
                          {row.layananNama}
                        </span>
                      </td>
                      <td className="px-5 py-4 max-w-xs">
                        <p className="line-clamp-2 text-slate-600 dark:text-slate-300 text-[11px]">
                          {row.rincian}
                        </p>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${badge.className}`}
                        >
                          <BadgeIcon className="h-3 w-3" />
                          <span>{badge.label}</span>
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveModalItem(row);
                            setPetugasNote(row.catatanPetugas || "");
                          }}
                          className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 font-bold text-navy-900 hover:bg-navy-900 hover:text-white dark:bg-slate-800 dark:text-sky-300 dark:hover:bg-sky-600 dark:hover:text-white transition-all"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Verifikasi</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail & Verifikasi Pengajuan */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 animate-fade-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <span className="font-mono text-xs font-bold text-brand-orange">
                  {activeModalItem.kode}
                </span>
                <h3 className="text-lg font-bold text-navy-900 dark:text-white font-brand">
                  Detail Pengajuan & Verifikasi Petugas
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profil Pemohon */}
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block font-medium">Nama Pemohon:</span>
                  <span className="font-bold text-navy-900 dark:text-white text-sm">
                    {activeModalItem.nama}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Nomor WhatsApp:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {activeModalItem.telepon}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">NIK KTP (16 Digit):</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {activeModalItem.nik}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Asal Instansi / Domisili:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {activeModalItem.asalInstansi}
                  </span>
                </div>
              </div>
            </div>

            {/* Rincian Masalah / Pengujian */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-navy-900 dark:text-white uppercase tracking-wider">
                Rincian Sampel / Permintaan Layanan:
              </label>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 leading-relaxed">
                {activeModalItem.rincian}
              </div>
            </div>

            {/* Form Catatan / Respon Petugas */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-navy-900 dark:text-white uppercase tracking-wider">
                Catatan Hasil Pemeriksaan / Tindak Lanjut Petugas BBPOM:
              </label>
              <textarea
                rows={3}
                value={petugasNote}
                onChange={(e) => setPetugasNote(e.target.value)}
                placeholder="Tuliskan respon resmi, hasil uji laboratorium, atau arahan jadwal konsultasi..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Action Status Buttons */}
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="block text-xs font-bold text-slate-500 uppercase">
                Ubah Status Pengajuan:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus("DIPROSES")}
                  className="rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-500 transition-colors"
                >
                  Set: Sedang Diproses
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus("SELESAI")}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition-colors"
                >
                  Set: Selesai / Lulus Uji
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus("DITOLAK")}
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-500 transition-colors"
                >
                  Set: Ditolak
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalItem(null)}
                  className="ml-auto rounded-xl px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
