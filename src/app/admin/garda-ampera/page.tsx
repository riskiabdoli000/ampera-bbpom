"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Award,
  Users,
  GraduationCap,
  TrendingUp,
  LayoutDashboard,
  FileSpreadsheet,
  Search,
  Filter,
  Calendar,
  ChevronDown,
  RotateCcw,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  BookOpen,
  HelpCircle,
  Eye,
  FileText,
  Clock,
  Sparkles,
  RefreshCw,
  X,
  Save,
  Upload,
  FileUp,
  Layers,
  AlertCircle,
  Check,
  FileCheck,
} from "lucide-react";
import {
  getAdminGardaOverviewAction,
  adminUpsertSoalAction,
  adminDeleteSoalAction,
  adminDeletePesertaAction,
  adminToggleSoalStatusAction,
  adminUpdateMateriAction,
  adminCreateMateriAction,
  adminDeleteMateriAction,
  adminBatchCreateSoalAction,
  adminUploadMateriAction,
  adminPreviewMateriFileAction,
  parsePdfQuestionsAction,
  GardaPesertaItem,
  GardaAdminStats,
} from "@/app/actions/garda-ampera";
import { parseQuestionsFromRawText } from "@/lib/garda-parser";
import { exportGardaToExcel, exportGardaToPdf } from "./export-garda";
import {
  ToastContainer,
  ConfirmDialogModal,
  ToastItem,
  ConfirmDialogConfig,
  ToastType,
} from "@/components/garda-ampera/GardaNotificationModal";
import { EducationPdfModal } from "@/components/landing/EducationPdfModal";
import { AdminPagination } from "@/components/admin/AdminPagination";

