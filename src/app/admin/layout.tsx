"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellRing, X, ArrowRight, Clock } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import {
  getAdminNotificationsAction,
  type AdminNotificationItem,
  type AdminNotificationsSummary,
} from "@/app/actions/data-ampera";

interface ActiveToastItem extends AdminNotificationItem {
  toastId: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  const [notifSummary, setNotifSummary] = useState<AdminNotificationsSummary>({
    waitingByService: {
      INFO: 0,
      UJI_CEPAT: 0,
      ADUAN: 0,
      KIP: 0,
      total: 0,
    },
    todayWaitingCount: 0,
    todayWaitingItems: [],
    todayDateKey: "",
  });

  const [activeToasts, setActiveToasts] = useState<ActiveToastItem[]>([]);
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const isFetchingRef = useRef(false);

  const dismissToast = useCallback((toastId: string) => {
    if (timersRef.current[toastId]) {
      clearTimeout(timersRef.current[toastId]);
      delete timersRef.current[toastId];
    }
    setActiveToasts((prev) => prev.filter((t) => t.toastId !== toastId));
  }, []);

  const enqueueToastWithAutoClose = useCallback(
    (item: AdminNotificationItem) => {
      const toastId = `notif-${item.id}-${Date.now()}`;
      setActiveToasts((prev) => {
        if (prev.some((existing) => existing.id === item.id)) return prev;
        return [{ ...item, toastId }, ...prev].slice(0, 3);
      });

      // Tutup otomatis dalam 6 detik (6000 ms)
      timersRef.current[toastId] = setTimeout(() => {
        dismissToast(toastId);
      }, 6000);
    },
    [dismissToast]
  );

  const fetchNotifications = useCallback(async () => {
    if (isLoginPage || isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const res = await getAdminNotificationsAction();

      // Hanya update state jika jumlah/daftar benar-benar berubah (mencegah re-render berulang)
      setNotifSummary((prev) => {
        const isSameCounts =
          prev.todayWaitingCount === res.todayWaitingCount &&
          prev.waitingByService.total === res.waitingByService.total &&
          prev.waitingByService.INFO === res.waitingByService.INFO &&
          prev.waitingByService.UJI_CEPAT === res.waitingByService.UJI_CEPAT &&
          prev.waitingByService.ADUAN === res.waitingByService.ADUAN &&
          prev.waitingByService.KIP === res.waitingByService.KIP &&
          prev.todayWaitingItems.length === res.todayWaitingItems.length &&
          prev.todayWaitingItems[0]?.id === res.todayWaitingItems[0]?.id;
        return isSameCounts ? prev : res;
      });

      if (typeof window !== "undefined" && res.todayDateKey) {
        const storageKey = `ampera_admin_notified_ids_${res.todayDateKey}`;
        let notifiedIds: number[] = [];
        try {
          const raw = localStorage.getItem(storageKey);
          if (raw) {
            notifiedIds = JSON.parse(raw);
          }
        } catch {
          notifiedIds = [];
        }

        const notifiedSet = new Set(notifiedIds);
        const unseenTodayItems = res.todayWaitingItems.filter(
          (item) => !notifiedSet.has(item.id)
        );

        if (unseenTodayItems.length > 0) {
          unseenTodayItems.slice(0, 2).forEach((item) => {
            enqueueToastWithAutoClose(item);
          });

          res.todayWaitingItems.forEach((item) => notifiedSet.add(item.id));
          try {
            localStorage.setItem(storageKey, JSON.stringify(Array.from(notifiedSet)));
          } catch {}
        }
      }
    } catch (err) {
      console.warn("Gagal memuat notifikasi admin:", err);
    } finally {
      isFetchingRef.current = false;
    }
  }, [isLoginPage, enqueueToastWithAutoClose]);

  // Hanya jalankan saat pertama kali masuk panel admin & saat ada event perubahan status / pengajuan baru (tanpa polling interval)
  useEffect(() => {
    if (isLoginPage) return;

    fetchNotifications();

    const handleUpdated = () => {
      fetchNotifications();
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "ampera_new_submission_signal") {
        fetchNotifications();
      }
    };

    window.addEventListener("ampera-pengajuan-updated", handleUpdated);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("ampera-pengajuan-updated", handleUpdated);
      window.removeEventListener("storage", handleStorage);
    };
  }, [isLoginPage, fetchNotifications]);

  // Bersihkan timer saat unmount
  useEffect(() => {
    const currentTimers = timersRef.current;
    return () => {
      Object.values(currentTimers).forEach(clearTimeout);
    };
  }, []);

  // Halaman login admin memiliki desain fullscreen tersendiri tanpa sidebar/header
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f7faff] dark:bg-[#060c1d] text-[#0f2257] dark:text-slate-100 font-brand antialiased transition-colors duration-300">
      {/* Floating Popup Notifikasi Layanan Baru Terdaftar (Tutup Otomatis dalam 6 Detik) */}
      {activeToasts.length > 0 && (
        <div className="fixed right-4 top-24 z-50 flex flex-col gap-3 w-[calc(100vw-2rem)] sm:w-96 pointer-events-none">
          {activeToasts.map((toast) => (
            <div
              key={toast.toastId}
              className="pointer-events-auto relative overflow-hidden rounded-2xl border border-blue-200 dark:border-blue-800/80 bg-white dark:bg-slate-900 shadow-2xl p-4 transition-all animate-fade-up"
            >
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0b4fd1] to-[#2f86f6] text-white shadow-md">
                  <BellRing className="h-5 w-5 animate-bounce" />
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                      <Clock className="h-2.5 w-2.5" />
                      Layanan Baru Terdaftar
                    </span>
                    <button
                      type="button"
                      onClick={() => dismissToast(toast.toastId)}
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
                      aria-label="Tutup Notifikasi"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-xs font-extrabold text-[#0f2257] dark:text-white leading-snug">
                    {toast.layananNama}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Pemohon: <strong className="text-[#0f2257] dark:text-white">{toast.tamuNama}</strong>{" "}
                    <span className="font-mono text-[11px] text-slate-500">
                      (#{toast.kodePengajuan})
                    </span>
                  </p>

                  <div className="pt-1.5 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      Menutup otomatis dalam 6 detik
                    </span>
                    <Link
                      href={toast.href}
                      onClick={() => dismissToast(toast.toastId)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#1664e8] hover:text-blue-700 dark:text-blue-400"
                    >
                      Buka Laporan
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sidebar Sisi Kiri */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        waitingByService={notifSummary.waitingByService}
      />

      {/* Konten Sisi Kanan (Offset 72 pada layar desktop) */}
      <div className="flex min-h-screen flex-col bg-[#f7faff] dark:bg-slate-950 lg:ml-64 transition-all duration-300">
        {/* Top Header Bar */}
        <AdminHeader
          onOpenSidebar={() => setSidebarOpen(true)}
          todayWaitingCount={notifSummary.todayWaitingCount}
          todayWaitingItems={notifSummary.todayWaitingItems}
        />

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
              Created by <span className="font-semibold text-[#0f2257] dark:text-white">Riski Abdoli & Tea</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
