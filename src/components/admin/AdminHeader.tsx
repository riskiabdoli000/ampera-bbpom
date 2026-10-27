"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Menu, Sun, Moon, Bell, Mail, LogOut } from "lucide-react";
import { logoutAdminAction } from "@/app/actions/admin-auth";

interface AdminHeaderProps {
  onOpenSidebar: () => void;
}

export function AdminHeader({ onOpenSidebar }: AdminHeaderProps) {
  const [isDark, setIsDark] = useState(false);

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
    "relative flex h-11 w-11 items-center justify-center rounded-xl border border-[#e3ecfa] bg-white text-[#0f2257] transition-colors hover:bg-[#f1f6ff] hover:text-[#1664e8] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800";

  return (
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

        <button type="button" className={iconBtn} aria-label="Pemberitahuan" title="Pemberitahuan Sistem">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[#1664e8] ring-2 ring-white dark:ring-slate-900" />
        </button>

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

          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="flex h-10 items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/70 px-3 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 hover:text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/60"
              title="Keluar dari akun admin"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Keluar</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
