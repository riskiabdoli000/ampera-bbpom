"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sun, Moon, Menu, X, HelpCircle } from "lucide-react";

interface SubpageNavbarProps {
  activePage?: "beranda" | "layanan" | "edukasi" | "video" | "kontak";
}

export function SubpageNavbar({ activePage = "layanan" }: SubpageNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }

    return () => window.removeEventListener("scroll", handleScroll);
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

  const navItems = [
    { label: "Beranda", href: "/#beranda", key: "beranda" },
    { label: "Layanan", href: "/#layanan", key: "layanan" },
    { label: "Edukasi", href: "/#edukasi", key: "edukasi" },
    { label: "Video", href: "/#video", key: "video" },
    { label: "Kontak", href: "/#kontak", key: "kontak" },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/85 dark:bg-slate-900/85 backdrop-blur-md shadow-[0_8px_30px_-18px_rgb(11_42_107/0.3)] py-3"
          : "bg-white/40 dark:bg-slate-950/40 backdrop-blur-xs py-4 sm:py-5"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-14">
        <div className="relative flex items-center justify-between">
          {/* Logo BBPOM Palembang */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus:outline-hidden z-20"
            aria-label="Kembali ke Beranda AMPERA BBPOM Palembang"
          >
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 shrink-0 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/assets-landingpage/logo-bpom.png"
                alt="Logo BPOM"
                width={48}
                height={48}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-brand font-extrabold text-xl sm:text-2xl tracking-tight text-navy-900 dark:text-white">
                BBPOM
              </span>
              <span className="font-brand font-medium text-[11px] sm:text-xs text-brand-orange dark:text-orange-400 tracking-wide mt-0.5">
                Palembang • Portal AMPERA
              </span>
            </div>
          </Link>

          {/* Navigasi Utama */}
          <nav
            className="hidden lg:flex items-center gap-1.5 absolute left-1/2 -translate-x-1/2 z-10"
            aria-label="Navigasi halaman"
          >
            {navItems.map((item) => {
              const isActive = activePage === item.key;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`font-brand rounded-full px-5 py-2 text-[13px] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-brand-orange ${
                    isActive
                      ? "bg-[#fff0e5] text-[#f26a0f] font-bold dark:bg-orange-500/20 dark:text-orange-300 shadow-xs"
                      : "text-navy-900 dark:text-slate-200 font-semibold hover:text-brand-orange hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Kanan: Theme Toggle (Desktop) & Menu (Mobile) */}
          <div className="flex items-center gap-2.5 sm:gap-3 z-20">
            {/* Theme Toggle Button (Desktop) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="hidden lg:flex w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-navy-900 dark:text-yellow-400 items-center justify-center shadow-xs hover:border-brand-orange hover:scale-105 active:scale-95 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-brand-orange"
              aria-label={isDark ? "Ganti ke tema terang" : "Ganti ke tema gelap"}
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700 dark:text-slate-200" />}
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-navy-900 dark:text-white flex items-center justify-center shadow-sm active:scale-95 cursor-pointer focus-visible:outline-2 focus-visible:outline-brand-orange"
              aria-label="Buka menu navigasi"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 stroke-[2.2]" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mt-3 lg:hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-5 shadow-2xl animate-fade-up relative z-50">
            <nav className="flex flex-col gap-1.5" aria-label="Navigasi mobile">
              {navItems.map((item) => {
                const isActive = activePage === item.key;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`font-brand rounded-2xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-[#fff0e5] text-[#f26a0f] font-bold dark:bg-orange-500/20 dark:text-orange-300"
                        : "text-navy-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5">
                <Link
                  href="/#kontak"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff8a1f] to-[#f26a0f] py-3 text-sm font-bold text-white shadow-cta hover:shadow-orange-500/25 transition-all"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Pusat Bantuan BBPOM</span>
                </Link>

                {/* Night Mode Toggle */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-navy-900 dark:text-slate-100 transition-colors cursor-pointer hover:border-brand-orange"
                  aria-label={isDark ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
                >
                  <span className="flex items-center gap-2.5 text-xs font-semibold">
                    {isDark ? (
                      <Sun className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    )}
                    <span>{isDark ? "Mode Terang" : "Mode Gelap"}</span>
                  </span>
                  <div
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ${
                      isDark ? "bg-brand-orange" : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                        isDark ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </div>
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
