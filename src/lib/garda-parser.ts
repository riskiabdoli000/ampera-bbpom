/**
 * Helper Parser Soal dari Teks Bebas / Ekstraksi PDF
 * Mendukung berbagai format penulisan:
 * - Opsi standar dengan tanda baca: "A. ...", "A) ...", "(A) ...", "[A] ..."
 * - Opsi tanpa tanda baca (spasi langsung): "A ...", "B ...", "C ...", "D ..."
 * - Format Kunci Jawaban: "Kunci. B", "Kunci: B", "Kunci B", "Jawaban: C", "Kunci Jawaban. A", dll.
 * - Pembersihan otomatis nomor halaman dan page break antar halaman
 */

export function parseQuestionsFromRawText(
  rawText: string,
  tipe: "PRE_TEST" | "POST_TEST" | "SEMUA" = "SEMUA",
  defaultCategory: string = "Regulasi Obat & Makanan"
): Array<{
  tipe: "PRE_TEST" | "POST_TEST" | "SEMUA";
  kategori: string;
  pertanyaan: string;
  pilihanA: string;
  pilihanB: string;
  pilihanC: string;
  pilihanD: string;
  jawabanBenar: string;
  penjelasan: string;
}> {
  if (!rawText || !rawText.trim()) return [];

  // Normalisasi line break dan bersihkan watermark/page joiner PDF
  const cleanText = rawText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/(?:^|\n)\s*--\s*\d+\s+of\s+\d+\s*--\s*(?:\n|$)/gi, "\n")
    .replace(/(?:^|\n)\s*(?:Halaman|Page)\s+\d+(?:\s*(?:dari|\/|of)\s*\d+)?\s*(?:\n|$)/gi, "\n");

  const parsedQuestions: Array<any> = [];

  // Pola pembagi butir soal: Angka diikuti titik atau kurung tutup (contoh: "1. ", "1) ", "Soal 1:")
  const questionBlocks = cleanText.split(/(?:^|\n)\s*(?:(?:Soal|Pertanyaan|No\.?)?\s*(\d+)[\.\)]\s*)/i);

  if (questionBlocks.length > 2) {
    for (let i = 1; i < questionBlocks.length; i += 2) {
      const blockContent = questionBlocks[i + 1] || "";
      const parsed = extractSingleQuestion(blockContent, tipe, defaultCategory);
      if (parsed) {
        parsedQuestions.push(parsed);
      }
    }
  } else {
    // Fallback: Jika tidak terpecah oleh regex nomor, coba pecah per baris berawalan angka
    const lines = cleanText.split("\n");
    let currentBlock = "";
    for (const line of lines) {
      if (/^\s*(?:(?:Soal|Pertanyaan|No\.?)?\s*\d+[\.\)]|\b\d+[\.\)])\s+/i.test(line)) {
        if (currentBlock.trim()) {
          const parsed = extractSingleQuestion(currentBlock, tipe, defaultCategory);
          if (parsed) parsedQuestions.push(parsed);
        }
        currentBlock = line + "\n";
      } else {
        currentBlock += line + "\n";
      }
    }
    if (currentBlock.trim()) {
      const parsed = extractSingleQuestion(currentBlock, tipe, defaultCategory);
      if (parsed) parsedQuestions.push(parsed);
    }
  }

  return parsedQuestions;
}

/**
 * Ekstraksi 1 Butir Soal & Pilihan A/B/C/D
 */
