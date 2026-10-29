"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword, comparePassword } from "@/lib/auth/password";
import { verifyAdminSession, getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { RoleAdmin } from "@prisma/client";

export interface AdminAccountItem {
  id: number;
  username: string;
  nama: string;
  role: "SUPERADMIN" | "OPERATOR";
  isAktif: boolean;
  createdAt: string;
  updatedAt: string;
  verifikasiCount: number;
}

export interface CurrentAdminProfile {
  id: number;
  username: string;
  nama: string;
  role: string;
  isAktif: boolean;
  createdAt: string;
}

export type ActionResult<T = unknown> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

/**
 * Mengambil data profil admin yang sedang login dan seluruh daftar akun admin/operator
 */
export async function getAdminAccountDataAction(): Promise<
  ActionResult<{
    currentAdmin: CurrentAdminProfile;
    accounts: AdminAccountItem[];
  }>
> {
  try {
    const session = await verifyAdminSession();

    const [currentAdminDb, rawAccounts] = await Promise.all([
      prisma.admin.findUnique({
        where: { id: session.id },
        select: {
          id: true,
          username: true,
          nama: true,
          role: true,
          isAktif: true,
          createdAt: true,
        },
      }),
      prisma.admin.findMany({
        select: {
          id: true,
          username: true,
          nama: true,
          role: true,
          isAktif: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { verifikasi: true },
          },
        },
        orderBy: [{ role: "asc" }, { createdAt: "desc" }],
      }),
    ]);

    if (!currentAdminDb) {
      return {
        success: false,
        error: "Data akun Anda tidak ditemukan di database.",
      };
    }

    const accounts: AdminAccountItem[] = rawAccounts.map((acc) => ({
      id: acc.id,
      username: acc.username,
      nama: acc.nama,
      role: acc.role as "SUPERADMIN" | "OPERATOR",
      isAktif: acc.isAktif,
      createdAt: acc.createdAt.toISOString(),
      updatedAt: acc.updatedAt.toISOString(),
      verifikasiCount: acc._count.verifikasi,
    }));

    return {
      success: true,
      data: {
        currentAdmin: {
          id: currentAdminDb.id,
          username: currentAdminDb.username,
          nama: currentAdminDb.nama,
          role: currentAdminDb.role,
          isAktif: currentAdminDb.isAktif,
          createdAt: currentAdminDb.createdAt.toISOString(),
        },
        accounts,
      },
    };
  } catch (error) {
    console.error("[getAdminAccountDataAction] Error:", error);
    return {
      success: false,
      error: "Gagal mengambil data akun. Pastikan Anda memiliki sesi admin yang valid.",
    };
  }
}

/**
 * Ganti kata sandi admin yang sedang login
 */
