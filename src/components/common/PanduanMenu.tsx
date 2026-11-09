"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, FileText } from "lucide-react";
import { PANDUAN_LIST } from "@/lib/panduan";

interface PanduanDropdownProps {
  /** Apakah menu Panduan sedang aktif (berada di halaman /panduan) */
  isActive?: boolean;
  /** Slug panduan yang sedang dibuka (untuk highlight item) */
  activeSlug?: string;
  onNavigate?: () => void;
}

/**
 * Menu dropdown "Panduan" untuk navigasi desktop.
 * Terbuka saat hover (perangkat dengan pointer) atau klik, tertutup saat klik di luar / tombol Escape.
 */
export function PanduanDropdown({ isActive = false, activeSlug, onNavigate }: PanduanDropdownProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setOpen(false), 150);
  };

  const highlighted = isActive || open;

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-current={isActive ? "page" : undefined}
        className={`font-brand inline-flex items-center gap-1 rounded-full px-4 xl:px-5 py-2 text-[13px] transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-brand-orange ${
          highlighted
            ? "bg-orange-tint text-brand-orange-600 font-bold dark:bg-orange-500/20 dark:text-orange-300 shadow-xs"
            : "text-navy-900 dark:text-slate-200 font-semibold hover:text-brand-orange"
        }`}
      >
        <span>Panduan</span>
        <ChevronDown
          className={`w-3.5 h-3.5 stroke-[2.5] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50">
          <div
            role="menu"
            aria-label="Daftar panduan"
            className="w-[360px] rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-2 shadow-[0_24px_48px_-16px_rgb(11_42_107/0.35)] animate-fade-up"
          >
            <div className="px-3 pt-2 pb-2.5 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-brand-orange dark:text-orange-400">
              <FileText className="w-3.5 h-3.5" />
              <span>Dokumen Panduan</span>
            </div>
            {PANDUAN_LIST.map((item) => {
              const Icon = item.icon;
              const itemActive = activeSlug === item.slug;
              return (
                <Link
                  key={item.slug}
                  href={`/panduan/${item.slug}`}
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    onNavigate?.();
                  }}
                  className={`group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                    itemActive
                      ? "bg-orange-tint dark:bg-orange-500/15"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/70"
                  }`}
                >
                  <span
                    className={`mt-0.5 w-9 h-9 shrink-0 rounded-xl flex items-center justify-center transition-colors ${
                      itemActive
                        ? "bg-gradient-to-br from-[#ff8a1f] to-[#f26a0f] text-white shadow-cta"
                        : "bg-orange-50 text-brand-orange dark:bg-orange-500/10 dark:text-orange-400 group-hover:bg-gradient-to-br group-hover:from-[#ff8a1f] group-hover:to-[#f26a0f] group-hover:text-white"
                    }`}
                  >
                    <Icon className="w-[18px] h-[18px]" />
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`block font-brand text-[13px] font-bold leading-snug ${
                        itemActive
                          ? "text-brand-orange-600 dark:text-orange-300"
                          : "text-navy-900 dark:text-white group-hover:text-brand-orange"
                      }`}
                    >
                      {item.label}
                    </span>
                    <span className="block text-[11.5px] leading-snug text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.shortDescription}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface PanduanMobileMenuProps {
  isActive?: boolean;
  activeSlug?: string;
  onNavigate?: () => void;
}

/**
 * Menu "Panduan" versi mobile (accordion) untuk drawer navigasi.
 */
export function PanduanMobileMenu({ isActive = false, activeSlug, onNavigate }: PanduanMobileMenuProps) {
  const [expanded, setExpanded] = useState(isActive);

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className={`font-brand w-full flex items-center justify-between px-4 py-2.5 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
          isActive
            ? "bg-orange-tint text-brand-orange-600 dark:bg-orange-500/20 dark:text-orange-300 font-bold"
            : "text-navy-900 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60"
        }`}
      >
        <span>Panduan</span>
        <ChevronDown
          className={`w-4 h-4 stroke-[2.5] transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="mt-1 ml-3 pl-3 border-l-2 border-orange-100 dark:border-orange-500/20 flex flex-col gap-0.5">
          {PANDUAN_LIST.map((item) => {
            const Icon = item.icon;
            const itemActive = activeSlug === item.slug;
            return (
              <Link
                key={item.slug}
                href={`/panduan/${item.slug}`}
                onClick={() => onNavigate?.()}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-semibold transition-colors ${
                  itemActive
                    ? "bg-orange-tint text-brand-orange-600 dark:bg-orange-500/15 dark:text-orange-300"
                    : "text-navy-900 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0 text-brand-orange dark:text-orange-400" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
