"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Sliders,
  Sparkles,
  BookOpen,
  Video,
  PhoneCall,
  ChevronDown,
  ChevronRight,
  LogOut,
} from "lucide-react";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  const isDashboardActive = pathname === "/admin" || pathname === "/admin/dashboard";
  const isLayananActive = pathname.startsWith("/admin/layanan");
  const isSettingsPath = pathname.startsWith("/admin/settings");

  // Website Settings submenu collapse state (default tertutup)
  const [settingsOpen, setSettingsOpen] = useState(false);

  const menuItems = [
    { title: "Dashboard", href: "/admin", icon: LayoutDashboard, active: isDashboardActive },
    { title: "Data Layanan", href: "/admin/layanan", icon: ClipboardList, active: isLayananActive },
  ];

  const websiteSubItems = [
    { title: "Hero Content", href: "/admin/settings/hero", icon: Sparkles },
    { title: "Edukasi", href: "/admin/settings/edukasi", icon: BookOpen },
    { title: "Video Profil", href: "/admin/settings/video", icon: Video },
    { title: "Kontak & Lokasi", href: "/admin/settings/kontak", icon: PhoneCall },
  ];

  const isAnySubActive = websiteSubItems.some((item) => pathname === item.href);
  const isParentActive = isSettingsPath && (!settingsOpen || !isAnySubActive);

  // Sliding tab indicator position and dimensions
  const [indicator, setIndicator] = useState<{
    top: number;
    height: number;
    ready: boolean;
  }>({
    top: 0,
    height: 48,
    ready: false,
  });

  // Calculate position whenever pathname changes, submenu toggles, or window resizes
  useEffect(() => {
    const updateIndicator = () => {
      if (!navRef.current) return;
      const activeEl = navRef.current.querySelector<HTMLElement>('[data-active="true"]');
      if (activeEl) {
        const navRect = navRef.current.getBoundingClientRect();
        const elRect = activeEl.getBoundingClientRect();
        setIndicator({
          top: elRect.top - navRect.top + navRef.current.scrollTop,
          height: elRect.height,
          ready: true,
        });
      } else {
        setIndicator((prev) => ({ ...prev, ready: false }));
      }
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    const timer = setTimeout(updateIndicator, 60);

    return () => {
      window.removeEventListener("resize", updateIndicator);
      clearTimeout(timer);
    };
  }, [pathname, settingsOpen]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const elRect = e.currentTarget.getBoundingClientRect();
      setIndicator({
        top: elRect.top - navRect.top + navRef.current.scrollTop,
        height: elRect.height,
        ready: true,
      });
    }
    onClose();
  };

  const handleSettingsToggle = () => {
    setSettingsOpen((prev) => !prev);
  };

  const renderLink = (item: { title: string; href: string; icon: React.ElementType; active?: boolean }) => {
    const Icon = item.icon;
    const active = item.active ?? pathname === item.href;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={handleLinkClick}
        data-active={active ? "true" : "false"}
        className={`group relative z-10 flex items-center gap-3 py-3 pl-4 pr-5 text-sm transition-colors duration-200 ${active
            ? "font-bold text-[#0b2a6b] dark:text-blue-400"
            : "mr-4 rounded-xl font-medium text-white hover:bg-white/15"
          }`}
      >
        <Icon
          className={`h-[19px] w-[19px] shrink-0 transition-colors duration-200 ${active
              ? "text-[#0b2a6b] dark:text-blue-400"
              : "text-white/90 group-hover:text-white"
            }`}
        />
        <span>{item.title}</span>
      </Link>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#06132f]/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 flex w-72 flex-col bg-[#0b2a6b] text-white shadow-2xl transition-transform duration-300 ease-in-out lg:w-64 lg:translate-x-0 lg:shadow-none ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Logo Header */}
        <div className="flex items-center justify-center px-6 pb-5 pt-6">
          <Link href="/admin" onClick={onClose} className="flex items-center justify-center">
            <Image
              src="/assets-landingpage/am.png"
              alt="Logo AMPERA BBPOM"
              width={240}
              height={160}
              className="h-16 sm:h-20 w-auto max-w-[190px] object-contain drop-shadow"
              priority
            />
          </Link>
        </div>

        <div className="mx-6 border-t border-white/10" />

        {/* Navigation with Animated Sliding Indicator */}
        <nav ref={navRef} className="relative flex-1 space-y-6 overflow-y-auto pl-4 pr-0 py-5">
          {/* Sliding active tab indicator with organic inverted curves */}
          <div
            className="pointer-events-none absolute right-0 z-0 will-change-transform"
            style={{
              top: 0,
              left: "16px",
              height: `${indicator.height}px`,
              transform: `translateY(${indicator.top}px)`,
              opacity: indicator.ready ? 1 : 0,
              transition: indicator.ready
                ? "transform 320ms cubic-bezier(0.2, 0.8, 0.2, 1), height 320ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 150ms ease"
                : "opacity 150ms ease",
            }}
          >
            <div className="relative h-full w-full rounded-l-2xl bg-[#f7faff] dark:bg-slate-950 shadow-sm">
              {/* Top concave fillet curve */}
              <svg
                className="pointer-events-none absolute -top-6 right-0 h-6 w-6 fill-[#f7faff] dark:fill-slate-950"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M24,0 L24,24 L0,24 A24,24 0 0,0 24,0 Z" />
              </svg>
              {/* Bottom concave fillet curve */}
              <svg
                className="pointer-events-none absolute -bottom-6 right-0 h-6 w-6 fill-[#f7faff] dark:fill-slate-950"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M24,24 L24,0 L0,0 A24,24 0 0,1 24,24 Z" />
              </svg>
            </div>
          </div>

          {/* Section 1: Menu */}
          <div>
            <p className="mb-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-white/70">
              Menu
            </p>
            <div className="space-y-1.5">{menuItems.map(renderLink)}</div>
          </div>

          {/* Section 2: General */}
          <div>
            <p className="mb-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-white/70">
              General
            </p>
            <div className="space-y-1.5">
              {/* Website Settings (Collapsible Navlink with 4 Sub-items) */}
              <div>
                <button
                  type="button"
                  onClick={handleSettingsToggle}
                  data-active={isParentActive ? "true" : "false"}
                  className={`group relative z-10 flex w-full items-center justify-between py-3 pl-4 pr-5 text-sm transition-colors duration-200 ${isParentActive
                      ? "font-bold text-[#0b2a6b] dark:text-blue-400"
                      : isSettingsPath
                        ? "mr-4 rounded-xl font-semibold text-white hover:bg-white/15"
                        : "mr-4 rounded-xl font-medium text-white hover:bg-white/15"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Sliders
                      className={`h-[19px] w-[19px] shrink-0 transition-colors duration-200 ${isParentActive
                          ? "text-[#0b2a6b] dark:text-blue-400"
                          : "text-white/90 group-hover:text-white"
                        }`}
                    />
                    <span>Website Settings</span>
                  </div>
                  {settingsOpen ? (
                    <ChevronDown className="h-4 w-4 text-white/80 transition-colors group-hover:text-white" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-white/80 transition-colors group-hover:text-white" />
                  )}
                </button>

                {/* 4 Sub-items */}
                {settingsOpen && (
                  <div className="mt-1 space-y-1 pl-3">
                    {websiteSubItems.map((sub) => {
                      const SubIcon = sub.icon;
                      const active = pathname === sub.href;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={handleLinkClick}
                          data-active={active ? "true" : "false"}
                          className={`group relative z-10 flex items-center gap-2.5 py-2.5 pl-5 pr-5 text-[13px] transition-colors duration-200 ${active
                              ? "font-bold text-[#0b2a6b] dark:text-blue-400"
                              : "mr-4 rounded-xl font-medium text-white hover:bg-white/15"
                            }`}
                        >
                          <SubIcon
                            className={`h-4 w-4 shrink-0 transition-colors duration-200 ${active
                                ? "text-[#0b2a6b] dark:text-blue-400"
                                : "text-white/90 group-hover:text-white"
                              }`}
                          />
                          <span>{sub.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Bottom Section: Gambar Jembatan Emas selebar sidebar dengan gradasi atas menyatu dan Tombol Logout menimpa di atasnya */}
        <div className="relative mt-auto w-full overflow-hidden">
          {/* Gambar Jembatan Emas selebar horizontal sidebar */}
          <div className="relative h-44 w-full sm:h-48">
            <Image
              src="/assets-landingpage/Jembatan-emas.png"
              alt="Jembatan Emas Palembang"
              fill
              sizes="(max-width: 1024px) 288px, 256px"
              className="object-cover"
              style={{ objectPosition: "center 27%" }}
            />
            {/* Gradasi bagian atas agar menyatu mulus dengan warna sidebar (#0b2a6b) */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#0b2a6b] via-[#0b2a6b]/70 to-transparent" />
           
          </div>

          {/* Tombol Logout menimpa (overlay) di atas gambar */}
          {/* <div className="absolute inset-x-0 bottom-0 p-4">
            <Link
              href="/"
              title="Keluar ke Landing Page"
              className="flex items-center justify-center gap-2.5 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-all hover:border-rose-300/60 hover:bg-rose-500/30 hover:backdrop-blur-lg active:scale-[0.98]"
            >
              <LogOut className="h-[18px] w-[18px] text-rose-300" />
              <span>Logout</span>
            </Link>
          </div> */}
        </div>
      </aside>
    </>
  );
}
