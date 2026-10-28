"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, User } from "lucide-react";

interface CindoSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CindoSidebar({ isOpen, onClose }: CindoSidebarProps) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  const isDashboardActive = pathname === "/cindo" || pathname === "/cindo/dashboard";
  const isMateriActive = pathname.startsWith("/cindo/materi");
  const isProfileActive = pathname.startsWith("/cindo/profile");

  const menuItems = [
    { title: "Profile", href: "/cindo/profile", icon: User, active: isProfileActive },
    { title: "Dashboard", href: "/cindo", icon: LayoutDashboard, active: isDashboardActive },
    { title: "Materi", href: "/cindo/materi", icon: BookOpen, active: isMateriActive },
  ];

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


  // Calculate position whenever pathname changes
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
  }, [pathname]);

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
        className={`fixed bottom-0 left-0 top-0 z-50 flex w-72 flex-col bg-[#0b2a6b] text-white shadow-2xl transition-transform duration-300 ease-in-out lg:w-64 lg:translate-x-0 lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo Header */}
        <div className="flex flex-col items-center justify-center px-6 pb-4 pt-6">
          <Link href="/cindo" onClick={onClose} className="flex flex-col items-center">
            <Image
              src="/assets-landingpage/am.png"
              alt="Logo AMPERA BBPOM"
              width={240}
              height={160}
              className="h-14 sm:h-16 w-auto max-w-[170px] object-contain drop-shadow"
              priority
            />
            <div className="mt-2 text-center">
              <span className="inline-block rounded-full bg-orange-500/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-amber-300 border border-amber-400/30">
                CINDO E-LEARNING
              </span>
            </div>
          </Link>
        </div>

        <div className="mx-6 border-t border-white/10" />

        {/* Navigation with Animated Sliding Indicator */}
        <nav ref={navRef} className="relative flex-1 space-y-6 overflow-y-auto pl-4 pr-0 py-6">
          {/* Sliding active tab indicator with organic curves */}
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
              <svg
                className="pointer-events-none absolute -top-6 right-0 h-6 w-6 fill-[#f7faff] dark:fill-slate-950"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M24,0 L24,24 L0,24 A24,24 0 0,0 24,0 Z" />
              </svg>
              <svg
                className="pointer-events-none absolute -bottom-6 right-0 h-6 w-6 fill-[#f7faff] dark:fill-slate-950"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M24,24 L24,0 L0,0 A24,24 0 0,1 24,24 Z" />
              </svg>
            </div>
          </div>

          {/* Bagian Menu (Hanya Dashboard dan Materi) */}
          <div>
            <p className="mb-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-white/70">
              Menu E-Learning
            </p>
            <div className="space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = item.active;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleLinkClick}
                    data-active={active ? "true" : "false"}
                    className={`group relative z-10 flex items-center gap-3 py-3 pl-4 pr-5 text-sm transition-colors duration-200 ${
                      active
                        ? "font-black text-brand-orange dark:text-orange-400"
                        : "mr-4 rounded-xl font-medium text-white hover:bg-white/15"
                    }`}
                  >
                    <Icon
                      className={`h-[19px] w-[19px] shrink-0 transition-colors duration-200 ${
                        active
                          ? "text-brand-orange dark:text-orange-400"
                          : "text-white/90 group-hover:text-white"
                      }`}
                    />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Bottom Section: Gambar Jembatan Emas selebar sidebar */}
        <div className="relative mt-auto w-full overflow-hidden">
          <div className="relative h-44 w-full sm:h-48">
            <Image
              src="/assets-landingpage/Jembatan-emas.png"
              alt="Jembatan Emas Palembang"
              fill
              sizes="(max-width: 1024px) 288px, 256px"
              className="object-cover"
              style={{ objectPosition: "center 27%" }}
            />
            {/* Gradasi menyatu dengan warna sidebar */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#0b2a6b] via-[#0b2a6b]/70 to-transparent" />
          </div>

        </div>
      </aside>
    </>
  );
}
