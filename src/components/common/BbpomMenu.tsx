"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Building2,
  Globe,
  Landmark,
  ExternalLink,
  Link2,
  LucideIcon,
} from "lucide-react";
import { getPublicBbpomTautanListAction } from "@/app/actions/settings-bbpom";

export interface BbpomExternalLinkItem {
  id: number | string;
  label: string;
  shortDescription: string;
  href: string;
  iconName?: string;
  badge?: string | null;
}

export const BBPOM_EXTERNAL_LINKS: BbpomExternalLinkItem[] = [
  {
    id: 1,
    label: "Badan POM RI (Pusat)",
    shortDescription: "Portal Resmi Badan Pengawas Obat dan Makanan RI",
    href: "https://www.pom.go.id",
    iconName: "globe",
    badge: "Pusat",
  },
  {
    id: 2,
    label: "BBPOM di Palembang",
    shortDescription: "Portal Resmi Balai Besar POM di Palembang",
    href: "https://palembang.pom.go.id",
    iconName: "landmark",
    badge: "Sumsel",
  },
];

const ICON_MAP: Record<string, LucideIcon> = {
  globe: Globe,
  landmark: Landmark,
  building: Building2,
  link: Link2,
};

function resolveIcon(name?: string | null): LucideIcon {
  if (!name) return Globe;
  return ICON_MAP[name.toLowerCase()] || Globe;
}

// Module-level in-memory cache to share across desktop & mobile navbar instances
let cachedLinks: BbpomExternalLinkItem[] | null = null;
let fetchPromise: Promise<BbpomExternalLinkItem[]> | null = null;

async function loadDynamicBbpomLinks(): Promise<BbpomExternalLinkItem[]> {
  if (cachedLinks && cachedLinks.length > 0) return cachedLinks;

  if (!fetchPromise) {
    fetchPromise = getPublicBbpomTautanListAction()
      .then((items) => {
        if (items && items.length > 0) {
          const mapped: BbpomExternalLinkItem[] = items.map((i) => ({
            id: i.id,
            label: i.judul,
            shortDescription: i.deskripsi,
            href: i.url,
            iconName: i.ikon,
            badge: i.badge,
          }));
          cachedLinks = mapped;
          return mapped;
        }
        return BBPOM_EXTERNAL_LINKS;
      })
      .catch((err) => {
        console.warn("[BbpomMenu] Gagal memuat tautan dinamis:", err);
        return BBPOM_EXTERNAL_LINKS;
      })
      .finally(() => {
        fetchPromise = null;
      });
  }

  return fetchPromise;
}

interface BbpomDropdownProps {
  label?: string;
  onNavigate?: () => void;
}

/**
 * Menu dropdown portal BBPOM / Website eksternal untuk navigasi desktop.
 * Terbuka saat hover (pointer) atau klik, tertutup saat klik di luar / tombol Escape.
 */
export function BbpomDropdown({ label = "Website", onNavigate }: BbpomDropdownProps) {
  const [open, setOpen] = useState(false);
  const [links, setLinks] = useState<BbpomExternalLinkItem[]>(
    () => cachedLinks || BBPOM_EXTERNAL_LINKS
  );
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadDynamicBbpomLinks().then((data) => {
      if (data && data.length > 0) {
        setLinks(data);
      }
    });
  }, []);

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
        className={`font-brand inline-flex items-center gap-1 rounded-full px-4 xl:px-5 py-2 text-[13px] transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-brand-orange ${
          open
            ? "bg-orange-tint text-brand-orange-600 font-bold dark:bg-orange-500/20 dark:text-orange-300 shadow-xs"
            : "text-navy-900 dark:text-slate-200 font-semibold hover:text-brand-orange"
        }`}
      >
        <span>{label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 stroke-[2.5] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50">
          <div
            role="menu"
            aria-label="Tautan portal BBPOM"
            className="w-[340px] sm:w-[360px] rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-2 shadow-[0_24px_48px_-16px_rgb(11_42_107/0.35)] animate-fade-up"
          >
            <div className="px-3 pt-2 pb-2.5 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-[0.16em] text-brand-orange dark:text-orange-400">
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5" />
                <span>Portal Resmi BBPOM</span>
              </div>
              <span className="text-[10px] text-slate-400 font-normal lowercase">
                tautan eksternal
              </span>
            </div>

            {links.map((item) => {
              const Icon = resolveIcon(item.iconName);
              return (
                <a
                  key={`${item.id}-${item.href}`}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    onNavigate?.();
                  }}
                  className="group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/70"
                >
                  <span className="mt-0.5 w-9 h-9 shrink-0 rounded-xl flex items-center justify-center transition-colors bg-orange-50 text-brand-orange dark:bg-orange-500/10 dark:text-orange-400 group-hover:bg-gradient-to-br group-hover:from-[#ff8a1f] group-hover:to-[#f26a0f] group-hover:text-white shadow-xs">
                    <Icon className="w-[18px] h-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-1.5">
                      <span className="flex items-center gap-1.5 min-w-0">
                        <span className="block font-brand text-[13px] font-bold leading-snug text-navy-900 dark:text-white group-hover:text-brand-orange transition-colors truncate">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded-md uppercase tracking-wider bg-orange-100 text-brand-orange-700 dark:bg-orange-500/20 dark:text-orange-300 shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-orange shrink-0 transition-colors ml-1" />
                    </span>
                    <span className="block text-[11.5px] leading-snug text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                      {item.shortDescription}
                    </span>
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface BbpomMobileMenuProps {
  label?: string;
  onNavigate?: () => void;
}

/**
 * Menu portal BBPOM / Website eksternal versi mobile (accordion) untuk drawer navigasi.
 */
export function BbpomMobileMenu({ label = "Website", onNavigate }: BbpomMobileMenuProps) {
  const [expanded, setExpanded] = useState(false);
  const [links, setLinks] = useState<BbpomExternalLinkItem[]>(
    () => cachedLinks || BBPOM_EXTERNAL_LINKS
  );

  useEffect(() => {
    loadDynamicBbpomLinks().then((data) => {
      if (data && data.length > 0) {
        setLinks(data);
      }
    });
  }, []);

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className={`font-brand w-full flex items-center justify-between px-4 py-2.5 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
          expanded
            ? "bg-orange-tint text-brand-orange-600 dark:bg-orange-500/20 dark:text-orange-300 font-bold"
            : "text-navy-900 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60"
        }`}
      >
        <span>{label}</span>
        <ChevronDown
          className={`w-4 h-4 stroke-[2.5] transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded && (
        <div className="mt-1 ml-3 pl-3 border-l-2 border-orange-100 dark:border-orange-500/20 flex flex-col gap-1">
          {links.map((item) => {
            const Icon = resolveIcon(item.iconName);
            return (
              <a
                key={`${item.id}-${item.href}`}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onNavigate?.()}
                className="flex items-center justify-between rounded-xl px-3 py-2 text-[13px] font-semibold text-navy-900 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className="w-4 h-4 shrink-0 text-brand-orange dark:text-orange-400" />
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded-md uppercase tracking-wider bg-orange-100 text-brand-orange-700 dark:bg-orange-500/20 dark:text-orange-300 shrink-0">
                      {item.badge}
                    </span>
                  )}
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1.5" />
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
