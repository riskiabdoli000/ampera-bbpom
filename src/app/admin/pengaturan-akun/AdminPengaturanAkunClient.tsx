"use client";

import React, { useState, useMemo, useTransition } from "react";
import {
  UserCog,
  Users,
  KeyRound,
  Shield,
  ShieldCheck,
  UserPlus,
  Search,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Power,
  RefreshCw,
  Sparkles,
  Info,
  User,
  ArrowRight,
  Filter,
} from "lucide-react";
import {
  AdminAccountItem,
  CurrentAdminProfile,
  changeMyPasswordAction,
  updateMyProfileAction,
  toggleAccountStatusAction,
} from "@/app/actions/admin-account";
import { CreateOperatorModal } from "./CreateOperatorModal";
import { ResetPasswordModal } from "./ResetPasswordModal";
import { DeleteAccountModal } from "./DeleteAccountModal";

interface AdminPengaturanAkunClientProps {
  initialCurrentAdmin: CurrentAdminProfile;
  initialAccounts: AdminAccountItem[];
}

export function AdminPengaturanAkunClient({
  initialCurrentAdmin,
  initialAccounts,
}: AdminPengaturanAkunClientProps) {
  const [activeTab, setActiveTab] = useState<"MANAJEMEN_OPERATOR" | "GANTI_PASSWORD">(
    "MANAJEMEN_OPERATOR"
  );

  // Data State
  const [currentAdmin, setCurrentAdmin] = useState<CurrentAdminProfile>(initialCurrentAdmin);
  const [accounts, setAccounts] = useState<AdminAccountItem[]>(initialAccounts);

  // Filter State for Management Tab
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "SUPERADMIN" | "OPERATOR">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedForReset, setSelectedForReset] = useState<AdminAccountItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<AdminAccountItem | null>(null);

  // Banner Feedback
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Form State: Ganti Password Saya
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  // Form State: Ubah Nama Profil
  const [profileName, setProfileName] = useState(currentAdmin.nama);
  const [profileLoading, setProfileLoading] = useState(false);

  // Toggling status state
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  const isSuperadmin = currentAdmin.role === "SUPERADMIN";

  // Auto clear feedback after 6s
  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback((prev) => (prev?.message === message ? null : prev));
    }, 6000);
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = accounts.length;
    const superadmins = accounts.filter((a) => a.role === "SUPERADMIN").length;
    const operators = accounts.filter((a) => a.role === "OPERATOR").length;
    const active = accounts.filter((a) => a.isAktif).length;
    return { total, superadmins, operators, active };
  }, [accounts]);

  // Filtered Accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const matchSearch =
        acc.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.username.toLowerCase().includes(searchQuery.toLowerCase());

      const matchRole =
        roleFilter === "ALL" ? true : acc.role === roleFilter;

      const matchStatus =
        statusFilter === "ALL"
          ? true
          : statusFilter === "ACTIVE"
          ? acc.isAktif
          : !acc.isAktif;

      return matchSearch && matchRole && matchStatus;
    });
  }, [accounts, searchQuery, roleFilter, statusFilter]);

  // Handler: Ganti Password Saya
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showFeedback("error", "Kata sandi baru minimal harus 6 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showFeedback("error", "Konfirmasi kata sandi baru tidak cocok.");
      return;
    }

    setPassLoading(true);
    try {
      const res = await changeMyPasswordAction({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (res.success) {
        showFeedback("success", res.message || "Kata sandi berhasil diperbarui.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showFeedback("error", res.error || "Gagal mengubah kata sandi.");
      }
    } catch {
      showFeedback("error", "Terjadi gangguan saat menghubungi server.");
    } finally {
      setPassLoading(false);
    }
  };

  // Handler: Ubah Nama Profil
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      showFeedback("error", "Nama lengkap tidak boleh kosong.");
      return;
    }

    setProfileLoading(true);
    try {
      const res = await updateMyProfileAction({ nama: profileName });
      if (res.success) {
        showFeedback("success", res.message || "Nama profil berhasil diperbarui.");
        setCurrentAdmin((prev) => ({ ...prev, nama: profileName.trim() }));
        setAccounts((prev) =>
          prev.map((a) => (a.id === currentAdmin.id ? { ...a, nama: profileName.trim() } : a))
        );
      } else {
        showFeedback("error", res.error || "Gagal memperbarui nama profil.");
      }
    } catch {
      showFeedback("error", "Gagal memperbarui nama.");
    } finally {
      setProfileLoading(false);
    }
  };

  // Handler: Toggle Status Aktif/Nonaktif
  const handleToggleStatus = async (account: AdminAccountItem) => {
    if (account.id === currentAdmin.id) {
      showFeedback("error", "Anda tidak dapat menonaktifkan akun yang sedang digunakan.");
      return;
    }

    setTogglingId(account.id);
    startTransition(async () => {
      try {
        const res = await toggleAccountStatusAction({ targetAdminId: account.id });
        if (res.success && res.data) {
          const newStatus = res.data.isAktif;
          setAccounts((prev) =>
            prev.map((a) => (a.id === account.id ? { ...a, isAktif: newStatus } : a))
          );
          showFeedback(
            "success",
            `Akun "${account.nama}" kini berstatus ${newStatus ? "Aktif" : "Nonaktif"}.`
          );
        } else {
          showFeedback("error", res.error || "Gagal mengubah status akun.");
        }
      } catch {
        showFeedback("error", "Terjadi kesalahan koneksi.");
      } finally {
        setTogglingId(null);
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-6 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1664e8] dark:text-sky-400">
            <UserCog className="h-4 w-4" />
            <span>Manajemen Akun & Autentikasi</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-[#0f2257] dark:text-white font-brand">
            Pengaturan Akun Petugas
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#7b8aa8] dark:text-slate-400">
            Ganti kata sandi akun pribadi, buat akun operator baru, serta reset kata sandi akses sistem AMPERA.
          </p>
        </div>

        {/* Current Logged In Badge */}
        <div className="flex items-center gap-3 rounded-2xl border border-[#e3ecfa] bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#1664e8] to-[#408bff] text-xs font-bold text-white shadow-sm">
            {currentAdmin.nama.charAt(0)}
          </div>
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0f2257] dark:text-white truncate">
                {currentAdmin.nama}
              </span>
              <span
                className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                  currentAdmin.role === "SUPERADMIN"
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                }`}
              >
                {currentAdmin.role}
              </span>
            </div>
            <p className="text-[11px] text-[#7b8aa8] dark:text-slate-400">
              @{currentAdmin.username} • Login Aktif
            </p>
          </div>
        </div>
      </div>

      {/* Global Feedback Alert */}
      {feedback && (
        <div
          className={`flex items-start justify-between gap-3 rounded-2xl border p-4 text-xs transition-all animate-fade-in ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <span className="font-semibold">{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tab Selector */}
      <div className="flex border-b border-[#e3ecfa] dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab("MANAJEMEN_OPERATOR")}
          className={`relative flex items-center gap-2.5 pb-3.5 pt-1 text-xs sm:text-sm font-bold transition-colors ${
            activeTab === "MANAJEMEN_OPERATOR"
              ? "text-[#1664e8] dark:text-sky-400"
              : "text-[#7b8aa8] hover:text-[#0f2257] dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Manajemen Akun Operator</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {accounts.length}
          </span>
          {activeTab === "MANAJEMEN_OPERATOR" && (
            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#1664e8] dark:bg-sky-400 rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("GANTI_PASSWORD")}
          className={`relative ml-6 flex items-center gap-2.5 pb-3.5 pt-1 text-xs sm:text-sm font-bold transition-colors ${
            activeTab === "GANTI_PASSWORD"
              ? "text-[#1664e8] dark:text-sky-400"
              : "text-[#7b8aa8] hover:text-[#0f2257] dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <KeyRound className="h-4 w-4" />
          <span>Ganti Kata Sandi Saya</span>
          {activeTab === "GANTI_PASSWORD" && (
            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#1664e8] dark:bg-sky-400 rounded-full" />
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: MANAJEMEN AKUN OPERATOR                           */}
      {/* ======================================================== */}
      {activeTab === "MANAJEMEN_OPERATOR" && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-[#e3ecfa] bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#7b8aa8]">Total Petugas</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-[#1664e8] dark:bg-blue-950/50 dark:text-blue-400">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-black text-[#0f2257] dark:text-white">
                {metrics.total}
              </div>
              <p className="mt-0.5 text-[11px] text-[#7b8aa8]">Semua akun terdaftar</p>
            </div>

            <div className="rounded-2xl border border-[#e3ecfa] bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#7b8aa8]">Akun Operator</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
                  <User className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-black text-[#0f2257] dark:text-white">
                {metrics.operators}
              </div>
              <p className="mt-0.5 text-[11px] text-[#7b8aa8]">Petugas pelaksana</p>
            </div>

            <div className="rounded-2xl border border-[#e3ecfa] bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#7b8aa8]">Superadmin</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-black text-[#0f2257] dark:text-white">
                {metrics.superadmins}
              </div>
              <p className="mt-0.5 text-[11px] text-[#7b8aa8]">Administrator utama</p>
            </div>

            <div className="rounded-2xl border border-[#e3ecfa] bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#7b8aa8]">Status Aktif</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                  <Power className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-black text-[#0f2257] dark:text-white">
                {metrics.active}
              </div>
              <p className="mt-0.5 text-[11px] text-[#7b8aa8]">Bisa login ke sistem</p>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#e3ecfa] bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7b8aa8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan nama atau username..."
                className="w-full rounded-xl border border-[#e3ecfa] bg-slate-50/70 py-2.5 pl-10 pr-4 text-xs font-medium text-[#0f2257] transition focus:border-[#1664e8] focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/60 dark:text-white dark:focus:bg-slate-900"
              />
            </div>

            {/* Filter Dropdowns & CTA */}
            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="rounded-xl border border-[#e3ecfa] bg-slate-50/70 px-3 py-2 text-xs font-semibold text-[#0f2257] focus:border-[#1664e8] focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="ALL">Semua Wewenang</option>
                <option value="OPERATOR">Operator Saja</option>
                <option value="SUPERADMIN">Superadmin Saja</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="rounded-xl border border-[#e3ecfa] bg-slate-50/70 px-3 py-2 text-xs font-semibold text-[#0f2257] focus:border-[#1664e8] focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="ALL">Semua Status</option>
                <option value="ACTIVE">Hanya Aktif</option>
                <option value="INACTIVE">Hanya Nonaktif</option>
              </select>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1664e8] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition hover:bg-[#1253c4]"
              >
                <UserPlus className="h-4 w-4" />
                <span>Tambah Operator</span>
              </button>
            </div>
          </div>

          {/* Accounts Table Card */}
          <div className="overflow-hidden rounded-2xl border border-[#e3ecfa] bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#eef3fb] bg-slate-50/60 text-[#7b8aa8] dark:border-slate-800 dark:bg-slate-800/40">
                  <tr>
                    <th className="py-3.5 pl-6 pr-4 font-semibold">Petugas / Pengguna</th>
                    <th className="py-3.5 pr-4 font-semibold">Wewenang (Role)</th>
                    <th className="py-3.5 pr-4 font-semibold">Status Akun</th>
                    <th className="py-3.5 pr-4 font-semibold">Histori Verifikasi</th>
                    <th className="py-3.5 pr-6 text-right font-semibold">Aksi Pengelolaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef3fb] dark:divide-slate-800">
                  {filteredAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <Users className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                        <p className="font-semibold text-xs">Tidak ada akun operator yang cocok.</p>
                        <p className="text-[11px] text-[#7b8aa8] mt-0.5">
                          Coba ubah kata kunci pencarian atau filter status Anda.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredAccounts.map((acc) => {
                      const isSelf = acc.id === currentAdmin.id;
                      const isToggling = togglingId === acc.id;

                      return (
                        <tr
                          key={acc.id}
                          className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                        >
                          {/* Kolom Petugas */}
                          <td className="py-4 pl-6 pr-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold uppercase text-white shadow-sm ${
                                  acc.role === "SUPERADMIN"
                                    ? "bg-gradient-to-tr from-purple-600 to-indigo-600"
                                    : "bg-gradient-to-tr from-[#1664e8] to-[#408bff]"
                                }`}
                              >
                                {acc.nama.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-[#0f2257] dark:text-white truncate">
                                    {acc.nama}
                                  </span>
                                  {isSelf && (
                                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-extrabold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                      Akun Anda
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-[#7b8aa8] dark:text-slate-400">
                                  @{acc.username}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Kolom Role */}
                          <td className="py-4 pr-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
                                acc.role === "SUPERADMIN"
                                  ? "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-900/40"
                                  : "bg-blue-50 text-[#1664e8] dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40"
                              }`}
                            >
                              {acc.role === "SUPERADMIN" ? (
                                <Shield className="h-3 w-3" />
                              ) : (
                                <User className="h-3 w-3" />
                              )}
                              <span>{acc.role}</span>
                            </span>
                          </td>

                          {/* Kolom Status */}
                          <td className="py-4 pr-4">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(acc)}
                              disabled={isSelf || isToggling}
                              title={
                                isSelf
                                  ? "Anda tidak dapat menonaktifkan akun sendiri"
                                  : "Klik untuk mengubah status aktif/nonaktif"
                              }
                              className={`group inline-flex items-center gap-2 rounded-xl px-2.5 py-1 text-[11px] font-bold transition ${
                                acc.isAktif
                                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
                                  : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                              } ${isSelf ? "cursor-default opacity-80" : "cursor-pointer"}`}
                            >
                              {isToggling ? (
                                <Loader2 className="h-3 w-3 animate-spin text-slate-500" />
                              ) : (
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    acc.isAktif ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                                  }`}
                                />
                              )}
                              <span>{acc.isAktif ? "Aktif" : "Nonaktif"}</span>
                            </button>
                          </td>

                          {/* Kolom Verifikasi */}
                          <td className="py-4 pr-4">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {acc.verifikasiCount}
                            </span>{" "}
                            <span className="text-[11px] text-[#7b8aa8]">berkas diproses</span>
                          </td>

                          {/* Kolom Aksi */}
                          <td className="py-4 pr-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Tombol Reset Password */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedForReset(acc);
                                  setIsResetModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50/80 px-2.5 py-1.5 text-[11px] font-bold text-amber-700 transition hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/60"
                                title="Reset Kata Sandi Akun Ini"
                              >
                                <KeyRound className="h-3 w-3" />
                                <span>Reset Password</span>
                              </button>

                              {/* Tombol Hapus (Hanya jika bukan akun sendiri) */}
                              {!isSelf && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedForDelete(acc);
                                    setIsDeleteModalOpen(true);
                                  }}
                                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/60"
                                  title="Hapus Akun Operator"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Summary info */}
            <div className="border-t border-[#eef3fb] bg-slate-50/40 px-6 py-3 text-[11px] text-[#7b8aa8] dark:border-slate-800 dark:bg-slate-900/40">
              Menampilkan <strong>{filteredAccounts.length}</strong> dari total{" "}
              <strong>{accounts.length}</strong> akun operator di database.
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: GANTI KATA SANDI SAYA                             */}
      {/* ======================================================== */}
      {activeTab === "GANTI_PASSWORD" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kolom Kiri: Profil & Keterangan Keamanan */}
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-2xl border border-[#e3ecfa] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-[#1664e8] to-[#408bff] text-2xl font-black text-white shadow-lg shadow-blue-500/20">
                  {currentAdmin.nama.charAt(0)}
                </div>
                <h3 className="mt-4 text-base font-bold text-[#0f2257] dark:text-white">
                  {currentAdmin.nama}
                </h3>
                <p className="text-xs text-[#7b8aa8]">@{currentAdmin.username}</p>

                <div className="mt-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                      currentAdmin.role === "SUPERADMIN"
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                    }`}
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>{currentAdmin.role}</span>
                  </span>
                </div>
              </div>

              {/* Form Update Nama Tampilan */}
              <form onSubmit={handleUpdateProfile} className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
                <label className="mb-1.5 block text-xs font-semibold text-[#0f2257] dark:text-slate-200">
                  Perbarui Nama Lengkap
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="flex-1 rounded-xl border border-[#e3ecfa] bg-slate-50/60 px-3 py-2 text-xs font-medium text-[#0f2257] focus:border-[#1664e8] focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={profileLoading || profileName === currentAdmin.nama}
                    className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    {profileLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Ubah"}
                  </button>
                </div>
              </form>
            </div>

            {/* Tips Keamanan Sandi */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 dark:border-blue-900/40 dark:bg-blue-950/30">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1664e8] dark:text-sky-300">
                <Info className="h-4 w-4 shrink-0" />
                <span>Tips Keamanan Kata Sandi</span>
              </div>
              <ul className="mt-2.5 space-y-2 text-[11px] text-[#5d6c8c] dark:text-slate-300 leading-relaxed">
                <li>• Gunakan minimal 6 karakter dengan kombinasi huruf dan angka.</li>
                <li>• Hindari menggunakan tanggal lahir atau nama pengguna.</li>
                <li>• Jangan berikan kata sandi Anda kepada siapa pun demi keamanan data masyarakat.</li>
              </ul>
            </div>
          </div>

          {/* Kolom Kanan: Form Ganti Password */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-[#e3ecfa] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#1664e8] to-[#408bff] text-white shadow-md shadow-blue-500/20">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0f2257] dark:text-white">
                    Ganti Kata Sandi Pribadi
                  </h3>
                  <p className="text-xs text-[#7b8aa8] dark:text-slate-400">
                    Masukkan kata sandi lama Anda terlebih dahulu untuk verifikasi keamanan
                  </p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
                {/* Kata Sandi Lama */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#0f2257] dark:text-slate-200">
                    Kata Sandi Saat Ini <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7b8aa8]" />
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Masukkan kata sandi saat ini"
                      className="w-full rounded-xl border border-[#e3ecfa] bg-slate-50/60 py-2.5 pl-10 pr-10 text-xs font-medium text-[#0f2257] transition focus:border-[#1664e8] focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/60 dark:text-white dark:focus:bg-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Kata Sandi Baru */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[#0f2257] dark:text-slate-200">
                      Kata Sandi Baru <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7b8aa8]" />
                      <input
                        type={showNewPass ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full rounded-xl border border-[#e3ecfa] bg-slate-50/60 py-2.5 pl-10 pr-10 text-xs font-medium text-[#0f2257] transition focus:border-[#1664e8] focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/60 dark:text-white dark:focus:bg-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Ulangi Kata Sandi Baru */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[#0f2257] dark:text-slate-200">
                      Ulangi Kata Sandi Baru <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7b8aa8]" />
                      <input
                        type={showConfirmPass ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ketik ulang kata sandi baru"
                        className="w-full rounded-xl border border-[#e3ecfa] bg-slate-50/60 py-2.5 pl-10 pr-10 text-xs font-medium text-[#0f2257] transition focus:border-[#1664e8] focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/60 dark:text-white dark:focus:bg-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Match Indicator */}
                {newPassword && confirmPassword && (
                  <div className="text-[11px] font-semibold">
                    {newPassword === confirmPassword ? (
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Kata sandi baru cocok dan siap disimpan.
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Konfirmasi kata sandi belum cocok.
                      </span>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={passLoading || !currentPassword || !newPassword || !confirmPassword}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#1664e8] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition hover:bg-[#1253c4] disabled:opacity-50"
                  >
                    {passLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Memperbarui...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Simpan Kata Sandi Baru</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tambah Operator Baru */}
      <CreateOperatorModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        isSuperadmin={isSuperadmin}
        onSuccess={(msg) => {
          showFeedback("success", msg);
          // Refresh list by triggering a server action or update state
          window.location.reload();
        }}
      />

      {/* Modal: Reset Password Operator */}
      <ResetPasswordModal
        isOpen={isResetModalOpen}
        targetAccount={selectedForReset}
        onClose={() => {
          setIsResetModalOpen(false);
          setSelectedForReset(null);
        }}
        onSuccess={(msg) => {
          showFeedback("success", msg);
        }}
      />

      {/* Modal: Konfirmasi Hapus Akun */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        targetAccount={selectedForDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedForDelete(null);
        }}
        onSuccess={(msg) => {
          showFeedback("success", msg);
          if (selectedForDelete) {
            setAccounts((prev) => prev.filter((a) => a.id !== selectedForDelete.id));
          }
        }}
      />
    </div>
  );
}
