"use client";

import React, { useState, useMemo, useEffect, useTransition } from "react";
import Image from "next/image";
import {
  Users,
  ClipboardList,
  Clock,
  CheckCircle2,
  Search,
  Download,
  Eye,
  MessageSquare,
  ChevronDown,
  UserCheck,
  Inbox,
  FileText,
  FileCheck,
  Check,
  XCircle,
  ExternalLink,
  FileQuestion,
  FlaskConical,
  AlertTriangle,
  FileLock,
  Phone,
  Mail,
  MapPin,
  Building2,
  FileSpreadsheet,
} from "lucide-react";
import {
  PengajuanItem,
  PenggunaItem,
  DataAmperaStats,
  StatusPengajuan,
  updatePengajuanStatusAction,
} from "@/app/actions/data-ampera";
import {
  exportToExcelProfessional,
  exportToPdfOfficial,
} from "@/lib/export-service";
import { PengajuanDetailModal } from "../data-ampera/PengajuanDetailModal";
import { PenggunaDetailModal } from "../data-ampera/PenggunaDetailModal";
import { AdminPagination } from "@/components/admin/AdminPagination";

interface ServiceReportClientProps {
  serviceCode: "INFO" | "UJI_CEPAT" | "ADUAN" | "KIP";
  title: string;
  subtitle: string;
  serviceName: string;
  initialPengajuan: PengajuanItem[];
  initialPengguna: PenggunaItem[];
  initialStats: DataAmperaStats;
}

