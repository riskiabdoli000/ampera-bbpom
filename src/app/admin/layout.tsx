"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Halaman login admin memiliki desain fullscreen tersendiri tanpa sidebar/header
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f7faff] dark:bg-[#060c1d] text-[#0f2257] dark:text-slate-100 font-brand antialiased transition-colors duration-300">
      {/* Sidebar Sisi Kiri */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Konten Sisi Kanan (Offset 72 pada layar desktop) */}
      <div className="flex min-h-screen flex-col bg-[#f7faff] dark:bg-slate-950 lg:ml-64 transition-all duration-300">
        {/* Top Header Bar */}
        <AdminHeader onOpenSidebar={() => setSidebarOpen(true)} />

        {/* Dynamic Main Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:px-8 lg:py-7 w-full">
          {children}
        </main>

        {/* Footer Admin Bar */}
        <footer className="border-t border-[#e3ecfa] px-6 py-4 text-center text-xs text-[#7b8aa8] dark:border-slate-800/80 dark:text-slate-400">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
            <p>
              © {new Date().getFullYear()} <strong className="text-navy-900 dark:text-sky-300">AMPERA</strong> — Balai Besar Pengawas Obat dan Makanan di Palembang.
            </p>
            <div className="text-[11px] font-medium text-[#7b8aa8] dark:text-slate-400">
              Created by <span className="font-semibold text-[#0f2257] dark:text-white">Riski Abdoli</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
