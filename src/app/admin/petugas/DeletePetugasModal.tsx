"use client";

import React, { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  AlertTriangle,
  X,
  Trash2,
  Loader2,
  ShieldAlert,
  User,
} from "lucide-react";
import { deletePetugasAction, PetugasRecord } from "@/app/actions/admin-petugas";

interface DeletePetugasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (deletedId: number) => void;
  petugas: PetugasRecord | null;
}

export function DeletePetugasModal({
  isOpen,
  onClose,
  onSuccess,
  petugas,
}: DeletePetugasModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!isOpen || !petugas || !mounted) return null;

  const handleDelete = () => {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await deletePetugasAction(petugas.id);
      if (res.success) {
        onSuccess(petugas.id);
        onClose();
      } else {
        setErrorMessage(res.error || "Gagal menghapus data petugas.");
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
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 z-10 animate-fade-up my-auto">
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-500/15 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-900 dark:text-white font-brand">
                Hapus Data Petugas
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Konfirmasi penghapusan data dari sistem
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

        {errorMessage && (
          <div className="mt-4 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="mt-5 space-y-3.5">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Apakah Anda yakin ingin menghapus profil petugas berikut?
          </p>

          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700">
            {petugas.fotoUrl ? (
              <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                <Image
                  src={petugas.fotoUrl}
                  alt={petugas.nama}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 font-bold shrink-0">
                <User className="w-6 h-6 stroke-1.5" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-navy-900 dark:text-white truncate">
                {petugas.nama}
              </div>
              <div className="font-mono text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                NIP: {petugas.nip}
              </div>
              {petugas.jabatan && (
                <div className="text-[11px] text-brand-orange truncate mt-0.5">
                  {petugas.jabatan}
                </div>
              )}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
            Tindakan ini tidak dapat dibatalkan. Berkas foto profil dan seluruh data petugas akan dihapus permanen.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-5 mt-6 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Hapus Permanen</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
