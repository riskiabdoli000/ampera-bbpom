"use server";

import { prisma } from "@/lib/prisma";
import { lookupTamuFromBukuTamu } from "@/lib/services/bukuTamuBridge";

export interface LookupResult {
  found: boolean;
  source?: "lokal_ampera" | "buku_tamu";
  message: string;
  data?: {
    nik: string;
    nama: string;
    telepon?: string | null;
    alamat?: string | null;
    asalInstansi?: string | null;
    umur?: number | null;
    email?: string | null;
  };
}

/**
 * Mencari data pendaftar/tamu berdasarkan NIK
 * 1. Cek database lokal Ampera-BBPOM terlebih dahulu
 * 2. Jika belum ada di lokal, hubungi API Buku-Tamu (cross-database call)
 */
export async function lookupNikAction(nikInput: string): Promise<LookupResult> {
  const cleanNik = nikInput.trim();

  if (!cleanNik || cleanNik.length < 8) {
    return {
      found: false,
      message: "Masukkan NIK yang valid (minimal 8-16 digit)",
    };
  }

  try {
    // 1. Cek database lokal Ampera-BBPOM
    const localTamu = await prisma.tamu.findUnique({
      where: { nik: cleanNik },
    });

    if (localTamu) {
      return {
        found: true,
        source: "lokal_ampera",
        message: "Data ditemukan di Database Ampera-BBPOM (Pernah mendaftar layanan sebelumnya)",
        data: {
          nik: localTamu.nik,
          nama: localTamu.nama,
          telepon: localTamu.telepon,
          alamat: localTamu.alamat,
          asalInstansi: localTamu.asalInstansi,
          umur: localTamu.umur,
          email: localTamu.email,
        },
      };
    }

    // 2. Jika tidak ada di lokal Ampera, panggil API Buku Tamu
    const tamuFromBukuTamu = await lookupTamuFromBukuTamu(cleanNik);

    if (tamuFromBukuTamu) {
      return {
        found: true,
        source: "buku_tamu",
        message: "Data ditemukan dari Database Buku Tamu (Pernah berkunjung langsung ke kantor BBPOM)",
        data: {
          nik: tamuFromBukuTamu.nik,
          nama: tamuFromBukuTamu.nama,
          telepon: tamuFromBukuTamu.telepon,
          alamat: tamuFromBukuTamu.alamat,
          asalInstansi: tamuFromBukuTamu.alamat,
          umur: tamuFromBukuTamu.umur,
        },
      };
    }

    return {
      found: false,
      message: "Data NIK belum terdaftar di Ampera maupun Buku Tamu. Silakan lengkapi formulir.",
    };
  } catch (error) {
    console.error("[lookupNikAction Error]", error);
    return {
      found: false,
      message: "Gagal memeriksa NIK. Silakan isi data secara manual.",
    };
  }
}