function extractSingleQuestion(
  content: string,
  tipe: "PRE_TEST" | "POST_TEST" | "SEMUA",
  kategori: string
) {
  // Pola awalan opsi yang sangat fleksibel:
  // Mendukung: "A.", "A)", "(A)", "[A]", maupun "A " (tanpa titik) di awal baris
  const optAPattern = /(?:^|\n)\s*(?:A[\.\)]|\(A\)|\[A\]|A\s+)\s*/i;
  const optBPattern = /(?:^|\n)\s*(?:B[\.\)]|\(B\)|\[B\]|B\s+)\s*/i;
  const optCPattern = /(?:^|\n)\s*(?:C[\.\)]|\(C\)|\[C\]|C\s+)\s*/i;
  const optDPattern = /(?:^|\n)\s*(?:D[\.\)]|\(D\)|\[D\]|D\s+)\s*/i;

  // Pola Kunci Jawaban yang fleksibel:
  // Mendukung: "Kunci. B", "Kunci: B", "Kunci B", "Kunci Jawaban. A", "Jawaban: C", dll.
  const keyPattern = /(?:^|\n)\s*(?:Kunci|Jawaban|Kunci Jawaban|Ans|Answer)[\s\.\:\=\-]+([A-Da-d])\b/i;

  // 1. Ambil pertanyaan (semua teks sebelum opsi A)
  const qParts = content.split(optAPattern);
  const qText = qParts[0]?.trim();
  const restAfterA = qParts.slice(1).join(" ");

  if (!qText || restAfterA === undefined) {
    return null;
  }

  // 2. Ambil Opsi A (teks antara A dan B)
  const bParts = restAfterA.split(optBPattern);
  const optA = bParts[0]?.trim();
  const restAfterB = bParts.slice(1).join(" ");

  // 3. Ambil Opsi B (teks antara B dan C)
  const cParts = restAfterB.split(optCPattern);
  const optB = cParts[0]?.trim();
  const restAfterC = cParts.slice(1).join(" ");

  // 4. Ambil Opsi C (teks antara C dan D)
  const dParts = restAfterC.split(optDPattern);
  const optC = dParts[0]?.trim();
  const restAfterD = dParts.slice(1).join(" ");

  // 5. Ambil Opsi D dan Kunci Jawaban
  let optD = restAfterD ? restAfterD.trim() : "";
  let jawabanBenar = "A"; // Default jika tidak ada baris Kunci Jawaban eksplisit
  let penjelasan = "";

  // Deteksi kunci jawaban dalam restAfterD atau seluruh blok
  const keyMatch = restAfterD.match(keyPattern);
  if (keyMatch) {
    jawabanBenar = keyMatch[1].toUpperCase();
    optD = restAfterD.split(keyPattern)[0]?.trim();
  } else {
    const globalKeyMatch = content.match(keyPattern);
    if (globalKeyMatch) {
      jawabanBenar = globalKeyMatch[1].toUpperCase();
      optD = optD.replace(keyPattern, "").trim();
    }
  }

  // Bersihkan Opsi D jika ada penjelasan / pembahasan
  const explMatch = optD.match(/(?:Pembahasan|Penjelasan|Alasan)[\s\.\:\=\-]+([\s\S]*?)$/i);
  if (explMatch) {
    penjelasan = explMatch[1].trim();
    optD = optD.split(/(?:Pembahasan|Penjelasan|Alasan)[\s\.\:\=\-]/i)[0]?.trim();
  }

  // Validasi: Pertanyaan, Opsi A, dan Opsi B wajib terisi
  if (qText && optA && optB) {
    return {
      tipe,
      kategori,
      pertanyaan: qText.replace(/^\d+[\.\)]\s*/, "").trim(),
      pilihanA: optA,
      pilihanB: optB,
      pilihanC: optC || "Pilihan C",
      pilihanD: optD || "Pilihan D",
      jawabanBenar,
      penjelasan,
    };
  }

  return null;
}

/**
 * Konversi daftar halaman teks PDF menjadi daftar slide pembelajaran
 */
