"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  UserPlus,
  Lock,
  User,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { createOperatorAccountAction } from "@/app/actions/admin-account";

interface CreateOperatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  isSuperadmin: boolean;
}

export function CreateOperatorModal({
  isOpen,
  onClose,
  onSuccess,
  isSuperadmin,
}: CreateOperatorModalProps) {
  const [mounted, setMounted] = useState(false);
  const [nama, setNama] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"OPERATOR" | "SUPERADMIN">("OPERATOR");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!nama.trim()) {
      setErrorMsg("Nama lengkap operator wajib diisi.");
      return;
    }
    if (!username.trim()) {
      setErrorMsg("Username akun wajib diisi.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Kata sandi minimal harus 6 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      const res = await createOperatorAccountAction({
        nama,
        username,
        password,
        confirmPassword,
        role,
      });

      if (res.success) {
        onSuccess(res.message || "Akun operator berhasil dibuat.");
        handleClose();
      } else {
        setErrorMsg(res.error || "Gagal membuat akun.");
      }
    } catch {
      setErrorMsg("Terjadi gangguan koneksi ke server.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNama("");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setRole("OPERATOR");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setErrorMsg(null);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Fullscreen Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={handleClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg rounded-3xl border border-[#e3ecfa] bg-white p-6 shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900 sm:p-8 z-10 animate-fade-up my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#1664e8] to-[#408bff] text-white shadow-md shadow-blue-500/20">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0f2257] dark:text-white">
                Tambah Akun Operator
              </h3>
              <p className="text-xs text-[#7b8aa8] dark:text-slate-400">
                Buat kredensial akses baru untuk staf / petugas BBPOM
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Nama Lengkap */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#0f2257] dark:text-slate-200">
              Nama Lengkap Petugas <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7b8aa8]" />
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Rahmat Hidayat, S.Farm"
                className="w-full rounded-xl border border-[#e3ecfa] bg-slate-50/60 py-2.5 pl-10 pr-4 text-xs font-medium text-[#0f2257] transition focus:border-[#1664e8] focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/60 dark:text-white dark:focus:bg-slate-900"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#0f2257] dark:text-slate-200">
              Username <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#7b8aa8]">
                @
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                placeholder="operator_rahmat"
                className="w-full rounded-xl border border-[#e3ecfa] bg-slate-50/60 py-2.5 pl-9 pr-4 text-xs font-medium text-[#0f2257] transition focus:border-[#1664e8] focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/60 dark:text-white dark:focus:bg-slate-900"
              />
            </div>
            <p className="mt-1 text-[11px] text-[#7b8aa8]">
              Digunakan saat login. Huruf kecil, angka, garis bawah, tanpa spasi.
            </p>
          </div>

          {/* Role Pilihan (Hanya jika Superadmin) */}
          {isSuperadmin && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#0f2257] dark:text-slate-200">
                Tingkat Wewenang (Role)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("OPERATOR")}
                  className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition ${
                    role === "OPERATOR"
                      ? "border-[#1664e8] bg-blue-50/60 text-[#1664e8] ring-1 ring-[#1664e8] dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-300"
                      : "border-[#e3ecfa] bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300"
                  }`}
                >
                  <User className="h-4 w-4 shrink-0" />
                  <div>
                    <div className="text-xs font-bold">Operator</div>
                    <div className="text-[10px] text-slate-500">Akses Verifikasi Layanan</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("SUPERADMIN")}
                  className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition ${
                    role === "SUPERADMIN"
                      ? "border-purple-600 bg-purple-50/60 text-purple-700 ring-1 ring-purple-600 dark:border-purple-500 dark:bg-purple-950/40 dark:text-purple-300"
                      : "border-[#e3ecfa] bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300"
                  }`}
                >
                  <Shield className="h-4 w-4 shrink-0" />
                  <div>
                    <div className="text-xs font-bold">Superadmin</div>
                    <div className="text-[10px] text-slate-500">Akses Penuh Sistem</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Kata Sandi Awal */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#0f2257] dark:text-slate-200">
              Kata Sandi Awal <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7b8aa8]" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full rounded-xl border border-[#e3ecfa] bg-slate-50/60 py-2.5 pl-10 pr-10 text-xs font-medium text-[#0f2257] transition focus:border-[#1664e8] focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/60 dark:text-white dark:focus:bg-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Konfirmasi Kata Sandi */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#0f2257] dark:text-slate-200">
              Ulangi Kata Sandi <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7b8aa8]" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ketik ulang kata sandi di atas"
                className="w-full rounded-xl border border-[#e3ecfa] bg-slate-50/60 py-2.5 pl-10 pr-10 text-xs font-medium text-[#0f2257] transition focus:border-[#1664e8] focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/60 dark:text-white dark:focus:bg-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1664e8] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition hover:bg-[#1253c4] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Simpan Akun Operator</span>
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
