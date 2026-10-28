import { PrismaClient, RoleAdmin } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Memulai seeding master data & website settings Ampera-BBPOM...");

  // 1. Seed 4 Master Layanan Resmi Ampera-BBPOM
  const masterLayanan = [
    {
      kode: "INFO",
      nama: "Layanan Permintaan Informasi",
      deskripsi: "Layanan permohonan informasi umum, regulasi, dan konsultasi ketentuan produk obat dan makanan.",
      isAktif: true,
    },
    {
      kode: "UJI_CEPAT",
      nama: "Layanan Pengujian Cepat Ampera",
      deskripsi: "Pengujian cepat (Rapid Test Kit) untuk produk pangan khas lokal yang dicurigai mengandung bahan berbahaya seperti boraks, formalin, rhodamin B, atau metanil yellow.",
      isAktif: true,
    },
    {
      kode: "ADUAN",
      nama: "Layanan Pengaduan",
      deskripsi: "Kanal pengaduan masyarakat atas produk obat, makanan, kosmetik, atau obat tradisional yang berbahaya, kadaluarsa, rusak, atau tanpa izin edar.",
      isAktif: true,
    },
    {
      kode: "KIP",
      nama: "Layanan Keterbukaan Informasi Publik",
      deskripsi: "Permohonan akses informasi publik resmi BBPOM Palembang sesuai UU No. 14 Tahun 2008 tentang Keterbukaan Informasi Publik (PPID).",
      isAktif: true,
    },
  ];

  for (const item of masterLayanan) {
    await prisma.layanan.upsert({
      where: { kode: item.kode },
      update: { nama: item.nama, deskripsi: item.deskripsi, isAktif: item.isAktif },
      create: item,
    });
  }
  console.log("✅ 4 Master Layanan resmi Ampera berhasil di-seed.");

  // 2. Seed Akun Petugas Default dengan Hashed Password
  const hashedAdminPassword = await bcrypt.hash("admin123", 10);
  const hashedOperatorPassword = await bcrypt.hash("operator123", 10);

  await prisma.admin.upsert({
    where: { username: "admin" },
    update: {
      password: hashedAdminPassword,
      nama: "Administrator BBPOM",
      role: RoleAdmin.SUPERADMIN,
      isAktif: true,
    },
    create: {
      username: "admin",
      nama: "Administrator BBPOM",
      password: hashedAdminPassword,
      role: RoleAdmin.SUPERADMIN,
      isAktif: true,
    },
  });
  console.log("✅ Admin default: username (admin) / password (admin123)");

  await prisma.admin.upsert({
    where: { username: "operator" },
    update: {
      password: hashedOperatorPassword,
      nama: "Operator Verifikator",
      role: RoleAdmin.OPERATOR,
      isAktif: true,
    },
    create: {
      username: "operator",
      nama: "Operator Verifikator",
      password: hashedOperatorPassword,
      role: RoleAdmin.OPERATOR,
      isAktif: true,
    },
  });
  console.log("✅ Operator default: username (operator) / password (operator123)");

  // 3. Seed Website Settings - Hero Content
  await prisma.heroKonten.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      judul: "Obat & Pangan yang Aman, untuk Anda",
      subjudul:
        "AMPERA adalah inovasi Balai Besar POM di Palembang untuk layanan informasi, pengaduan, dan pengujian cepat sediaan farmasi dan pangan olahan.",
      ctaUtamaLabel: "Akses Layanan AMPERA",
      ctaSekunderLabel: "",
    },
  });
  console.log("✅ Hero Content berhasil di-seed.");

  // 4. Seed Website Settings - Hero Slides
  const existingSlidesCount = await prisma.heroSlide.count();
  if (existingSlidesCount === 0) {
    await prisma.heroSlide.createMany({
      data: [
        {
          title: "Jembatan Ampera & Sungai Musi",
          alt: "Landmark Ikonik Sumatera Selatan",
          imageUrl: "/assets-landingpage/hero2.png",
          isActive: true,
          urutan: 1,
        },
        {
          title: "Gedung Balai Besar POM di Palembang",
          alt: "Kantor Pelayanan Terpadu BBPOM",
          imageUrl: "/assets-landingpage/hero1.png",
          isActive: true,
          urutan: 2,
        },
      ],
    });
    console.log("✅ Hero Slides default berhasil di-seed (2 slide).");
  }

  // 5. Seed Website Settings - Video Profil
  await prisma.videoProfil.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      eyebrow: "DEDIKASI, INTEGRITAS & PELAYANAN PUBLIK PRIMA",
      judul: "Mengenal Lebih Dekat Dedikasi & Layanan BBPOM di Palembang",
      deskripsi:
        "Saksikan dokumentasi resmi mengenai fasilitas laboratorium modern teruji, pengawasan peredaran terpadu, serta komitmen seluruh insan BPOM dalam melindungi kesehatan masyarakat Sumatera Selatan.",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      youtubeId: "dQw4w9WgXcQ",
    },
  });
  console.log("✅ Video Profil default berhasil di-seed.");

  // 6. Seed Website Settings - Kontak Kantor (sesuai ContactSection)
  await prisma.kontakKantor.upsert({
    where: { id: 1 },
    update: {},
    create: {
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
    },
  });
  console.log("✅ Kontak Kantor default berhasil di-seed.");

  // 7. Seed Website Settings - Edukasi
  const existingEdukasiCount = await prisma.edukasi.count();
  if (existingEdukasiCount === 0) {
    await prisma.edukasi.createMany({
      data: [
        {
          judul: "Waspada Bahan Berbahaya pada Pangan Olahan Tradisional",
          kategori: "Pangan Aman",
          ringkasan:
            "Kenali ciri-ciri pangan yang mengandung formalin, boraks, rhodamin B, dan metanil yellow pada makanan favorit di pasar tradisional.",
          konten:
            "Formalin dan boraks sering disalahgunakan sebagai pengawet pada mie basah, tahu, bakso, dan ikan asin. BBPOM Palembang rutin melakukan uji cepat di pasar-pasar lokal untuk menjamin keamanan pangan masyarakat.",
          imageUrl: "/assets-landingpage/hero1.png",
          isPublished: true,
          urutan: 1,
        },
        {
          judul: "Ingat Cek KLIK Sebelum Membeli Produk Obat dan Kosmetik",
          kategori: "Cek KLIK",
          ringkasan:
            "Pastikan Anda selalu memeriksa Kemasan, Label, Izin Edar, dan Kedaluwarsa demi melindungi diri dan keluarga dari produk ilegal.",
          konten:
            "Cek Kemasan dalam kondisi baik, Cek Label untuk informasi komposisi dan aturan pakai, Cek Izin Edar melalui aplikasi BPOM Mobile, dan Cek Kedaluwarsa agar tidak mengonsumsi produk kedaluwarsa.",
          imageUrl: "/assets-landingpage/hero2.png",
          isPublished: true,
          urutan: 2,
        },
      ],
    });
    console.log("✅ Edukasi default berhasil di-seed.");
  }

  console.log("🎉 Seeding Ampera-BBPOM selesai secara menyeluruh!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
