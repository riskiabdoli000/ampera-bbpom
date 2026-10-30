"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, Sun, Moon, Bell, LogOut, Clock, ArrowRight, CheckCircle2, AlertTriangle, X, Loader2 } from "lucide-react";
import { logoutAdminAction } from "@/app/actions/admin-auth";
import type { AdminNotificationItem } from "@/app/actions/data-ampera";

interface AdminHeaderProps {
  onOpenSidebar: () => void;
  todayWaitingCount?: number;
  todayWaitingItems?: AdminNotificationItem[];
}

export function AdminHeader({
  onOpenSidebar,
  todayWaitingCount = 0,
  todayWaitingItems = [],
}: AdminHeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isLoggingOut, startLogoutTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tutup modal konfirmasi logout saat menekan tombol Escape
  useEffect(() => {
    if (!logoutModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoggingOut) {
        setLogoutModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [logoutModalOpen, isLoggingOut]);

  const handleConfirmLogout = () => {
    startLogoutTransition(async () => {
      await logoutAdminAction();
    });
  };

  // Inisialisasi tema dark mode berdasarkan localStorage atau preferensi sistem
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Tutup dropdown notifikasi saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifOpen]);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const iconBtn =
    "relative flex h-11 w-11 items-center justify-center rounded-xl border border-[#e3ecfa] bg-white text-[#0f2257] transition-colors hover:bg-[#f1f6ff] hover:text-[#1664e8] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer";

  return (
    <>
      <header className="sticky top-0 z-30 flex h-[84px] w-full items-center justify-between gap-4 border-b border-[#e3ecfa] bg-[#f7faff]/90 px-4 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-950/80 sm:px-8">
      {/* Kiri: hamburger + Logo BPOM & Nama Instansi */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onOpenSidebar}
          className={`${iconBtn} lg:hidden`}
          aria-label="Buka Menu Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 sm:h-11 sm:w-11">
            <Image
              src="/assets-landingpage/logo-bpom.png"
              alt="Logo BPOM"
              width={44}
              height={44}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-extrabold tracking-tight text-[#0f2257] dark:text-white sm:text-base md:text-lg">
              AMPERA BBPOM
            </span>
            <span className="text-[11px] font-medium text-[#7b8aa8] dark:text-slate-400 sm:text-xs">
              Balai Besar POM Palembang
            </span>
          </div>
        </div>
      </div>

      {/* Kanan */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Bell Notification Button + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setNotifOpen((prev) => !prev)}
            className={iconBtn}
            aria-label="Pemberitahuan"
            title="Pemberitahuan Layanan Baru Hari Ini"
          >
            <Bell className="h-[18px] w-[18px]" />
            {todayWaitingCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-extrabold leading-none text-white shadow-sm ring-2 ring-white dark:ring-slate-900 animate-pulse">
                {todayWaitingCount > 99 ? "99+" : todayWaitingCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-2xl border border-[#e3ecfa] bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden z-50">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-[#f7faff] dark:bg-slate-800/60 px-4 py-3">
                <div>
                  <h4 className="text-xs font-extrabold text-[#0f2257] dark:text-white">
                    Notifikasi Layanan Hari Ini
                  </h4>
                  <p className="text-[11px] text-[#7b8aa8] dark:text-slate-400">
                    Menunggu verifikasi petugas (reset setiap ganti hari)
                  </p>
                </div>
                {todayWaitingCount > 0 && (
                  <span className="rounded-full bg-red-100 dark:bg-red-950/60 px-2.5 py-0.5 text-[11px] font-extrabold text-red-600 dark:text-red-400">
                    {todayWaitingCount} Baru
                  </span>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {todayWaitingItems.length === 0 ? (
                  <div className="p-6 text-center space-y-2">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-bold text-[#0f2257] dark:text-slate-200">
                      Tidak Ada Antrean Baru Hari Ini
                    </p>
                    <p className="text-[11px] text-[#7b8aa8] dark:text-slate-400">
                      Seluruh pengajuan layanan hari ini telah ditindaklanjuti atau belum ada pendaftaran baru.
                    </p>
                  </div>
                ) : (
                  todayWaitingItems.map((item) => {
                    const timeStr = new Date(item.createdAt).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setNotifOpen(false)}
                        className="flex items-start justify-between gap-3 p-3.5 hover:bg-[#f1f6ff]/70 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="inline-block h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 truncate">
                              {item.layananNama}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-[#0f2257] dark:text-white truncate">
                            {item.tamuNama}{" "}
                            <span className="font-mono text-[11px] font-normal text-slate-500 dark:text-slate-400">
                              (#{item.kodePengajuan})
                            </span>
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-[#7b8aa8] dark:text-slate-400">
                            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                              <Clock className="h-3 w-3" />
                              Menunggu Verifikasi
                            </span>
                            <span>•</span>
                            <span>Pukul {timeStr} WIB</span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400 shrink-0 mt-1" />
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className={iconBtn}
          title={isDark ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
          aria-label="Ganti Tema"
        >
          {isDark ? <Sun className="h-[18px] w-[18px] text-amber-400" /> : <Moon className="h-[18px] w-[18px]" />}
        </button>

        <div className="ml-1 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0b4fd1] to-[#2f86f6] text-xs font-bold text-white shadow-sm ring-1 ring-white/20">
            ADM
          </div>
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="text-xs font-bold text-[#0f2257] dark:text-white">Admin BBPOM</span>
            <span className="text-[10px] text-[#7b8aa8]">Petugas Terverifikasi</span>
          </div>

          <button
            type="button"
            onClick={() => setLogoutModalOpen(true)}
            className="flex h-10 items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/70 px-3 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 hover:text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/60 cursor-pointer"
            title="Keluar dari akun admin"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Keluar</span>
          </button>
        </div>
      </div>
      </header>

      {/* Pop-up Modal Konfirmasi Logout */}
      {logoutModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#06132f]/60 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => {
            if (!isLoggingOut) setLogoutModalOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-modal-title"
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#e3ecfa] bg-white p-6 shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              disabled={isLoggingOut}
              onClick={() => setLogoutModalOpen(false)}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
              aria-label="Tutup"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-8 ring-red-50/60 dark:bg-red-950/60 dark:text-red-400 dark:ring-red-950/30">
                <AlertTriangle className="h-7 w-7" />
              </div>

              <h3
                id="logout-modal-title"
                className="text-lg font-extrabold text-[#0f2257] dark:text-white"
              >
                Konfirmasi Keluar Akun
              </h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#5d6c8c] dark:text-slate-400">
                Apakah Anda yakin ingin keluar dari sesi <strong className="text-[#0f2257] dark:text-slate-200">Admin AMPERA BBPOM</strong>? Anda harus login kembali untuk mengakses halaman pengelolaan.
              </p>

              <div className="mt-6 flex w-full items-center gap-3">
                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={() => setLogoutModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-xs sm:text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={handleConfirmLogout}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 px-4 text-xs sm:text-sm font-bold text-white shadow-md shadow-red-600/25 transition-all hover:bg-red-700 disabled:opacity-60 cursor-pointer"
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Keluar...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4" />
                      <span>Ya, Keluar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
