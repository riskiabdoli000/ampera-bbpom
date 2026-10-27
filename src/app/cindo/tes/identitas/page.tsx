"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CindoIdentitasPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/cindo/profile");
  }, [router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-t-transparent mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Mengalihkan ke halaman profil peserta...</p>
      </div>
    </div>
  );
}
