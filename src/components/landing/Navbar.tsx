"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sun, Moon, Menu, X, Globe, ArrowRight } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Beranda", href: "#beranda" },
  { label: "Layanan", href: "#layanan" },
  { label: "Edukasi", href: "#edukasi" },
  { label: "Video", href: "#video" },
  { label: "Kontak", href: "#kontak" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [activeSection, setActiveSection] = useState("#beranda");

  useEffect(() => {
    // Sinkronkan activeSection dengan hash URL saat pertama kali dimuat
    if (typeof window !== "undefined" && window.location.hash) {
      const currentHash = window.location.hash;
      if (NAV_ITEMS.some((item) => item.href === currentHash)) {
        setActiveSection(currentHash);
      }
    }

    const sectionIds = ["beranda", "layanan", "edukasi", "video", "kontak"];

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Cek jika sudah berada di dekat dasar halaman (section kontak)
      const isAtBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 80;

      if (isAtBottom) {
        setActiveSection("#kontak");
        return;
      }

      // Cek jika di paling atas halaman
      if (window.scrollY < 120) {
        setActiveSection("#beranda");
        return;
      }

      // Deteksi section aktif berdasarkan posisi scroll
      const scrollPosition = window.scrollY + 180;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(`#${sectionIds[i]}`);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

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

  const ctaClass =
    "group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#f26a0f] px-6 py-3 text-sm font-bold text-white shadow-cta transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-8px_rgb(255_122_26/0.65)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange";

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-[0_8px_30px_-18px_rgb(11_42_107/0.35)] py-3"
          : "bg-transparent py-5 sm:py-6"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-14">
        <div className="relative flex items-center justify-between">
          {/* Kiri: Logo */}
          <Link
            href="#beranda"
            onClick={() => setActiveSection("#beranda")}
            className="flex items-center gap-3 group focus:outline-hidden z-20"
            aria-label="Portal Layanan AMPERA BBPOM Palembang"
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

          {/* Tengah: Menu (desktop) */}
          <nav
            className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2 z-10"
            aria-label="Navigasi utama"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.href;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setActiveSection(item.href)}
                  aria-current={isActive ? "page" : undefined}
                  className={`font-brand rounded-full px-5 py-2 text-[13px] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-brand-orange ${
                    isActive
                      ? "bg-orange-tint text-brand-orange-600 font-bold dark:bg-orange-500/20 dark:text-orange-300 shadow-xs"
                      : "text-navy-900 dark:text-slate-200 font-semibold hover:text-brand-orange"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Kanan: CTA (desktop) / Hamburger (mobile) */}
          <div className="flex items-center gap-3 z-20">
            <a
              href="#layanan"
              onClick={() => setActiveSection("#layanan")}
              className={`${ctaClass} max-lg:hidden`}
            >
              <span>Akses Layanan</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </a>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-11 h-11 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-navy-900 dark:text-white flex items-center justify-center shadow-sm active:scale-95 cursor-pointer focus-visible:outline-2 focus-visible:outline-brand-orange"
              aria-label="Buka menu navigasi"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 stroke-[2.2]" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="mt-3 lg:hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-5 shadow-2xl animate-fade-up relative z-50">
            <nav className="flex flex-col gap-1" aria-label="Navigasi mobile">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.href;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => {
                      setActiveSection(item.href);
                      setMobileMenuOpen(false);
                    }}
                    aria-current={isActive ? "page" : undefined}
                    className={`font-brand px-4 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-orange-tint text-brand-orange-600 dark:bg-orange-500/20 dark:text-orange-300 font-bold"
                        : "text-navy-900 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>

            <a
              href="#layanan"
              onClick={() => {
                setActiveSection("#layanan");
                setMobileMenuOpen(false);
              }}
              className={`${ctaClass} w-full justify-center mt-4`}
            >
              <span>Akses Layanan</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <div className="mt-4 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-navy-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 rounded-full">
                <Globe className="w-3.5 h-3.5" />
                <span>ID</span>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center cursor-pointer active:scale-95"
                aria-label={isDark ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-navy-900" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
