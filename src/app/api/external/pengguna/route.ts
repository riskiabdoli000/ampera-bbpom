             import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Endpoint Bridge untuk dipanggil oleh sistem BUKU-TAMU
 * Mengizinkan Buku-Tamu mencari data pengguna yang pernah mendaftar di Ampera-BBPOM
 * Menggunakan proteksi header `x-service-api-key`
 */
export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get("x-service-api-key");
    const internalSecret = process.env.INTERNAL_SERVICE_KEY;

    if (!internalSecret || apiKey !== internalSecret) {
      return NextResponse.json(
        { success: false, message: "Akses tidak diizinkan (Invalid Service Key)" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const nik = searchParams.get("nik")?.trim();
    const telepon = searchParams.get("telepon")?.trim();

    if (!nik && !telepon) {
      return NextResponse.json(
        { success: false, message: "Parameter NIK atau telepon wajib disertakan" },
        { status: 400 }
      );
    }

    const tamu = await prisma.tamu.findFirst({
      where: {
        OR: [
          ...(nik ? [{ nik }] : []),
          ...(telepon ? [{ telepon }] : []),
        ],
      },
      select: {
        nik: true,
        nama: true,
        telepon: true,
        email: true,
        alamat: true,
        asalInstansi: true,
        umur: true,
      },
    });

    if (!tamu) {
      return NextResponse.json(
        { success: false, message: "Data tamu tidak ditemukan di database Ampera-BBPOM" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      source: "ampera-bbpom",
      data: tamu,
    });
  } catch (error) {
    console.error("[API_EXTERNAL_PENGGUNA_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
