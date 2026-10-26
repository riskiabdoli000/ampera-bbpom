"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Menu, Sun, Moon, Bell, Mail, ChevronDown } from "lucide-react";

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
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#0b4fd1] to-[#2f86f6] text-sm font-bold text-white ring-2 ring-white dark:ring-slate-800">
            OP
          </div>
          <div className="hidden flex-col leading-tight md:flex">
            <span className="text-sm font-bold text-[#0f2257] dark:text-white">BBPOM Operator</span>
            <span className="text-xs text-[#7b8aa8]">operator@ampera.go.id</span>
          </div>
        </div>
      </div>
    </header>
  );
}
