"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Sun, Moon, Bell, User, LogOut, ChevronRight, X, CheckCircle2, BookOpen } from "lucide-react";
import { getSesiCindo, getCurrentCindoUser, logoutCindoUser } from "@/data/cindo/cindoStorage";

interface CindoHeaderProps {
  onOpenSidebar: () => void;
}

export function CindoHeader({ onOpenSidebar }: CindoHeaderProps) {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [displayName, setDisplayName] = useState<string>("Peserta");
  const [initials, setInitials] = useState<string>("CP");
  const [progressLabel, setProgressLabel] = useState<string>("E-Learning Peserta");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

    const user = getCurrentCindoUser();
    const sesi = getSesiCindo();

    const name = sesi?.peserta?.nama || user?.username || "Peserta";
    setDisplayName(name);

    const parts = name.trim().split(" ");
    const ini =
      parts.length > 1
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : parts[0].slice(0, 2).toUpperCase();
    setInitials(ini);

    if (sesi?.postTest?.isPassed) {
      setProgressLabel("Lulus Bersertifikat ⭐");
    } else if (sesi?.preTest?.completed) {
      setProgressLabel("Sedang Membaca Materi");
    } else if (sesi?.peserta) {
      setProgressLabel("Siap Mengisi Pre-Test");
    } else {
      setProgressLabel("Belum Lengkapi Data");
    }
  }, []);

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

  const handleConfirmLogout = () => {
    logoutCindoUser();
    setShowLogoutModal(false);
    router.push("/");
  };

  const iconBtn =
    "relative flex h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 items-center justify-center rounded-lg sm:rounded-xl border border-[#e3ecfa] bg-white text-[#0f2257] transition-colors hover:bg-orange-50 hover:text-brand-orange dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 shrink-0";

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const profileMenuRef = React.useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 sm:h-16 lg:h-20 w-full items-center justify-between gap-2 sm:gap-4 border-b border-[#e3ecfa] bg-[#f7faff]/90 px-3 sm:px-6 lg:px-8 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-950/80">
      {/* Kiri: hamburger + Logo BPOM & Cindo Title */}
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0">
        <button
          type="button"
          onClick={onOpenSidebar}
          className={`${iconBtn} lg:hidden`}
          aria-label="Buka Menu Sidebar"
        >
          <Menu className="h-4 w-4 sm:h-4.5 sm:w-4.5 lg:h-5 lg:w-5" />
        </button>

        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="relative h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 shrink-0">
            <Image
              src="/assets-landingpage/logo-bpom.png"
              alt="Logo BPOM"
              width={40}
              height={40}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div className="flex flex-col min-w-0 leading-tight">
            <span className="text-xs sm:text-sm lg:text-base font-black tracking-tight text-[#0f2257] dark:text-white whitespace-nowrap">
              CINDO BBPOM
            </span>
            <span className="text-[9px] sm:text-[11px] lg:text-xs font-medium text-[#7b8aa8] dark:text-slate-400 whitespace-nowrap truncate">
              Balai Besar POM di Palembang
            </span>
          </div>
        </div>
      </div>

      {/* Kanan */}
      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 shrink-0">
        {/* Notifikasi - Tampil hanya di desktop (sm ke atas) */}
        <button
          type="button"
          onClick={() => setShowNotificationModal(true)}
          className={`${iconBtn} hidden sm:flex`}
          aria-label="Pemberitahuan"
          title="Notifikasi E-Learning"
        >
          <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-[18px] lg:w-[18px]" />
          <span className="absolute right-1 top-1 sm:right-1.5 sm:top-1.5 lg:right-2 lg:top-2 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500 ring-1.5 sm:ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* Theme Toggle - Tampil hanya di desktop (sm ke atas) */}
        <button
          type="button"
          onClick={toggleTheme}
          className={`${iconBtn} hidden sm:flex`}
          title={isDark ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
          aria-label="Ganti Tema"
        >
          {isDark ? (
            <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-[18px] lg:w-[18px] text-amber-400" />
          ) : (
            <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-[18px] lg:w-[18px]" />
          )}
        </button>

        {/* User Avatar & Dropdown */}
        <div className="relative" ref={profileMenuRef}>
          {/* Mobile Profile Trigger Button */}
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
            aria-expanded={isProfileMenuOpen}
            aria-label="Menu Profil Pengguna"
            title="Buka Menu Profil & Pengaturan"
            className="flex sm:hidden items-center rounded-full p-0.5 transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-orange"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange to-orange-600 text-xs font-bold text-white shadow ring-2 ring-white dark:ring-slate-800 shrink-0">
              {initials}
            </div>
          </button>

          {/* Desktop User Avatar & Info Link */}
          <Link
            href="/cindo/profile"
            title="Kelola Profil & Data Pengguna"
            className="hidden sm:flex items-center gap-2 rounded-xl p-0.5 sm:p-1 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/60 shrink-0"
          >
            <div className="flex sm:h-9 sm:w-9 lg:h-10 lg:w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange to-orange-600 text-sm font-bold text-white shadow ring-2 ring-white dark:ring-slate-800 shrink-0">
              {initials}
            </div>
            <div className="hidden flex-col leading-tight md:flex text-left">
              <span className="text-sm font-bold text-[#0f2257] dark:text-white max-w-[130px] truncate">
                {displayName}
              </span>
              <span className="text-[10px] font-semibold text-brand-orange dark:text-orange-400">
                {progressLabel}
              </span>
            </div>
          </Link>

          {/* Dropdown Menu Versi Mobile */}
          {isProfileMenuOpen && (
            <>
              {/* Overlay Backdrop Mobile */}
              <div
                className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[1px] sm:hidden"
                onClick={() => setIsProfileMenuOpen(false)}
                aria-hidden="true"
              />

              {/* Popup Dropdown Kecil & Sederhana */}
              <div className="absolute -right-11 top-full mt-2 w-44 sm:hidden z-50 rounded-xl border border-slate-200/80 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
                <div className="space-y-0.5">
                  {/* 1. Profile */}
                  <Link
                    href="/cindo/profile"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <User className="h-4 w-4 text-brand-orange shrink-0" />
                    <span>Profile</span>
                  </Link>

                  {/* 2. Icon Lonceng (Notifikasi) */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setShowNotificationModal(true);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <div className="flex items-center gap-2.5">
                      <Bell className="h-4 w-4 text-blue-500 shrink-0" />
                      <span>Notifikasi</span>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                  </button>

                  {/* 3. Night Mode */}
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <div className="flex items-center gap-2.5">
                      {isDark ? (
                        <Sun className="h-4 w-4 text-amber-400 shrink-0" />
                      ) : (
                        <Moon className="h-4 w-4 text-slate-600 dark:text-slate-400 shrink-0" />
                      )}
                      <span>{isDark ? "Mode Terang" : "Mode Gelap"}</span>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className={`${iconBtn} text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/50`}
          title="Keluar / Logout Akun"
          aria-label="Keluar"
        >
          <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-[18px] lg:w-[18px]" />
        </button>
      </div>
    </header>

    {/* Logout Confirmation Modal */}
    {showLogoutModal && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        onClick={() => setShowLogoutModal(false)}
      >
        <div
          className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/70 dark:text-rose-400">
              <LogOut className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Konfirmasi Keluar Akun
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Apakah Anda yakin ingin keluar dari akun Cindo? Anda akan dialihkan kembali ke Beranda Ampera BBPOM.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowLogoutModal(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              Tidak
            </button>
            <button
              type="button"
              onClick={handleConfirmLogout}
              className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 active:scale-95 transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span>Ya, Keluar</span>
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Notification Modal */}
    {showNotificationModal && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        onClick={() => setShowNotificationModal(false)}
      >
        <div
          className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-[#0b4fd1] dark:bg-blue-950/60 dark:text-blue-400">
                <Bell className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Notifikasi Pembelajaran
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Update aktivitas & status e-learning
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowNotificationModal(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-3 dark:border-blue-900/30 dark:bg-blue-950/30">
              <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Materi E-Learning Siap Diakses
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                  Modul digital siap dipelajari mandiri untuk menambah wawasan keamanan pangan.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 dark:border-emerald-900/30 dark:bg-emerald-950/30">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Status: {progressLabel}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                  Halo {displayName}, lanjutkan progres pembelajaran untuk menyelesaikan pelatihan.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowNotificationModal(false)}
              className="w-full rounded-xl bg-[#0f2257] py-2 text-xs font-bold text-white hover:bg-[#0b1a44] dark:bg-brand-orange dark:hover:bg-orange-600 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
}
