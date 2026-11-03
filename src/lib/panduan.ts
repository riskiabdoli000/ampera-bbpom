import { Sparkles, ShieldCheck, BookOpen, GraduationCap, type LucideIcon } from "lucide-react";

export interface PanduanItem {
  slug: string;
  /** Label singkat untuk menu dropdown */
  label: string;
  /** Judul lengkap halaman panduan */
  title: string;
  /** Deskripsi singkat (1 baris) untuk dropdown */
  shortDescription: string;
  /** Deskripsi lengkap untuk header halaman & SEO */
  description: string;
  badge: string;
  /** Nama berkas asli di folder public/panduan */
  fileName: string;
  /** URL publik berkas PDF (sudah di-encode) */
  pdfUrl: string;
  /** Nama berkas saat diunduh */
  downloadName: string;
  icon: LucideIcon;
}

function buildPdfUrl(fileName: string) {
  return `/panduan/${encodeURIComponent(fileName)}`;
}

const RAW_PANDUAN = [
  {
    slug: "fitur-ampera",
    label: "Fitur AMPERA",
    title: "Fitur AMPERA",
    shortDescription: "Kenali seluruh fitur & layanan portal AMPERA",
    description:
      "Gambaran lengkap seluruh fitur portal AMPERA BBPOM di Palembang: layanan publik, edukasi masyarakat, hingga e-learning Garda AMPERA.",
    badge: "Sistem & Fitur",
    fileName: "FITUR AMPERA.pdf",
    downloadName: "Fitur-AMPERA-BBPOM-Palembang.pdf",
    icon: Sparkles,
  },
  {
    slug: "layanan-publik",
    label: "Panduan Layanan Publik",
    title: "Panduan Layanan Publik",
    shortDescription: "Tata cara permintaan informasi, uji cepat & pengaduan",
    description:
      "Panduan langkah demi langkah mengakses layanan publik AMPERA: permintaan informasi, pengujian cepat, pengaduan, dan keterbukaan informasi publik.",
    badge: "Layanan Publik",
    fileName: "PANDUAN LAYANAN PUBLIK.pdf",
    downloadName: "Panduan-Layanan-Publik-AMPERA.pdf",
    icon: ShieldCheck,
  },
  {
    slug: "edukasi",
    label: "Panduan Edukasi",
    title: "Panduan Layanan Edukasi",
    shortDescription: "Cara mengakses materi edukasi obat & pangan aman",
    description:
      "Panduan mengakses layanan edukasi AMPERA, mulai dari materi literasi obat dan pangan aman hingga dokumen edukasi resmi BBPOM di Palembang.",
    badge: "Edukasi",
    fileName: "PANDUAN LAYANAN EDUKASI.pdf",
    downloadName: "Panduan-Layanan-Edukasi-AMPERA.pdf",
    icon: BookOpen,
  },
  {
    slug: "elearning-garda-ampera",
    label: "Panduan E-Learning Garda AMPERA",
    title: "Panduan E-Learning Garda AMPERA",
    shortDescription: "Pendaftaran, materi, kuis & sertifikat Garda AMPERA",
    description:
      "Panduan lengkap mengikuti e-learning Garda AMPERA: pendaftaran peserta, mempelajari materi, mengerjakan evaluasi, hingga memperoleh sertifikat resmi.",
    badge: "E-Learning",
    fileName: "PANDUAN E-LEARNING GARDA AMPERA.pdf",
    downloadName: "Panduan-E-Learning-Garda-AMPERA.pdf",
    icon: GraduationCap,
  },
] satisfies Omit<PanduanItem, "pdfUrl">[];

export const PANDUAN_LIST: PanduanItem[] = RAW_PANDUAN.map((item) => ({
  ...item,
  pdfUrl: buildPdfUrl(item.fileName),
}));

export const DEFAULT_PANDUAN_SLUG = PANDUAN_LIST[0].slug;

export function getPanduanBySlug(slug: string): PanduanItem | undefined {
  return PANDUAN_LIST.find((item) => item.slug === slug);
}

