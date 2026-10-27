"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Sun, Moon, Bell, GraduationCap, User, LogOut } from "lucide-react";
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

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin keluar dari akun Cindo?")) {
      logoutCindoUser();
      router.push("/cindo/login");
    }
  };

  const iconBtn =
    "relative flex h-11 w-11 items-center justify-center rounded-xl border border-[#e3ecfa] bg-white text-[#0f2257] transition-colors hover:bg-orange-50 hover:text-brand-orange dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800";

  return (
    <header className="sticky top-0 z-30 flex h-[84px] w-full items-center justify-between gap-4 border-b border-[#e3ecfa] bg-[#f7faff]/90 px-4 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-950/80 sm:px-8">
      {/* Kiri: hamburger + Logo BPOM & Cindo Title */}
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
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold tracking-tight text-[#0f2257] dark:text-white sm:text-base md:text-lg">
                CINDO BBPOM
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-orange-100 border border-orange-200/80 px-2 py-0.5 text-[10px] font-black text-brand-orange dark:bg-orange-950/60 dark:text-orange-300">
                <GraduationCap className="h-3 w-3" /> E-Learning
              </span>
            </div>
            <span className="text-[11px] font-medium text-[#7b8aa8] dark:text-slate-400 sm:text-xs">
              Balai Besar POM di Palembang
            </span>
          </div>
        </div>
      </div>

      {/* Kanan */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          className={iconBtn}
          aria-label="Pemberitahuan"
          title="Notifikasi E-Learning"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          className={iconBtn}
          title={isDark ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
          aria-label="Ganti Tema"
        >
          {isDark ? (
            <Sun className="h-[18px] w-[18px] text-amber-400" />
          ) : (
            <Moon className="h-[18px] w-[18px]" />
          )}
        </button>

        {/* User Avatar & Info */}
        <Link
          href="/cindo/profile"
          title="Kelola Profil & Data Pengguna"
          className="ml-1 flex items-center gap-2.5 rounded-xl p-1 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/60"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange to-orange-600 text-sm font-bold text-white shadow ring-2 ring-white dark:ring-slate-800">
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

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className={`${iconBtn} text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/50`}
          title="Keluar / Logout Akun"
          aria-label="Keluar"
        >
          <LogOut className="h-[18px] w-[18px]" />
        </button>
      </div>
    </header>
  );
}