export function formatPagesToSlides(
  pages: Array<{ num: number; text: string }>,
  modulJudul: string,
  modulNomor: number = 1
): Array<{
  urutan: number;
  judul: string;
  subjudul: string;
  poin: string[];
  tips: string;
  badge: string;
}> {
  const total = pages.length;
  if (total === 0) return [];

  return pages.map((page, idx) => {
    const pageNum = idx + 1;
    const rawLines = (page.text || "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => {
        if (!l) return false;
        // Abaikan nomor halaman sederhana seperti "1", "Page 1 of 5", "Halaman 2"
        if (/^(?:halaman|page|\d+\s*(?:of|\/|dari)\s*\d+|\d+)$/i.test(l)) return false;
        return true;
      });

    let judul = "";
    let subjudul = `Bagian ${pageNum} dari ${total}`;
    const poin: string[] = [];

    if (rawLines.length > 0) {
      if (rawLines[0].length <= 80 && !/[.!?]$/.test(rawLines[0])) {
        judul = rawLines[0];
        rawLines.shift();
      } else {
        judul = `Slide ${pageNum}: ${modulJudul}`;
      }
    } else {
      judul = `Slide ${pageNum}: ${modulJudul}`;
    }

    if (rawLines.length > 0 && rawLines[0].length <= 100 && !/[.!?]$/.test(rawLines[0])) {
      subjudul = rawLines[0];
      rawLines.shift();
    }

    // Ekstraksi poin materi dari sisa baris
    if (rawLines.length > 0) {
      let currentPoint = "";
      for (const line of rawLines) {
        if (/^[-•*–—]|\b\d+[\.\)]\s+|^[a-zA-Z][\.\)]\s+/.test(line)) {
          if (currentPoint) poin.push(currentPoint);
          currentPoint = line.replace(/^[-•*–—\d\.\)\s]+/, "").trim();
        } else {
          if (!currentPoint) {
            currentPoint = line;
          } else if (currentPoint.length < 160) {
            currentPoint += " " + line;
          } else {
            poin.push(currentPoint);
            currentPoint = line;
          }
        }
      }
      if (currentPoint) poin.push(currentPoint);
    }

    // Jika teks slide kosong (misalnya slide berisi diagram gambar murni)
    if (poin.length === 0) {
      poin.push(
        `Pelajari materi pembelajaran visual pada slide ${pageNum} ini dengan seksama.`
      );
      poin.push(
        "Materi ini disusun oleh tim BBPOM di Palembang untuk meningkatkan kesadaran regulasi obat dan makanan aman."
      );
    }

    const tips =
      pageNum === total
        ? "🎉 Anda telah mencapai slide terakhir pada modul ini! Silakan klik tombol di bawah untuk menyelesaikan modul dan membuka tahap berikutnya."
        : `💡 Pelajari setiap poin pada slide ${pageNum} ini secara seksama sebelum menekan tombol 'Slide Selanjutnya'.`;

    return {
      urutan: pageNum,
      judul,
      subjudul,
      poin,
      tips,
      badge: `Modul ${modulNomor} • Slide ${pageNum}/${total}`,
    };
  });
}

/**
 * Ekstraksi slide dari berkas PowerPoint (.pptx)
 */
