import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

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

    // Proteksi LFI / Path Traversal
    const filename = path.basename(decodeURIComponent(rawFilename));
    const uploadsDir = path.resolve(process.cwd(), "public/uploads/edukasi");
    const exactFilePath = path.resolve(uploadsDir, filename);

    if (!exactFilePath.startsWith(uploadsDir + path.sep)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // 1. Cek apakah berkas dengan nama persis tersedia di disk
    if (await fileExists(exactFilePath)) {
      const [stat, fileBuffer] = await Promise.all([
        fs.stat(exactFilePath),
        fs.readFile(exactFilePath),
      ]);

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Length": stat.size.toString(),
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      });
    }

    // 2. Jika berkas sudah diganti dengan file terbaru di direktori uploads/edukasi, ambil berkas PDF yang aktif
    if (await fileExists(uploadsDir)) {
      const allFiles = (await fs.readdir(uploadsDir)).filter((f) =>
        f.toLowerCase().endsWith(".pdf")
      );
      if (allFiles.length > 0) {
        const latestFile = allFiles[allFiles.length - 1];
        const latestPath = path.resolve(uploadsDir, path.basename(latestFile));
        const [stat, fileBuffer] = await Promise.all([
          fs.stat(latestPath),
          fs.readFile(latestPath),
        ]);
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Length": stat.size.toString(),
            "Cache-Control": "public, max-age=60",
          },
        });
      }
    }

    // 3. Fallback ke dokumen edukasi default bawaan jika belum ada di uploads/edukasi
    const fallbackPath = path.resolve(
      process.cwd(),
      "public/documents/materi-edukasi-bbpom.pdf"
    );
    if (await fileExists(fallbackPath)) {
      const [stat, fileBuffer] = await Promise.all([
        fs.stat(fallbackPath),
        fs.readFile(fallbackPath),
      ]);
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Length": stat.size.toString(),
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    return new NextResponse("Dokumen PDF edukasi tidak ditemukan di server.", {
      status: 404,
    });
  } catch (error) {
    console.error("Error serving edukasi PDF file:", error);
    return new NextResponse("Terjadi kesalahan saat memuat berkas PDF.", {
      status: 500,
    });
  }
}

