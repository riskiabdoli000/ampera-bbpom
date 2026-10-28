"use client";

import React from "react";
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
  if (!isOpen || !pengguna) return null;

  // Clean WhatsApp Link
  const rawWa = pengguna.telepon || "";
  let cleanWa = rawWa.replace(/\D/g, "");
  if (cleanWa.startsWith("0")) {
    cleanWa = "62" + cleanWa.slice(1);
  }
  const waUrl = cleanWa
    ? `https://wa.me/${cleanWa}?text=${encodeURIComponent(
        `Halo Bapak/Ibu ${pengguna.nama}, kami dari Balai Besar POM di Palembang.`
      )}`
    : null;

  const getStatusBadge = (status: StatusPengajuan) => {
    switch (status) {
      case "MENUNGGU_VERIFIKASI":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
      case "DIPROSES":
        return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800";
      case "SELESAI":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
      case "DITOLAK":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#06132f]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 flex flex-col max-h-[90vh] w-full max-w-2xl rounded-3xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 sm:px-7 py-5 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-500/15 text-brand-orange text-lg font-black shadow-2xs">
              {pengguna.nama.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-navy-900 dark:text-white font-brand">
                {pengguna.nama}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="font-mono font-semibold">NIK: {pengguna.nik}</span>
                <span>•</span>
                <span className="font-semibold text-brand-orange">{pengguna.totalPengajuan} Layanan Diajukan</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-6">
          {/* Identitas Pengguna */}
          <div className="rounded-3xl border border-slate-200/80 bg-slate-50/70 p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Informasi Lengkap Pemohon
              </h3>
              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white transition shadow-xs"
                >
                  <MessageSquare className="h-4 w-4" /> Hubungi via WhatsApp
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Nomor Induk Kependudukan (NIK):</span>
                <p className="font-mono font-bold text-navy-900 dark:text-white text-base mt-0.5">
                  {pengguna.nik}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Nomor WhatsApp:</span>
                <p className="font-bold text-navy-900 dark:text-white text-base mt-0.5">
                  {pengguna.telepon || "-"}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Alamat Email:</span>
                <p className="font-semibold text-navy-900 dark:text-white text-sm mt-0.5">
                  {pengguna.email || "-"}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Usia:</span>
                <p className="font-semibold text-navy-900 dark:text-white text-sm mt-0.5">
                  {pengguna.umur ? `${pengguna.umur} Tahun` : "-"}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Asal Instansi / Pekerjaan:</span>
                <p className="font-medium text-navy-900 dark:text-white text-sm mt-0.5">
                  {pengguna.asalInstansi || "-"}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Terdaftar Sejak:</span>
                <p className="font-medium text-navy-900 dark:text-white text-sm mt-0.5">
                  {new Date(pengguna.createdAt).toLocaleDateString("id-ID", {
                    dateStyle: "medium",
                  })}
                </p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs text-slate-400 block font-medium">Alamat Lengkap:</span>
                <p className="font-medium text-navy-900 dark:text-white text-sm sm:text-[15px] mt-0.5 leading-relaxed">
                  {pengguna.alamat || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Riwayat Pengajuan Layanan Pengguna Ini */}
          <div>
            <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3.5">
              <ClipboardList className="h-4 w-4 text-[#ff7a1a]" /> Riwayat Pengajuan Layanan ({pengguna.pengajuan.length})
            </h3>

            {pengguna.pengajuan.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400 dark:border-slate-800">
                Pengguna ini belum pernah menyelesaikan formulir pengajuan layanan.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 rounded-3xl border border-slate-200/80 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-2xs">
                {pengguna.pengajuan.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 sm:p-5 transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-sm font-bold text-[#1d68f6] dark:text-blue-400">
                          {item.kodePengajuan}
                        </span>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${getStatusBadge(
                            item.status
                          )}`}
                        >
                          {item.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="mt-1.5 text-sm sm:text-base font-bold text-navy-900 dark:text-white font-brand">
                        {item.layananNama}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {new Date(item.createdAt).toLocaleDateString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </div>
                    </div>

                    {onSelectPengajuan && (
                      <button
                        onClick={() => {
                          onClose();
                          onSelectPengajuan(item.kodePengajuan);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#ff7a1a] dark:bg-orange-950/40 dark:text-orange-400 border border-orange-200/80 px-3.5 py-2 text-xs font-bold transition shadow-2xs cursor-pointer"
                      >
                        <span>Buka Tiket</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-slate-100 px-6 sm:px-7 py-4.5 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
