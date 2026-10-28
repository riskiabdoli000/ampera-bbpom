import React from "react";
import type { Metadata } from "next";
import { getSurveiPengajuanAction } from "@/app/actions/survei";
import SurveiClient from "./SurveiClient";

export const metadata: Metadata = {
  title: "Survei Kepuasan Masyarakat (IKM) - AMPERA BBPOM Palembang",
  description:
    "Survei kepuasan masyarakat terhadap kualitas pelayanan petugas dan efektivitas website AMPERA Balai Besar POM di Palembang.",
};

interface SurveiPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SurveiPage({ searchParams }: SurveiPageProps) {
  const resolvedParams = await searchParams;
  const kodeParam = typeof resolvedParams.kode === "string" ? resolvedParams.kode.trim() : "";

  let initialData = null;
  let initialError = null;

  if (kodeParam) {
    const res = await getSurveiPengajuanAction(kodeParam);
    if (res.success && res.data) {
      initialData = res.data;
    } else {
      initialError = res.message || "Tiket permohonan tidak ditemukan.";
    }
  }

  return (
    <main className="min-h-screen bg-slate-100/80 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-center py-6 sm:py-10 px-3 sm:px-6 lg:px-8 selection:bg-[#ff7a1a] selection:text-white transition-colors duration-300">
      <div className="w-full max-w-6xl mx-auto">
        <SurveiClient
          initialKode={kodeParam}
          initialData={initialData}
          initialError={initialError}
        />
      </div>
    </main>
  );
}

