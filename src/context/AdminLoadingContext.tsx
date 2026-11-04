"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  AdminLoadingOverlay,
  AdminLoadingActionType,
} from "@/components/admin/AdminLoadingOverlay";

export interface ShowAdminLoadingOptions {
  title?: string;
  description?: string;
  actionType?: AdminLoadingActionType;
  badgeText?: string;
}

interface AdminLoadingContextValue {
  /** Menampilkan loading overlay dengan opsi konfigurasi kustom */
  showLoading: (options?: ShowAdminLoadingOptions) => void;
  /** Menyembunyikan loading overlay */
  hideLoading: () => void;
  /**
   * Menjalankan fungsi async dengan otomatis menampilkan loading overlay
   * dan menyembunyikannya kembali di blok finally (baik sukses maupun error).
   */
  withLoading: <T>(
    asyncFn: () => Promise<T>,
    options?: ShowAdminLoadingOptions
  ) => Promise<T>;
  /** Status apakah loading saat ini sedang aktif */
  isLoading: boolean;
}

const AdminLoadingContext = createContext<AdminLoadingContextValue | null>(null);

export function AdminLoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ShowAdminLoadingOptions>({});
  const activeCountRef = useRef(0);

  const showLoading = useCallback((opts?: ShowAdminLoadingOptions) => {
    activeCountRef.current += 1;
    if (opts) {
      setOptions(opts);
    }
    setIsOpen(true);
  }, []);

  const hideLoading = useCallback(() => {
    activeCountRef.current = Math.max(0, activeCountRef.current - 1);
    if (activeCountRef.current === 0) {
      setIsOpen(false);
    }
  }, []);

  const withLoading = useCallback(
    async <T,>(
      asyncFn: () => Promise<T>,
      opts?: ShowAdminLoadingOptions
    ): Promise<T> => {
      showLoading(opts);
      try {
        return await asyncFn();
      } finally {
        hideLoading();
      }
    },
    [showLoading, hideLoading]
  );

  const contextValue = useMemo(
    () => ({
      showLoading,
      hideLoading,
      withLoading,
      isLoading: isOpen,
    }),
    [showLoading, hideLoading, withLoading, isOpen]
  );

  return (
    <AdminLoadingContext.Provider value={contextValue}>
      {children}
      <AdminLoadingOverlay
        isOpen={isOpen}
        actionType={options.actionType}
        title={options.title}
        description={options.description}
        badgeText={options.badgeText}
      />
    </AdminLoadingContext.Provider>
  );
}

/**
 * Hook untuk mengontrol fullscreen loading overlay di panel admin AMPERA.
 */
export function useAdminLoading(): AdminLoadingContextValue {
  const context = useContext(AdminLoadingContext);
  if (!context) {
    // Fallback yang aman jika dipanggil di luar provider
    return {
      showLoading: () => {},
      hideLoading: () => {},
      withLoading: async <T,>(fn: () => Promise<T>) => fn(),
      isLoading: false,
    };
  }
  return context;
}

