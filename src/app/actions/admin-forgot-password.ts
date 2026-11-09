"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword, comparePassword } from "@/lib/auth/password";
import { sendRawWhatsAppMessage } from "@/lib/whatsapp";
import crypto from "crypto";

export type ForgotPasswordResult<T = unknown> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

/**
 * Mask nomor telepon: misal 08117850008 -> 0811-****-008
 */
function maskPhoneNumber(phone: string): string {
  const clean = phone.replace(/[^0-9]/g, "");
  if (clean.length <= 6) return clean;
  const start = clean.slice(0, 4);
  const end = clean.slice(-3);
  return `${start}-****-${end}`;
}

/**
 * Tahap 1: Meminta kode OTP untuk reset kata sandi
 */
export async function requestAdminResetOtpAction(
  username: string
): Promise<ForgotPasswordResult<{ maskedPhone: string }>> {
  try {
    const cleanUsername = username?.trim().toLowerCase();
    if (!cleanUsername) {
      return {
        success: false,
        error: "Silakan masukkan username akun Anda.",
      };
    }

    const admin = await prisma.admin.findUnique({
      where: { username: cleanUsername },
    });

    if (!admin) {
      return {
        success: false,
        error: "Akun dengan username tersebut tidak ditemukan.",
      };
    }

    if (!admin.isAktif) {
      return {
        success: false,
        error: "Akun ini telah dinonaktifkan. Hubungi Superadmin.",
      };
    }

    // Periksa apakah admin memiliki nomor telepon terdaftar
    if (!admin.telepon || admin.telepon.trim().length < 8) {
      return {
        success: false,
        error:
          "Akun Anda belum memiliki nomor WhatsApp terdaftar. Silakan hubungi Superadmin atau IT Administrator untuk melakukan reset manual.",
      };
    }

    // Generate kode OTP 6 digit angka
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await hashPassword(otp);
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

    // Simpan OTP ke database
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        resetOtp: hashedOtp,
        resetOtpExpiry: expiry,
        resetOtpAttempts: 0,
      },
    });

    // Kirim pesan WhatsApp via Baileys gateway
    const waMessage = `*KODE VERIFIKASI RESET KATA SANDI*\n*Sistem AMPERA BBPOM di Palembang*\n\nHalo *${admin.nama}*,\nKami menerima permintaan untuk mereset kata sandi akun AMPERA Anda (*${admin.username}*).\n\nKode verifikasi OTP Anda:\n👉 *${otp}* 👈\n\nKode ini berlaku selama *10 menit*.\n⚠️ JANGAN berikan kode ini kepada siapa pun demi keamanan sistem.\n\nJika Anda tidak merasa melakukan permintaan ini, abaikan pesan ini atau segera hubungi IT Support BBPOM Palembang.`;

    const waRes = await sendRawWhatsAppMessage(admin.telepon, waMessage);
    const masked = maskPhoneNumber(admin.telepon);

    if (!waRes.success) {
      console.warn("[requestAdminResetOtpAction] Gagal kirim WA:", waRes.error);
      return {
        success: false,
        error: `Gagal mengirim WhatsApp ke nomor terdaftar (${masked}). Pastikan gateway WhatsApp aktif atau hubungi IT Support.`,
      };
    }

    return {
      success: true,
      message: `Kode verifikasi 6 digit telah dikirim ke nomor WhatsApp Anda (${masked}).`,
      data: { maskedPhone: masked },
    };
  } catch (error) {
    console.error("[requestAdminResetOtpAction] Error:", error);
    return {
      success: false,
      error: "Terjadi kesalahan pada server saat memproses permintaan OTP.",
    };
  }
}

/**
 * Tahap 2: Verifikasi kode OTP 6 digit
 */
