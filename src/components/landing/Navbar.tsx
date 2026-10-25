"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sun, Moon, ArrowRight, Menu, X } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Beranda", href: "#", active: true },
  { label: "Profil", href: "#profil" },
  { label: "Layanan", href: "#layanan" },
  { label: "Informasi", href: "#informasi" },
  { label: "Berita", href: "#berita" },
  { label: "Kontak", href: "#kontak" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Inisialisasi tema saat pertama kali render
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    // Cek preferensi tersimpan di localStorage atau preferensi sistem secara asinkron
    const frame = requestAnimationFrame(() => {
      const savedTheme = localStorage.getItem("theme");
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
        setIsDark(true);
        document.documentElement.classList.add("dark");
      } else {
        setIsDark(false);
        document.documentElement.classList.remove("dark");
      }
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Fungsi toggle Mode Gelap / Terang
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

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 dark:bg-transparent backdrop-blur-md shadow-xs border-b border-slate-200/80 dark:border-transparent py-3 sm:py-3.5"
          : "bg-white/90 dark:bg-transparent backdrop-blur-md dark:backdrop-blur-none border-b border-slate-100/70 dark:border-transparent py-3.5 sm:py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Sisi Kiri: Logo Resmi BBPOM & Teks Identitas */}
          <Link
            href="/"
            className="flex items-center gap-2.5 sm:gap-3.5 group focus:outline-hidden"
            aria-label="Beranda BPOM Sumatera Selatan"
          >
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 shrink-0 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/assets-landingpage/logo-bpom-line.png"
                alt="Logo BPOM"
                fill
                sizes="52px"
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#0a3863] dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                BBPOM
              </span>
              <span className="font-semibold text-[10px] sm:text-[11px] tracking-wider text-[#0e4875] dark:text-teal-400 uppercase">
                Palembang
              </span>
            </div>
          </Link>

          {/* Sisi Tengah: Menu Navigasi Desktop dengan Garis Bawah di Bawah Teks */}
          <nav className="hidden lg:flex items-center gap-7 xl:gap-8">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`relative text-sm font-medium transition-colors duration-200 py-1 group ${
                  item.active
                    ? "text-[#003874] dark:text-white font-bold"
                    : "text-slate-600 dark:text-slate-300 hover:text-[#003874] dark:hover:text-white"
                }`}
              >
                <span>{item.label}</span>
                {/* Garis Bawah di Bawah Teks Navlink */}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 rounded-full transition-all duration-300 ${
                    item.active
                      ? "w-full bg-[#003874] dark:bg-white"
                      : "w-0 group-hover:w-full bg-[#003874]/60 dark:bg-white/60"
                  }`}
                />
              </a>
            ))}
          </nav>

          {/* Sisi Kanan: Theme Toggle & Tombol Pill CTA */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Tombol Toggle Mode Terang / Gelap */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full border border-slate-200/90 dark:border-white/15 bg-slate-50 dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 text-slate-700 dark:text-amber-400 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
              aria-label={isDark ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
              title={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 transition-transform duration-300 hover:-rotate-12" />
              )}
            </button>

            {/* Tombol CTA Kapsul Gelap dengan Lingkaran Panah */}
            <a
              href="#layanan"
              className="inline-flex items-center gap-3 pl-5 pr-2 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-[#0c385c] hover:bg-[#072640] dark:bg-teal-600 dark:hover:bg-teal-500 text-white shadow-sm hover:shadow-md transition-all duration-200 group active:scale-98 cursor-pointer"
            >
              <span>Layanan Kami</span>
              <span className="w-7 h-7 rounded-full bg-white text-[#0c385c] dark:bg-white dark:text-teal-700 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </span>
            </a>
          </div>

          {/* Mobile Actions: Theme Toggle & Hamburger Menu */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/10 text-slate-700 dark:text-amber-400 flex items-center justify-center transition-colors"
              aria-label={isDark ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/10 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/20 transition-colors"
              aria-label="Buka menu navigasi"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Card */}
        {mobileMenuOpen && (
          <div className="mt-3 lg:hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl p-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${
                    item.active
                      ? "bg-slate-100 dark:bg-slate-800 text-[#003874] dark:text-white font-bold border-b-2 border-[#003874] dark:border-white"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span>{item.label}</span>
                </a>
              ))}
            </nav>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              <a
                href="#layanan"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-between pl-5 pr-2 py-2.5 rounded-full text-sm font-semibold bg-[#0c385c] hover:bg-[#072640] dark:bg-teal-600 dark:hover:bg-teal-500 text-white shadow-xs transition-colors"
              >
                <span>Layanan Kami</span>
                <span className="w-7 h-7 rounded-full bg-white text-[#0c385c] dark:bg-white dark:text-teal-700 flex items-center justify-center shrink-0">
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

