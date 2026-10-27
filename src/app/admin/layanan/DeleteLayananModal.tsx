"use client";

import React, { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  X,
  Trash2,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { deleteLayananAction } from "@/app/actions/admin-layanan";
import { LayananItem } from "./LayananModal";

interface DeleteLayananModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (deletedId: number) => void;
  layanan: LayananItem | null;
}

export function DeleteLayananModal({
  isOpen,
  onClose,
  onSuccess,
  layanan,
}: DeleteLayananModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!isOpen || !layanan || !mounted) return null;

  const hasSubmissions = (layanan._count?.pengajuan ?? 0) > 0;

  const handleDelete = () => {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await deleteLayananAction(layanan.id);
      if (res.success) {
        onSuccess(layanan.id);
        onClose();
      } else {
        setErrorMessage(res.error || "Gagal menghapus layanan.");
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

      {/* Modal Dialog centered in screen */}
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 z-10 animate-fade-up my-auto">
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-500/15 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-900 dark:text-white font-brand">
                Hapus Data Layanan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Konfirmasi penghapusan layanan dari sistem
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

        <div className="mt-5 space-y-3">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Apakah Anda yakin ingin menghapus layanan:
          </p>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700">
            <div className="font-mono text-[11px] font-bold text-brand-orange uppercase">
              [{layanan.kode}]
            </div>
            <div className="text-sm font-bold text-navy-900 dark:text-white mt-0.5">
              {layanan.nama}
            </div>
          </div>

          {hasSubmissions ? (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-300 leading-relaxed space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Tidak Dapat Dihapus Langsung</span>
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                Layanan ini telah tercatat pada <strong>{layanan._count?.pengajuan} data permohonan</strong> pemohon. Demi menjaga integritas data riwayat publik, layanan yang sudah memiliki transaksi tidak dapat dihapus. Anda disarankan untuk <strong>menonaktifkan</strong> layanan tersebut.
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Tindakan ini tidak dapat dibatalkan. Layanan akan dihapus permanen dari daftar master data.
            </p>
          )}
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

          {!hasSubmissions && (
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
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
