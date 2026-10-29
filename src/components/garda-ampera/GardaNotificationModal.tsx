"use client";

import React, { useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X,
  Trash2,
  HelpCircle,
  RefreshCw,
} from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export interface ConfirmDialogConfig {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

/**
 * Toast Notifications Container
 * Menampilkan floating notification card di kanan atas layar dengan desain modern & profesional
 */
export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const duration = toast.duration || 4500;
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const config = {
    success: {
      bg: "bg-white dark:bg-slate-900",
      border: "border-emerald-500/40 dark:border-emerald-500/50",
      iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400",
      icon: <CheckCircle2 className="w-5 h-5 shrink-0" />,
      accent: "bg-emerald-500",
      textColor: "text-emerald-700 dark:text-emerald-300",
    },
    error: {
      bg: "bg-white dark:bg-slate-900",
      border: "border-rose-500/40 dark:border-rose-500/50",
      iconBg: "bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400",
      icon: <XCircle className="w-5 h-5 shrink-0" />,
      accent: "bg-rose-500",
      textColor: "text-rose-700 dark:text-rose-300",
    },
    warning: {
      bg: "bg-white dark:bg-slate-900",
      border: "border-amber-500/40 dark:border-amber-500/50",
      iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400",
      icon: <AlertTriangle className="w-5 h-5 shrink-0" />,
      accent: "bg-amber-500",
      textColor: "text-amber-700 dark:text-amber-300",
    },
    info: {
      bg: "bg-white dark:bg-slate-900",
      border: "border-blue-500/40 dark:border-blue-500/50",
      iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400",
      icon: <Info className="w-5 h-5 shrink-0" />,
      accent: "bg-blue-500",
      textColor: "text-blue-700 dark:text-blue-300",
    },
  }[toast.type];

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border ${config.border} ${config.bg} p-4 shadow-xl shadow-slate-900/10 dark:shadow-black/40 backdrop-blur-md transition-all duration-300 animate-slide-in-right hover:translate-y-[-2px]`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl shrink-0 ${config.iconBg}`}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0 pr-4">
          <h4 className="text-xs font-extrabold text-navy-900 dark:text-white leading-tight">
            {toast.title}
          </h4>
          {toast.message && (
            <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed break-words">
              {toast.message}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Tutup notifikasi"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Subtle indicator bar */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 opacity-75 ${config.accent}`} />
    </div>
  );
}

/**
 * Professional Confirm Dialog Modal
 * Pengganti window.confirm() bawaan browser dengan tampilan web modern dan ramah pengguna
 */
export function ConfirmDialogModal({
  config,
}: {
  config: ConfirmDialogConfig | null;
}) {
  if (!config || !config.isOpen) return null;

  const isDanger = config.type === "danger" || !config.type;
  const isWarning = config.type === "warning";

  const iconElement = isDanger ? (
    <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />
  ) : isWarning ? (
    <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
  ) : (
    <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
  );

  const iconBg = isDanger
    ? "bg-rose-100 dark:bg-rose-950/70 border-rose-200 dark:border-rose-900"
    : isWarning
    ? "bg-amber-100 dark:bg-amber-950/70 border-amber-200 dark:border-amber-900"
    : "bg-blue-100 dark:bg-blue-950/70 border-blue-200 dark:border-blue-900";

  const confirmBtnBg = isDanger
    ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30"
    : isWarning
    ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30"
    : "bg-navy-900 hover:bg-navy-800 text-white shadow-navy-900/30";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-scale-up"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${iconBg}`}
          >
            {iconElement}
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <h3 className="text-base font-extrabold text-navy-900 dark:text-white leading-snug">
              {config.title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {config.message}
            </p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={config.isLoading}
            onClick={config.onCancel}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            {config.cancelText || "Batal"}
          </button>
          <button
            type="button"
            disabled={config.isLoading}
            onClick={() => config.onConfirm()}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50 ${confirmBtnBg}`}
          >
            {config.isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Memproses...
              </>
            ) : (
              config.confirmText || (isDanger ? "Ya, Hapus Data" : "Ya, Lanjutkan")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