export function ServiceReportClient({
  serviceCode,
  title,
  subtitle,
  serviceName,
  initialPengajuan,
  initialPengguna,
  initialStats,
}: ServiceReportClientProps) {
  const IconComponent =
    serviceCode === "INFO"
      ? FileQuestion
      : serviceCode === "UJI_CEPAT"
      ? FlaskConical
      : serviceCode === "ADUAN"
      ? AlertTriangle
      : FileLock;

  const [activeTab, setActiveTab] = useState<"PENGAJUAN" | "PENGGUNA">("PENGAJUAN");
  const [pengajuanList, setPengajuanList] = useState<PengajuanItem[]>(initialPengajuan);
  const [penggunaList, setPenggunaList] = useState<PenggunaItem[]>(initialPengguna);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Inline Status Change State
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  // Selected for Modals
  const [selectedPengajuan, setSelectedPengajuan] = useState<PengajuanItem | null>(null);
  const [isPengajuanModalOpen, setIsPengajuanModalOpen] = useState(false);

  const [selectedPengguna, setSelectedPengguna] = useState<PenggunaItem | null>(null);
  const [isPenggunaModalOpen, setIsPenggunaModalOpen] = useState(false);

  // Lightbox Preview Gambar
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Feedback Toast Banner
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Export Loading States
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Recalculate dynamic stats from current list
  const stats = useMemo(() => {
    const totalPengajuan = pengajuanList.length;
    let menungguVerifikasi = 0;
    let sedangDiproses = 0;
    let selesai = 0;
    let ditolak = 0;

    for (const p of pengajuanList) {
      if (p.status === "MENUNGGU_VERIFIKASI") menungguVerifikasi++;
      else if (p.status === "DIPROSES") sedangDiproses++;
      else if (p.status === "SELESAI") selesai++;
      else if (p.status === "DITOLAK") ditolak++;
    }

    return {
      totalPengajuan,
      menungguVerifikasi,
      sedangDiproses,
      selesai,
      ditolak,
      totalPengguna: penggunaList.length,
    };
  }, [pengajuanList, penggunaList]);

  // Filtered Pengajuan List
  const filteredPengajuan = useMemo(() => {
    return pengajuanList.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        item.kodePengajuan.toLowerCase().includes(q) ||
        item.tamu.nama.toLowerCase().includes(q) ||
        item.tamu.nik.toLowerCase().includes(q) ||
        (item.tamu.telepon && item.tamu.telepon.includes(q)) ||
        (item.tamu.email && item.tamu.email.toLowerCase().includes(q)) ||
        (item.produkDicurigai && item.produkDicurigai.toLowerCase().includes(q)) ||
        (item.informasiDibutuhkan && item.informasiDibutuhkan.toLowerCase().includes(q)) ||
        (item.kategoriInformasi && item.kategoriInformasi.toLowerCase().includes(q)) ||
        (item.isiPengaduan && item.isiPengaduan.toLowerCase().includes(q)) ||
        (item.rincianInformasiKip && item.rincianInformasiKip.toLowerCase().includes(q));

      const matchStatus =
        statusFilter === "ALL" ? true : item.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [pengajuanList, searchQuery, statusFilter]);

  // Filtered Pengguna List
  const filteredPengguna = useMemo(() => {
    return penggunaList.filter((item) => {
      const q = searchQuery.toLowerCase();
      return (
        item.nama.toLowerCase().includes(q) ||
        item.nik.toLowerCase().includes(q) ||
        (item.telepon && item.telepon.includes(q)) ||
        (item.email && item.email.toLowerCase().includes(q)) ||
        (item.alamat && item.alamat.toLowerCase().includes(q)) ||
        (item.asalInstansi && item.asalInstansi.toLowerCase().includes(q))
      );
    });
  }, [penggunaList, searchQuery]);

  // Pagination State (Maksimum 10 item per halaman)
  const ITEMS_PER_PAGE = 10;
  const [pagePengajuan, setPagePengajuan] = useState(1);
  const [pagePengguna, setPagePengguna] = useState(1);

  // Reset halaman saat filter berubah
  useEffect(() => {
    setPagePengajuan(1);
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    setPagePengguna(1);
  }, [searchQuery]);

  const totalPengajuanPages = Math.ceil(filteredPengajuan.length / ITEMS_PER_PAGE) || 1;
  const paginatedPengajuan = useMemo(() => {
    const start = (pagePengajuan - 1) * ITEMS_PER_PAGE;
    return filteredPengajuan.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPengajuan, pagePengajuan]);

  const totalPenggunaPages = Math.ceil(filteredPengguna.length / ITEMS_PER_PAGE) || 1;
  const paginatedPengguna = useMemo(() => {
    const start = (pagePengguna - 1) * ITEMS_PER_PAGE;
    return filteredPengguna.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPengguna, pagePengguna]);

  // Quick Direct Status Change from Table Column
  const handleDirectStatusChange = (
    pengajuanId: number,
    newStatus: StatusPengajuan,
    kodePengajuan: string
  ) => {
    setUpdatingStatusId(pengajuanId);
    startTransition(async () => {
      const res = await updatePengajuanStatusAction(pengajuanId, newStatus);
      setUpdatingStatusId(null);
      if (res.success) {
        setPengajuanList((prev) =>
          prev.map((item) =>
            item.id === pengajuanId ? { ...item, status: newStatus } : item
          )
        );
        setFeedback({
          type: "success",
          message: `Status pengajuan #${kodePengajuan} berhasil diubah menjadi ${newStatus.replace(
            "_",
            " "
          )}.`,
        });
      } else {
        setFeedback({
          type: "error",
          message: res.message || "Gagal memperbarui status pengajuan.",
        });
      }
    });
  };

  // Handlers
  const handleOpenDetail = (item: PengajuanItem) => {
    setSelectedPengajuan(item);
    setIsPengajuanModalOpen(true);
  };

  const handleOpenPengguna = (item: PenggunaItem) => {
    setSelectedPengguna(item);
    setIsPenggunaModalOpen(true);
  };

  const handleStatusUpdated = (updated: PengajuanItem) => {
    setPengajuanList((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
  };

  const handleDeleted = (deletedId: number) => {
    setPengajuanList((prev) => prev.filter((item) => item.id !== deletedId));
  };

  const handleSelectPengajuanFromUser = (kodePengajuan: string) => {
    const found = pengajuanList.find((p) => p.kodePengajuan === kodePengajuan);
    if (found) {
      handleOpenDetail(found);
    }
  };

  // Export to Excel (.xlsx)
  const handleExportExcel = async () => {
    try {
      setIsExportingExcel(true);
      await exportToExcelProfessional({
        activeTab,
        pengajuanList: filteredPengajuan,
        penggunaList: filteredPengguna,
        stats,
        serviceTitle: `Laporan Layanan: ${serviceName}`,
      });
      setFeedback({
        type: "success",
        message: `Berkas Excel (.xlsx) laporan ${serviceName} berhasil diunduh.`,
      });
    } catch (err: any) {
      console.error("Gagal export excel:", err);
      setFeedback({
        type: "error",
        message: "Gagal mengekspor berkas Excel.",
      });
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Export to PDF Resmi
  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      await exportToPdfOfficial({
        activeTab,
        pengajuanList: filteredPengajuan,
        penggunaList: filteredPengguna,
        stats,
        serviceTitle: `Laporan Layanan: ${serviceName}`,
      });
      setFeedback({
        type: "success",
        message: `Dokumen PDF resmi laporan ${serviceName} ber-kop BBPOM berhasil diunduh.`,
      });
    } catch (err: any) {
      console.error("Gagal export pdf:", err);
      setFeedback({
        type: "error",
        message: "Gagal mengekspor dokumen PDF.",
      });
    } finally {
      setIsExportingPdf(false);
    }
  };

  const getStatusBadgeStyle = (status: StatusPengajuan) => {
    switch (status) {
      case "MENUNGGU_VERIFIKASI":
        return {
          label: "Menunggu",
          badge:
            "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
        };
      case "DIPROSES":
        return {
          label: "Diproses",
          badge:
            "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800",
        };
      case "SELESAI":
        return {
          label: "Selesai",
          badge:
            "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
        };
      case "DITOLAK":
        return {
          label: "Ditolak",
          badge:
            "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
        };
    }
  };

  const getStatusSelectStyle = (status: StatusPengajuan) => {
    switch (status) {
      case "MENUNGGU_VERIFIKASI":
        return "border-amber-300 bg-amber-50/70 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800";
      case "DIPROSES":
        return "border-sky-300 bg-sky-50/70 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800";
      case "SELESAI":
        return "border-emerald-300 bg-emerald-50/70 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800";
      case "DITOLAK":
        return "border-rose-300 bg-rose-50/70 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card (Matching Data Layanan Layout & Styling) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-500/15 text-brand-orange shadow-2xs">
              <IconComponent className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-navy-900 dark:text-white font-brand">
                {title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Unduh Excel & PDF (Icon Only) */}
        <div className="shrink-0 flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            aria-label="Unduh Excel (.xlsx)"
            title="Unduh format spreadsheet Microsoft Excel (.xlsx)"
            className="inline-flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {isExportingExcel ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <FileSpreadsheet className="h-5 w-5 stroke-[2.2]" />
            )}
          </button>

          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            aria-label="Unduh Dokumen PDF"
            title="Unduh dokumen laporan resmi format PDF (A4 Landscape)"
            className="inline-flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] text-white shadow-cta hover:brightness-110 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {isExportingPdf ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Download className="h-5 w-5 stroke-[2.5]" />
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

      {/* Overview Stat Cards (Exact match with Data Layanan design) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Pengguna Layanan Ini (Blue Squircle) */}
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1d68f6] text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
            <Users className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
              Pemohon Terdaftar
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-brand mt-0.5 leading-tight">
              {stats.totalPengguna}
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-[11px]">
              <span className="font-bold text-[#1d68f6] dark:text-blue-400">{serviceName}</span>
              <span className="text-slate-400 dark:text-slate-500 font-medium">Pemohon</span>
            </div>
          </div>
        </div>

        {/* Card 2: Menunggu Verifikasi (Orange Squircle) */}
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#ff9500] text-white flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/30">
            <Clock className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
              Menunggu Verifikasi
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-brand mt-0.5 leading-tight">
              {stats.menungguVerifikasi}
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-[11px]">
              <span className="font-bold text-[#ff9500] dark:text-amber-400">Perlu Tindakan</span>
              <span className="text-slate-400 dark:text-slate-500 font-medium">Prioritas</span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Pengajuan Masuk (Blue Squircle) */}
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#2563eb] text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
            <ClipboardList className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
              Total Pengajuan
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-brand mt-0.5 leading-tight">
              {stats.totalPengajuan}
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-[11px]">
              <span className="font-bold text-[#2563eb] dark:text-blue-400">Total Tiket</span>
              <span className="text-slate-400 dark:text-slate-500 font-medium">Live Data</span>
            </div>
          </div>
        </div>

        {/* Card 4: Selesai Dilayani (Emerald Squircle) */}
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#00c076] text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
              Selesai Dilayani
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-brand mt-0.5 leading-tight">
              {stats.selesai}
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-[11px]">
              <span className="font-bold text-[#00c076] dark:text-emerald-400">Tuntas</span>
              <span className="text-slate-400 dark:text-slate-500 font-medium">Terverifikasi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
        {/* Navigation Tabs (Orange Gradient for Active) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab("PENGAJUAN")}
              className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "PENGAJUAN"
                  ? "bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] text-white shadow-cta hover:brightness-110"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              <ClipboardList className="h-4 w-4" />
              <span>Daftar Pengajuan ({stats.totalPengajuan})</span>
            </button>

            <button
              onClick={() => setActiveTab("PENGGUNA")}
              className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "PENGGUNA"
                  ? "bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] text-white shadow-cta hover:brightness-110"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Data Pemohon / Tamu ({stats.totalPengguna})</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col gap-3.5 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Nama pemohon, NIK, No. HP, Kode Tiket..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-xs sm:text-sm text-navy-900 placeholder-slate-400 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                &times;
              </button>
            )}
          </div>

          {activeTab === "PENGAJUAN" && (
            <div className="flex items-center gap-2.5">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-navy-900 focus:border-brand-orange focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="ALL">Semua Status</option>
                <option value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi</option>
                <option value="DIPROSES">Sedang Diproses</option>
                <option value="SELESAI">Selesai Dilayani</option>
                <option value="DITOLAK">Ditolak</option>
              </select>
            </div>
          )}
        </div>

        {/* TAB 1: DAFTAR PENGAJUAN (SPECIFIC TO THIS SERVICE) */}
        {activeTab === "PENGAJUAN" && (
          <div className="rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="py-4 px-5 whitespace-nowrap">Kode & Tanggal</th>
                    <th className="py-4 px-5 min-w-[200px]">Data Tamu / Pemohon</th>
                    <th className="py-4 px-5 min-w-[170px]">Kontak Tamu</th>
                    <th className="py-4 px-5 min-w-[190px]">Domisili & Instansi</th>

                    {/* Service-Specific Header Columns */}
                    {serviceCode === "INFO" && (
                      <th className="py-4 px-5 min-w-[240px]">Kategori & Rincian Kebutuhan</th>
                    )}
                    {serviceCode === "UJI_CEPAT" && (
                      <th className="py-4 px-5 min-w-[240px]">Produk Dicurigai & Alasan</th>
                    )}
                    {serviceCode === "ADUAN" && (
                      <th className="py-4 px-5 min-w-[240px]">Uraian Pengaduan & Lampiran</th>
                    )}
                    {serviceCode === "KIP" && (
                      <th className="py-4 px-5 min-w-[240px]">Rincian Informasi & Formulir</th>
                    )}

                    <th className="py-4 px-5 text-center whitespace-nowrap">Status</th>
                    <th className="py-4 px-5 text-right whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredPengajuan.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-16 text-center text-sm text-slate-400 dark:text-slate-500"
                      >
                        <Inbox className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600 mb-2.5" />
                        Belum ada data pengajuan untuk layanan {serviceName}.
                      </td>
                    </tr>
                  ) : (
                    paginatedPengajuan.map((item) => {
                      const st = getStatusBadgeStyle(item.status);

                      // Clean WhatsApp Link
                      const cleanPhone = (item.tamu.telepon || "").replace(/\D/g, "");
                      const waNum = cleanPhone.startsWith("0")
                        ? "62" + cleanPhone.slice(1)
                        : cleanPhone;

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          {/* 1. Kode & Tanggal Masuk */}
                          <td className="py-4 px-5 align-top whitespace-nowrap">
                            <span className="text-xs sm:text-sm font-bold text-[#1d68f6] dark:text-blue-400 block tracking-tight">
                              {item.kodePengajuan}
                            </span>
                            <span className="text-xs text-slate-700 dark:text-slate-300 font-medium block mt-0.5">
                              {new Date(item.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
                              {new Date(item.createdAt).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })} WIB
                            </span>
                          </td>

                          {/* 2. Data Tamu / Pemohon (Tipografi Rapi & Bersih) */}
                          <td className="py-4 px-5 align-top">
                            <div className="text-xs sm:text-sm font-bold text-navy-900 dark:text-white">
                              {item.tamu.nama}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                              NIK: {item.tamu.nik}
                            </div>
                            {item.tamu.umur && (
                              <div className="text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5">
                                Usia: {item.tamu.umur} Tahun
                              </div>
                            )}
                          </td>

                          {/* 3. Kontak Tamu */}
                          <td className="py-4 px-5 align-top">
                            {item.tamu.telepon ? (
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                                <Phone className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                <span>{item.tamu.telepon}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">No HP -</span>
                            )}
                            {item.tamu.email ? (
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1 break-all">
                                <Mail className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                <span>{item.tamu.email}</span>
                              </div>
                            ) : (
                              <div className="text-xs text-slate-400 italic mt-0.5">Email -</div>
                            )}
                          </td>

                          {/* 4. Domisili & Instansi */}
                          <td className="py-4 px-5 align-top max-w-xs">
                            {item.tamu.alamat ? (
                              <div className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                                <span className="line-clamp-2">{item.tamu.alamat}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Alamat -</span>
                            )}
                            {item.tamu.asalInstansi && (
                              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#ff7a1a] dark:text-orange-400 mt-1">
                                <Building2 className="h-3 w-3 shrink-0" />
                                <span className="truncate">{item.tamu.asalInstansi}</span>
                              </div>
                            )}
                          </td>

                          {/* 5. Service-Specific Content */}
                          {serviceCode === "INFO" && (
                            <td className="py-4 px-5 align-top max-w-xs">
                              <span className="inline-block rounded-lg bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 text-xs font-bold">
                                {item.kategoriInformasi || "Informasi Umum"}
                              </span>
                              <p className="line-clamp-2 mt-1.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                {item.informasiDibutuhkan || "-"}
                              </p>
                            </td>
                          )}

                          {serviceCode === "UJI_CEPAT" && (
                            <td className="py-4 px-5 align-top max-w-xs">
                              <div className="font-bold text-sm text-navy-900 dark:text-white">
                                {item.produkDicurigai || item.produkLainnya || "-"}
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                                Alasan: {item.alasanKecurigaan || item.alasanLainnya || "-"}
                              </div>
                              {item.rincianProduk && (
                                <p className="line-clamp-1 text-[11px] text-slate-500 mt-1">
                                  Lokasi/Sampel: {item.rincianProduk}
                                </p>
                              )}
                            </td>
                          )}

                          {serviceCode === "ADUAN" && (
                            <td className="py-4 px-5 align-top max-w-xs">
                              <p className="line-clamp-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                {item.isiPengaduan || "-"}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                {item.buktiFotoUrl && (
                                  <button
                                    onClick={() => setPreviewImage(item.buktiFotoUrl)}
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                                  >
                                    <Eye className="h-3 w-3" /> Foto Bukti
                                  </button>
                                )}
                                {item.ktpUrl && (
                                  <button
                                    onClick={() => setPreviewImage(item.ktpUrl)}
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                                  >
                                    <Eye className="h-3 w-3" /> KTP
                                  </button>
                                )}
                              </div>
                            </td>
                          )}

                          {serviceCode === "KIP" && (
                            <td className="py-4 px-5 align-top max-w-xs">
                              <p className="line-clamp-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                {item.rincianInformasiKip || "-"}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                {item.dokumenPendukungUrl && (
                                  <a
                                    href={item.dokumenPendukungUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-700 hover:bg-sky-100"
                                  >
                                    <Download className="h-3 w-3" /> Dokumen PDF
                                  </a>
                                )}
                                {item.ktpUrl && (
                                  <button
                                    onClick={() => setPreviewImage(item.ktpUrl)}
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                                  >
                                    <Eye className="h-3 w-3" /> KTP
                                  </button>
                                )}
                              </div>
                            </td>
                          )}

                          {/* 6. Status Permohonan */}
                          <td className="py-4 px-5 align-top text-center whitespace-nowrap">
                            <span
                              className={`inline-block rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${st.badge}`}
                            >
                              {st.label}
                            </span>
                            {item.lampiranTindakan && item.lampiranTindakan.length > 0 && (
                              <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">
                                <FileCheck className="h-3.5 w-3.5 shrink-0" />
                                <span>{item.lampiranTindakan.length} Bukti Tindakan</span>
                              </div>
                            )}
                          </td>

                          {/* 7. Aksi Detail */}
                          <td className="py-4 px-5 text-right align-top whitespace-nowrap">
                            <div className="inline-flex items-center gap-2">
                              {waNum && (
                                <a
                                  href={`https://wa.me/${waNum}?text=${encodeURIComponent(
                                    `Halo Bapak/Ibu ${item.tamu.nama}, kami dari Balai Besar POM di Palembang terkait permohonan ${item.kodePengajuan}.`
                                  )}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition shadow-2xs dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                                  title="Chat WhatsApp"
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </a>
                              )}
                              <button
                                onClick={() => handleOpenDetail(item)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 hover:bg-orange-100 text-[#ff7a1a] dark:bg-orange-950/40 dark:text-orange-400 dark:hover:bg-orange-900/50 border border-orange-200/80 dark:border-orange-900/60 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                                title="Lihat Detail Permohonan"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Tab 1 */}
            <AdminPagination
              currentPage={pagePengajuan}
              totalPages={totalPengajuanPages}
              totalItems={filteredPengajuan.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setPagePengajuan}
            />
          </div>
        )}

        {/* TAB 2: DATA PEMOHON KHUSUS LAYANAN INI */}
        {activeTab === "PENGGUNA" && (
          <div className="rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="py-4 px-6 min-w-[260px]">Profil Pemohon</th>
                    <th className="py-4 px-6 min-w-[200px]">Kontak WhatsApp & Email</th>
                    <th className="py-4 px-6 min-w-[220px]">Domisili / Instansi</th>
                    <th className="py-4 px-6 text-center whitespace-nowrap">
                      Pengajuan {serviceName}
                    </th>
                    <th className="py-4 px-6 whitespace-nowrap">Terdaftar Sejak</th>
                    <th className="py-4 px-6 text-right whitespace-nowrap">Aksi Profil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredPengguna.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-16 text-center text-sm text-slate-400 dark:text-slate-500"
                      >
                        <Inbox className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600 mb-2.5" />
                        Belum ada pemohon yang terdaftar untuk layanan {serviceName}.
                      </td>
                    </tr>
                  ) : (
                    paginatedPengguna.map((user) => {
                      // Clean WA
                      const cleanPhone = (user.telepon || "").replace(/\D/g, "");
                      const waNum = cleanPhone.startsWith("0")
                        ? "62" + cleanPhone.slice(1)
                        : cleanPhone;

                      return (
                        <tr
                          key={user.id}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          {/* Profil Pemohon */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3.5">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-500/15 text-brand-orange text-sm font-black shadow-2xs">
                                {user.nama.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-xs sm:text-sm font-bold text-navy-900 dark:text-white">
                                  {user.nama}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                                  NIK: {user.nik}
                                </div>
                                {user.umur && (
                                  <div className="text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5">
                                    Usia: {user.umur} Tahun
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Kontak */}
                          <td className="py-4 px-6">
                            <div className="text-xs sm:text-sm font-semibold text-navy-900 dark:text-slate-200">
                              {user.telepon || "-"}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {user.email || "-"}
                            </div>
                          </td>

                          {/* Domisili / Instansi */}
                          <td className="py-4 px-6 max-w-xs">
                            <div className="line-clamp-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                              {user.asalInstansi || user.alamat || "-"}
                            </div>
                          </td>

                          {/* Total Pengajuan */}
                          <td className="py-4 px-6 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 px-3 py-1.5 text-xs font-bold text-[#1d68f6] dark:text-blue-300">
                              <FileText className="w-3.5 h-3.5" />
                              <span>{user.totalPengajuan} Kali</span>
                            </span>
                          </td>

                          {/* Terdaftar */}
                          <td className="py-4 px-6 text-slate-500 dark:text-slate-400 text-xs sm:text-sm whitespace-nowrap">
                            {new Date(user.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>

                          {/* Aksi Profil (Tombol Orange!) */}
                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-2">
                              {waNum && (
                                <a
                                  href={`https://wa.me/${waNum}?text=${encodeURIComponent(
                                    `Halo Bapak/Ibu ${user.nama}, kami dari Balai Besar POM di Palembang.`
                                  )}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition shadow-2xs dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                                  title="Chat WhatsApp"
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </a>
                              )}
                              <button
                                onClick={() => handleOpenPengguna(user)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#ff7a1a] dark:bg-orange-950/40 dark:text-orange-400 dark:hover:bg-orange-900/50 border border-orange-200/80 dark:border-orange-900/60 px-3.5 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                              >
                                <UserCheck className="h-4 w-4" />
                                <span>Riwayat</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Tab 2 */}
            <AdminPagination
              currentPage={pagePengguna}
              totalPages={totalPenggunaPages}
              totalItems={filteredPengguna.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setPagePengguna}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <PengajuanDetailModal
        pengajuan={selectedPengajuan}
        isOpen={isPengajuanModalOpen}
        onClose={() => setIsPengajuanModalOpen(false)}
        onStatusUpdated={handleStatusUpdated}
        onDeleted={handleDeleted}
        onNotify={(type, message) => setFeedback({ type, message })}
      />

      <PenggunaDetailModal
        pengguna={selectedPengguna}
        isOpen={isPenggunaModalOpen}
        onClose={() => setIsPenggunaModalOpen(false)}
        onSelectPengajuan={handleSelectPengajuanFromUser}
      />

      {/* Lightbox Preview Gambar */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-h-[85vh] max-w-[85vw] overflow-hidden rounded-3xl bg-white shadow-2xl">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black transition cursor-pointer"
            >
              <XCircle className="h-5 w-5" />
            </button>
            <div className="relative h-[72vh] w-[72vw] max-w-4xl">
              <Image
                src={previewImage}
                alt="Preview Lampiran"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
