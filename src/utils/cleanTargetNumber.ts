/**
 * Pembersih & Formatter Otomatis Nomor Tujuan (HP, E-Money, Game, Tagihan)
 * 
 * - Membersihkan spasi, tanda '+', tanda '-', tanda kurung, titik, dll.
 * - Mengubah otomatis awalan '+62' atau '62' menjadi '08' untuk nomor HP / E-Money Indonesia.
 * - Menjaga ID Game / ID Pelanggan PLN tetap valid dan bersih.
 */

export function cleanTargetNumber(input?: string | null, isGame?: boolean): string {
  if (!input || typeof input !== "string") return "";
  let val = input.trim();
  if (!val) return "";

  // 1. Jika ini adalah ID Game (seperti Mobile Legends dengan Zone ID)
  if (isGame) {
    // Pertahankan angka dan spasi/kurung zone ID, buang karakter aneh
    return val.replace(/[^\w\s\(\)]/g, "").trim();
  }

  // 2. Bersihkan karakter non-angka standar: spasi, '+', '-', '(', ')', '.', dll.
  let cleaned = val.replace(/[\s\+\-\(\)\.]/g, "");

  // 3. Konversi format internasional Indonesia ke format nasional lokal '08...'
  // Contoh: "+62 822-5665-4179" -> cleaned "6282256654179" -> "082256654179"
  // Contoh: "62822-5665-4179" -> "082256654179"
  // Contoh: "+6281234567890" -> "081234567890"
  if (cleaned.startsWith("62")) {
    cleaned = "0" + cleaned.substring(2);
  }

  return cleaned;
}
