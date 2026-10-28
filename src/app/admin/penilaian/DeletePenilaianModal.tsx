"use client";

import React, { useState, useTransition } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { PenilaianItem, deletePenilaianAction } from "@/app/actions/admin-penilaian";

interface DeletePenilaianModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: PenilaianItem | null;
  onSuccess: (deletedId: number) => void;
  onNotify: (type: "success" | "error", message: string) => void;
}

export function DeletePenilaianModal({
  isOpen,
  onClose,
  item,
  onSuccess,
  onNotify,
}: DeletePenilaianModalProps) {
  const [isPending, startTransition] = useTransition();

  if (!isOpen || !item) return null;

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deletePenilaianAction(item.id);
      if (res.success) {
        onNotify("success", res.message);
        onSuccess(item.id);
        onClose();
      } else {
        onNotify("error", res.message);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 animate-fade-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <h3 className="mt-4 text-lg font-black text-navy-900 dark:text-white font-brand">
            Hapus Data Penilaian?
          </h3>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
            Data evaluasi kepuasan masyarakat untuk nomor tiket{" "}
            <strong className="font-mono text-[#ff7a1a]">{item.pengajuan.kodePengajuan}</strong> (Pemohon:{" "}
            <strong className="text-slate-700 dark:text-slate-200">{item.pengajuan.tamu.nama}</strong>) akan dihapus secara permanen dari sistem.
          </p>

          <div className="mt-6 flex w-full items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-700 transition disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isPending ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" /> Ya, Hapus
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