export async function changeMyPasswordAction(payload: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ActionResult> {
  try {
    const session = await verifyAdminSession();

    const { currentPassword, newPassword, confirmPassword } = payload;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return {
        success: false,
        error: "Semua bidang formulir kata sandi wajib diisi.",
      };
    }

    if (newPassword.length < 6) {
      return {
        success: false,
        error: "Kata sandi baru minimal harus terdiri dari 6 karakter.",
      };
    }

    if (newPassword !== confirmPassword) {
      return {
        success: false,
        error: "Konfirmasi kata sandi baru tidak cocok. Periksa kembali.",
      };
    }

    // Ambil data admin saat ini beserta password terenkripsi dari DB
    const admin = await prisma.admin.findUnique({
      where: { id: session.id },
    });

    if (!admin) {
      return {
        success: false,
        error: "Akun admin tidak ditemukan.",
      };
    }

    const isMatch = await comparePassword(currentPassword, admin.password);
    if (!isMatch) {
      return {
        success: false,
        error: "Kata sandi saat ini yang Anda masukkan salah.",
      };
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.admin.update({
      where: { id: session.id },
      data: {
        password: hashedPassword,
      },
    });

    revalidatePath("/admin/pengaturan-akun");
    return {
      success: true,
      message: "Kata sandi akun Anda berhasil diperbarui.",
    };
  } catch (error) {
    console.error("[changeMyPasswordAction] Error:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat memperbarui kata sandi.",
    };
  }
}

/**
 * Perbarui nama tampilan profil admin yang sedang login
 */
export async function updateMyProfileAction(payload: {
  nama: string;
}): Promise<ActionResult> {
  try {
    const session = await verifyAdminSession();
    const namaClean = payload.nama.trim();

    if (!namaClean || namaClean.length < 3) {
      return {
        success: false,
        error: "Nama lengkap minimal terdiri dari 3 karakter.",
      };
    }

    await prisma.admin.update({
      where: { id: session.id },
      data: { nama: namaClean },
    });

    revalidatePath("/admin/pengaturan-akun");
    return {
      success: true,
      message: "Nama profil Anda berhasil diperbarui.",
    };
  } catch (error) {
    console.error("[updateMyProfileAction] Error:", error);
    return {
      success: false,
      error: "Gagal memperbarui nama profil.",
    };
  }
}

/**
 * Menambahkan akun operator / admin baru ke dalam sistem
 */
export async function createOperatorAccountAction(payload: {
  nama: string;
  username: string;
  password: string;
  confirmPassword: string;
  role?: "OPERATOR" | "SUPERADMIN";
}): Promise<ActionResult> {
  try {
    const session = await verifyAdminSession();

    const namaClean = payload.nama?.trim();
    const usernameClean = payload.username?.trim().toLowerCase();
    const { password, confirmPassword } = payload;
    const roleChoice = payload.role === "SUPERADMIN" ? RoleAdmin.SUPERADMIN : RoleAdmin.OPERATOR;

    // Batasan role: jika operator biasa, tidak diperkenankan membuat superadmin
    if (session.role !== "SUPERADMIN" && roleChoice === RoleAdmin.SUPERADMIN) {
      return {
        success: false,
        error: "Hanya akun bertipe Superadmin yang berwenang membuat akun Superadmin baru.",
      };
    }

    if (!namaClean || namaClean.length < 3) {
      return {
        success: false,
        error: "Nama operator minimal 3 karakter.",
      };
    }

    if (!usernameClean || usernameClean.length < 3) {
      return {
        success: false,
        error: "Username minimal 3 karakter.",
      };
    }

    // Validasi format username (hanya huruf, angka, underscore, titik, atau strip)
    const usernameRegex = /^[a-z0-9_.-]+$/;
    if (!usernameRegex.test(usernameClean)) {
      return {
        success: false,
        error: "Username hanya boleh mengandung huruf kecil, angka, garis bawah (_), atau titik.",
      };
    }

    if (!password || password.length < 6) {
      return {
        success: false,
        error: "Kata sandi akun minimal harus 6 karakter.",
      };
    }

    if (password !== confirmPassword) {
      return {
        success: false,
        error: "Konfirmasi kata sandi tidak cocok.",
      };
    }

    // Cek duplikasi username
    const existing = await prisma.admin.findUnique({
      where: { username: usernameClean },
    });

    if (existing) {
      return {
        success: false,
        error: `Username "${usernameClean}" telah digunakan oleh petugas lain. Gunakan username unik lain.`,
      };
    }

    const hashedPassword = await hashPassword(password);

    await prisma.admin.create({
      data: {
        nama: namaClean,
        username: usernameClean,
        password: hashedPassword,
        role: roleChoice,
        isAktif: true,
      },
    });

    revalidatePath("/admin/pengaturan-akun");
    return {
      success: true,
      message: `Akun ${roleChoice === "SUPERADMIN" ? "Superadmin" : "Operator"} "${namaClean}" (@${usernameClean}) berhasil dibuat.`,
    };
  } catch (error) {
    console.error("[createOperatorAccountAction] Error:", error);
    return {
      success: false,
      error: "Gagal membuat akun operator baru. Terjadi kendala di server database.",
    };
  }
}

/**
 * Reset kata sandi akun operator oleh Admin
 */
export async function resetOperatorPasswordAction(payload: {
  targetAdminId: number;
  newPassword: string;
  confirmPassword: string;
}): Promise<ActionResult> {
  try {
    const session = await verifyAdminSession();
    const { targetAdminId, newPassword, confirmPassword } = payload;

    if (!targetAdminId) {
      return {
        success: false,
        error: "Target akun operator tidak ditentukan.",
      };
    }

    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        error: "Kata sandi baru minimal 6 karakter.",
      };
    }

    if (newPassword !== confirmPassword) {
      return {
        success: false,
        error: "Konfirmasi kata sandi tidak cocok. Mohon ulangi pengetikan.",
      };
    }

    const targetAdmin = await prisma.admin.findUnique({
      where: { id: targetAdminId },
    });

    if (!targetAdmin) {
      return {
        success: false,
        error: "Akun operator target tidak ditemukan dalam sistem database.",
      };
    }

    // Proteksi: Operator biasa tidak boleh mereset password Superadmin
    if (session.role !== "SUPERADMIN" && targetAdmin.role === "SUPERADMIN") {
      return {
        success: false,
        error: "Anda tidak memiliki wewenang untuk mereset kata sandi akun Superadmin.",
      };
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.admin.update({
      where: { id: targetAdminId },
      data: { password: hashedPassword },
    });

    revalidatePath("/admin/pengaturan-akun");
    return {
      success: true,
      message: `Kata sandi akun "${targetAdmin.nama}" (@${targetAdmin.username}) berhasil direset. Beritahukan kata sandi baru kepada petugas yang bersangkutan.`,
    };
  } catch (error) {
    console.error("[resetOperatorPasswordAction] Error:", error);
    return {
      success: false,
      error: "Gagal mereset kata sandi akun operator.",
    };
  }
}

