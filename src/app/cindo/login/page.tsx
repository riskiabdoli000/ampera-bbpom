"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import {
  registerCindoUser,
  loginCindoUser,
  getCurrentCindoUser,
} from "@/data/cindo/cindoStorage";

export default function CindoAuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("register");

  // Form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg("Password dan Konfirmasi Password tidak cocok!");
      return;
    }

    setIsLoading(true);
    const res = registerCindoUser(username, password);
    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.message);
    } else {
      setSuccessMsg(res.message);
      // Auto switch to login or auto login
      setTimeout(() => {
        const loginRes = loginCindoUser(username, password);
        if (loginRes.success) {
          router.push("/cindo/profile");
        } else {
          setTab("login");
          setPassword("");
          setConfirmPassword("");
        }
      }, 800);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    setIsLoading(true);
    const res = loginCindoUser(username, password);
    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.message);
    } else {
      setSuccessMsg("Login berhasil! Mengalihkan ke halaman profil...");
      setTimeout(() => {
        router.push("/cindo/profile");
      }, 500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7faff] dark:bg-[#060c1d] px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <div className="flex items-center justify-center gap-3">
              <div className="relative h-12 w-12 sm:h-14 sm:w-14">
                <Image
                  src="/assets-landingpage/logo-bpom.png"
                  alt="Logo BPOM"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="text-left">
                <div className="text-xl sm:text-2xl font-black tracking-tight text-[#0b2a6b] dark:text-white">
                  AMPERA CINDO
                </div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  E-Learning BBPOM di Palembang
                </div>
              </div>
            </div>
          </Link>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 pt-2">
            Silakan registrasi atau masuk untuk mengakses materi dan asesmen mandiri.
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          {/* Form Title */}
          <div className="mb-6 text-center">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {tab === "register" ? "Registrasi Akun Baru" : "Masuk ke Akun Cindo"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {tab === "register"
                ? "Lengkapi form di bawah untuk membuat akun baru."
                : "Masukkan username dan password Anda untuk masuk."}
            </p>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-200 animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-200 animate-fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username Anda..."
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none transition-all focus:border-brand-orange focus:ring-1 focus:ring-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password Anda..."
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none transition-all focus:border-brand-orange focus:ring-1 focus:ring-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-orange to-orange-600 py-3 text-xs sm:text-sm font-bold text-white shadow-lg transition-all hover:from-orange-600 hover:to-orange-700 active:scale-95 disabled:opacity-50 mt-2"
              >
                <span>{isLoading ? "Memproses..." : "Masuk ke Cindo"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  Belum punya akun?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setTab("register");
                      setErrorMsg(null);
                    }}
                    className="font-bold text-brand-orange hover:underline"
                  >
                    Daftar di sini
                  </button>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: peserta123"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none transition-all focus:border-brand-orange focus:ring-1 focus:ring-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 4 karakter..."
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none transition-all focus:border-brand-orange focus:ring-1 focus:ring-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Konfirmasi Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password..."
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none transition-all focus:border-brand-orange focus:ring-1 focus:ring-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-orange to-orange-600 py-3 text-xs sm:text-sm font-bold text-white shadow-lg transition-all hover:from-orange-600 hover:to-orange-700 active:scale-95 disabled:opacity-50 mt-2"
              >
                <span>{isLoading ? "Mendaftarkan..." : "Daftar Akun Baru"}</span>
                <CheckCircle2 className="h-4 w-4" />
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  Sudah punya akun?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setTab("login");
                      setErrorMsg(null);
                    }}
                    className="font-bold text-brand-orange hover:underline"
                  >
                    Masuk di sini
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Back to Home Link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            ← Kembali ke Beranda Portal Ampera
          </Link>
        </div>
      </div>
    </div>
  );
}
