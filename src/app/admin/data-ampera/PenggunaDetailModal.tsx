"use client";

import React, { useState } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  Calendar,
  MessageSquare,
  ClipboardList,
  ArrowUpRight,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { PenggunaItem, StatusPengajuan } from "@/app/actions/data-ampera";

interface PenggunaDetailModalProps {
  pengguna: PenggunaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectPengajuan?: (kodePengajuan: string) => void;
}

export function PenggunaDetailModal({
  pengguna,
  isOpen,
  onClose,
  onSelectPengajuan,
}: PenggunaDetailModalProps) {
  const [copiedNik, setCopiedNik] = useState(false);

  if (!isOpen || !pengguna) return null;

  // Format link WhatsApp resmi
  const rawWa = pengguna.telepon || "";
  let cleanWa = rawWa.replace(/\D/g, "");
  if (cleanWa.startsWith("0")) {
    cleanWa = "62" + cleanWa.slice(1);
  }
  const waUrl = cleanWa
    ? `https://wa.me/${cleanWa}?text=${encodeURIComponent(
        `Halo Bapak/Ibu ${pengguna.nama}, kami dari Balai Besar POM di Palembang terkait pengajuan layanan Anda di portal AMPERA.`
      )}`
    : null;

  // Breakdown statistik status pengajuan untuk pengguna ini
  const stats = {
    total: pengguna.pengajuan.length,
    menunggu: pengguna.pengajuan.filter(
      (p) => p.status === "MENUNGGU_VERIFIKASI"
    ).length,
    diproses: pengguna.pengajuan.filter((p) => p.status === "DIPROSES").length,
    selesai: pengguna.pengajuan.filter((p) => p.status === "SELESAI").length,
    ditolak: pengguna.pengajuan.filter((p) => p.status === "DITOLAK").length,
  };

  const handleCopyNik = () => {
    if (pengguna.nik) {
      navigator.clipboard.writeText(pengguna.nik);
      setCopiedNik(true);
      setTimeout(() => setCopiedNik(false), 2000);
    }
  };

  const getStatusBadge = (status: StatusPengajuan) => {
    switch (status) {
      case "MENUNGGU_VERIFIKASI":
        return {
          label: "Menunggu Verifikasi",
          cls: "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
          dot: "bg-amber-500",
        };
      case "DIPROSES":
        return {
          label: "Sedang Diproses",
          cls: "bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60",
          dot: "bg-sky-500",
        };
      case "SELESAI":
        return {
          label: "Selesai",
          cls: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
          dot: "bg-emerald-500",
        };
      case "DITOLAK":
        return {
          label: "Ditolak",
          cls: "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60",
          dot: "bg-rose-500",
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#06132f]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 flex flex-col max-h-[92vh] w-full max-w-3xl rounded-3xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Header Profil Pemohon */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 sm:px-7 py-5 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#ff8a1f] to-[#f26a0f] text-white text-xl font-extrabold shadow-md">
              {pengguna.nama.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-extrabold text-navy-900 dark:text-white font-brand">
                  {pengguna.nama}
                </h2>
                {stats.total >= 3 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    Pemohon Rutin
                  </span>
                ) : stats.total >= 2 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] font-bold text-blue-700 dark:text-blue-300">
                    <TrendingUp className="w-3 h-3 text-blue-500" />
                    Pemohon Aktif
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    Pemohon Terdaftar
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                <span className="font-mono font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60">
                  NIK: {pengguna.nik}
                </span>
                <span>•</span>
                <span>
                  Terdaftar sejak{" "}
                  {new Date(pengguna.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition cursor-pointer shrink-0"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-6">
          {/* Ringkasan Rekam Jejak Pemohon (Card Mini) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-blue-100 dark:border-blue-950/60 bg-blue-50/50 dark:bg-blue-950/20 p-3.5 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                Total Layanan
              </span>
              <span className="text-2xl font-black text-navy-900 dark:text-white font-brand mt-0.5 block">
                {stats.total}
              </span>
            </div>

            <div className="rounded-2xl border border-amber-100 dark:border-amber-950/60 bg-amber-50/50 dark:bg-amber-950/20 p-3.5 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                Menunggu
              </span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-brand mt-0.5 block">
                {stats.menunggu}
              </span>
            </div>

            <div className="rounded-2xl border border-sky-100 dark:border-sky-950/60 bg-sky-50/50 dark:bg-sky-950/20 p-3.5 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 block">
                Diproses
              </span>
              <span className="text-2xl font-black text-sky-600 dark:text-sky-400 font-brand mt-0.5 block">
                {stats.diproses}
              </span>
            </div>

            <div className="rounded-2xl border border-emerald-100 dark:border-emerald-950/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                Selesai
              </span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-brand mt-0.5 block">
                {stats.selesai}
              </span>
            </div>
          </div>

          {/* Kartu Profil & Kontak Lengkap Pemohon */}
          <div className="rounded-3xl border border-slate-200/80 bg-slate-50/70 p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <User className="w-4 h-4 text-brand-orange" />
                <span>Identitas & Informasi Kontak Pemohon</span>
              </h3>

              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white transition shadow-xs"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Chat WhatsApp</span>
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {/* NIK */}
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-medium">
                  Nomor Induk Kependudukan (NIK):
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="font-mono font-bold text-navy-900 dark:text-white text-base">
                    {pengguna.nik}
                  </p>
                  <button
                    type="button"
                    onClick={handleCopyNik}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition cursor-pointer"
                    title="Salin NIK"
                  >
                    {copiedNik ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* No WhatsApp */}
              <div>
                <span className="text-xs text-slate-400 font-medium">
                  Nomor WhatsApp:
                </span>
                <p className="font-bold text-navy-900 dark:text-white text-base mt-0.5">
                  {pengguna.telepon || "-"}
                </p>
              </div>

              {/* Email */}
              <div>
                <span className="text-xs text-slate-400 font-medium">
                  Alamat Email:
                </span>
                <p className="font-semibold text-navy-900 dark:text-white text-sm mt-0.5 break-all">
                  {pengguna.email || "-"}
                </p>
              </div>

              {/* Usia */}
              <div>
                <span className="text-xs text-slate-400 font-medium">
                  Usia:
                </span>
                <p className="font-semibold text-navy-900 dark:text-white text-sm mt-0.5">
                  {pengguna.umur ? `${pengguna.umur} Tahun` : "-"}
                </p>
              </div>

              {/* Instansi / Pekerjaan */}
              <div>
                <span className="text-xs text-slate-400 font-medium">
                  Asal Instansi / Pekerjaan:
                </span>
                <p className="font-medium text-navy-900 dark:text-white text-sm mt-0.5">
                  {pengguna.asalInstansi || "-"}
                </p>
              </div>

              {/* Terdaftar */}
              <div>
                <span className="text-xs text-slate-400 font-medium">
                  Terdaftar Pertama Kali:
                </span>
                <p className="font-medium text-navy-900 dark:text-white text-sm mt-0.5">
                  {new Date(pengguna.createdAt).toLocaleDateString("id-ID", {
                    dateStyle: "medium",
                  })}
                </p>
              </div>

              {/* Alamat Lengkap */}
              <div className="sm:col-span-2">
                <span className="text-xs text-slate-400 font-medium">
                  Alamat Lengkap Pemohon:
                </span>
                <p className="font-medium text-navy-900 dark:text-white text-sm sm:text-[15px] mt-0.5 leading-relaxed bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  {pengguna.alamat || "Alamat belum dilengkapi oleh pemohon."}
                </p>
              </div>
            </div>
          </div>

          {/* Rekam Jejak Seluruh Pengajuan Layanan */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <ClipboardList className="h-4 w-4 text-[#ff7a1a]" />
                <span>
                  Rekam Jejak Layanan yang Pernah Diajukan ({pengguna.pengajuan.length})
                </span>
              </h3>
              <span className="text-[11px] text-slate-400">
                Urut berdasarkan pengajuan terbaru
              </span>
            </div>

            {pengguna.pengajuan.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-sm text-slate-400">
                Belum ada berkas permohonan layanan yang tercatat untuk data tamu ini.
              </div>
            ) : (
              <div className="space-y-3">
                {pengguna.pengajuan.map((item, index) => {
                  const badge = getStatusBadge(item.status);
                  return (
                    <div
                      key={item.id || index}
                      className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/90 hover:border-brand-orange/60 dark:hover:border-brand-orange/60 transition-all shadow-2xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        {/* Kode & Status */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono text-sm font-bold text-[#1d68f6] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-lg border border-blue-200/60 dark:border-blue-900/60">
                            {item.kodePengajuan}
                          </span>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-bold ${badge.cls}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}
                            />
                            <span>{badge.label}</span>
                          </span>
                        </div>

                        {/* Tanggal & Jam */}
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {new Date(item.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            WIB
                          </span>
                        </div>
                      </div>

                      {/* Judul Layanan */}
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-navy-900 dark:text-white font-brand">
                          {item.layananNama}
                        </h4>

                        {/* Ringkasan Subjek / Kebutuhan yang Diajukan */}
                        {item.ringkasan && (
                          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="font-semibold text-slate-700 dark:text-slate-200">
                              Topik / Rincian:{" "}
                            </span>
                            {item.ringkasan}
                          </p>
                        )}

                        {/* Catatan Petugas Terakhir Jika Ada */}
                        {item.catatanPetugas && (
                          <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60 flex items-start gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>
                              <strong>Catatan Petugas:</strong>{" "}
                              {item.catatanPetugas}
                            </span>
                          </p>
                        )}
                      </div>

                      {/* Tombol Aksi Buka Tiket */}
                      {onSelectPengajuan && (
                        <div className="pt-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onSelectPengajuan(item.kodePengajuan);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#ff7a1a] dark:bg-orange-950/40 dark:text-orange-400 dark:hover:bg-orange-900/50 border border-orange-200/80 dark:border-orange-900/60 px-4 py-2 text-xs sm:text-sm font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                          >
                            <span>Buka & Tindak Lanjuti Berkas</span>
                            <ArrowUpRight className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Modal */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 sm:px-7 py-4 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900">
          <p className="text-xs text-slate-400 hidden sm:block">
            Portal Pelayanan Terpadu AMPERA — BBPOM di Palembang
          </p>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-2.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition cursor-pointer shadow-2xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
