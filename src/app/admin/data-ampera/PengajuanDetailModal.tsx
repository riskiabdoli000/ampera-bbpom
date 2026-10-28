"use client";

import React, { useState, useTransition, useRef, useEffect } from "react";
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
  UploadCloud,
  Plus,
  RefreshCw,
  Bell,
  Check,
  Image as ImageIcon,
} from "lucide-react";
import {
  PengajuanItem,
  StatusPengajuan,
  LampiranTindakanItem,
  NotifikasiWaItem,
  updatePengajuanTindakanWithLampiranAction,
  deletePengajuanAction,
  resendPengajuanWaNotificationAction,
  sendManualPengajuanWaNotificationAction,
} from "@/app/actions/data-ampera";

interface PengajuanDetailModalProps {
  pengajuan: PengajuanItem | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated: (updated: PengajuanItem) => void;
  onDeleted: (deletedId: number) => void;
  onNotify: (type: "success" | "error", message: string) => void;
}

interface NewFileItem {
  id: string;
  file: File;
  previewUrl: string;
  isPdf: boolean;
  sizeFormatted: string;
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
  const [existingLampiran, setExistingLampiran] = useState<LampiranTindakanItem[]>([]);
  const [deletedLampiranIds, setDeletedLampiranIds] = useState<number[]>([]);
  const [newFiles, setNewFiles] = useState<NewFileItem[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [waLogs, setWaLogs] = useState<NotifikasiWaItem[]>(pengajuan?.notifikasiWa || []);
  const [isResendingWa, setIsResendingWa] = useState<number | null>(null);
  const [isSendingManualWa, setIsSendingManualWa] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes || bytes === 0) return "0 KB";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Sync state saat modal dibuka dengan pengajuan baru
  useEffect(() => {
    if (pengajuan) {
      setSelectedStatus(pengajuan.status);
      setCatatanPetugas(pengajuan.catatanPetugas || "");
      setExistingLampiran(pengajuan.lampiranTindakan || []);
      setDeletedLampiranIds([]);
      setNewFiles([]);
      setValidationError(null);
      setIsDragging(false);
      setWaLogs(pengajuan.notifikasiWa || []);
    }
  }, [pengajuan]);

  // Bersihkan object URLs saat unmount atau newFiles dibersihkan
  useEffect(() => {
    return () => {
      newFiles.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, [newFiles]);

  if (!isOpen || !pengajuan) return null;

  // Hitung jumlah lampiran aktif
  const remainingExisting = existingLampiran.filter((l) => !deletedLampiranIds.includes(l.id));
  const totalLampiran = remainingExisting.length + newFiles.length;

  const handleAddFiles = (filesList: FileList | File[]) => {
    const incoming = Array.from(filesList);
    const added: NewFileItem[] = [];
    let err: string | null = null;

    for (const file of incoming) {
      if (file.size > 10 * 1024 * 1024) {
        err = `Berkas "${file.name}" melebihi batas ukuran maksimal 10MB.`;
        continue;
      }
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      const isImg = file.type.startsWith("image/") || /\.(jpe?g|png|webp)$/i.test(file.name);
      if (!isPdf && !isImg) {
        err = `Format berkas "${file.name}" tidak didukung. Harap unggah gambar (JPG, PNG, WebP) atau PDF.`;
        continue;
      }

      const previewUrl = isImg ? URL.createObjectURL(file) : "";
      added.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        previewUrl,
        isPdf,
        sizeFormatted: formatFileSize(file.size),
      });
    }

    if (err) {
      setValidationError(err);
    } else {
      setValidationError(null);
    }

    if (added.length > 0) {
      setNewFiles((prev) => [...prev, ...added]);
    }
  };

