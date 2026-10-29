import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const params = await context.params;
    const rawFilename = params.filename;
    if (!rawFilename) {
      return new NextResponse("Filename is required", { status: 400 });
    }

    const filename = decodeURIComponent(rawFilename);
    const uploadsDir = path.resolve(process.cwd(), "public/uploads/materi");
    const exactFilePath = path.join(uploadsDir, filename);

    // 1. Cek apakah berkas dengan nama persis tersedia di disk
    if (fs.existsSync(exactFilePath)) {
      const stat = fs.statSync(exactFilePath);
      const fileBuffer = fs.readFileSync(exactFilePath);
      const contentType = filename.toLowerCase().endsWith(".pdf")
        ? "application/pdf"
        : "application/octet-stream";

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Length": stat.size.toString(),
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      });
    }

    // 2. Berkas lama / timestamp berbeda (misal di-reupload oleh admin).
    // Cari berkas pengganti terdekat di direktori uploads/materi
    if (fs.existsSync(uploadsDir)) {
      const allFiles = fs.readdirSync(uploadsDir);

      // Ekstrak nama dasar tanpa prefix timestamp (contoh: materi-1793207612030-Materi_1... -> Materi_1...)
      const cleanedQuery = filename.replace(/^materi-\d+-/i, "").toLowerCase();

      // Cari file yang mengandung nama dasar yang sama
      let matchedFile = allFiles.find((f) => {
        const cleanedDisk = f.replace(/^materi-\d+-/i, "").toLowerCase();
        return cleanedDisk === cleanedQuery || f.toLowerCase().includes(cleanedQuery);
      });

      // Jika tidak cocok langsung, coba cocokkan berdasarkan nomor materi (contoh: Materi_1, Materi_2, Materi_3)
      if (!matchedFile) {
        const matchNumber = filename.match(/materi[_-]?(\d+)/i);
        if (matchNumber && matchNumber[1]) {
          const num = matchNumber[1];
          matchedFile = allFiles.find((f) =>
            new RegExp(`materi[_-]?${num}`, "i").test(f)
          );
        }
      }

      if (matchedFile) {
        const matchedPath = path.join(uploadsDir, matchedFile);
        const stat = fs.statSync(matchedPath);
        const fileBuffer = fs.readFileSync(matchedPath);
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Length": stat.size.toString(),
            "Cache-Control": "public, max-age=3600",
          },
        });
      }
    }

    // 3. Fallback terakhir jika berkas sama sekali tidak ada di disk: gunakan dokumen edukasi default
    const fallbackPath = path.resolve(process.cwd(), "public/documents/materi-edukasi-bbpom.pdf");
    if (fs.existsSync(fallbackPath)) {
      const stat = fs.statSync(fallbackPath);
      const fileBuffer = fs.readFileSync(fallbackPath);
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Length": stat.size.toString(),
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    return new NextResponse("Dokumen PDF materi tidak ditemukan di server.", { status: 404 });
  } catch (error: any) {
    console.error("Error serving materi file:", error);
    return new NextResponse("Terjadi kesalahan saat memuat berkas PDF.", { status: 500 });
  }
}
