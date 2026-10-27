"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  X,
  UserCheck,
  Save,
  Loader2,
  AlertCircle,
  Upload,
  Sparkles,
  User,
  Phone,
  Briefcase,
  Hash,
  ClipboardList,
} from "lucide-react";
import {
  createPetugasAction,
  updatePetugasAction,
  PetugasRecord,
  LayananOption,
} from "@/app/actions/admin-petugas";

interface PetugasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (savedPetugas: PetugasRecord) => void;
  petugasToEdit?: PetugasRecord | null;
  layananOptions: LayananOption[];
}

export function PetugasModal({
  isOpen,
  onClose,
  onSuccess,
  petugasToEdit,
  layananOptions,
}: PetugasModalProps) {
  const isEditing = Boolean(petugasToEdit);

  const [mounted, setMounted] = useState(false);
  const [nip, setNip] = useState("");
  const [nama, setNama] = useState("");
  const [telepon, setTelepon] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [layananId, setLayananId] = useState<number | null>(null);
  const [isAktif, setIsAktif] = useState(true);

  // Foto state
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [removeFoto, setRemoveFoto] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (petugasToEdit) {
      setNip(petugasToEdit.nip);
      setNama(petugasToEdit.nama);
      setTelepon(petugasToEdit.telepon || "");
      setJabatan(petugasToEdit.jabatan || "");
      setLayananId(petugasToEdit.layananId || null);
      setIsAktif(petugasToEdit.isAktif);
      setFotoPreview(petugasToEdit.fotoUrl || null);
    } else {
      setNip("");
      setNama("");
      setTelepon("");
      setJabatan("");
      setLayananId(null);
      setIsAktif(true);
      setFotoPreview(null);
    }
    setFotoFile(null);
    setRemoveFoto(false);
    setErrorMessage(null);
  }, [petugasToEdit, isOpen]);

  // Lock body scroll when modal is open
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

  const handleFileSelect = (selectedFile: File) => {
    setErrorMessage(null);
    setFotoFile(selectedFile);
    setFotoPreview(URL.createObjectURL(selectedFile));
    setRemoveFoto(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleRemoveExistingFoto = () => {
    setFotoFile(null);
    setFotoPreview(null);
    setRemoveFoto(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedNip = nip.trim();
    const trimmedNama = nama.trim();

    if (!trimmedNip) {
      setErrorMessage("NIP petugas wajib diisi.");
      return;
    }
    if (!trimmedNama) {
      setErrorMessage("Nama lengkap petugas wajib diisi.");
      return;
    }

    const formData = new FormData();
    formData.append("nip", trimmedNip);
    formData.append("nama", trimmedNama);
    formData.append("telepon", telepon.trim());
    formData.append("jabatan", jabatan.trim());
    formData.append("layananId", layananId ? String(layananId) : "0");
    formData.append("isAktif", String(isAktif));

    if (fotoFile) {
      formData.append("fotoFile", fotoFile);
    }
    if (removeFoto) {
      formData.append("removeFoto", "true");
    }

    startTransition(async () => {
      if (isEditing && petugasToEdit) {
        const res = await updatePetugasAction(petugasToEdit.id, formData);
        if (res.success && res.data) {
          onSuccess(res.data as PetugasRecord);
          onClose();
        } else {
          setErrorMessage(res.error || "Gagal memperbarui data petugas.");
        }
      } else {
        const res = await createPetugasAction(formData);
        if (res.success && res.data) {
          onSuccess(res.data as PetugasRecord);
          onClose();
        } else {
          setErrorMessage(res.error || "Gagal menambahkan data petugas baru.");
        }
      }
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Fullscreen Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-md transition-opacity animate-fade-in"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 z-10 animate-fade-up my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-navy-900 dark:text-white font-brand">
                {isEditing ? "Edit Data Petugas" : "Tambah Petugas Baru"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing
                  ? `Memperbarui rincian profil ID #${petugasToEdit?.id}`
                  : "Mendaftarkan profil petugas pelayanan BBPOM Palembang"}
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
          {/* Section: Foto Petugas Dropzone / Avatar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Foto Profil Petugas
              </label>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-3 w-3" />
                <span>Auto-kompres ~200KB</span>
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/jpg"
              className="hidden"
              onChange={(e) => {
                const selected = e.target.files?.[0];
                if (selected) handleFileSelect(selected);
              }}
            />

            {fotoPreview ? (
              <div className="flex items-center gap-4 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-slate-200 border-2 border-white dark:border-slate-700 shadow-sm">
                  <Image
                    src={fotoPreview}
                    alt="Preview Foto"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-navy-900 dark:text-white truncate">
                    {fotoFile ? fotoFile.name : "Foto Petugas Tersimpan"}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {fotoFile ? "Berkas siap diunggah" : "Tersimpan di sistem"}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:text-brand-orange transition-colors cursor-pointer"
                    >
                      Ganti Foto
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveExistingFoto}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                    >
                      Hapus Foto
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex items-center gap-3.5 rounded-2xl border-2 border-dashed p-4 cursor-pointer transition-all ${
                  isDragging
                    ? "border-brand-orange bg-orange-50/40 dark:bg-orange-950/20"
                    : "border-slate-200 dark:border-slate-700 hover:border-brand-orange hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-500/15 text-brand-orange flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-navy-900 dark:text-white">
                    Pilih atau seret foto petugas ke sini
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Mendukung JPG, PNG, WEBP (opsional, maks ~200KB).
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Grid Dua Kolom: NIP & Nomor WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* NIP */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                NIP Pegawai <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={nip}
                  onChange={(e) => setNip(e.target.value.replace(/[^0-9\s.-]/g, ""))}
                  placeholder="Cth: 19850412 201001 1 002"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono font-bold text-navy-900 dark:text-white focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            </div>

            {/* Nomor WA */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Nomor WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={telepon}
                  onChange={(e) => setTelepon(e.target.value)}
                  placeholder="Cth: 081234567890"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-navy-900 dark:text-white focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Nama Lengkap */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Nama Lengkap Petugas <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Cth: Apt. Hendra Wijaya, S.Farm."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs sm:text-sm font-bold text-navy-900 dark:text-white focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>

          {/* Dropdown Pilihan Layanan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Penugasan Layanan
            </label>
            <div className="relative">
              <ClipboardList className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={layananId ? String(layananId) : ""}
                onChange={(e) => setLayananId(e.target.value ? Number(e.target.value) : null)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-navy-900 dark:text-white focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
              >
                <option value="">Semua Layanan / Petugas Umum</option>
                {layananOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    [{opt.kode}] {opt.nama}
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Tautkan petugas ini ke layanan tertentu atau pilih &apos;Semua Layanan&apos; jika bertugas umum.
            </p>
          </div>

          {/* Jabatan / Unit Kerja */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Jabatan / Unit Kerja
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={jabatan}
                onChange={(e) => setJabatan(e.target.value)}
                placeholder="Cth: Analis Pengujian Laboratorium Pangan & Bahan Berbahaya"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-navy-900 dark:text-white focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>

          {/* Status Aktif Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
            <div>
              <span className="block text-xs font-bold text-navy-900 dark:text-white">
                Status Petugas Aktif
              </span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                {isAktif
                  ? "Petugas aktif dan bertugas melayani masyarakat"
                  : "Petugas dinonaktifkan sementara"}
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
                  <span>{isEditing ? "Simpan Perubahan" : "Tambahkan Petugas"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
