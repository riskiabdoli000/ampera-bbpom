"use server";

import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { extractGoogleMapsEmbedUrl } from "@/lib/maps";

const kontakSettingsSchema = z.object({
  eyebrow: z.string().min(2, "Tagline atas (eyebrow) minimal 2 karakter"),
  judul: z.string().min(3, "Judul section minimal 3 karakter"),
  deskripsi: z.string().min(10, "Deskripsi minimal 10 karakter"),
  labelSosmed: z.string().min(2, "Label media sosial minimal 2 karakter"),

  alamat: z.string().min(5, "Alamat kantor minimal 5 karakter"),
  email1: z.string().email("Format Email Utama tidak valid"),
  email2: z
    .string()
    .transform((val) => (val?.trim() === "" ? null : val))
    .pipe(z.string().email("Format Email Kedua tidak valid").nullable()),
  telepon: z.string().min(5, "Nomor telepon kantor minimal 5 karakter"),
  whatsapp: z.string().min(8, "Nomor WhatsApp minimal 8 karakter"),
  whatsappPesan: z.string().default("Halo Admin BBPOM Palembang, saya ingin berkonsultasi."),

  mapsEmbedUrl: z.string().min(5, "URL Embed Peta Google Maps wajib diisi"),
  mapsLinkUrl: z.string().min(5, "Tautan 'Buka di Google Maps' wajib diisi"),

  instagramUrl: z.string().optional().nullable(),
  facebookUrl: z.string().optional().nullable(),
  tiktokUrl: z.string().optional().nullable(),
  threadsUrl: z.string().optional().nullable(),
  youtubeUrl: z.string().optional().nullable(),
});

export type KontakSettingsInput = z.infer<typeof kontakSettingsSchema>;

const DEFAULT_KONTAK = {
  id: 1,
  eyebrow: "CONTACT DETAIL",
  judul: "Visit Our Office",
  deskripsi:
    "Balai Besar Pengawas Obat dan Makanan di Palembang siap melayani kebutuhan informasi, konsultasi izin edar produk, pengaduan konsumen, serta pengujian laboratorium terakreditasi.",
  labelSosmed: "Media Sosial Resmi BBPOM Palembang:",
  alamat: "Jl. Pangeran Ratu, Jakabaring, 15 Ulu, Palembang - Sumsel 30252",
  email1: "bpom_palembang@pom.go.id",
  email2: "ulpk_palembang@yahoo.com",
  telepon: "(0711) 510042",
  whatsapp: "0811-7850-008",
  whatsappPesan: "Halo Admin BBPOM Palembang, saya ingin berkonsultasi.",
  mapsEmbedUrl:
    "https://maps.google.com/maps?q=Balai+Besar+POM+di+Palembang,+Jl.+Pangeran+Ratu,+Jakabaring,+Palembang&t=&z=16&ie=UTF8&iwloc=&output=embed",
  mapsLinkUrl: "https://maps.google.com/?q=Balai+Besar+POM+di+Palembang",
  instagramUrl: "https://www.instagram.com/bpom.palembang/",
  facebookUrl: "https://www.facebook.com/bpom.palembang/",
  tiktokUrl: "https://www.tiktok.com/@bpom.palembang",
  threadsUrl: "https://www.threads.net/@bpom.palembang",
  youtubeUrl: "https://www.youtube.com/@bbpomdipalembang",
};

/**
 * Mengambil data pengaturan Kontak & Lokasi dari database (row id: 1).
 * Jika belum ada, otomatis membuat row default.
 */
export async function getKontakSettings() {
  let kontak = await prisma.kontakKantor.findUnique({
    where: { id: 1 },
  });

  if (!kontak) {
    kontak = await prisma.kontakKantor.create({
      data: DEFAULT_KONTAK,
    });
  }

  return kontak;
}

/**
 * Server Action untuk menyimpan perubahan data Kontak & Lokasi Kantor.
 */
export async function saveKontakSettingsAction(data: KontakSettingsInput) {
  await verifyAdminSession();

  const validated = kontakSettingsSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Data formulir kontak tidak valid.",
    };
  }

  // Bersihkan URL embed jika user menempelkan seluruh kode <iframe>
  const cleanEmbedUrl = extractGoogleMapsEmbedUrl(validated.data.mapsEmbedUrl);

  try {
    const updated = await prisma.kontakKantor.upsert({
      where: { id: 1 },
      update: {
        eyebrow: validated.data.eyebrow,
        judul: validated.data.judul,
        deskripsi: validated.data.deskripsi,
        labelSosmed: validated.data.labelSosmed,
        alamat: validated.data.alamat,
        email1: validated.data.email1,
        email2: validated.data.email2 || null,
        telepon: validated.data.telepon,
        whatsapp: validated.data.whatsapp,
        whatsappPesan: validated.data.whatsappPesan || DEFAULT_KONTAK.whatsappPesan,
        mapsEmbedUrl: cleanEmbedUrl,
        mapsLinkUrl: validated.data.mapsLinkUrl,
        instagramUrl: validated.data.instagramUrl || null,
        facebookUrl: validated.data.facebookUrl || null,
        tiktokUrl: validated.data.tiktokUrl || null,
        threadsUrl: validated.data.threadsUrl || null,
        youtubeUrl: validated.data.youtubeUrl || null,
      },
      create: {
        id: 1,
        eyebrow: validated.data.eyebrow,
        judul: validated.data.judul,
        deskripsi: validated.data.deskripsi,
        labelSosmed: validated.data.labelSosmed,
        alamat: validated.data.alamat,
        email1: validated.data.email1,
        email2: validated.data.email2 || null,
        telepon: validated.data.telepon,
        whatsapp: validated.data.whatsapp,
        whatsappPesan: validated.data.whatsappPesan || DEFAULT_KONTAK.whatsappPesan,
        mapsEmbedUrl: cleanEmbedUrl,
        mapsLinkUrl: validated.data.mapsLinkUrl,
        instagramUrl: validated.data.instagramUrl || null,
        facebookUrl: validated.data.facebookUrl || null,
        tiktokUrl: validated.data.tiktokUrl || null,
        threadsUrl: validated.data.threadsUrl || null,
        youtubeUrl: validated.data.youtubeUrl || null,
      },
    });

    revalidatePath("/admin/settings/kontak");
    revalidatePath("/admin/settings");
    revalidatePath("/");

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error("Gagal menyimpan pengaturan kontak kantor:", error);
    return {
      success: false,
      error: "Gagal menyimpan perubahan pengaturan kontak ke database.",
    };
  }
}
