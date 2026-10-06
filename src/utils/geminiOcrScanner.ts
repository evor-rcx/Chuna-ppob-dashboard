import { GoogleGenAI } from '@google/genai';

export interface OcrScanResult {
  isDetected: boolean;
  jenisFoto: 'METERAN_PLN' | 'STRUK_PEMBAYARAN' | 'NOMOR_HP' | 'BARCODE' | 'LAINNYA';
  noMeterPln: string | null;
  noHp: string | null;
  idPelanggan: string | null;
  merkAtauModel: string | null;
  dayaAtauTarif: string | null;
  fullText: string;
  ringkasan: string;
}

/**
 * Memindai foto (Meteran PLN, No HP, Struk, Barcode) menggunakan Gemini Vision AI OCR
 */
export async function scanImageWithGeminiOCR(imageBuffer: Buffer): Promise<OcrScanResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      isDetected: false,
      jenisFoto: 'LAINNYA',
      noMeterPln: null,
      noHp: null,
      idPelanggan: null,
      merkAtauModel: null,
      dayaAtauTarif: null,
      fullText: '',
      ringkasan: 'API Key Gemini belum disetel'
    };
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });

  const base64Data = imageBuffer.toString('base64');
  const prompt = `Kamu adalah sistem OCR Scanner Gambar & Pendeteksi Teks/Nomor Otomatis untuk toko pulsa & PPOB "E4 Store".
Tugasmu adalah menganalisis foto yang dikirimkan pelanggan melalui WhatsApp:
1. PENTING: Apakah foto ini merupakan foto METERAN LISTRIK PLN (KWh meter prabayar/pascabayar), BARCODE, STRUK, atau FOTO NOMOR TUJUAN (nomor HP, token listrik, coretan nomor di kertas)?
2. Cari dan ekstrak dengan sangat teliti:
   - noMeterPln: Jika ada meteran listrik PLN, cari nomor meteran 11-12 digit (biasanya tertera tepat di bawah barcode meteran atau pada stiker/LCD, contoh: 45055441815, 14123456789, 53123456789, dsb). Pastikan hanya berupa deretan angka bulat murni. Jika tidak ada, isi null.
   - noHp: Jika ada nomor handphone / WhatsApp (contoh: 0822..., 0812..., 0858...), bersihkan karakter pemisah dan pastikan berawalan '08' (contoh: 082256654179). Jika tidak ada, isi null.
   - idPelanggan: ID Pelanggan atau nomor ID lainnya jika tertera.
   - merkAtauModel: Merk/pabrikan meteran/alat jika terbaca (contoh: "Sanxing CSI11", "Itron", "Hexing", "Glomet", "Star", "Melcoinda", dsb).
   - dayaAtauTarif: Informasi daya/tarif jika terbaca (contoh: "450 VA", "900 VA", "R1", dsb).
   - fullText: Ringkasan teks-teks penting yang berhasil terbaca dari foto tersebut.
   - jenisFoto: "METERAN_PLN" | "STRUK_PEMBAYARAN" | "NOMOR_HP" | "BARCODE" | "LAINNYA".

KEMBALIKAN HANYA JSON MURNI (VALID JSON) TANPA CODE BLOCK / MARKDOWN:
{
  "isDetected": boolean,
  "jenisFoto": "METERAN_PLN" | "STRUK_PEMBAYARAN" | "NOMOR_HP" | "BARCODE" | "LAINNYA",
  "noMeterPln": string | null,
  "noHp": string | null,
  "idPelanggan": string | null,
  "merkAtauModel": string | null,
  "dayaAtauTarif": string | null,
  "fullText": string,
  "ringkasan": string
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
            { text: prompt }
          ]
        }
      ]
    });

    let raw = response.text?.trim() || '{}';
    if (raw.startsWith('```')) {
      raw = raw.replace(/^```[a-z]*\s*/i, '').replace(/\s*```$/, '').trim();
    }
    const parsed = JSON.parse(raw);
    const noMeterPln = parsed.noMeterPln ? String(parsed.noMeterPln).replace(/\D/g, '') : null;
    const noHp = parsed.noHp ? String(parsed.noHp).replace(/\D/g, '') : null;
    const idPelanggan = parsed.idPelanggan ? String(parsed.idPelanggan).trim() : null;

    return {
      isDetected: Boolean(noMeterPln || noHp || idPelanggan || (parsed.fullText && parsed.fullText.length > 5)),
      jenisFoto: parsed.jenisFoto || 'LAINNYA',
      noMeterPln: noMeterPln && noMeterPln.length >= 8 ? noMeterPln : null,
      noHp: noHp && noHp.length >= 8 ? noHp : null,
      idPelanggan: idPelanggan || null,
      merkAtauModel: parsed.merkAtauModel || null,
      dayaAtauTarif: parsed.dayaAtauTarif || null,
      fullText: parsed.fullText || '',
      ringkasan: parsed.ringkasan || ''
    };
  } catch (err: any) {
    console.error('Error scanning image with Gemini OCR:', err);
    return {
      isDetected: false,
      jenisFoto: 'LAINNYA',
      noMeterPln: null,
      noHp: null,
      idPelanggan: null,
      merkAtauModel: null,
      dayaAtauTarif: null,
      fullText: '',
      ringkasan: 'Gagal memindai gambar'
    };
  }
}

