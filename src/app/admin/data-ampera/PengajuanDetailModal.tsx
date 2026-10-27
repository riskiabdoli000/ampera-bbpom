"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import {
  X,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  Calendar,
  Clock,
  ExternalLink,
  Download,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Send,
  MessageSquare,
  FileCheck,
  ShieldCheck,
  Eye,
} from "lucide-react";
import {
  PengajuanItem,
  StatusPengajuan,
  updatePengajuanStatusAction,
  deletePengajuanAction,
} from "@/app/actions/data-ampera";

interface PengajuanDetailModalProps {
  pengajuan: PengajuanItem | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated: (updated: PengajuanItem) => void;
  onDeleted: (deletedId: number) => void;
  onNotify: (type: "success" | "error", message: string) => void;
}

export function PengajuanDetailModal({
  pengajuan,
  isOpen,
  onClose,
  onStatusUpdated,
  onDeleted,
  onNotify,
}: PengajuanDetailModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<StatusPengajuan>(
    pengajuan?.status || "MENUNGGU_VERIFIKASI"
  );
  const [catatanPetugas, setCatatanPetugas] = useState(pengajuan?.catatanPetugas || "");
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Sync state saat modal dibuka dengan pengajuan baru
  React.useEffect(() => {
    if (pengajuan) {
      setSelectedStatus(pengajuan.status);
      setCatatanPetugas(pengajuan.catatanPetugas || "");
    }
  }, [pengajuan]);

  if (!isOpen || !pengajuan) return null;

  const handleUpdateStatus = () => {
    startTransition(async () => {
      const res = await updatePengajuanStatusAction(
        pengajuan.id,
        selectedStatus,
        catatanPetugas
      );
      if (res.success) {
        onNotify("success", res.message);
        onStatusUpdated({
          ...pengajuan,
          status: selectedStatus,
          catatanPetugas: catatanPetugas || null,
        });
      } else {
        onNotify("error", res.message);
      }
    });
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Yakin ingin menghapus data pengajuan #${pengajuan.kodePengajuan}? Tindakan ini tidak dapat dibatalkan.`
      )
    ) {
      return;
    }
    setIsDeleting(true);
    const res = await deletePengajuanAction(pengajuan.id);
    setIsDeleting(false);
    if (res.success) {
      onNotify("success", res.message);
      onDeleted(pengajuan.id);
      onClose();
    } else {
      onNotify("error", res.message);
    }
  };

  const getStatusBadge = (status: StatusPengajuan) => {
    switch (status) {
      case "MENUNGGU_VERIFIKASI":
        return {
          label: "Menunggu Verifikasi",
          bg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
        };
      case "DIPROSES":
        return {
          label: "Sedang Diproses",
          bg: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800",
        };
      case "SELESAI":
        return {
          label: "Selesai Dilayani",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
        };
      case "DITOLAK":
        return {
          label: "Ditolak",
          bg: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
        };
    }
  };

  const badge = getStatusBadge(pengajuan.status);

  // Clean WhatsApp Link
  const rawWa = pengajuan.tamu.telepon || "";
  let cleanWa = rawWa.replace(/\D/g, "");
  if (cleanWa.startsWith("0")) {
    cleanWa = "62" + cleanWa.slice(1);
  }
  const waUrl = cleanWa
    ? `https://wa.me/${cleanWa}?text=${encodeURIComponent(
        `Halo Bapak/Ibu ${pengajuan.tamu.nama}, kami dari Balai Besar POM di Palembang terkait pengajuan layanan Anda (${pengajuan.kodePengajuan}) mengenai "${pengajuan.layanan.nama}".`
      )}`
    : null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-[#06132f]/60 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />

        {/* Modal Dialog */}
        <div className="relative z-10 flex flex-col max-h-[92vh] w-full max-w-3xl rounded-3xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 sm:px-7 py-5 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm sm:text-base font-extrabold text-[#ff7a1a] dark:text-orange-400">
                  {pengajuan.kodePengajuan}
                </span>
                <span
                  className={`inline-block rounded-full border px-3 py-1 text-xs font-bold ${badge.bg}`}
                >
                  {badge.label}
                </span>
              </div>
              <h2 className="mt-1 text-lg sm:text-xl font-black text-navy-900 dark:text-white font-brand">
                {pengajuan.layanan.nama}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Modal Body Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-6">
            {/* 1. Profil Pemohon / Tamu (Clear & Legible) */}
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50/70 p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <User className="h-4 w-4 text-[#ff7a1a]" /> Profil Pemohon Layanan
                </h3>
                {waUrl && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white transition shadow-xs"
                  >
                    <MessageSquare className="h-4 w-4" /> Chat WhatsApp
                  </a>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Nama Lengkap Pemohon:</span>
                  <p className="font-bold text-navy-900 dark:text-white text-base mt-0.5 font-brand">
                    {pengajuan.tamu.nama}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">NIK (KTP):</span>
                  <p className="font-mono font-bold text-slate-800 dark:text-white text-sm sm:text-base mt-0.5">
                    {pengajuan.tamu.nik}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Nomor WhatsApp:</span>
                  <p className="font-bold text-navy-900 dark:text-white text-sm sm:text-base mt-0.5">
                    {pengajuan.tamu.telepon || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Alamat Email:</span>
                  <p className="font-semibold text-navy-900 dark:text-white text-sm mt-0.5">
                    {pengajuan.tamu.email || "-"}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-xs text-slate-400 block font-medium">Alamat Domisili / Instansi:</span>
                  <p className="font-medium text-navy-900 dark:text-white text-sm sm:text-[15px] mt-0.5 leading-relaxed">
                    {pengajuan.tamu.alamat || pengajuan.tamu.asalInstansi || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Rincian Isian Formulir Layanan */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <FileText className="h-4 w-4 text-[#ff7a1a]" /> Rincian Formulir Pengajuan
              </h3>

              {/* Layanan 1: Permintaan Informasi */}
              {pengajuan.layanan.kode === "INFO" && (
                <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900 space-y-3.5 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Kategori Informasi:</span>
                    <p className="font-bold text-navy-900 dark:text-white text-sm sm:text-base mt-0.5">
                      {pengajuan.kategoriInformasi || "Regulasi / Informasi Umum"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Informasi yang Dibutuhkan:</span>
                    <p className="mt-1.5 rounded-2xl bg-slate-50 p-4 text-sm text-navy-900 dark:bg-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed border border-slate-200/60 dark:border-slate-700/60 font-medium">
                      {pengajuan.informasiDibutuhkan || "-"}
                    </p>
                  </div>
                </div>
              )}

              {/* Layanan 2: Pengujian Cepat */}
              {pengajuan.layanan.kode === "UJI_CEPAT" && (
                <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900 space-y-3.5 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Produk yang Dicurigai:</span>
                    <p className="font-bold text-navy-900 dark:text-white text-base mt-0.5 font-brand">
                      {pengajuan.produkDicurigai || pengajuan.produkLainnya || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Alasan Kecurigaan:</span>
                    <p className="font-semibold text-navy-900 dark:text-white text-sm sm:text-base mt-0.5">
                      {pengajuan.alasanKecurigaan || pengajuan.alasanLainnya || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Rincian Pembelian / Keterangan Sampel:</span>
                    <p className="mt-1.5 rounded-2xl bg-slate-50 p-4 text-sm text-navy-900 dark:bg-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed border border-slate-200/60 dark:border-slate-700/60 font-medium">
                      {pengajuan.rincianProduk || "-"}
                    </p>
                  </div>
                </div>
              )}

              {/* Layanan 3: Pengaduan */}
              {pengajuan.layanan.kode === "ADUAN" && (
                <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900 space-y-3.5 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Isi / Uraian Laporan Pengaduan:</span>
                    <p className="mt-1.5 rounded-2xl bg-slate-50 p-4 text-sm text-navy-900 dark:bg-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed border border-slate-200/60 dark:border-slate-700/60 font-medium">
                      {pengajuan.isiPengaduan || "-"}
                    </p>
                  </div>
                </div>
              )}

              {/* Layanan 4: Keterbukaan Informasi Publik (KIP) */}
              {pengajuan.layanan.kode === "KIP" && (
                <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900 space-y-3.5 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Rincian Informasi Publik yang Dimohon:</span>
                    <p className="mt-1.5 rounded-2xl bg-slate-50 p-4 text-sm text-navy-900 dark:bg-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed border border-slate-200/60 dark:border-slate-700/60 font-medium">
                      {pengajuan.rincianInformasiKip || "-"}
                    </p>
                  </div>
                  {pengajuan.tujuanPenggunaanKip && (
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">Tujuan Penggunaan Informasi:</span>
                      <p className="font-semibold text-navy-900 dark:text-white text-sm sm:text-base mt-0.5">
                        {pengajuan.tujuanPenggunaanKip}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. Lampiran Berkas (Foto Bukti, Scan KTP, Dokumen PDF) */}
            {(pengajuan.buktiFotoUrl || pengajuan.ktpUrl || pengajuan.dokumenPendukungUrl) && (
              <div className="space-y-3.5">
                <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <FileCheck className="h-4 w-4 text-[#ff7a1a]" /> Lampiran Dokumen & Bukti
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Foto Bukti Aduan */}
                  {pengajuan.buktiFotoUrl && (
                    <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 border">
                          <Image
                            src={pengajuan.buktiFotoUrl}
                            alt="Bukti Foto"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-navy-900 dark:text-white">
                            Foto Bukti Laporan
                          </div>
                          <div className="text-xs text-slate-400">Lampiran Bukti</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setPreviewImage(pengajuan.buktiFotoUrl)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
                          title="Lihat Gambar"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <a
                          href={pengajuan.buktiFotoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                          title="Buka di Tab Baru"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Foto KTP Pemohon */}
                  {pengajuan.ktpUrl && (
                    <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 border">
                          <Image
                            src={pengajuan.ktpUrl}
                            alt="Identitas KTP"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-navy-900 dark:text-white">
                            Identitas KTP
                          </div>
                          <div className="text-xs text-slate-400">Verifikasi Pemohon</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setPreviewImage(pengajuan.ktpUrl)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
                          title="Lihat Gambar"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <a
                          href={pengajuan.ktpUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                          title="Buka di Tab Baru"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Dokumen PDF Formulir KIP */}
                  {pengajuan.dokumenPendukungUrl && (
                    <div className="sm:col-span-2 flex items-center justify-between rounded-2xl border border-sky-200 bg-sky-50/50 p-4 dark:border-sky-900 dark:bg-sky-950/30">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300 font-extrabold text-sm">
                          PDF
                        </div>
                        <div>
                          <div className="text-sm font-bold text-navy-900 dark:text-white">
                            Formulir Permohonan KIP Resmi
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Dokumen formulir format PDF yang diunggah pemohon
                          </div>
                        </div>
                      </div>
                      <a
                        href={pengajuan.dokumenPendukungUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] px-4 py-2.5 text-xs font-bold text-white shadow-cta hover:brightness-110 transition"
                      >
                        <Download className="h-4 w-4" /> Buka PDF
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. Tindakan Petugas & Perubahan Status */}
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50/70 p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-800/40 space-y-4">
              <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-navy-900 dark:text-white">
                <ShieldCheck className="h-4 w-4 text-[#ff7a1a]" /> Tindakan Petugas BBPOM
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Ubah Status Pengajuan
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as StatusPengajuan)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs sm:text-sm font-bold text-navy-900 focus:border-brand-orange focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-2xs"
                  >
                    <option value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi (Pending)</option>
                    <option value="DIPROSES">Sedang Diproses (Uji Laboratorium/Tindak Lanjut)</option>
                    <option value="SELESAI">Selesai (Tuntas Dilayani)</option>
                    <option value="DITOLAK">Ditolak (Tidak Memenuhi Syarat)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Waktu Masuk
                  </label>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs sm:text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {new Date(pengajuan.createdAt).toLocaleString("id-ID", {
                      dateStyle: "full",
                      timeStyle: "short",
                    })}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Catatan / Hasil Pemeriksaan Petugas BBPOM
                  </label>
                  <textarea
                    rows={3}
                    value={catatanPetugas}
                    onChange={(e) => setCatatanPetugas(e.target.value)}
                    placeholder="Contoh: Sampel telah diuji dengan test kit Rapid Boraks/Formalin dengan hasil Negatif. Atau tanggapan resmi jawaban informasi."
                    className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-xs sm:text-sm text-navy-900 placeholder-slate-400 focus:border-brand-orange focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action (Orange Button CTA!) */}
          <div className="flex items-center justify-between border-t border-slate-100 px-6 sm:px-7 py-4.5 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-rose-200 px-4 py-2.5 text-xs sm:text-sm font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/40 transition disabled:opacity-50 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Menghapus..." : "Hapus Pengajuan"}
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-cta hover:brightness-110 transition disabled:opacity-60 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

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
              <X className="h-5 w-5" />
            </button>
            <div className="relative h-[72vh] w-[72vw] max-w-4xl">
              <Image
                src={previewImage}
                alt="Preview Bukti"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
