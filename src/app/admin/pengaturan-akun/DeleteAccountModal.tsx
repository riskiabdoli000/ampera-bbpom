"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Trash2,
  AlertTriangle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { deleteAccountAction, AdminAccountItem } from "@/app/actions/admin-account";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetAccount: AdminAccountItem | null;
  onSuccess: (message: string) => void;
}

export function DeleteAccountModal({
  isOpen,
  onClose,
  targetAccount,
  onSuccess,
}: DeleteAccountModalProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted || !targetAccount) return null;

  const handleDelete = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await deleteAccountAction({
        targetAdminId: targetAccount.id,
      });

      if (res.success) {
        onSuccess(res.message || "Akun berhasil dihapus.");
        onClose();
      } else {
        setErrorMsg(res.error || "Gagal menghapus akun.");
      }
    } catch {
      setErrorMsg("Terjadi gangguan koneksi saat menghapus akun.");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Fullscreen Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md rounded-3xl border border-[#e3ecfa] bg-white p-6 shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900 sm:p-7 z-10 animate-fade-up my-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0f2257] dark:text-white">
                Hapus Akun Operator
              </h3>
              <p className="text-xs text-[#7b8aa8] dark:text-slate-400">
                Konfirmasi penghapusan akun dari sistem
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="mt-4 space-y-3">
          <p className="text-xs text-[#5d6c8c] dark:text-slate-300">
            Apakah Anda yakin ingin menghapus akun operator ini secara permanen?
          </p>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="text-xs font-bold text-[#0f2257] dark:text-white">
              {targetAccount.nama}
            </div>
            <div className="text-[11px] text-[#7b8aa8]">
              Username: <span className="font-semibold text-slate-700 dark:text-slate-300">@{targetAccount.username}</span> • Role: {targetAccount.role}
            </div>
          </div>

          <p className="text-[11px] text-[#7b8aa8]">
            Catatan: Tindakan ini tidak dapat dibatalkan. Petugas tidak akan dapat lagi masuk ke dashboard admin.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-rose-500/20 transition hover:bg-rose-700 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Hapus Akun</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