/**
 * Ubah status aktif / nonaktif akun
 */
export async function toggleAccountStatusAction(payload: {
  targetAdminId: number;
}): Promise<ActionResult<{ isAktif: boolean }>> {
  try {
    const session = await verifyAdminSession();
    const { targetAdminId } = payload;

    if (session.id === targetAdminId) {
      return {
        success: false,
        error: "Anda tidak dapat menonaktifkan akun Anda sendiri saat sedang login.",
      };
    }

    const targetAdmin = await prisma.admin.findUnique({
      where: { id: targetAdminId },
    });

    if (!targetAdmin) {
      return {
        success: false,
        error: "Akun tidak ditemukan.",
      };
    }

    if (session.role !== "SUPERADMIN" && targetAdmin.role === "SUPERADMIN") {
      return {
        success: false,
        error: "Hanya Superadmin yang dapat mengubah status akun Superadmin.",
      };
    }

    const newStatus = !targetAdmin.isAktif;

    await prisma.admin.update({
      where: { id: targetAdminId },
      data: { isAktif: newStatus },
    });

    revalidatePath("/admin/pengaturan-akun");
    return {
      success: true,
      message: `Status akun "${targetAdmin.nama}" berhasil diubah menjadi ${newStatus ? "Aktif" : "Nonaktif"}.`,
      data: { isAktif: newStatus },
    };
  } catch (error) {
    console.error("[toggleAccountStatusAction] Error:", error);
    return {
      success: false,
      error: "Gagal mengubah status aktifasi akun.",
    };
  }
}

/**
 * Hapus akun operator secara permanen
 */
export async function deleteAccountAction(payload: {
  targetAdminId: number;
}): Promise<ActionResult> {
  try {
    const session = await verifyAdminSession();
    const { targetAdminId } = payload;

    if (session.id === targetAdminId) {
      return {
        success: false,
        error: "Anda tidak dapat menghapus akun Anda sendiri.",
      };
    }

    const targetAdmin = await prisma.admin.findUnique({
      where: { id: targetAdminId },
      include: {
        _count: {
          select: { verifikasi: true },
        },
      },
    });

    if (!targetAdmin) {
      return {
        success: false,
        error: "Akun yang ingin dihapus tidak ditemukan.",
      };
    }

    if (session.role !== "SUPERADMIN" && targetAdmin.role === "SUPERADMIN") {
      return {
        success: false,
        error: "Anda tidak memiliki wewenang untuk menghapus akun Superadmin.",
      };
    }

    // Cegah penghapusan jika akun memiliki riwayat verifikasi layanan publik
    if (targetAdmin._count.verifikasi > 0) {
      return {
        success: false,
        error: `Akun "${targetAdmin.nama}" telah memverifikasi ${targetAdmin._count.verifikasi} berkas pengajuan layanan masyarakat. Untuk menjaga integritas rekam jejak audit, Anda disarankan menonaktifkan akun (toggle nonaktif) daripada menghapusnya.`,
      };
    }

    await prisma.admin.delete({
      where: { id: targetAdminId },
    });

    revalidatePath("/admin/pengaturan-akun");
    return {
      success: true,
      message: `Akun "${targetAdmin.nama}" (@${targetAdmin.username}) telah berhasil dihapus dari database.`,
    };
  } catch (error) {
    console.error("[deleteAccountAction] Error:", error);
    return {
      success: false,
      error: "Gagal menghapus akun operator.",
    };
  }
}
