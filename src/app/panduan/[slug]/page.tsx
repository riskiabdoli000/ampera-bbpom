import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { SubpageNavbar } from "@/components/common/SubpageNavbar";
import { Footer } from "@/components/landing/Footer";
import { PanduanPdfViewer } from "@/components/panduan/PanduanPdfViewer";
import { PANDUAN_LIST, getPanduanBySlug } from "@/lib/panduan";

export const dynamicParams = false;

export function generateStaticParams() {
  return PANDUAN_LIST.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata(props: PageProps<"/panduan/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const panduan = getPanduanBySlug(slug);
  if (!panduan) return {};

  return {
    title: `${panduan.title} - AMPERA BBPOM Palembang`,
    description: panduan.description,
    openGraph: {
      title: `${panduan.title} - AMPERA BBPOM Palembang`,
      description: panduan.description,
      type: "article",
      locale: "id_ID",
    },
  };
}

export default async function PanduanDetailPage(props: PageProps<"/panduan/[slug]">) {
  const { slug } = await props.params;
  const panduan = getPanduanBySlug(slug);
  if (!panduan) notFound();

  const ActiveIcon = panduan.icon;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f2f7ff] via-white to-[#f0f6ff] dark:from-slate-950 dark:via-[#06122e]/40 dark:to-slate-950 text-slate-800 dark:text-slate-100 flex flex-col selection:bg-brand-orange selection:text-white overflow-x-hidden transition-colors duration-300">
      <SubpageNavbar activePage="panduan" activePanduanSlug={panduan.slug} />

      <div className="flex-1 w-full pt-28 sm:pt-32 pb-16 sm:pb-24">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-14">
          {/* Header */}
          <div className="relative mb-8 sm:mb-10 max-w-3xl mx-auto text-center animate-fade-up">
            <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold uppercase tracking-[0.2em] text-brand-orange dark:text-orange-400 mb-2">
              <FileText className="w-4 h-4" />
              Panduan AMPERA
            </span>
            <h1 className="font-brand font-extrabold text-3xl sm:text-4xl lg:text-[44px] leading-[1.15] tracking-tight text-navy-900 dark:text-white">
              {panduan.title}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-ink-soft dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              {panduan.description}
            </p>
          </div>

          {/* Tab navigasi antar panduan */}
          <nav
            aria-label="Pilih dokumen panduan"
            className="mb-6 sm:mb-8 -mx-5 sm:mx-0 px-5 sm:px-0 overflow-x-auto"
          >
            <ul className="flex sm:flex-wrap sm:justify-center gap-2 sm:gap-3 w-max sm:w-auto mx-auto">
              {PANDUAN_LIST.map((item) => {
                const Icon = item.icon;
                const isActive = item.slug === panduan.slug;
                return (
                  <li key={item.slug}>
                    <Link
                      href={`/panduan/${item.slug}`}
                      aria-current={isActive ? "page" : undefined}
                      className={`font-brand inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-[13px] font-bold border transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-[#ff8a1f] to-[#f26a0f] text-white border-transparent shadow-cta"
                          : "bg-white dark:bg-slate-900 text-navy-900 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-brand-orange hover:text-brand-orange"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Info dokumen */}
          <div className="max-w-6xl mx-auto mb-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ActiveIcon className="w-4 h-4 text-brand-orange" />
            <span className="font-semibold text-navy-900 dark:text-slate-200">{panduan.badge}</span>
            <span>•</span>
            <span>Dokumen Resmi BBPOM di Palembang</span>
          </div>

          {/* PDF Viewer */}
          <div className="max-w-6xl mx-auto">
            <PanduanPdfViewer
              key={panduan.slug}
              pdfUrl={panduan.pdfUrl}
              downloadName={panduan.downloadName}
              title={panduan.title}
            />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