  const handleRemoveNewFile = (fileId: string) => {
    setNewFiles((prev) => {
      const target = prev.find((item) => item.id === fileId);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== fileId);
    });
  };

  const handleDeleteExistingLampiran = (lampiranId: number) => {
    setDeletedLampiranIds((prev) => (prev.includes(lampiranId) ? prev : [...prev, lampiranId]));
  };

  const handleRestoreExistingLampiran = (lampiranId: number) => {
    setDeletedLampiranIds((prev) => prev.filter((id) => id !== lampiranId));
  };

  const handleUpdateStatus = () => {
    // Validasi frontend minimal 2 lampiran jika status diproses/selesai atau ada catatan/berkas
    const isUnderAction =
      selectedStatus === "DIPROSES" ||
      selectedStatus === "SELESAI" ||
      catatanPetugas.trim().length > 0 ||
      totalLampiran > 0;

    if (isUnderAction && totalLampiran < 2) {
      setValidationError(
        `Bukti lampiran tindakan petugas minimal 2 berkas (saat ini ${totalLampiran} berkas). Silakan lampirkan minimal 2 berkas bukti sebelum menyimpan.`
      );
      return;
    }
    setValidationError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", String(pengajuan.id));
      formData.append("status", selectedStatus);
      formData.append("catatanPetugas", catatanPetugas);
      formData.append("deletedLampiranIds", JSON.stringify(deletedLampiranIds));

      for (const item of newFiles) {
        formData.append("lampiranFiles", item.file);
      }

      const res = await updatePengajuanTindakanWithLampiranAction(formData);
      if (res.success && res.updatedPengajuan) {
        onNotify("success", res.message);
        onStatusUpdated(res.updatedPengajuan);
        onClose();
      } else {
        setValidationError(res.message);
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

  const handleResendWa = async (logId: number) => {
    setIsResendingWa(logId);
    try {
      const res = await resendPengajuanWaNotificationAction(logId);
      if (res.success) {
        onNotify("success", res.message);
        setWaLogs((prev) =>
          prev.map((l) =>
            l.id === logId ? { ...l, status: "TERKIRIM", dikirimPada: new Date() } : l
          )
        );
      } else {
        onNotify("error", res.message);
      }
    } catch (err: any) {
      onNotify("error", err.message || "Gagal mengirim ulang WhatsApp.");
    } finally {
      setIsResendingWa(null);
    }
  };

  const handleSendManualWa = async () => {
    if (!pengajuan) return;
    setIsSendingManualWa(true);
    try {
      const res = await sendManualPengajuanWaNotificationAction(pengajuan.id);
      if (res.success) {
        onNotify("success", res.message);
      } else {
        onNotify("error", res.message);
      }
    } catch (err: any) {
      onNotify("error", err.message || "Gagal memproses pengiriman notifikasi.");
    } finally {
      setIsSendingManualWa(false);
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
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50/70 p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-800/40 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-navy-900 dark:text-white">
                  <ShieldCheck className="h-4 w-4 text-[#ff7a1a]" /> Tindakan Petugas BBPOM
                </h3>

                {/* Indikator Counter Minimal 2 Lampiran */}
                {totalLampiran >= 2 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {totalLampiran} Lampiran Terpenuhi (Bisa ditambah lagi)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                    <AlertCircle className="h-3.5 w-3.5" /> Wajib Min. 2 Lampiran (Saat ini: {totalLampiran}/2)
                  </span>
                )}
              </div>

              {validationError && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                  <span>{validationError}</span>
                </div>
              )}

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
                    onChange={(e) => {
                      setCatatanPetugas(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    placeholder="Contoh: Sampel telah diuji dengan test kit Rapid Boraks/Formalin dengan hasil Negatif. Atau tanggapan resmi jawaban informasi."
                    className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-xs sm:text-sm text-navy-900 placeholder-slate-400 focus:border-brand-orange focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white leading-relaxed"
                  />
                </div>
              </div>

              {/* Area Upload Bukti Lampiran Tindakan Petugas */}
              <div className="space-y-3 pt-3 border-t border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                      Bukti Lampiran Tindakan (Foto Hasil Uji Lab / Berita Acara / LHU)
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Minimal 2 lampiran bukti • Mendukung banyak lampiran (&gt;2) • Foto dikompresi ke ~100KB • PDF disimpan utuh
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-orange px-3 py-1.5 text-xs font-bold text-navy-900 dark:text-white transition shadow-2xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <Plus className="h-3.5 w-3.5 text-[#ff7a1a]" /> Tambah Berkas
                  </button>
                </div>

                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleAddFiles(e.target.files);
                      e.target.value = "";
                    }
                  }}
                  accept="image/jpeg,image/png,image/webp,application/pdf,.pdf"
                  className="hidden"
                />

                {/* Dropzone Container */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleAddFiles(e.dataTransfer.files);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center transition cursor-pointer ${
                    isDragging
                      ? "border-brand-orange bg-orange-50/50 dark:bg-orange-950/20"
                      : "border-slate-300/80 bg-white hover:border-brand-orange/70 hover:bg-orange-50/20 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-[#ff7a1a] dark:bg-orange-950/40 dark:text-orange-400 group-hover:scale-105 transition">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <div className="mt-2 text-xs font-bold text-navy-900 dark:text-white">
                    Seret & letakkan berkas di sini, atau <span className="text-[#ff7a1a] underline">pilih dari perangkat</span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                    JPG, PNG, WebP (kompresi otomatis ~100KB) atau PDF (Maksimal 10 MB per berkas)
                  </div>
                </div>

                {/* List Lampiran Tersimpan & Draft Baru */}
                <div className="space-y-3 pt-1">
                  {/* 1. Berkas Tersimpan Sebelumnya */}
                  {existingLampiran.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Lampiran Tersimpan ({remainingExisting.length} aktif
                        {deletedLampiranIds.length > 0 ? `, ${deletedLampiranIds.length} dihapus` : ""})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {existingLampiran.map((item) => {
                          const isDeleted = deletedLampiranIds.includes(item.id);
                          const isPdf =
                            item.tipeFile === "application/pdf" ||
                            item.namaFile.toLowerCase().endsWith(".pdf");

                          if (isDeleted) {
                            return (
                              <div
                                key={`existing-${item.id}`}
                                className="flex items-center justify-between rounded-2xl border border-rose-200/80 bg-rose-50/60 p-3 dark:border-rose-900/60 dark:bg-rose-950/20 opacity-75"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 text-xs font-bold">
                                    <Trash2 className="h-4 w-4" />
                                  </div>
                                  <div className="truncate">
                                    <span className="block text-xs font-bold text-slate-500 line-through truncate">
                                      {item.namaFile}
                                    </span>
                                    <span className="text-[10px] text-rose-600 font-semibold">
                                      Akan dihapus saat disimpan
                                    </span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRestoreExistingLampiran(item.id)}
                                  className="shrink-0 text-xs font-bold text-slate-600 hover:text-navy-900 underline px-2 py-1 cursor-pointer"
                                  title="Batalkan penghapusan"
                                >
                                  Batal
                                </button>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={`existing-${item.id}`}
                              className="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-3 dark:border-slate-700/80 dark:bg-slate-800 shadow-2xs group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {isPdf ? (
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 font-extrabold text-[11px]">
                                    PDF
                                  </div>
                                ) : (
                                  <div
                                    className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900 border cursor-pointer hover:opacity-85 transition"
                                    onClick={() => setPreviewImage(item.url)}
                                    title="Klik untuk pratinjau"
                                  >
                                    <Image
                                      src={item.url}
                                      alt={item.namaFile}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                )}
                                <div className="truncate">
                                  <span className="block text-xs font-bold text-navy-900 dark:text-white truncate">
                                    {item.namaFile}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {formatFileSize(item.ukuranFile)} • Tersimpan
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {isPdf ? (
                                  <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer transition"
                                    title="Buka PDF"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                  </a>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setPreviewImage(item.url)}
                                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer transition"
                                    title="Lihat Pratinjau"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteExistingLampiran(item.id)}
                                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-rose-500 hover:bg-rose-50 hover:border-rose-300 dark:border-slate-700 dark:hover:bg-rose-950/40 cursor-pointer transition"
                                  title="Hapus berkas ini"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 2. Berkas Baru Ditambahkan (Draft) */}
                  {newFiles.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-[#ff7a1a] uppercase tracking-wider block">
                        Berkas Baru Diunggah ({newFiles.length} berkas)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {newFiles.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-2xl border border-orange-200 bg-orange-50/40 p-3 dark:border-orange-900/60 dark:bg-orange-950/20 shadow-2xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {item.isPdf ? (
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 font-extrabold text-[11px]">
                                  PDF
                                </div>
                              ) : (
                                <div
                                  className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900 border cursor-pointer hover:opacity-85 transition"
                                  onClick={() => item.previewUrl && setPreviewImage(item.previewUrl)}
                                  title="Klik untuk pratinjau"
                                >
                                  {item.previewUrl ? (
                                    <img
                                      src={item.previewUrl}
                                      alt={item.file.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <ImageIcon className="h-4 w-4 text-slate-400" />
                                  )}
                                </div>
                              )}
                              <div className="truncate">
                                <span className="block text-xs font-bold text-navy-900 dark:text-white truncate">
                                  {item.file.name}
                                </span>
                                <span className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold">
                                  {item.sizeFormatted} • Siap diupload (~100KB)
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {!item.isPdf && item.previewUrl && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewImage(item.previewUrl)}
                                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-orange-200 text-slate-700 hover:bg-orange-100/50 dark:border-slate-700 dark:text-slate-300 cursor-pointer transition"
                                  title="Pratinjau Gambar"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveNewFile(item.id)}
                                className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 dark:border-rose-900 cursor-pointer transition"
                                title="Batal unggah berkas ini"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 5. Notifikasi Otomatis WhatsApp (Dual-Recipient: Tamu & Petugas) */}
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50/70 p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-800/40 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-navy-900 dark:text-white">
                      Notifikasi Otomatis WhatsApp
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Pemantauan pengiriman pesan WhatsApp ke Tamu & Petugas Layanan
                    </p>
                  </div>
                </div>

                {pengajuan.tamu.telepon && (
                  <button
                    type="button"
                    onClick={handleSendManualWa}
                    disabled={isSendingManualWa}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-700 transition shadow-2xs disabled:opacity-50 cursor-pointer"
                    title="Kirim pesan status terbaru ke nomor WhatsApp pemohon"
                  >
                    <Send className={`h-3.5 w-3.5 ${isSendingManualWa ? "animate-pulse" : ""}`} />
                    {isSendingManualWa ? "Mengirim..." : "Kirim Status ke WA Pemohon"}
                  </button>
                )}
              </div>

              {/* Daftar Riwayat Notifikasi */}
              {waLogs.length > 0 ? (
                <div className="space-y-2.5">
                  {waLogs.map((log) => {
                    const isTamu = log.tipePenerima === "TAMU";
                    const isSent = log.status === "TERKIRIM";
                    return (
                      <div
                        key={log.id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-3.5 transition ${
                          isSent
                            ? "border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                            : "border-rose-200/80 bg-rose-50/40 dark:border-rose-900/50 dark:bg-rose-950/20"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 inline-flex h-2 w-2 rounded-full shrink-0 ${
                              isSent ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold text-navy-900 dark:text-white">
                                {isTamu ? "Penerima: Tamu / Pemohon" : "Penerima: Petugas BBPOM"}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                                  isSent
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200"
                                    : "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200"
                                }`}
                              >
                                {isSent ? "Terkirim" : "Gagal"}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                              {log.namaPenerima} • <span className="font-mono">{log.nomorTujuan}</span>
                            </p>
                            {!isSent && log.responGateway && (
                              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 italic">
                                Info: {log.responGateway}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:self-center shrink-0">
                          <span className="text-[11px] text-slate-400 font-medium">
                            {new Date(log.dikirimPada || log.createdAt).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })} WIB
                          </span>

                          {!isSent && (
                            <button
                              type="button"
                              onClick={() => handleResendWa(log.id)}
                              disabled={isResendingWa === log.id}
                              className="inline-flex items-center gap-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-slate-700 transition cursor-pointer disabled:opacity-50"
                              title="Kirim ulang pesan WhatsApp ini"
                            >
                              <RefreshCw
                                className={`h-3 w-3 ${
                                  isResendingWa === log.id ? "animate-spin" : ""
                                }`}
                              />
                              Kirim Ulang
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-4 text-center dark:border-slate-700 dark:bg-slate-900/40">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Belum ada riwayat notifikasi otomatis WhatsApp yang tercatat untuk tiket ini.
                  </p>
                  {pengajuan.tamu.telepon ? (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Pesan akan dikirim otomatis ke <span className="font-mono font-semibold">{pengajuan.tamu.telepon}</span> saat status pengajuan diubah menjadi Diproses atau Selesai.
                    </p>
                  ) : (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
                      Pemohon tidak mencantumkan nomor WhatsApp pada formulir pengajuan.
                    </p>
                  )}
                </div>
              )}
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
            <div className="relative h-[72vh] w-[72vw] max-w-4xl flex items-center justify-center p-2">
              <img
                src={previewImage}
                alt="Preview Bukti"
                className="max-h-full max-w-full object-contain rounded-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
