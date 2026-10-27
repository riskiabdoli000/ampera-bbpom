"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CindoSidebar } from "@/components/cindo/CindoSidebar";
import { CindoHeader } from "@/components/cindo/CindoHeader";
import { getCurrentCindoUser } from "@/data/cindo/cindoStorage";

export default function CindoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const isAuthPage = pathname === "/cindo/login";

  useEffect(() => {
    if (isAuthPage) {
      setIsAuthenticated(true);
      return;
    }

    const user = getCurrentCindoUser();
    if (!user) {
      setIsAuthenticated(false);
      router.replace("/cindo/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, isAuthPage, router]);

  // Halaman Login / Registrasi tidak menampilkan sidebar & header admin
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Menunggu pemeriksaan status login
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7faff] dark:bg-[#060c1d]">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1664e8] border-t-transparent mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Memeriksa sesi login Cindo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7faff] dark:bg-[#060c1d] text-[#0f2257] dark:text-slate-100 font-brand antialiased transition-colors duration-300">
      {/* Sidebar Sisi Kiri */}
      <CindoSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Konten Sisi Kanan */}
      <div className="flex min-h-screen flex-col bg-[#f7faff] dark:bg-slate-950 lg:ml-64 transition-all duration-300">
        {/* Top Header Bar */}
        <CindoHeader onOpenSidebar={() => setSidebarOpen(true)} />

        {/* Dynamic Main Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:px-8 lg:py-7 w-full">
          {children}
        </main>

        {/* Footer Bar */}
        <footer className="border-t border-[#e3ecfa] px-6 py-4 text-center text-xs text-[#7b8aa8] dark:border-slate-800/80 dark:text-slate-400">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
            <p>
              © {new Date().getFullYear()} <strong className="text-navy-900 dark:text-sky-300">CINDO E-LEARNING</strong> — Balai Besar Pengawas Obat dan Makanan di Palembang.
            </p>
            <div className="text-[11px] font-medium text-[#7b8aa8] dark:text-slate-400">
              Modul Edukasi Keamanan Pangan & Obat
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
