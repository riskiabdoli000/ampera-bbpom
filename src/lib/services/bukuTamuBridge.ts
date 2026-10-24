/**
 * Service Bridge: Menghubungkan Ampera-BBPOM ke API Buku-Tamu
 * Digunakan untuk mengambil data profil tamu yang sudah pernah datang langsung ke kantor BBPOM
 */

export interface TamuFromBukuTamu {
  nik: string;
  nama: string;
  telepon: string;
  alamat: string;
  pekerjaan: string;
  jenisKelamin: string;
  pendidikan: string;
  umur?: number;
}

export async function lookupTamuFromBukuTamu(nik: string): Promise<TamuFromBukuTamu | null> {
  const baseUrl = process.env.BUKU_TAMU_URL || "http://localhost:3000";
  const serviceKey = process.env.INTERNAL_SERVICE_KEY;

  if (!serviceKey) {
    console.warn("[Bridge] INTERNAL_SERVICE_KEY belum dikonfigurasi di file .env");
    return null;
  }

  try {
    const url = `${baseUrl}/api/external/tamu?nik=${encodeURIComponent(nik.trim())}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-service-api-key": serviceKey,
      },
      next: { revalidate: 0 }, // Selalu fetch fresh
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Belum pernah berkunjung/terdaftar di Buku Tamu
      }
      console.warn(`[Bridge] Gagal memanggil Buku-Tamu API: HTTP ${response.status}`);
      return null;
    }

    const json = await response.json();
    return json.data as TamuFromBukuTamu;
  } catch (error) {
    console.error("[Bridge] Error saat menghubungkan ke Buku-Tamu:", error);
    return null;
  }
}
