import React from "react";
import type { Metadata } from "next";
import { getSurveiPengajuanAction } from "@/app/actions/survei";
import SurveiClient from "./SurveiClient";

export const metadata: Metadata = {
  title: "Survey Kepuasan Pelanggan - BBPOM di Palembang",
  description:
    "Survey kepuasan pelanggan terhadap kualitas layanan petugas dan sistem website AMPERA Balai Besar POM di Palembang.",
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
    <main className="min-h-screen bg-[#f0f4f9] text-slate-800 flex flex-col justify-center py-6 sm:py-12 px-3 sm:px-6 lg:px-8 selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-5xl mx-auto">
        <SurveiClient
          initialKode={kodeParam}
          initialData={initialData}
          initialError={initialError}
        />
      </div>
    </main>
  );
}
