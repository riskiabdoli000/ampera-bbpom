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

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".pdf":
      return "application/pdf";
    case ".webp":
      return "image/webp";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".svg":
      return "image/svg+xml";
    case ".gif":
      return "image/gif";
    case ".json":
      return "application/json";
    default:
      return "application/octet-stream";
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const params = await context.params;
    const rawSegments = params.path;

    if (!rawSegments || rawSegments.length === 0) {
      return new NextResponse("Filename or path is required", { status: 400 });
    }

    // Proteksi LFI / Path Traversal: bersihkan setiap segmen path
    const cleanSegments = (Array.isArray(rawSegments) ? rawSegments : [rawSegments]).map(
      (segment) => path.basename(decodeURIComponent(segment))
    );

    const uploadsDir = path.resolve(process.cwd(), "public", "uploads", "edukasi");
    const exactFilePath = path.resolve(uploadsDir, ...cleanSegments);

    // Pastikan berkas berada di dalam direktori public/uploads/edukasi
    if (!exactFilePath.startsWith(uploadsDir + path.sep) && exactFilePath !== uploadsDir) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // 1. Cek berkas persis di lokasi yang diminta
    if (await fileExists(exactFilePath)) {
      const [stat, fileBuffer] = await Promise.all([
        fs.stat(exactFilePath),
        fs.readFile(exactFilePath),
      ]);

      const contentType = getContentType(exactFilePath);

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Length": stat.size.toString(),
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        },
      });
    }

    // 2. Pencarian fleksibel antar subfolder (misal dipindahkan ke documents/ atau images/ atau root)
    const targetFilename = cleanSegments[cleanSegments.length - 1];
    const candidatePaths = [
      path.resolve(uploadsDir, targetFilename),
      path.resolve(uploadsDir, "documents", targetFilename),
      path.resolve(uploadsDir, "images", targetFilename),
    ];

    for (const candPath of candidatePaths) {
      if (candPath !== exactFilePath && (await fileExists(candPath))) {
        const [stat, fileBuffer] = await Promise.all([
          fs.stat(candPath),
          fs.readFile(candPath),
        ]);
        const contentType = getContentType(candPath);
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Content-Length": stat.size.toString(),
            "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
          },
        });
      }
    }

    // 3. Fallback jika berkas PDF tidak ditemukan: berikan dokumen default agar pratinjau tidak gagal (404)
    if (targetFilename.toLowerCase().endsWith(".pdf")) {
      const fallbackPdf = path.resolve(
        process.cwd(),
        "public",
        "documents",
        "materi-edukasi-bbpom.pdf"
      );
      if (await fileExists(fallbackPdf)) {
        const [stat, fileBuffer] = await Promise.all([
          fs.stat(fallbackPdf),
          fs.readFile(fallbackPdf),
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
    }

    // 4. Fallback jika berkas gambar tidak ditemukan: berikan gambar default agar cover kartu tidak rusak
    const isImage = /\.(webp|jpg|jpeg|png|svg)$/i.test(targetFilename);
    if (isImage) {
      const fallbackImg = path.resolve(
        process.cwd(),
        "public",
        "assets-landingpage",
        "layanan",
        "1.jpg"
      );
      if (await fileExists(fallbackImg)) {
        const [stat, fileBuffer] = await Promise.all([
          fs.stat(fallbackImg),
          fs.readFile(fallbackImg),
        ]);
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            "Content-Type": "image/jpeg",
            "Content-Length": stat.size.toString(),
            "Cache-Control": "public, max-age=3600",
          },
        });
      }
    }

    return new NextResponse("Berkas edukasi tidak ditemukan di server.", {
      status: 404,
    });
  } catch (error) {
    console.error("[Route /uploads/edukasi] Error serving file:", error);
    return new NextResponse("Terjadi kesalahan saat memproses berkas.", {
      status: 500,
    });
  }
}

