import React from "react";
import type { Metadata } from "next";
import { SubpageNavbar } from "@/components/common/SubpageNavbar";
import { Footer } from "@/components/landing/Footer";
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
    <main className="min-h-screen bg-gradient-to-b from-[#f2f7ff] via-white to-[#f0f6ff] dark:from-slate-950 dark:via-[#06122e]/40 dark:to-slate-950 text-slate-800 dark:text-slate-100 flex flex-col selection:bg-brand-orange selection:text-white overflow-x-hidden transition-colors duration-300">
      <SubpageNavbar activePage="layanan" />

      <div className="flex-1 w-full pt-28 sm:pt-32 pb-16 sm:pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SurveiClient
            initialKode={kodeParam}
            initialData={initialData}
            initialError={initialError}
          />
        </div>
      </div>

      <Footer />
    </main>
  );
}
