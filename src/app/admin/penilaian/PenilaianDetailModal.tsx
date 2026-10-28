"use client";

import React from "react";
import {
  X,
  Star,
  FileText,
  User,
  ShieldCheck,
  Globe,
  Clock,
  Trash2,
  Phone,
  Mail,
  Building,
} from "lucide-react";
import { PenilaianItem } from "@/app/actions/admin-penilaian";

interface PenilaianDetailModalProps {
  item: PenilaianItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleteClick?: (item: PenilaianItem) => void;
}

export function PenilaianDetailModal({
  item,
  isOpen,
  onClose,
  onDeleteClick,
}: PenilaianDetailModalProps) {
  if (!isOpen || !item) return null;

  const formatTanggalIndo = (d: Date | string) => {
    return new Date(d).toLocaleString("id-ID", {
      dateStyle: "full",
      timeStyle: "short",
    }) + " WIB";
  };

  const getLabelKualitas = (val: number) => {
    switch (val) {
      case 5:
        return { label: "Sangat Baik (5/5)", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
      case 4:
        return { label: "Baik (4/5)", color: "text-sky-700 bg-sky-50 border-sky-200" };
      case 3:
        return { label: "Cukup (3/5)", color: "text-amber-700 bg-amber-50 border-amber-200" };
      case 2:
        return { label: "Buruk (2/5)", color: "text-orange-700 bg-orange-50 border-orange-200" };
      default:
        return { label: "Sangat Buruk (1/5)", color: "text-rose-700 bg-rose-50 border-rose-200" };
    }
  };

  const getLabelManfaat = (val: number) => {
    switch (val) {
      case 5:
        return { label: "Sangat Bermanfaat (5/5)", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
      case 4:
        return { label: "Bermanfaat (4/5)", color: "text-sky-700 bg-sky-50 border-sky-200" };
      case 3:
        return { label: "Cukup Bermanfaat (3/5)", color: "text-amber-700 bg-amber-50 border-amber-200" };
      case 2:
        return { label: "Kurang Bermanfaat (2/5)", color: "text-orange-700 bg-orange-50 border-orange-200" };
      default:
        return { label: "Tidak Bermanfaat (1/5)", color: "text-rose-700 bg-rose-50 border-rose-200" };
    }
  };

  const statusLayananBadge = (status: string) => {
    switch (status) {
      case "SELESAI":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "DIPROSES":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "DITOLAK":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

  const kualitasPel = getLabelKualitas(item.kualitasPelayanan);
  const manfaatPel = getLabelManfaat(item.manfaatPelayanan);
  const kualitasWeb = getLabelKualitas(item.kualitasWebsite);
  const manfaatWeb = getLabelManfaat(item.manfaatWebsite);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden my-8 animate-fade-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
              <Star className="h-5 w-5 fill-amber-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-navy-900 dark:text-white font-brand">
                Detail Evaluasi Survei IKM
              </h2>
              <span className="text-xs text-slate-500 font-mono">
                Nomor Tiket: #{item.pengajuan.kodePengajuan}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Card Profil Pemohon & Tiket */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4.5 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Profil Pemohon & Permohonan
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${statusLayananBadge(
                  item.pengajuan.status
                )}`}
              >
                {item.pengajuan.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-400" /> Nama Pemohon:
                </span>
                <span className="font-bold text-navy-900 dark:text-white block">
                  {item.pengajuan.tamu.nama}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-slate-400" /> Jenis Layanan:
                </span>
                <span className="font-bold text-navy-900 dark:text-white block truncate">
                  {item.pengajuan.layanan.nama}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-slate-400" /> Asal Instansi / Alamat:
                </span>
                <span className="text-slate-700 dark:text-slate-300 block truncate">
                  {item.pengajuan.tamu.asalInstansi || item.pengajuan.tamu.alamat || "-"}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" /> WhatsApp / Kontak:
                </span>
                <span className="text-slate-700 dark:text-slate-300 font-mono block">
                  {item.pengajuan.tamu.telepon || "-"}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" /> Waktu Submit Survei:
              </span>
              <span className="font-medium text-slate-600 dark:text-slate-300">
                {formatTanggalIndo(item.createdAt)}
              </span>
            </div>
          </div>

          {/* Skor Rating Keseluruhan (Bintang 1-5) */}
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4.5 text-center dark:border-amber-900/40 dark:bg-amber-950/20 space-y-2">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider block">
              1. Tingkat Kepuasan Menyeluruh
            </span>
            <div className="flex items-center justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-7 w-7 ${
                    star <= item.ratingBintang
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300 dark:text-slate-700 fill-transparent"
                  }`}
                />
              ))}
            </div>
            <span className="inline-block rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
              Skor: {item.ratingBintang} dari 5 Bintang
            </span>
          </div>

          {/* Rincian 4 Aspek Penilaian */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              Rincian Aspek Pelayanan & Website
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Pertanyaan 2 */}
              <div className="rounded-2xl border border-slate-200/80 p-3.5 bg-white dark:bg-slate-800/80 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  <span>2. Kualitas Pelayanan Petugas:</span>
                </div>
                <div
                  className={`inline-block px-2.5 py-1 rounded-xl text-xs font-bold border ${kualitasPel.color}`}
                >
                  {kualitasPel.label}
                </div>
              </div>

              {/* Pertanyaan 3 */}
              <div className="rounded-2xl border border-slate-200/80 p-3.5 bg-white dark:bg-slate-800/80 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  <span>3. Kebermanfaatan Pelayanan:</span>
                </div>
                <div
                  className={`inline-block px-2.5 py-1 rounded-xl text-xs font-bold border ${manfaatPel.color}`}
                >
                  {manfaatPel.label}
                </div>
              </div>

              {/* Pertanyaan 4 */}
              <div className="rounded-2xl border border-slate-200/80 p-3.5 bg-white dark:bg-slate-800/80 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                  <Globe className="h-4 w-4 text-purple-600" />
                  <span>4. Kualitas Sistem & Website:</span>
                </div>
                <div
                  className={`inline-block px-2.5 py-1 rounded-xl text-xs font-bold border ${kualitasWeb.color}`}
                >
                  {kualitasWeb.label}
                </div>
              </div>

              {/* Pertanyaan 5 */}
              <div className="rounded-2xl border border-slate-200/80 p-3.5 bg-white dark:bg-slate-800/80 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                  <Globe className="h-4 w-4 text-purple-600" />
                  <span>5. Kebermanfaatan Website:</span>
                </div>
                <div
                  className={`inline-block px-2.5 py-1 rounded-xl text-xs font-bold border ${manfaatWeb.color}`}
                >
                  {manfaatWeb.label}
                </div>
              </div>
            </div>
          </div>

          {/* Kritik & Saran Pemohon (Jika Ada) */}
          {item.kritikSaran && (
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 dark:bg-slate-800/50 dark:border-slate-700 text-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Kritik, Saran, atau Masukan:
              </span>
              <p className="text-slate-700 dark:text-slate-300 italic whitespace-pre-wrap leading-relaxed">
                &ldquo;{item.kritikSaran}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          {onDeleteClick ? (
            <button
              type="button"
              onClick={() => onDeleteClick(item)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/40 transition cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" /> Hapus Penilaian
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
