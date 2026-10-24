import { PrismaClient, RoleAdmin } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Memulai seeding master data Ampera-BBPOM...");

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

  // 2. Seed Akun Petugas Default
  const existingAdmin = await prisma.admin.findUnique({
    where: { username: "admin" },
  });

  if (!existingAdmin) {
    await prisma.admin.create({
      data: {
        username: "admin",
        nama: "Administrator BBPOM",
        password: "admin123", // Akan di-hash dengan bcrypt saat modul auth aktif
        role: RoleAdmin.SUPERADMIN,
        isAktif: true,
      },
    });
    console.log("✅ Admin default dibuat: username (admin) / password (admin123)");
  }

  const existingOperator = await prisma.admin.findUnique({
    where: { username: "operator" },
  });

  if (!existingOperator) {
    await prisma.admin.create({
      data: {
        username: "operator",
        nama: "Operator Verifikator",
        password: "operator123",
        role: RoleAdmin.OPERATOR,
        isAktif: true,
      },
    });
    console.log("✅ Operator default dibuat: username (operator) / password (operator123)");
  }

  console.log("🎉 Seeding Ampera-BBPOM selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