const MONTHS_LIST = [
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

const DAYS_LIST = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

export default function AdminGardaAmperaPage() {
  const [activeTab, setActiveTab] = useState<"peserta" | "soal" | "materi">("peserta");
  const [loading, setLoading] = useState(true);

  // Preview PDF Modal State untuk Modul Materi
  const [adminPdfPreview, setAdminPdfPreview] = useState<{
    isOpen: boolean;
    title: string;
    pdfUrl: string;
    badge?: string;
  }>({
    isOpen: false,
    title: "",
    pdfUrl: "",
  });

  // Toast & Confirm Notification States (Pengganti alert/confirm browser)
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmDialogConfig | null>(null);

  const showToast = (title: string, message?: string, type: ToastType = "info") => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showConfirm = (params: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "warning" | "info";
    onConfirm: () => void | Promise<void>;
  }) => {
    setConfirmConfig({
      isOpen: true,
      title: params.title,
      message: params.message,
      confirmText: params.confirmText,
      cancelText: params.cancelText,
      type: params.type || "danger",
      onCancel: () => setConfirmConfig(null),
      onConfirm: async () => {
        setConfirmConfig((prev) => (prev ? { ...prev, isLoading: true } : null));
        try {
          await params.onConfirm();
        } finally {
          setConfirmConfig(null);
        }
      },
    });
  };

  // Data State
  const [pesertaList, setPesertaList] = useState<GardaPesertaItem[]>([]);
  const [stats, setStats] = useState<GardaAdminStats>({
    totalPeserta: 0,
    totalLulus: 0,
    totalRemidi: 0,
    tingkatKelulusanPersen: 0,
    rataRataPreTest: 0,
    rataRataPostTest: 0,
    peningkatanNilai: 0,
    rataRataRatingSistem: 0,
  });
  const [soalList, setSoalList] = useState<any[]>([]);
  const [materiList, setMateriList] = useState<any[]>([]);
  const [isDbConnected, setIsDbConnected] = useState(false);

  // Filter & Search State
  const [searchPeserta, setSearchPeserta] = useState("");
  const [filterStatusPeserta, setFilterStatusPeserta] = useState<"all" | "lulus" | "remidi">("all");
  const [filterTahunPeserta, setFilterTahunPeserta] = useState<string>("all");
  const [filterBulanPeserta, setFilterBulanPeserta] = useState<string>("all");
  const [filterTanggalPeserta, setFilterTanggalPeserta] = useState<string>("all");
  const [isPesertaDatePickerOpen, setIsPesertaDatePickerOpen] = useState(false);
  const pesertaDatePickerRef = useRef<HTMLDivElement>(null);
  const [filterTipeSoal, setFilterTipeSoal] = useState<"all" | "PRE_TEST" | "POST_TEST" | "SEMUA">("all");

  // Close date picker popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pesertaDatePickerRef.current &&
        !pesertaDatePickerRef.current.contains(event.target as Node)
      ) {
        setIsPesertaDatePickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Available Years list from peserta data (sorted descending)
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>();
    const currentYear = new Date().getFullYear().toString();
    yearsSet.add(currentYear);

    pesertaList.forEach((p) => {
      if (p.tanggalTes) {
        const d = new Date(p.tanggalTes);
        if (!isNaN(d.getTime())) {
          yearsSet.add(d.getFullYear().toString());
        }
      }
    });

    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
  }, [pesertaList]);

  const isFilterPesertaActive =
    searchPeserta.trim() !== "" ||
    filterStatusPeserta !== "all" ||
    filterTahunPeserta !== "all" ||
    filterBulanPeserta !== "all" ||
    filterTanggalPeserta !== "all";

  const handleResetFilterPeserta = () => {
    setSearchPeserta("");
    setFilterStatusPeserta("all");
    setFilterTahunPeserta("all");
    setFilterBulanPeserta("all");
    setFilterTanggalPeserta("all");
    setIsPesertaDatePickerOpen(false);
    setCurrentPagePeserta(1);
  };

  // Modal Detail Peserta
  const [selectedPeserta, setSelectedPeserta] = useState<GardaPesertaItem | null>(null);

  // Modal Single Soal
  const [showSoalModal, setShowSoalModal] = useState(false);
  const [editingSoal, setEditingSoal] = useState<any | null>(null);
  const [soalForm, setSoalForm] = useState({
    id: undefined as number | undefined,
    tipe: "SEMUA" as "PRE_TEST" | "POST_TEST" | "SEMUA",
    kategori: "Regulasi Obat & Makanan",
    pertanyaan: "",
    pilihanA: "",
    pilihanB: "",
    pilihanC: "",
    pilihanD: "",
    jawabanBenar: "A",
    penjelasan: "",
  });

  // Modal Upload Soal via PDF
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfTargetTipe, setPdfTargetTipe] = useState<"PRE_TEST" | "POST_TEST" | "SEMUA">("SEMUA");
  const [pdfCategory, setPdfCategory] = useState("Regulasi Obat & Makanan");
  const [pdfPastedText, setPdfPastedText] = useState("");
  const [pdfStep, setPdfStep] = useState<"upload" | "preview">("upload");
  const [pdfParsedQuestions, setPdfParsedQuestions] = useState<any[]>([]);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Modal Tambah Modul Materi Baru (Upload PDF / PPT)
  const [showCreateMateriModal, setShowCreateMateriModal] = useState(false);
  const [newMateriForm, setNewMateriForm] = useState<{
    judul: string;
    ringkasan: string;
    durasi: string;
    file: File | null;
    previewSlidesCount: number | null;
    previewFileName: string;
    previewFileSize: string;
    isAnalyzing: boolean;
    compressionStat?: {
      originalSizeText: string;
      compressedSizeText: string;
      savedPercent: number;
    } | null;
  }>({
    judul: "",
    ringkasan: "",
    durasi: "",
    file: null,
    previewSlidesCount: null,
    previewFileName: "",
    previewFileSize: "",
    isAnalyzing: false,
    compressionStat: null,
  });

  // Modal Edit Materi
  const [editingMateri, setEditingMateri] = useState<any | null>(null);
  const [editMateriFile, setEditMateriFile] = useState<File | null>(null);
  const [editPreviewSlidesCount, setEditPreviewSlidesCount] = useState<number | null>(null);
  const [editCompressionStat, setEditCompressionStat] = useState<{
    originalSizeText: string;
    compressedSizeText: string;
    savedPercent: number;
  } | null>(null);
  const [editIsAnalyzing, setEditIsAnalyzing] = useState(false);
  const [materiSaving, setMateriSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAdminGardaOverviewAction();
      setPesertaList(res.pesertaList);
      setStats(res.stats);
      setSoalList(res.soalList);
      setMateriList(res.materiList);
      setIsDbConnected(res.isDbConnected);
    } catch (err) {
      console.error("Gagal mengambil data overview:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter Peserta (Search, Status, Tahun, Bulan, Tanggal)
  const filteredPeserta = useMemo(() => {
    return pesertaList.filter((p) => {
      const matchSearch =
        searchPeserta.trim() === "" ||
        p.nama.toLowerCase().includes(searchPeserta.toLowerCase()) ||
        p.nik.includes(searchPeserta) ||
        p.instansi.toLowerCase().includes(searchPeserta.toLowerCase()) ||
        (p.pekerjaan && p.pekerjaan.toLowerCase().includes(searchPeserta.toLowerCase()));

      const matchStatus =
        filterStatusPeserta === "all"
          ? true
          : filterStatusPeserta === "lulus"
          ? p.isLulus
          : !p.isLulus;

      const itemDate = p.tanggalTes ? new Date(p.tanggalTes) : null;
      const isValidDate = Boolean(itemDate && !isNaN(itemDate.getTime()));

      const matchTahun =
        filterTahunPeserta === "all"
          ? true
          : Boolean(
              isValidDate &&
                itemDate &&
                itemDate.getFullYear().toString() === filterTahunPeserta
            );

      const matchBulan =
        filterBulanPeserta === "all"
          ? true
          : Boolean(
              isValidDate &&
                itemDate &&
                (itemDate.getMonth() + 1).toString() === filterBulanPeserta
            );

      const matchTanggal =
        filterTanggalPeserta === "all"
          ? true
          : Boolean(
              isValidDate &&
                itemDate &&
                itemDate.getDate().toString() === filterTanggalPeserta
            );

      return matchSearch && matchStatus && matchTahun && matchBulan && matchTanggal;
    });
  }, [
    pesertaList,
    searchPeserta,
    filterStatusPeserta,
    filterTahunPeserta,
    filterBulanPeserta,
    filterTanggalPeserta,
  ]);

  // Pagination Peserta (Maksimal 10 peserta per halaman)
  const [currentPagePeserta, setCurrentPagePeserta] = useState(1);
  const itemsPerPagePeserta = 10;

  // Reset pagination ke halaman 1 saat filter atau pencarian berubah
  useEffect(() => {
    setCurrentPagePeserta(1);
  }, [
    searchPeserta,
    filterStatusPeserta,
    filterTahunPeserta,
    filterBulanPeserta,
    filterTanggalPeserta,
  ]);

  const totalPagesPeserta = Math.ceil(filteredPeserta.length / itemsPerPagePeserta) || 1;
  const paginatedPeserta = useMemo(() => {
    const startIndex = (currentPagePeserta - 1) * itemsPerPagePeserta;
    return filteredPeserta.slice(startIndex, startIndex + itemsPerPagePeserta);
  }, [filteredPeserta, currentPagePeserta]);

  // Filter Soal
  const filteredSoal = soalList.filter((s) => {
    if (filterTipeSoal === "all") return true;
    if (filterTipeSoal === "SEMUA") return s.tipe === "SEMUA";
    if (filterTipeSoal === "PRE_TEST") return s.tipe === "PRE_TEST" || s.tipe === "SEMUA";
    if (filterTipeSoal === "POST_TEST") return s.tipe === "POST_TEST" || s.tipe === "SEMUA";
    return s.tipe === filterTipeSoal;
  });

  // ==========================================
  // HANDLERS SOAL SATU-SATU
  // ==========================================
  const handleOpenSoalModal = (soal?: any) => {
    if (soal) {
      setEditingSoal(soal);
      setSoalForm({
        id: soal.id,
        tipe: soal.tipe,
        kategori: soal.kategori,
        pertanyaan: soal.pertanyaan,
        pilihanA: soal.pilihanA,
        pilihanB: soal.pilihanB,
        pilihanC: soal.pilihanC,
        pilihanD: soal.pilihanD,
        jawabanBenar: soal.jawabanBenar,
        penjelasan: soal.penjelasan || "",
      });
    } else {
      setEditingSoal(null);
      setSoalForm({
        id: undefined,
        tipe: "SEMUA",
        kategori: "Regulasi Obat & Makanan",
        pertanyaan: "",
        pilihanA: "",
        pilihanB: "",
        pilihanC: "",
        pilihanD: "",
        jawabanBenar: "A",
        penjelasan: "",
      });
    }
    setShowSoalModal(true);
  };

  const handleSaveSoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!soalForm.pertanyaan.trim() || !soalForm.pilihanA.trim()) {
      showToast("Form Belum Lengkap", "Pertanyaan dan pilihan jawaban A wajib diisi.", "warning");
      return;
    }

    const res = await adminUpsertSoalAction(soalForm);
    if (res.success) {
      setShowSoalModal(false);
      showToast("Soal Berhasil Disimpan", res.message || "Soal berhasil disimpan ke bank soal.", "success");
      fetchData();
    } else {
      showToast("Gagal Menyimpan", res.message || "Gagal menyimpan butir soal.", "error");
    }
  };

  const handleDeletePeserta = (peserta: GardaPesertaItem) => {
    showConfirm({
      title: "Hapus Data Peserta?",
      message: `Apakah Anda yakin ingin menghapus data peserta "${peserta.nama}" (NIK: ${peserta.nik})? Riwayat ujian Pre-Test, Post-Test, sertifikat kelulusan, serta data survei evaluasi peserta ini akan dihapus secara permanen dari sistem.`,
      confirmText: "Ya, Hapus Data",
      cancelText: "Batal",
      type: "danger",
      onConfirm: async () => {
        try {
          const res = await adminDeletePesertaAction(peserta.id);
          if (res.success) {
            setPesertaList((prev) => prev.filter((p) => p.id !== peserta.id));
            setSelectedPeserta(null);
            showToast(
              "Peserta Berhasil Dihapus",
              res.message || `Data peserta ${peserta.nama} berhasil dihapus.`,
              "success"
            );
          } else {
            showToast("Gagal Menghapus", res.message || "Gagal menghapus data peserta.", "error");
          }
        } catch (err: any) {
          showToast(
            "Gagal Menghapus",
            err.message || "Terjadi kesalahan saat menghapus data peserta.",
            "error"
          );
        }
      },
    });
  };

  const handleDeleteSoal = (id: number, pertanyaan?: string) => {
    const preview = pertanyaan
      ? `\n"${pertanyaan.slice(0, 90)}${pertanyaan.length > 90 ? "..." : ""}"\n\n`
      : " ";
    showConfirm({
      title: "Hapus Butir Soal?",
      message: `Apakah Anda yakin ingin menghapus soal ini dari Bank Soal?${preview}Tindakan ini tidak dapat dibatalkan.`,
      confirmText: "Ya, Hapus Soal",
      type: "danger",
      onConfirm: async () => {
        const res = await adminDeleteSoalAction(id);
        if (res.success) {
          setSoalList((prev) => prev.filter((s) => s.id !== id));
          showToast("Soal Berhasil Dihapus", res.message || "Soal telah dihapus dari database.", "success");
        } else {
          showToast("Gagal Menghapus Soal", res.message || "Soal gagal dihapus.", "error");
        }
      },
    });
  };

  const handleToggleSoal = async (id: number, currentStatus: boolean) => {
    // Optimistic update langsung agar tombol responsif instan
    setSoalList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isAktif: !currentStatus } : s))
    );
    const res = await adminToggleSoalStatusAction(id, !currentStatus);
    if (res.success) {
      showToast(
        !currentStatus ? "Soal Diaktifkan" : "Soal Dinonaktifkan",
        res.message || `Status butir soal diperbarui.`,
        "info"
      );
    } else {
      // Rollback jika gagal
      setSoalList((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isAktif: currentStatus } : s))
      );
      showToast("Gagal Mengubah Status", res.message || "Gagal memperbarui status butir soal.", "error");
    }
  };

  // ==========================================
  // HANDLERS UPLOAD SOAL VIA PDF
  // ==========================================
  const handleOpenPdfModal = () => {
    setPdfFile(null);
    setPdfPastedText("");
    setPdfParsedQuestions([]);
    setPdfStep("upload");
    setPdfError(null);
    setShowPdfModal(true);
  };

  const handleProcessPdfUpload = async () => {
    setPdfUploading(true);
    setPdfError(null);

    try {
      if (pdfFile) {
        const formData = new FormData();
        formData.append("file", pdfFile);
        formData.append("tipe", pdfTargetTipe);
        formData.append("kategori", pdfCategory);

        const res = await parsePdfQuestionsAction(formData);
        if (res.success && res.questions && res.questions.length > 0) {
          setPdfParsedQuestions(res.questions);
          setPdfStep("preview");
        } else {
          setPdfError(
            res.message ||
              "Gagal menemukan butir soal dari berkas PDF. Pastikan format nomor soal dan opsi A-D tersedia."
          );
        }
      } else if (pdfPastedText.trim()) {
        const extracted = parseQuestionsFromRawText(pdfPastedText, pdfTargetTipe, pdfCategory);
        if (extracted.length > 0) {
          setPdfParsedQuestions(extracted);
          setPdfStep("preview");
        } else {
          setPdfError("Tidak dapat mendeteksi format soal. Gunakan format '1. Pertanyaan ... A. Opsi'");
        }
      } else {
        setPdfError("Silakan pilih berkas PDF atau tempel teks soal terlebih dahulu.");
      }
    } catch (err: any) {
      setPdfError(`Terjadi kesalahan: ${err.message}`);
    } finally {
      setPdfUploading(false);
    }
  };

  const handleSaveBatchQuestions = async () => {
    if (pdfParsedQuestions.length === 0) return;
    setPdfUploading(true);

    try {
      const res = await adminBatchCreateSoalAction(pdfParsedQuestions);
      if (res.success) {
        setShowPdfModal(false);
        showToast(
          "Berhasil Mengimpor Soal",
          res.message || `${pdfParsedQuestions.length} butir soal dari PDF berhasil disimpan.`,
          "success"
        );
        fetchData();
      } else {
        setPdfError(res.message);
        showToast("Gagal Mengimpor Soal", res.message, "error");
      }
    } catch (err: any) {
      setPdfError(`Gagal menyimpan: ${err.message}`);
      showToast("Terjadi Kesalahan", err.message, "error");
    } finally {
      setPdfUploading(false);
    }
  };

  const handleUpdateParsedQuestion = (index: number, field: string, value: string) => {
    setPdfParsedQuestions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveParsedQuestion = (index: number) => {
    setPdfParsedQuestions((prev) => prev.filter((_, idx) => idx !== index));
  };

  // ==========================================
  // HANDLERS KELOLA MODUL MATERI
  // ==========================================
  const handleOpenCreateMateriModal = () => {
    setNewMateriForm({
      judul: "",
      ringkasan: "",
      durasi: "",
      file: null,
      previewSlidesCount: null,
      previewFileName: "",
      previewFileSize: "",
      isAnalyzing: false,
      compressionStat: null,
    });
    setShowCreateMateriModal(true);
  };

  const handleSelectMateriFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNewMateriForm((prev) => ({
      ...prev,
      file,
      previewFileName: file.name,
      isAnalyzing: true,
      previewSlidesCount: null,
      compressionStat: null,
    }));

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("judul", newMateriForm.judul || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
      fd.append("nomor", String(materiList.length + 1));

      const res = await adminPreviewMateriFileAction(fd);
      if (res.success) {
        setNewMateriForm((prev) => ({
          ...prev,
          previewSlidesCount: res.totalSlides,
          previewFileSize: res.fileSizeText,
          compressionStat: res.compressionStat || null,
          isAnalyzing: false,
          durasi: prev.durasi || `${Math.max(3, Math.round(res.totalSlides * 1.5))} Menit Belajar`,
          judul: prev.judul || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        }));
      } else {
        showToast("Gagal Membaca Berkas", res.message || "Gagal membaca berkas.", "error");
        setNewMateriForm((prev) => ({ ...prev, isAnalyzing: false }));
      }
    } catch (err: any) {
      showToast("Gagal Membaca Berkas", err.message, "error");
      setNewMateriForm((prev) => ({ ...prev, isAnalyzing: false }));
    }
  };

  const handleSaveNewMateri = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMateriForm.judul.trim() || !newMateriForm.ringkasan.trim()) {
      showToast("Form Belum Lengkap", "Judul dan ringkasan modul materi wajib diisi.", "warning");
      return;
    }
    if (!newMateriForm.file) {
      showToast("Berkas Belum Dipilih", "Silakan unggah berkas materi dalam format PDF (.pdf) atau PowerPoint (.pptx).", "warning");
      return;
    }

    setMateriSaving(true);
    try {
      const fd = new FormData();
      fd.append("file", newMateriForm.file);
      fd.append("judul", newMateriForm.judul.trim());
      fd.append("ringkasan", newMateriForm.ringkasan.trim());
      fd.append(
        "durasi",
        newMateriForm.durasi.trim() ||
          `${Math.max(3, Math.round((newMateriForm.previewSlidesCount || 4) * 1.5))} Menit Belajar`
      );
      fd.append("nomor", String(materiList.length + 1));

      const res = await adminUploadMateriAction(fd);
      if (res.success) {
        showToast("Modul Berhasil Disimpan", res.message || "Modul materi baru berhasil disimpan.", "success");
        setShowCreateMateriModal(false);
        fetchData();
      } else {
        showToast("Gagal Menyimpan Modul", res.message || "Gagal menyimpan modul materi.", "error");
      }
    } catch (err: any) {
      showToast("Terjadi Kesalahan", err.message, "error");
    } finally {
      setMateriSaving(false);
    }
  };

  const handleDeleteMateri = (id: number, judul: string) => {
    showConfirm({
      title: "Hapus Modul Pembelajaran?",
      message: `Apakah Anda yakin ingin menghapus '${judul}'?\nSeluruh data slide materi terkait akan ikut dihapus.`,
      confirmText: "Ya, Hapus Modul",
      type: "danger",
      onConfirm: async () => {
        const res = await adminDeleteMateriAction(id);
        if (res.success) {
          showToast("Modul Berhasil Dihapus", `Modul '${judul}' berhasil dihapus.`, "success");
          fetchData();
        } else {
          showToast("Gagal Menghapus Modul", res.message || "Gagal menghapus modul materi.", "error");
        }
      },
    });
  };

  const handleSelectEditMateriFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEditMateriFile(file);
    setEditIsAnalyzing(true);
    setEditPreviewSlidesCount(null);
    setEditCompressionStat(null);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("judul", editingMateri?.judul || file.name);
      fd.append("nomor", String(editingMateri?.nomor || 1));

      const res = await adminPreviewMateriFileAction(fd);
      if (res.success) {
        setEditPreviewSlidesCount(res.totalSlides);
        if (res.compressionStat) {
          setEditCompressionStat(res.compressionStat);
        }
        if (editingMateri) {
          setEditingMateri((prev: any) => ({
            ...prev,
            durasi: `${Math.max(3, Math.round(res.totalSlides * 1.5))} Menit Belajar`,
          }));
        }
        showToast("Berkas Baru Terdeteksi", `Berkas materi baru memiliki ${res.totalSlides} slide presentasi.`, "info");
      } else {
        showToast("Gagal Membaca Berkas", res.message || "Gagal membaca berkas.", "error");
      }
    } catch (err: any) {
      showToast("Gagal Membaca Berkas", err.message, "error");
    } finally {
      setEditIsAnalyzing(false);
    }
  };

  const handleSaveEditMateri = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMateri) return;

    setMateriSaving(true);
    try {
      const fd = new FormData();
      if (editMateriFile) {
        fd.append("file", editMateriFile);
      }
      fd.append("id", String(editingMateri.id));
      fd.append("judul", editingMateri.judul.trim());
      fd.append("ringkasan", editingMateri.ringkasan.trim());
      fd.append("durasi", editingMateri.durasi?.trim() || "7 Menit Belajar");
      fd.append("nomor", String(editingMateri.nomor));

      const res = await adminUploadMateriAction(fd);
      if (res.success) {
        showToast("Modul Berhasil Diperbarui", res.message || "Modul materi berhasil diperbarui.", "success");
        setEditingMateri(null);
        setEditMateriFile(null);
        setEditPreviewSlidesCount(null);
        setEditCompressionStat(null);
        fetchData();
      } else {
        showToast("Gagal Memperbarui", res.message || "Gagal memperbarui modul materi.", "error");
      }
    } catch (err: any) {
      showToast("Terjadi Kesalahan", err.message, "error");
    } finally {
      setMateriSaving(false);
    }
  };

  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      const exportData = isFilterPesertaActive ? filteredPeserta : pesertaList;
      if (exportData.length === 0) {
        showToast("Tidak Ada Data", "Tidak ada data peserta yang memenuhi kriteria filter untuk diekspor.", "error");
        return;
      }

      const exportStats: GardaAdminStats = isFilterPesertaActive
        ? {
            totalPeserta: exportData.length,
            totalLulus: exportData.filter((p) => p.isLulus).length,
            totalRemidi: exportData.filter((p) => !p.isLulus).length,
            tingkatKelulusanPersen: Math.round(
              (exportData.filter((p) => p.isLulus).length / exportData.length) * 100
            ),
            rataRataPreTest:
              Math.round(
                (exportData.reduce((acc, p) => acc + (p.preTestScore ?? 0), 0) /
                  exportData.length) *
                  10
              ) / 10,
            rataRataPostTest:
              Math.round(
                (exportData.reduce((acc, p) => acc + (p.postTestScore ?? 0), 0) /
                  exportData.length) *
                  10
              ) / 10,
            peningkatanNilai: 0,
            rataRataRatingSistem: 0,
          }
        : stats;

      await exportGardaToExcel(exportData, exportStats);
      showToast(
        "Ekspor Berhasil",
        `Berkas rekapitulasi Excel (${exportData.length} peserta) berhasil diunduh.`,
        "success"
      );
    } catch (err: any) {
      showToast("Gagal Ekspor", err.message || "Terjadi kesalahan saat mengekspor data Excel.", "error");
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const exportData = isFilterPesertaActive ? filteredPeserta : pesertaList;
      if (exportData.length === 0) {
        showToast("Tidak Ada Data", "Tidak ada data peserta yang memenuhi kriteria filter untuk diekspor.", "error");
        return;
      }

      const exportStats: GardaAdminStats = isFilterPesertaActive
        ? {
            totalPeserta: exportData.length,
            totalLulus: exportData.filter((p) => p.isLulus).length,
            totalRemidi: exportData.filter((p) => !p.isLulus).length,
            tingkatKelulusanPersen: Math.round(
              (exportData.filter((p) => p.isLulus).length / exportData.length) * 100
            ),
            rataRataPreTest:
              Math.round(
                (exportData.reduce((acc, p) => acc + (p.preTestScore ?? 0), 0) /
                  exportData.length) *
                  10
              ) / 10,
            rataRataPostTest:
              Math.round(
                (exportData.reduce((acc, p) => acc + (p.postTestScore ?? 0), 0) /
                  exportData.length) *
                  10
              ) / 10,
            peningkatanNilai: 0,
            rataRataRatingSistem: 0,
          }
        : stats;

      await exportGardaToPdf(exportData, exportStats);
      showToast(
        "Ekspor Berhasil",
        `Berkas laporan PDF (${exportData.length} peserta) berhasil diunduh.`,
        "success"
      );
    } catch (err: any) {
      showToast("Gagal Ekspor", err.message || "Terjadi kesalahan saat mengekspor data PDF.", "error");
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Title & Export Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
              PROGRAM EDUKASI KADER & MASYARAKAT
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
            Manajemen Garda Ampera
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola data kelulusan peserta, bank soal Pre-Test & Post-Test, serta modul edukasi berjenjang.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Ekspor Excel */}
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-60"
            title="Unduh Rekapitulasi Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isExportingExcel ? "Menyiapkan Excel..." : "Unduh Excel (.xlsx)"}</span>
          </button>

          {/* Ekspor PDF */}
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-60"
            title="Unduh Laporan Resmi PDF (.pdf)"
          >
            <FileText className="w-4 h-4" />
            <span>{isExportingPdf ? "Menyiapkan PDF..." : "Unduh PDF (.pdf)"}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Peserta */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Peserta
            </p>
            <h3 className="text-2xl font-black text-navy-900 dark:text-white mt-1">
              {stats.totalPeserta}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Peserta terdaftar</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Tingkat Kelulusan */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tingkat Kelulusan
            </p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.tingkatKelulusanPersen}%
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {stats.totalLulus} Lulus • {stats.totalRemidi} Remidi
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        {/* Rata-rata Pre-Test */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Rata-rata Pre-Test
            </p>
            <h3 className="text-2xl font-black text-navy-900 dark:text-white mt-1">
              {stats.rataRataPreTest}
              <span className="text-xs text-slate-400 font-medium ml-1">pts</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Rata-rata total {stats.totalPeserta} peserta
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <HelpCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Rata-rata Post-Test */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Rata-rata Post-Test
            </p>
            <h3 className="text-2xl font-black text-navy-900 dark:text-white mt-1">
              {stats.rataRataPostTest}
              <span className="text-xs text-emerald-600 font-bold ml-1.5">
                (+{stats.peningkatanNilai} pts)
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Rata-rata total {stats.totalPeserta} peserta
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
        <button
          type="button"
          onClick={() => setActiveTab("peserta")}
          className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "peserta"
              ? "border-navy-900 text-navy-900 dark:border-blue-500 dark:text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          <Users className="w-4 h-4" />
          Data Peserta & Kelulusan ({pesertaList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("soal")}
          className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "soal"
              ? "border-navy-900 text-navy-900 dark:border-blue-500 dark:text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          Kelola Bank Soal ({soalList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("materi")}
          className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "materi"
              ? "border-navy-900 text-navy-900 dark:border-blue-500 dark:text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Kelola Modul Materi ({materiList.length})
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: DATA PESERTA & KELULUSAN */}
      {/* ===================================================================== */}
      {activeTab === "peserta" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama, NIK, instansi, pekerjaan..."
                  value={searchPeserta}
                  onChange={(e) => setSearchPeserta(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder:text-slate-400"
                />
                {searchPeserta && (
                  <button
                    type="button"
                    onClick={() => setSearchPeserta("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Controls Group */}
              <div className="flex flex-wrap items-center gap-2">
                {/* 1. Status Filter */}
                <div className="flex items-center gap-1.5">
                  <select
                    value={filterStatusPeserta}
                    onChange={(e: any) => setFilterStatusPeserta(e.target.value)}
                    className="h-10 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer transition-all"
                  >
                    <option value="all">Semua Status</option>
                    <option value="lulus">Hanya Lulus (Post-Test ≥ 70)</option>
                    <option value="remidi">Hanya Remidi (Post-Test &lt; 70)</option>
                  </select>
                </div>

                {/* 2. Tahun Filter */}
                <div className="flex items-center gap-1.5">
                  <select
                    value={filterTahunPeserta}
                    onChange={(e) => setFilterTahunPeserta(e.target.value)}
                    className="h-10 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer transition-all"
                  >
                    <option value="all">Semua Tahun</option>
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        Tahun {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Bulan Filter */}
                <div className="flex items-center gap-1.5">
                  <select
                    value={filterBulanPeserta}
                    onChange={(e) => setFilterBulanPeserta(e.target.value)}
                    className="h-10 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer transition-all"
                  >
                    <option value="all">Semua Bulan</option>
                    {MONTHS_LIST.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Tanggal Filter (Custom Popover) */}
                <div className="relative" ref={pesertaDatePickerRef}>
                  <button
                    type="button"
                    onClick={() => setIsPesertaDatePickerOpen(!isPesertaDatePickerOpen)}
                    className={`h-10 px-3 rounded-xl border text-xs font-medium flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all cursor-pointer ${
                      filterTanggalPeserta !== "all"
                        ? "border-orange-500 bg-orange-50/60 dark:bg-orange-950/30 text-brand-orange font-bold"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-orange-400"
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {filterTanggalPeserta === "all" ? "Semua Tanggal" : `Tanggal ${filterTanggalPeserta}`}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                        isPesertaDatePickerOpen ? "rotate-180 text-brand-orange" : ""
                      }`}
                    />
                  </button>

                  {/* Popover Dropdown Kalender Tanggal */}
                  {isPesertaDatePickerOpen && (
                    <div className="absolute right-0 top-full mt-2 z-50 w-[285px] sm:w-[305px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xl shadow-slate-900/15 animate-in fade-in zoom-in-95 duration-150">
                      {/* Tombol Utama: Semua Tanggal (Pill Oranye) */}
                      <button
                        type="button"
                        onClick={() => {
                          setFilterTanggalPeserta("all");
                          setIsPesertaDatePickerOpen(false);
                        }}
                        className={`w-full py-2.5 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center ${
                          filterTanggalPeserta === "all"
                            ? "bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] text-white shadow-md shadow-orange-500/35 hover:brightness-105"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-orange-50 hover:text-brand-orange dark:hover:bg-slate-750"
                        }`}
                      >
                        Semua Tanggal
                      </button>

                      {/* Grid 7 Kolom Tanggal (1-31) */}
                      <div className="grid grid-cols-7 gap-y-2.5 gap-x-1 text-center mt-4 mb-1">
                        {DAYS_LIST.map((d) => {
                          const isSelected = filterTanggalPeserta === d;
                          return (
                            <button
                              key={d}
                              type="button"
                              onClick={() => {
                                setFilterTanggalPeserta(d);
                                setIsPesertaDatePickerOpen(false);
                              }}
                              className={`w-8 h-8 mx-auto rounded-full text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-[#ff7a1a] text-white font-black shadow-md shadow-orange-500/35 scale-110"
                                  : "text-slate-800 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-slate-800 hover:text-brand-orange"
                              }`}
                            >
                              {d}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Reset Filter Button */}
                {isFilterPesertaActive && (
                  <button
                    type="button"
                    onClick={handleResetFilterPeserta}
                    className="h-10 px-3 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all cursor-pointer"
                    title="Reset semua filter"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Active Filter Indicators & Count */}
            <div className="flex flex-wrap items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span>
                  Menampilkan <strong className="text-slate-800 dark:text-slate-200">{filteredPeserta.length}</strong> dari{" "}
                  <strong className="text-slate-800 dark:text-slate-200">{pesertaList.length}</strong> peserta
                </span>
                {isFilterPesertaActive && (
                  <span className="text-brand-orange font-bold">• Filter aktif</span>
                )}
              </div>
              {isFilterPesertaActive && (
                <div className="flex items-center gap-1 flex-wrap mt-1 sm:mt-0">
                  {filterStatusPeserta !== "all" && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[10px]">
                      Status: {filterStatusPeserta === "lulus" ? "Lulus" : "Remidi"}
                    </span>
                  )}
                  {filterTahunPeserta !== "all" && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[10px]">
                      Tahun: {filterTahunPeserta}
                    </span>
                  )}
                  {filterBulanPeserta !== "all" && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[10px]">
                      Bulan: {MONTHS_LIST.find((m) => m.value === filterBulanPeserta)?.label}
                    </span>
                  )}
                  {filterTanggalPeserta !== "all" && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[10px]">
                      Tanggal: {filterTanggalPeserta}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold">
                  <tr>
                    <th className="py-3 px-4">No</th>
                    <th className="py-3 px-4">Peserta</th>
                    <th className="py-3 px-4">Instansi & Profesi</th>
                    <th className="py-3 px-4">Tanggal Tes</th>
                    <th className="py-3 px-4 text-center">Pre-Test</th>
                    <th className="py-3 px-4 text-center">Post-Test</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Evaluasi</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredPeserta.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Users className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                          <span className="font-semibold text-xs text-slate-600 dark:text-slate-300">
                            {isFilterPesertaActive ? "Tidak Ada Peserta yang Cocok" : "Belum Ada Data Peserta"}
                          </span>
                          <span className="text-[11px] text-slate-400 max-w-sm text-center">
                            {isFilterPesertaActive
                              ? "Tidak ditemukan peserta yang sesuai dengan kriteria filter pencarian atau tanggal yang dipilih."
                              : "Database peserta masih kosong karena belum ada peserta yang menyelesaikan asesmen Garda Ampera."}
                          </span>
                          {isFilterPesertaActive && (
                            <button
                              type="button"
                              onClick={handleResetFilterPeserta}
                              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-brand-orange text-xs font-bold hover:bg-orange-100 transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Reset Filter</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedPeserta.map((p, idx) => {
                      const rowNumber =
                        (currentPagePeserta - 1) * itemsPerPagePeserta + idx + 1;
                      return (
                        <tr
                          key={p.id}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3.5 px-4 font-bold text-slate-400">{rowNumber}</td>
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-navy-900 dark:text-white">{p.nama}</p>
                            <p className="text-[11px] text-slate-500 font-mono">
                              NIK: {p.nik} • {p.usia} Th ({p.jenisKelamin === "Laki-laki" ? "L" : "P"})
                            </p>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-slate-800 dark:text-slate-200">
                              {p.instansi}
                            </p>
                            <p className="text-[11px] text-slate-500">{p.pekerjaan}</p>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                            {new Date(p.tanggalTes).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                            {p.preTestScore !== null ? `${p.preTestScore}` : "-"}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`font-black text-sm ${
                                (p.postTestScore ?? 0) >= 70
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-rose-600"
                              }`}
                            >
                              {p.postTestScore !== null ? p.postTestScore : "-"}
                            </span>
                            {p.postTestAttempts > 1 && (
                              <span className="block text-[10px] text-slate-400">
                                (Ujian ke-{p.postTestAttempts})
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {p.isLulus ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                                <CheckCircle2 className="w-3 h-3" /> Lulus (≥70)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                                <XCircle className="w-3 h-3" /> Remidi (&lt;70)
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {p.evaluasi ? (
                              <span className="font-bold text-amber-500 text-[11px]">
                                ★{" "}
                                {(
                                  (p.evaluasi.ratingKemudahan +
                                    p.evaluasi.ratingMateri +
                                    p.evaluasi.ratingSoal +
                                    p.evaluasi.ratingManfaat) /
                                  4
                                ).toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedPeserta(p)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-blue-600 dark:text-blue-400 transition-colors cursor-pointer"
                                title="Lihat Detail Peserta"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Detail
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePeserta(p)}
                                className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                                title="Hapus Data Peserta"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <AdminPagination
              currentPage={currentPagePeserta}
              totalPages={totalPagesPeserta}
              totalItems={filteredPeserta.length}
              itemsPerPage={itemsPerPagePeserta}
              onPageChange={(page) => setCurrentPagePeserta(page)}
            />
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: KELOLA BANK SOAL (DUAL INPUT: PDF UPLOAD & MANUAL SATU-SATU) */}
      {/* ===================================================================== */}
      {activeTab === "soal" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Tampilkan Soal:</span>
              <select
                value={filterTipeSoal}
                onChange={(e: any) => setFilterTipeSoal(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium"
              >
                <option value="all">Semua Soal ({soalList.length})</option>
                <option value="SEMUA">Keduanya (Pre & Post Test)</option>
                <option value="PRE_TEST">Pre-Test Saja</option>
                <option value="POST_TEST">Post-Test Saja</option>
              </select>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Tombol 1: Upload Soal via PDF */}
              <button
                type="button"
                onClick={handleOpenPdfModal}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <FileUp className="w-4 h-4" />
                Upload Soal via PDF
              </button>

              {/* Tombol 2: Tambah Soal Satu-Satu (Manual) */}
              <button
                type="button"
                onClick={() => handleOpenSoalModal()}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-navy-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Tambah Soal Satu-Satu
              </button>
            </div>
          </div>

          {filteredSoal.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-navy-900 dark:text-white">
                Bank Soal Belum Memiliki Data
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                Database bank soal masih kosong karena belum ada butir soal yang diinput. Anda dapat mulai menambahkan soal satu per satu secara manual atau mengunggah berkas PDF soal untuk generate otomatis.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPdfModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <FileUp className="w-4 h-4" />
                  Upload Soal via PDF
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenSoalModal()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Soal Satu-Satu
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSoal.map((s, idx) => (
              <div
                key={s.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 ${
                  s.isAktif
                    ? "border-slate-200 dark:border-slate-800"
                    : "border-slate-200/50 dark:border-slate-800/50 opacity-60"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        s.tipe === "SEMUA"
                          ? "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                          : s.tipe === "PRE_TEST"
                          ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                          : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                      }`}
                    >
                      {s.tipe === "SEMUA"
                        ? "PRE & POST TEST"
                        : s.tipe === "PRE_TEST"
                        ? "PRE-TEST"
                        : "POST-TEST"}{" "}
                      • {s.kategori}
                    </span>

                    <span
                      className={`text-[10px] font-bold ${
                        s.isAktif ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      {s.isAktif ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-navy-900 dark:text-white leading-snug">
                    {idx + 1}. {s.pertanyaan}
                  </h4>

                  {/* Options List */}
                  <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div
                      className={`p-2 rounded-lg ${
                        s.jawabanBenar === "A"
                          ? "bg-emerald-50 dark:bg-emerald-950/60 font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300"
                          : "bg-slate-50 dark:bg-slate-800/40"
                      }`}
                    >
                      A. {s.pilihanA}
                    </div>
                    <div
                      className={`p-2 rounded-lg ${
                        s.jawabanBenar === "B"
                          ? "bg-emerald-50 dark:bg-emerald-950/60 font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300"
                          : "bg-slate-50 dark:bg-slate-800/40"
                      }`}
                    >
                      B. {s.pilihanB}
                    </div>
                    <div
                      className={`p-2 rounded-lg ${
                        s.jawabanBenar === "C"
                          ? "bg-emerald-50 dark:bg-emerald-950/60 font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300"
                          : "bg-slate-50 dark:bg-slate-800/40"
                      }`}
                    >
                      C. {s.pilihanC}
                    </div>
                    <div
                      className={`p-2 rounded-lg ${
                        s.jawabanBenar === "D"
                          ? "bg-emerald-50 dark:bg-emerald-950/60 font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300"
                          : "bg-slate-50 dark:bg-slate-800/40"
                      }`}
                    >
                      D. {s.pilihanD}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                    Kunci: <strong>Pilihan {s.jawabanBenar}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleSoal(s.id, s.isAktif)}
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                    >
                      {s.isAktif ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenSoalModal(s)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600 cursor-pointer"
                      title="Edit Soal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSoal(s.id, s.pertanyaan)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-600 cursor-pointer"
                      title="Hapus Soal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: KELOLA MODUL MATERI (LENGKAP DENGAN FITUR TAMBAH MATERI BARU) */}
      {/* ===================================================================== */}
      {activeTab === "materi" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-navy-900 dark:text-white">
                Daftar Modul Pembelajaran Mandiri
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Peserta wajib menyelesaikan modul secara berurutan slide demi slide untuk membuka ujian Post-Test.
              </p>
            </div>

            {/* Tombol Tambah Modul Materi Baru */}
            <button
              type="button"
              onClick={handleOpenCreateMateriModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tambah Modul Materi Baru
            </button>
          </div>

          {materiList.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-navy-900 dark:text-white">
                Belum Ada Modul Materi Edukasi
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                Daftar modul pembelajaran mandiri di database masih kosong. Klik tombol di bawah untuk membuat modul dan menyusun slide materi baru.
              </p>
              <button
                type="button"
                onClick={handleOpenCreateMateriModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Tambah Modul Materi Baru
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {materiList.map((m) => (
                <div
                  key={m.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-md bg-navy-900 dark:bg-blue-600 text-white text-xs font-bold">
                        Modul {m.nomor}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">{m.durasi}</span>
                    </div>

                    <h3 className="text-base font-extrabold text-navy-900 dark:text-white">
                      {m.judul}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      {m.ringkasan}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                        <span>Jumlah Slide:</span>
                        <strong className="font-mono">{m.slides?.length || 0} Slide</strong>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                        <span>Berkas PDF:</span>
                        <span className="text-[11px] text-blue-600 truncate max-w-44">
                          {m.pdfUrl?.split("/").pop() || "materi-edukasi.pdf"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setAdminPdfPreview({
                          isOpen: true,
                          title: m.judul,
                          pdfUrl: m.pdfUrl || "/documents/materi-edukasi-bbpom.pdf",
                          badge: `Modul ${m.nomor}`,
                        })
                      }
                      className="px-3 py-2.5 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Lihat Berkas PDF Asli"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      Lihat PDF
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingMateri(m)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteMateri(m.id, m.judul)}
                      className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 cursor-pointer"
                      title="Hapus Modul Ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL UPLOAD SOAL VIA PDF (DENGAN GENERATE & PRATINJAU OTOMATIS) */}
      {/* ===================================================================== */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-up">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                  AUTO GENERATE BANK SOAL
                </span>
                <h3 className="text-lg font-extrabold text-navy-900 dark:text-white">
                  {pdfStep === "upload" ? "Upload Soal via Dokumen PDF" : "Pratinjau & Edit Soal Hasil Ekstraksi"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPdfModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {pdfError && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {pdfError}
              </div>
            )}

            {/* STEP 1: UPLOAD PDF FILE / PASTE TEXT */}
            {pdfStep === "upload" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1">Tujuan Pengujian</label>
                    <select
                      value={pdfTargetTipe}
                      onChange={(e: any) => setPdfTargetTipe(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                    >
                      <option value="SEMUA">Semuanya (Pre-Test & Post-Test)</option>
                      <option value="PRE_TEST">Pre-Test Saja (Pengujian Awal)</option>
                      <option value="POST_TEST">Post-Test Saja (Kelulusan KKM 70)</option>
                    </select>
                    <p className="text-[10px] text-slate-500 mt-1">
                      💡 Opsi <strong>Semuanya</strong>: Soal digabung untuk Pre & Post Test, lalu 10 soal diambil acak saat ujian.
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Kategori Default</label>
                    <input
                      type="text"
                      value={pdfCategory}
                      onChange={(e) => setPdfCategory(e.target.value)}
                      placeholder="Regulasi Obat / Pangan Aman / dll."
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>

                {/* Dropzone PDF */}
                <div>
                  <label className="block font-bold mb-1.5">Pilih Berkas PDF Soal</label>
                  <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-amber-500 hover:bg-amber-50/20 transition-all">
                    <FileUp className="w-8 h-8 text-amber-500 mb-2" />
                    <span className="font-bold text-slate-800 dark:text-white">
                      {pdfFile ? pdfFile.name : "Klik untuk memilih berkas PDF soal"}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1">
                      Mendukung format soal pilihan ganda 1. ... A. ... B. ... Kunci: A
                    </span>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        if (e.target.files?.[0]) setPdfFile(e.target.files[0]);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Atau Paste Teks Alternatif */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Atau Tempel / Paste Teks Soal Langsung:
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setPdfPastedText(`1. Apa kepanjangan dari BPOM?
A. Badan Pengawas Obat dan Makanan
B. Balai Pemeriksaan Obat dan Minuman
C. Badan Pengujian Obat Modern
D. Balai Perlindungan Obat Masyarakat
Kunci: A

2. Prinsip Cek KLIK yang disosialisasikan BBPOM adalah...
A. Kemasan, Label, Izin Edar, Kedaluwarsa
B. Kualitas, Lokasi, Industri, Kehalalan
C. Kandungan, Lisensi, Informasi, Kuantitas
D. Kemasan, Legalitas, Industri, Kedaluwarsa
Kunci: A`)
                      }
                      className="text-[11px] text-blue-600 font-bold hover:underline"
                    >
                      ⚡ Isi Contoh Format Teks
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={pdfPastedText}
                    onChange={(e) => setPdfPastedText(e.target.value)}
                    placeholder="1. Pertanyaan soal...&#10;A. Pilihan A&#10;B. Pilihan B&#10;C. Pilihan C&#10;D. Pilihan D&#10;Kunci: A"
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-[11px]"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPdfModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleProcessPdfUpload}
                    disabled={pdfUploading || (!pdfFile && !pdfPastedText.trim())}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {pdfUploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Mengekstrak Soal...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Ekstraksi & Generate Soal
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: PRATINJAU & EDIT SOAL HASIL EKSTRAKSI */}
            {pdfStep === "preview" && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    Ditemukan {pdfParsedQuestions.length} Butir Soal Siap Diimpor
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Target: <strong>{pdfTargetTipe}</strong>
                  </span>
                </div>

                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                  {pdfParsedQuestions.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-navy-900 dark:text-white">
                          Soal #{qIdx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveParsedQuestion(qIdx)}
                          className="text-rose-500 hover:text-rose-700 text-[11px] font-semibold"
                        >
                          Hapus Butir Ini
                        </button>
                      </div>

                      <textarea
                        rows={2}
                        value={q.pertanyaan}
                        onChange={(e) =>
                          handleUpdateParsedQuestion(qIdx, "pertanyaan", e.target.value)
                        }
                        className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">A:</span>
                          <input
                            type="text"
                            value={q.pilihanA}
                            onChange={(e) =>
                              handleUpdateParsedQuestion(qIdx, "pilihanA", e.target.value)
                            }
                            className="flex-1 p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">B:</span>
                          <input
                            type="text"
                            value={q.pilihanB}
                            onChange={(e) =>
                              handleUpdateParsedQuestion(qIdx, "pilihanB", e.target.value)
                            }
                            className="flex-1 p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">C:</span>
                          <input
                            type="text"
                            value={q.pilihanC}
                            onChange={(e) =>
                              handleUpdateParsedQuestion(qIdx, "pilihanC", e.target.value)
                            }
                            className="flex-1 p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">D:</span>
                          <input
                            type="text"
                            value={q.pilihanD}
                            onChange={(e) =>
                              handleUpdateParsedQuestion(qIdx, "pilihanD", e.target.value)
                            }
                            className="flex-1 p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-[11px] font-bold text-slate-500">
                          Pilih Kunci Jawaban:
                        </span>
                        <div className="flex items-center gap-3">
                          {["A", "B", "C", "D"].map((opt) => (
                            <label
                              key={opt}
                              className={`px-2.5 py-1 rounded-md font-bold cursor-pointer transition-colors ${
                                q.jawabanBenar === opt
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`kunci-${qIdx}`}
                                value={opt}
                                checked={q.jawabanBenar === opt}
                                onChange={() =>
                                  handleUpdateParsedQuestion(qIdx, "jawabanBenar", opt)
                                }
                                className="hidden"
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setPdfStep("upload")}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold"
                  >
                    Kembali Upload
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveBatchQuestions}
                    disabled={pdfUploading || pdfParsedQuestions.length === 0}
                    className="px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-blue-800 text-white font-bold inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    Simpan Semua {pdfParsedQuestions.length} Soal ke Bank Soal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL DETAIL PESERTA */}
      {/* ===================================================================== */}
      {selectedPeserta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-up">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  DETAIL DATA PESERTA
                </span>
                <h3 className="text-lg font-extrabold text-navy-900 dark:text-white">
                  {selectedPeserta.nama}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPeserta(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-400">NIK (KTP):</p>
                <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {selectedPeserta.nik}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Usia & Jenis Kelamin:</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedPeserta.usia} Tahun ({selectedPeserta.jenisKelamin})
                </p>
              </div>
              <div>
                <p className="text-slate-400">Pendidikan Terakhir:</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedPeserta.pendidikan}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Pekerjaan / Profesi:</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedPeserta.pekerjaan}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-400">Instansi / Organisasi:</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedPeserta.instansi}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-400">Alamat Domisili:</p>
                <p className="text-slate-800 dark:text-slate-200">{selectedPeserta.alamat}</p>
              </div>
            </div>

            {/* Assessment Scores Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-around text-center">
              <div>
                <p className="text-[11px] text-slate-400 uppercase font-bold">Skor Pre-Test</p>
                <p className="text-2xl font-black text-blue-600">
                  {selectedPeserta.preTestScore ?? "-"}
                </p>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
              <div>
                <p className="text-[11px] text-slate-400 uppercase font-bold">Skor Post-Test</p>
                <p
                  className={`text-2xl font-black ${
                    (selectedPeserta.postTestScore ?? 0) >= 70 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {selectedPeserta.postTestScore ?? "-"}
                </p>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
              <div>
                <p className="text-[11px] text-slate-400 uppercase font-bold">Status</p>
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedPeserta.isLulus
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {selectedPeserta.isLulus ? "LULUS" : "REMIDI"}
                </span>
              </div>
            </div>

            {/* Certificate & Evaluation */}
            {selectedPeserta.nomorSertifikat && (
              <div className="text-xs p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                <p className="font-bold text-navy-900 dark:text-blue-300">
                  Nomor Sertifikat Kelulusan:
                </p>
                <p className="font-mono text-blue-800 dark:text-blue-200">
                  {selectedPeserta.nomorSertifikat}
                </p>
              </div>
            )}

            {selectedPeserta.evaluasi && (
              <div className="text-xs space-y-1 p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
                <p className="font-bold text-amber-900 dark:text-amber-300">
                  Hasil Evaluasi Sistem:
                </p>
                <p className="text-slate-600 dark:text-slate-300 italic">
                  &ldquo;{selectedPeserta.evaluasi.kritikSaran || "-"}&rdquo;
                </p>
              </div>
            )}

            {/* Modal Actions Footer */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleDeletePeserta(selectedPeserta)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-200 dark:border-rose-900/50 shadow-xs transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Data Peserta</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPeserta(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all cursor-pointer text-center"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL FORM TAMBAH / EDIT SOAL SATU-SATU (MANUAL) */}
      {/* ===================================================================== */}
      {showSoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-up">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-extrabold text-navy-900 dark:text-white">
                {editingSoal ? "Edit Soal Ujian" : "Tambah Soal Ujian Baru"}
              </h3>
              <button
                type="button"
                onClick={() => setShowSoalModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSoal} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">Tipe Pengujian</label>
                  <select
                    value={soalForm.tipe}
                    onChange={(e: any) =>
                      setSoalForm((prev) => ({ ...prev, tipe: e.target.value }))
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="SEMUA">Semuanya (Pre-Test & Post-Test)</option>
                    <option value="PRE_TEST">Hanya Pre-Test</option>
                    <option value="POST_TEST">Hanya Post-Test</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Kategori Materi</label>
                  <input
                    type="text"
                    value={soalForm.kategori}
                    onChange={(e) =>
                      setSoalForm((prev) => ({ ...prev, kategori: e.target.value }))
                    }
                    placeholder="Regulasi Obat / Pangan Aman..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Pertanyaan Soal</label>
                <textarea
                  rows={3}
                  value={soalForm.pertanyaan}
                  onChange={(e) =>
                    setSoalForm((prev) => ({ ...prev, pertanyaan: e.target.value }))
                  }
                  placeholder="Tuliskan butir soal pertanyaan di sini..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              {/* 4 Pilihan Jawaban */}
              <div className="space-y-2">
                <label className="block font-bold">Opsi Pilihan Ganda (A, B, C, D)</label>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold">
                    A
                  </span>
                  <input
                    type="text"
                    value={soalForm.pilihanA}
                    onChange={(e) =>
                      setSoalForm((prev) => ({ ...prev, pilihanA: e.target.value }))
                    }
                    placeholder="Teks opsi A"
                    className="flex-1 p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold">
                    B
                  </span>
                  <input
                    type="text"
                    value={soalForm.pilihanB}
                    onChange={(e) =>
                      setSoalForm((prev) => ({ ...prev, pilihanB: e.target.value }))
                    }
                    placeholder="Teks opsi B"
                    className="flex-1 p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold">
                    C
                  </span>
                  <input
                    type="text"
                    value={soalForm.pilihanC}
                    onChange={(e) =>
                      setSoalForm((prev) => ({ ...prev, pilihanC: e.target.value }))
                    }
                    placeholder="Teks opsi C"
                    className="flex-1 p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold">
                    D
                  </span>
                  <input
                    type="text"
                    value={soalForm.pilihanD}
                    onChange={(e) =>
                      setSoalForm((prev) => ({ ...prev, pilihanD: e.target.value }))
                    }
                    placeholder="Teks opsi D"
                    className="flex-1 p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Kunci Jawaban */}
              <div>
                <label className="block font-bold mb-1">Kunci Jawaban yang Benar</label>
                <select
                  value={soalForm.jawabanBenar}
                  onChange={(e) =>
                    setSoalForm((prev) => ({ ...prev, jawabanBenar: e.target.value }))
                  }
                  className="w-full p-2.5 rounded-xl border border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 font-bold text-emerald-800 dark:text-emerald-200"
                >
                  <option value="A">Pilihan A</option>
                  <option value="B">Pilihan B</option>
                  <option value="C">Pilihan C</option>
                  <option value="D">Pilihan D</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSoalModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-navy-900 text-white font-bold"
                >
                  Simpan Soal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL TAMBAH MODUL MATERI BARU (UPLOAD PDF / PPT) */}
      {/* ===================================================================== */}
      {showCreateMateriModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-up">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  MODUL BARU (MODUL {materiList.length + 1})
                </span>
                <h3 className="text-lg font-extrabold text-navy-900 dark:text-white">
                  Tambah Modul Materi Pembelajaran
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateMateriModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewMateri} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1">Judul Modul Materi</label>
                <input
                  type="text"
                  required
                  value={newMateriForm.judul}
                  onChange={(e) =>
                    setNewMateriForm((prev) => ({ ...prev, judul: e.target.value }))
                  }
                  placeholder="Contoh: Pengawasan Bahan Tambahan Pangan (BTP) Berlebih"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Ringkasan Modul</label>
                <textarea
                  rows={2}
                  required
                  value={newMateriForm.ringkasan}
                  onChange={(e) =>
                    setNewMateriForm((prev) => ({ ...prev, ringkasan: e.target.value }))
                  }
                  placeholder="Deskripsi singkat materi pembelajaran yang akan dipelajari peserta..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              {/* Upload Berkas PDF atau PPT Materi */}
              <div>
                <label className="block font-bold mb-1">
                  Upload Berkas Materi (PDF / PowerPoint PPTX) <span className="text-rose-500">*</span>
                </label>
                <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-2xl p-5 text-center transition-all bg-slate-50/50 dark:bg-slate-800/30">
                  <input
                    type="file"
                    accept=".pdf,.ppt,.pptx"
                    required={!newMateriForm.file}
                    onChange={handleSelectMateriFile}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-navy-900 dark:text-white">
                        {newMateriForm.previewFileName ? (
                          <span className="text-blue-600 dark:text-blue-400">
                            {newMateriForm.previewFileName}
                          </span>
                        ) : (
                          "Klik atau seret berkas PDF atau PPT ke sini"
                        )}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Mendukung dokumen .PDF dan slide PowerPoint .PPTX
                      </p>
                    </div>
                  </div>
                </div>

                {newMateriForm.isAnalyzing && (
                  <div className="mt-2.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 flex items-center gap-2.5 text-blue-700 dark:text-blue-300 text-xs font-semibold animate-pulse">
                    <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                    Menganalisis berkas dan menghitung jumlah slide presentasi...
                  </div>
                )}

                {newMateriForm.previewSlidesCount !== null && (
                  <div className="mt-2.5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-200 text-xs space-y-2 animate-fade-up">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {newMateriForm.previewSlidesCount} Slide Terdeteksi Otomatis
                      </span>
                      <span className="text-[11px] opacity-80">{newMateriForm.previewFileSize}</span>
                    </div>

                    {newMateriForm.compressionStat && newMateriForm.compressionStat.savedPercent > 0 && (
                      <div className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg bg-emerald-100/90 dark:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-700/60 font-medium">
                        <span className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-100">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          Kompresi Otomatis Aktif
                        </span>
                        <span className="text-emerald-700 dark:text-emerald-300 font-semibold">
                          Hemat {newMateriForm.compressionStat.savedPercent}% ({newMateriForm.compressionStat.originalSizeText} → {newMateriForm.compressionStat.compressedSizeText})
                        </span>
                      </div>
                    )}

                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                      Jumlah slide materi pembelajaran akan otomatis disesuaikan persis dengan {newMateriForm.previewSlidesCount} slide dari berkas ini.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold mb-1">Estimasi Durasi Belajar</label>
                <input
                  type="text"
                  value={newMateriForm.durasi}
                  onChange={(e) =>
                    setNewMateriForm((prev) => ({ ...prev, durasi: e.target.value }))
                  }
                  placeholder="Contoh: 10 Menit Belajar"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateMateriModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={materiSaving || newMateriForm.isAnalyzing}
                  className="px-5 py-2 rounded-xl bg-navy-900 text-white font-bold inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {materiSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Menyimpan Modul...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Simpan Modul Baru
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL EDIT MODUL MATERI */}
      {/* ===================================================================== */}
      {editingMateri && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-up">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-extrabold text-navy-900 dark:text-white">
                Edit Informasi Modul {editingMateri.nomor}
              </h3>
              <button
                type="button"
                onClick={() => setEditingMateri(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditMateri} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1">Judul Modul</label>
                <input
                  type="text"
                  required
                  value={editingMateri.judul}
                  onChange={(e) =>
                    setEditingMateri((prev: any) => ({ ...prev, judul: e.target.value }))
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Ringkasan Materi</label>
                <textarea
                  rows={3}
                  required
                  value={editingMateri.ringkasan}
                  onChange={(e) =>
                    setEditingMateri((prev: any) => ({ ...prev, ringkasan: e.target.value }))
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Estimasi Durasi Belajar</label>
                <input
                  type="text"
                  value={editingMateri.durasi}
                  onChange={(e) =>
                    setEditingMateri((prev: any) => ({ ...prev, durasi: e.target.value }))
                  }
                  placeholder="7 Menit Belajar"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              {/* Status Berkas & Opsi Ganti Berkas */}
              <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Ganti Berkas Materi PDF / PPT (Opsional)
                </label>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="truncate text-slate-600 dark:text-slate-300">
                      {editingMateri.pdfUrl?.split("/").pop() || "materi-edukasi.pdf"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setAdminPdfPreview({
                          isOpen: true,
                          title: editingMateri.judul,
                          pdfUrl: editingMateri.pdfUrl || "/documents/materi-edukasi-bbpom.pdf",
                          badge: `Modul ${editingMateri.nomor}`,
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[11px] font-bold hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      Lihat Berkas
                    </button>
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold shrink-0">
                      {editingMateri.slides?.length || 0} Slide
                    </span>
                  </div>
                </div>

                <div className="relative border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-xl p-3 text-center transition-all bg-white dark:bg-slate-800">
                  <input
                    type="file"
                    accept=".pdf,.ppt,.pptx"
                    onChange={handleSelectEditMateriFile}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                    {editMateriFile ? editMateriFile.name : "+ Pilih berkas PDF / PPT baru untuk mengganti materi"}
                  </span>
                </div>

                {editIsAnalyzing && (
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[11px] font-semibold flex items-center gap-2 animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                    Menganalisis berkas materi baru...
                  </div>
                )}

                {editPreviewSlidesCount !== null && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-[11px] space-y-1.5 border border-emerald-200 dark:border-emerald-800/50">
                    <div className="flex items-center gap-2 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      Berkas baru terdeteksi memiliki {editPreviewSlidesCount} slide.
                    </div>
                    {editCompressionStat && editCompressionStat.savedPercent > 0 && (
                      <div className="flex items-center justify-between text-[10px] px-2 py-1 rounded-md bg-emerald-100/90 dark:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-700 font-medium">
                        <span className="flex items-center gap-1 font-bold text-emerald-900 dark:text-emerald-100">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          Kompresi Otomatis
                        </span>
                        <span className="text-emerald-700 dark:text-emerald-300 font-semibold">
                          Hemat {editCompressionStat.savedPercent}% ({editCompressionStat.originalSizeText} → {editCompressionStat.compressedSizeText})
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingMateri(null);
                    setEditMateriFile(null);
                    setEditPreviewSlidesCount(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={materiSaving || editIsAnalyzing}
                  className="px-5 py-2 rounded-xl bg-navy-900 text-white font-bold inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {materiSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Menyimpan Perubahan...
                    </>
                  ) : (
                    "Simpan Perubahan Modul"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* PROFESSIONAL WEB TOASTS & CONFIRMATION MODALS */}
      {/* ===================================================================== */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <ConfirmDialogModal config={confirmConfig} />

      {/* ===================================================================== */}
      {/* MODAL PRATINJAU DOKUMEN PDF MATERI RESMI */}
      {/* ===================================================================== */}
      <EducationPdfModal
        isOpen={adminPdfPreview.isOpen}
        onClose={() => setAdminPdfPreview((prev) => ({ ...prev, isOpen: false }))}
        title={adminPdfPreview.title || "Pratinjau Modul Materi"}
        badge={adminPdfPreview.badge || "Modul Materi BBPOM"}
        pdfUrl={adminPdfPreview.pdfUrl || "/documents/materi-edukasi-bbpom.pdf"}
        filename={adminPdfPreview.pdfUrl?.split("/").pop() || "Materi-BBPOM.pdf"}
      />
    </div>
  );
}