export async function parsePptxSlides(
  buffer: Uint8Array,
  modulJudul: string,
  modulNomor: number = 1
): Promise<Array<{
  urutan: number;
  judul: string;
  subjudul: string;
  poin: string[];
  tips: string;
  badge: string;
}>> {
  try {
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(buffer);

    const slideFileNames = Object.keys(zip.files).filter((name) =>
      /^ppt\/slides\/slide\d+\.xml$/i.test(name)
    );

    if (slideFileNames.length === 0) {
      return [];
    }

    slideFileNames.sort((a, b) => {
      const matchA = a.match(/slide(\d+)\.xml/i);
      const matchB = b.match(/slide(\d+)\.xml/i);
      const numA = matchA ? parseInt(matchA[1], 10) : 0;
      const numB = matchB ? parseInt(matchB[1], 10) : 0;
      return numA - numB;
    });

    const pages: Array<{ num: number; text: string }> = [];

    for (let i = 0; i < slideFileNames.length; i++) {
      const fileName = slideFileNames[i];
      const xml = await zip.files[fileName].async("string");

      const pRegex = /<a:p\b[^>]*>([\s\S]*?)<\/a:p>/gi;
      const paragraphs: string[] = [];
      let pMatch;
      while ((pMatch = pRegex.exec(xml)) !== null) {
        const pContent = pMatch[1];
        const tRegex = /<a:t\b[^>]*>([\s\S]*?)<\/a:t>/gi;
        let tMatch;
        const textPieces: string[] = [];
        while ((tMatch = tRegex.exec(pContent)) !== null) {
          textPieces.push(tMatch[1]);
        }
        const paragraphText = textPieces.join("").trim();
        if (paragraphText) {
          paragraphs.push(paragraphText);
        }
      }

      pages.push({
        num: i + 1,
        text: paragraphs.join("\n"),
      });
    }

    return formatPagesToSlides(pages, modulJudul, modulNomor);
  } catch (err) {
    console.warn("Gagal mengekstrak PPTX:", err);
    return [];
  }
}

/**
 * Helper format ukuran byte ke teks yang mudah dibaca (KB / MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

/**
 * Kompresi dan optimasi berkas PDF sebelum disimpan ke storage server
 * - Menghilangkan metadata yang tidak diperlukan
 * - Mengemas objek ke dalam object streams terkompresi (FlateDecode)
 * - Menghapus duplikasi struktur berkas
 */
export async function compressPdfBuffer(inputBuffer: Uint8Array): Promise<{
  buffer: Uint8Array;
  originalSize: number;
  compressedSize: number;
  savedPercent: number;
}> {
  const originalSize = inputBuffer.length;
  try {
    const { PDFDocument } = await import("pdf-lib");
    const pdfDoc = await PDFDocument.load(inputBuffer, { ignoreEncryption: true });

    // Bersihkan metadata berlebih
    pdfDoc.setTitle("");
    pdfDoc.setAuthor("BBPOM di Palembang");
    pdfDoc.setSubject("Materi Edukasi Garda Ampera");
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer("AMPERA BBPOM");
    pdfDoc.setCreator("AMPERA BBPOM System");

    // Simpan dengan kompresi object streams
    const compressedBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      updateFieldAppearances: false,
    });

    const compressedSize = compressedBytes.length;
    if (compressedSize < originalSize) {
      const savedPercent = Math.round(((originalSize - compressedSize) / originalSize) * 100);
      return {
        buffer: compressedBytes,
        originalSize,
        compressedSize,
        savedPercent,
      };
    }
  } catch (err) {
    console.warn("PDF stream compression failed, keeping original:", err);
  }

  return {
    buffer: inputBuffer,
    originalSize,
    compressedSize: originalSize,
    savedPercent: 0,
  };
}

/**
 * Kompresi berkas PowerPoint (.pptx) menggunakan DEFLATE level 9 maksimal
 */
export async function compressPptxBuffer(inputBuffer: Uint8Array): Promise<{
  buffer: Uint8Array;
  originalSize: number;
  compressedSize: number;
  savedPercent: number;
}> {
  const originalSize = inputBuffer.length;
  try {
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(inputBuffer);

    const compressedBytes = await zip.generateAsync({
      type: "uint8array",
      compression: "DEFLATE",
      compressionOptions: {
        level: 9,
      },
    });

    const compressedSize = compressedBytes.length;
    if (compressedSize < originalSize) {
      const savedPercent = Math.round(((originalSize - compressedSize) / originalSize) * 100);
      return {
        buffer: compressedBytes,
        originalSize,
        compressedSize,
        savedPercent,
      };
    }
  } catch (err) {
    console.warn("PPTX compression failed, keeping original:", err);
  }

  return {
    buffer: inputBuffer,
    originalSize,
    compressedSize: originalSize,
    savedPercent: 0,
  };
}