/**
 * Menghitung Harga Jual Owner resmi untuk Token PLN prabayar
 */
export function getPlnTokenPrice(
  nominalStr: string,
  db?: any,
  getProductFee?: (sku: string) => any
): { sku: string; nominal: number; price: number; name: string } {
  const norm = nominalStr.toLowerCase().replace(/[\s\.\,]/g, '');
  let sku = 'PLN20';
  let nominal = 20000;

  if (/500000|500rb|500k|^500$/.test(norm)) {
    sku = 'PLN500';
    nominal = 500000;
  } else if (/200000|200rb|200k|^200$/.test(norm)) {
    sku = 'PLN200';
    nominal = 200000;
  } else if (/100000|100rb|100k|^100$/.test(norm)) {
    sku = 'PLN100';
    nominal = 100000;
  } else if (/50000|50rb|50k|^50$/.test(norm)) {
    sku = 'PLN50';
    nominal = 50000;
  } else {
    sku = 'PLN20';
    nominal = 20000;
  }

  // Base price (modal Digiflazz)
  let basePrice = nominal + 100;
  if (db?.savedPrepaidProducts) {
    const found = db.savedPrepaidProducts.find((p: any) => p.buyer_sku_code?.toUpperCase() === sku);
    if (found?.price) basePrice = found.price;
  }

  // Markup / Margin Keuntungan Owner (Harga Jual Toko)
  let fee = 1500;
  if (typeof getProductFee === 'function') {
    const f = getProductFee(sku);
    if (f && f.biasa > 0) fee = f.biasa;
  }

  const sellingPrice = basePrice + fee;
  return {
    sku,
    nominal,
    price: sellingPrice,
    name: `Token PLN ${nominal.toLocaleString('id-ID')}`
  };
}

/**
 * Membuat daftar pilihan nominal dan Harga Jual Owner untuk Token PLN
 */
export function getPlnPriceListMenu(db?: any, getProductFee?: (sku: string) => any): string {
  const nominals = ['20000', '50000', '100000', '200000'];
  return nominals
    .map(n => {
      const info = getPlnTokenPrice(n, db, getProductFee);
      return `• *${info.nominal.toLocaleString('id-ID')}* = Rp ${info.price.toLocaleString('id-ID')}`;
    })
    .join('\n');
}

/**
 * Mengekstrak nominal token PLN dari teks chat pembeli (misal: "20.000", "20rb", "50k")
 */
export function extractPlnNominal(raw: string): number | null {
  const clean = raw.toLowerCase().replace(/[\s\.\,]/g, '');
  if (/500000|500rb|500k|^500$/.test(clean)) return 500000;
  if (/200000|200rb|200k|^200$/.test(clean)) return 200000;
  if (/100000|100rb|100k|^100$/.test(clean)) return 100000;
  if (/50000|50rb|50k|^50$/.test(clean)) return 50000;
  if (/20000|20rb|20k|^20$/.test(clean)) return 20000;

  const digits = raw.replace(/\D/g, '');
  const num = Number(digits);
  if (num >= 20000 && num <= 5000000) return num;
  return null;
}

