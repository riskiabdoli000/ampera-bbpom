"use client";

import React, { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ClipboardList,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  createLayananAction,
  updateLayananAction,
} from "@/app/actions/admin-layanan";
import { ServiceSavingOverlay } from "@/components/common/ServiceSavingOverlay";

export interface LayananItem {
  id: number;
  kode: string;
  nama: string;
  deskripsi: string | null;
  isAktif: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  _count?: {
    pengajuan: number;
  };
}

interface LayananModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedLayanan?: LayananItem) => void;
  layananToEdit?: LayananItem | null;
}

export function LayananModal({
  isOpen,
  onClose,
  onSuccess,
  layananToEdit,
}: LayananModalProps) {
  const isEditing = Boolean(layananToEdit);

  const [mounted, setMounted] = useState(false);
  const [kode, setKode] = useState("");
  const [nama, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [isAktif, setIsAktif] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (layananToEdit) {
      setKode(layananToEdit.kode);
      setNama(layananToEdit.nama);
      setDeskripsi(layananToEdit.deskripsi || "");
      setIsAktif(layananToEdit.isAktif);
    } else {
      setKode("");
      setNama("");
      setDeskripsi("");
      setIsAktif(true);
    }
    setErrorMessage(null);
  }, [layananToEdit, isOpen]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedKode = kode.trim().toUpperCase();
    const trimmedNama = nama.trim();

    if (!trimmedKode) {
      setErrorMessage("Kode layanan wajib diisi.");
      return;
    }
    if (!trimmedNama) {
      setErrorMessage("Nama layanan wajib diisi.");
      return;
    }

    startTransition(async () => {
      if (isEditing && layananToEdit) {
        const res = await updateLayananAction(layananToEdit.id, {
          kode: trimmedKode,
          nama: trimmedNama,
          deskripsi: deskripsi.trim() || null,
          isAktif,
        });

        if (res.success && res.data) {
          onSuccess(res.data as LayananItem);
          onClose();
        } else {
          setErrorMessage(res.error || "Gagal memperbarui layanan.");
        }
      } else {
        const res = await createLayananAction({
          kode: trimmedKode,
          nama: trimmedNama,
          deskripsi: deskripsi.trim() || null,
          isAktif,
        });

        if (res.success && res.data) {
          onSuccess(res.data as LayananItem);
          onClose();
        } else {
          setErrorMessage(res.error || "Gagal menambahkan layanan baru.");
        }
      }
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Fullscreen Backdrop covering sidebar, header, and entire viewport */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-md transition-opacity animate-fade-in"
      />

      {/* Modal Dialog centered perfectly in screen */}
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 z-10 animate-fade-up my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-500/15 text-brand-orange flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-navy-900 dark:text-white font-brand">
                {isEditing ? "Edit Data Layanan" : "Tambah Layanan Baru"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing
                  ? `Mengubah rincian layanan ID #${layananToEdit?.id}`
                  : "Mendaftarkan kategori layanan publik baru ke sistem"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-navy-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Kode Layanan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Kode Unik Layanan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={kode}
              onChange={(e) => setKode(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ""))}
              placeholder="CONTOH: UJI_CEPAT, INFO, KONSULTASI"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-mono font-bold tracking-wider text-navy-900 dark:text-white uppercase focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Format huruf kapital, angka, dan underscore. Digunakan sebagai kode referensi sistem.
            </p>
          </div>

          {/* Nama Layanan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Nama Layanan Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Layanan Pengujian Cepat Ampera"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-bold text-navy-900 dark:text-white focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          {/* Deskripsi Layanan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Deskripsi & Peruntukan Layanan
            </label>
            <textarea
              rows={3}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Tuliskan penjelasan singkat mengenai jenis pelayanan, syarat umum, atau sasaran masyarakat..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 leading-relaxed"
            />
          </div>

          {/* Status Aktif Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
            <div>
              <span className="block text-xs font-bold text-navy-900 dark:text-white">
                Status Publikasi Layanan
              </span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                {isAktif
                  ? "Layanan aktif dan dapat diakses pemohon di landing page"
                  : "Layanan dinonaktifkan sementara (disembunyikan)"}
              </span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={isAktif}
              onClick={() => setIsAktif(!isAktif)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isAktif ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isAktif ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-cta hover:brightness-110 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{isEditing ? "Simpan Perubahan" : "Tambahkan Layanan"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Overlay Loading saat Menyimpan Data Layanan */}
      <ServiceSavingOverlay
        isOpen={isPending}
        serviceName="Manajemen Layanan AMPERA"
        title={isEditing ? "Menyimpan Perubahan Layanan..." : "Menyimpan Layanan Baru..."}
        description="Sistem sedang memperbarui konfigurasi layanan publik pada database BBPOM di Palembang."
        hasFileUpload={false}
      />
    </div>,
    document.body
  );
}