export async function verifyAdminResetOtpAction(payload: {
  username: string;
  otp: string;
}): Promise<ForgotPasswordResult<{ resetToken: string }>> {
  try {
    const cleanUsername = payload.username?.trim().toLowerCase();
    const cleanOtp = payload.otp?.trim();

    if (!cleanUsername || !cleanOtp) {
      return {
        success: false,
        error: "Username dan kode OTP wajib diisi.",
      };
    }

    const admin = await prisma.admin.findUnique({
      where: { username: cleanUsername },
    });

    if (!admin || !admin.isAktif) {
      return {
        success: false,
        error: "Akun tidak ditemukan atau tidak aktif.",
      };
    }

    if (!admin.resetOtp || !admin.resetOtpExpiry) {
      return {
        success: false,
        error: "Tidak ada permintaan reset yang aktif. Silakan kirim ulang kode OTP.",
      };
    }

    // Cek batas kedaluwarsa
    if (new Date() > admin.resetOtpExpiry) {
      return {
        success: false,
        error: "Kode OTP telah kedaluwarsa. Silakan minta kode verifikasi baru.",
      };
    }

    // Cek percobaan salah (maksimal 5 kali)
    if (admin.resetOtpAttempts >= 5) {
      return {
        success: false,
        error: "Batas percobaan kode OTP telah habis (maksimal 5x). Silakan kirim ulang kode baru.",
      };
    }

    // Cocokkan OTP menggunakan bcrypt
    const isMatch = await comparePassword(cleanOtp, admin.resetOtp);
    if (!isMatch) {
      const nextAttempts = admin.resetOtpAttempts + 1;
      await prisma.admin.update({
        where: { id: admin.id },
        data: { resetOtpAttempts: nextAttempts },
      });

      const sisa = Math.max(0, 5 - nextAttempts);
      return {
        success: false,
        error:
          sisa > 0
            ? `Kode OTP tidak sesuai. Sisa kesempatan mencoba: ${sisa} kali.`
            : "Kode OTP salah. Batas percobaan habis, silakan klik kirim ulang kode.",
      };
    }

    // Jika cocok, buat one-time reset token acak (berlaku 15 menit)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await hashPassword(resetToken);
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        resetOtp: hashedToken,
        resetOtpExpiry: resetExpiry,
        resetOtpAttempts: 0,
      },
    });

    return {
      success: true,
      message: "Kode OTP berhasil diverifikasi.",
      data: { resetToken },
    };
  } catch (error) {
    console.error("[verifyAdminResetOtpAction] Error:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat memverifikasi kode OTP.",
    };
  }
}

/**
 * Tahap 3: Simpan kata sandi baru setelah OTP diverifikasi
 */
export async function resetAdminPasswordWithOtpAction(payload: {
  username: string;
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ForgotPasswordResult> {
  try {
    const cleanUsername = payload.username?.trim().toLowerCase();
    const { resetToken, newPassword, confirmPassword } = payload;

    if (!cleanUsername || !resetToken) {
      return {
        success: false,
        error: "Sesi reset tidak valid. Silakan ulangi proses dari awal.",
      };
    }

    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        error: "Kata sandi baru minimal harus terdiri dari 6 karakter.",
      };
    }

    if (newPassword !== confirmPassword) {
      return {
        success: false,
        error: "Konfirmasi kata sandi baru tidak cocok.",
      };
    }

    const admin = await prisma.admin.findUnique({
      where: { username: cleanUsername },
    });

    if (!admin || !admin.isAktif) {
      return {
        success: false,
        error: "Akun tidak ditemukan atau tidak aktif.",
      };
    }

    if (!admin.resetOtp || !admin.resetOtpExpiry) {
      return {
        success: false,
        error: "Sesi token reset telah kedaluwarsa. Silakan ulangi permintaan.",
      };
    }

    if (new Date() > admin.resetOtpExpiry) {
      return {
        success: false,
        error: "Waktu reset kata sandi telah habis. Silakan ulangi dari awal.",
      };
    }

    // Verifikasi token reset
    const isTokenValid = await comparePassword(resetToken, admin.resetOtp);
    if (!isTokenValid) {
      return {
        success: false,
        error: "Token reset tidak sah. Silakan ulangi proses dari awal.",
      };
    }

    // Hash kata sandi baru & bersihkan kolom OTP
    const hashedPassword = await hashPassword(newPassword);

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        password: hashedPassword,
        resetOtp: null,
        resetOtpExpiry: null,
        resetOtpAttempts: 0,
      },
    });

    return {
      success: true,
      message: "Kata sandi akun Anda berhasil diperbarui! Silakan masuk dengan kata sandi baru.",
    };
  } catch (error) {
    console.error("[resetAdminPasswordWithOtpAction] Error:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat menyimpan kata sandi baru.",
    };
  }
}

