"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Smartphone,
  KeyRound,
  RotateCcw,
} from "lucide-react";
import {
  requestAdminResetOtpAction,
  verifyAdminResetOtpAction,
  resetAdminPasswordWithOtpAction,
} from "@/app/actions/admin-forgot-password";

interface AdminForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newUsername?: string) => void;
  initialUsername?: string;
}

export function AdminForgotPasswordModal({
  isOpen,
  onClose,
  onSuccess,
  initialUsername = "",
}: AdminForgotPasswordModalProps) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [username, setUsername] = useState(initialUsername);
  const [maskedPhone, setMaskedPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update initial username if modal opened with pre-filled value
  useEffect(() => {
    if (initialUsername) {
      setUsername(initialUsername);
    }
  }, [initialUsername]);

  // Resend OTP countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Reset form when modal closes or opens
  const handleClose = () => {
    setErrorMsg(null);
    setLoading(false);
    onClose();
    setTimeout(() => {
      setStep(1);
      setOtp("");
      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");
    }, 300);
  };

  // Step 1: Request OTP
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const cleanUser = username.trim();
    if (!cleanUser) {
      setErrorMsg("Silakan masukkan username akun Anda.");
      return;
    }

    setLoading(true);
    try {
      const res = await requestAdminResetOtpAction(cleanUser);
      if (res.success && res.data) {
        setMaskedPhone(res.data.maskedPhone);
        setStep(2);
        setResendCooldown(60); // 60s cooldown
      } else {
        setErrorMsg(res.error || "Gagal memproses permintaan reset.");
      }
    } catch {
      setErrorMsg("Terjadi gangguan koneksi ke server. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanOtp = otp.trim().replace(/[^0-9]/g, "");
    if (!cleanOtp || cleanOtp.length !== 6) {
      setErrorMsg("Masukkan 6-digit kode verifikasi OTP.");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyAdminResetOtpAction({
        username: username.trim(),
        otp: cleanOtp,
      });

      if (res.success && res.data) {
        setResetToken(res.data.resetToken);
        setStep(3);
      } else {
        setErrorMsg(res.error || "Kode OTP tidak sesuai.");
      }
    } catch {
      setErrorMsg("Gagal memverifikasi OTP. Cek koneksi Anda.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword.length < 6) {
      setErrorMsg("Kata sandi baru minimal harus 6 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      const res = await resetAdminPasswordWithOtpAction({
        username: username.trim(),
        resetToken,
        newPassword,
        confirmPassword,
      });

      if (res.success) {
        setStep(4);
      } else {
        setErrorMsg(res.error || "Gagal mereset kata sandi.");
      }
    } catch {
      setErrorMsg("Gagal menyimpan kata sandi baru.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          handleClose();
        }
      }}
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
        {/* Header Ribbon / Pattern */}
        <div className="bg-[#0e3a8c] p-6 text-white relative">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
              {step === 1 && <KeyRound className="w-5 h-5 text-amber-300" />}
              {step === 2 && <Smartphone className="w-5 h-5 text-emerald-300" />}
              {step === 3 && <Lock className="w-5 h-5 text-blue-300" />}
              {step === 4 && <ShieldCheck className="w-5 h-5 text-emerald-300" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {step === 1 && "Lupa Kata Sandi"}
                {step === 2 && "Verifikasi Kode OTP"}
                {step === 3 && "Kata Sandi Baru"}
                {step === 4 && "Reset Berhasil"}
              </h3>
              <p className="text-xs text-blue-200 mt-0.5">
                {step === 1 && "Langkah 1 dari 3: Masukkan Username"}
                {step === 2 && "Langkah 2 dari 3: Masukkan Kode WA"}
                {step === 3 && "Langkah 3 dari 3: Buat Kata Sandi Baru"}
                {step === 4 && "Kata sandi telah berhasil diperbarui"}
              </p>
            </div>
          </div>

          {/* Stepper Dots */}
          {step < 4 && (
            <div className="flex items-center gap-2 mt-4">
              <div
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  step >= 1 ? "bg-amber-400" : "bg-white/20"
                }`}
              />
              <div
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  step >= 2 ? "bg-amber-400" : "bg-white/20"
                }`}
              />
              <div
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  step >= 3 ? "bg-amber-400" : "bg-white/20"
                }`}
              />
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {/* STEP 1: Input Username */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <p className="text-xs text-gray-600 leading-relaxed">
                Masukkan username akun petugas Anda. Sistem akan mengirimkan kode verifikasi 6-digit ke nomor WhatsApp yang terdaftar pada akun ini.
              </p>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Username Akun
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: admin atau nama pengguna"
                    className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !username.trim()}
                  className="w-full py-2.5 px-4 bg-[#0e3a8c] hover:bg-blue-800 disabled:bg-blue-300 text-white font-medium text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memeriksa Akun & Mengirim OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Kirim Kode OTP via WhatsApp</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-xs text-gray-500 hover:text-gray-800 font-medium"
                >
                  Kembali ke Form Login
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Input OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center p-3 rounded-2xl bg-blue-50/70 border border-blue-100">
                <p className="text-xs text-gray-600">
                  Kode 6 digit telah dikirim ke nomor WhatsApp:
                </p>
                <p className="text-sm font-bold text-[#0e3a8c] mt-0.5">
                  {maskedPhone || "Nomor Terdaftar"}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 text-center">
                  Masukkan 6-Digit Kode Verifikasi
                </label>
                <div className="flex justify-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      if (val.length <= 6) setOtp(val);
                    }}
                    placeholder="• • • • • •"
                    className="w-52 py-3 px-4 bg-gray-50 border-2 border-blue-200 rounded-2xl text-gray-900 text-2xl font-mono font-bold tracking-[0.4em] text-center focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all outline-none"
                    autoFocus
                    required
                  />
                </div>
                <p className="text-[11px] text-gray-400 text-center mt-1.5">
                  Kode OTP berlaku selama 10 menit
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || otp.trim().length !== 6}
                  className="w-full py-2.5 px-4 bg-[#0e3a8c] hover:bg-blue-800 disabled:bg-blue-300 text-white font-medium text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memverifikasi Kode OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Verifikasi & Lanjutkan</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Kirim Ulang OTP */}
              <div className="text-center pt-2">
                {resendCooldown > 0 ? (
                  <p className="text-xs text-gray-400">
                    Kirim ulang kode dalam <span className="font-bold text-gray-600">{resendCooldown}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRequestOtp()}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 text-xs text-[#0e3a8c] hover:text-blue-800 font-bold disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Kirim Ulang Kode OTP</span>
                  </button>
                )}
              </div>
            </form>
          )}

          {/* STEP 3: Input Password Baru */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-xs text-gray-600 leading-relaxed">
                Kode OTP cocok! Silakan buat kata sandi baru untuk akun Anda (minimal 6 karakter).
              </p>

              {/* Kata Sandi Baru */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="block w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Kata Sandi Baru */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Ulangi Kata Sandi Baru
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang kata sandi baru"
                    className="block w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Match indicator */}
              {newPassword && confirmPassword && (
                <div className="text-[11px] font-medium">
                  {newPassword === confirmPassword ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Kata sandi cocok
                    </span>
                  ) : (
                    <span className="text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Konfirmasi kata sandi belum sama
                    </span>
                  )}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={
                    loading ||
                    newPassword.length < 6 ||
                    newPassword !== confirmPassword
                  }
                  className="w-full py-2.5 px-4 bg-[#0e3a8c] hover:bg-blue-800 disabled:bg-blue-300 text-white font-medium text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan Kata Sandi...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Simpan Kata Sandi Baru</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Success View */}
          {step === 4 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-sm animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-gray-900">
                  Kata Sandi Berhasil Diperbarui!
                </h4>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  Akun <strong className="text-gray-800">@{username}</strong> siap digunakan. Silakan masuk kembali dengan kata sandi baru Anda.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onSuccess(username);
                    handleClose();
                  }}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <span>Masuk Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

