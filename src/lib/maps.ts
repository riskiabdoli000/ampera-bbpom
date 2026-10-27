/**
 * Helper untuk membersihkan & mengekstrak URL Google Maps Embed
 * Mendukung input:
 * 1. Tag iframe lengkap: <iframe src="https://www.google.com/maps/embed?..." ...></iframe>
 * 2. URL embed langsung: https://www.google.com/maps/embed?... atau https://maps.google.com/maps?q=...&output=embed
 */
export function extractGoogleMapsEmbedUrl(input: string): string {
  if (!input) return "";
  const trimmed = input.trim();

  // Jika admin menempelkan seluruh kode <iframe>
  const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  if (srcMatch && srcMatch[1]) {
    return srcMatch[1].trim();
  }

  // Jika admin menempelkan URL biasa
  return trimmed;
}

/**
 * Format nomor WhatsApp ke format internasional (misal: 0811-7850-008 -> 628117850008)
 */
export function formatWhatsAppNumber(phone: string): string {
  if (!phone) return "";
  let cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  } else if (!cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }
  return cleaned;
}

/**
 * Membuat tautan wa.me lengkap dengan pesan template default
 */
export function buildWhatsAppLink(phone: string, message: string = ""): string {
  const formattedNumber = formatWhatsAppNumber(phone);
  if (!formattedNumber) return "";
  const encodedMsg = message ? encodeURIComponent(message) : "";
  return `https://wa.me/${formattedNumber}${encodedMsg ? `?text=${encodedMsg}` : ""}`;
}
