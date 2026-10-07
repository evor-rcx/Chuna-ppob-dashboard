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
  let apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    try {
      const fs = require('fs');
      const path = require('path');
      const dbPath = path.join(process.cwd(), 'db.json');
      if (fs.existsSync(dbPath)) {
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        if (db.geminiApiKey) {
          apiKey = db.geminiApiKey;
          process.env.GEMINI_API_KEY = apiKey;
        }
      }
    } catch (e) {}
  }

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

  // Multi-Model Fallback: gemini-3.8-flash -> gemini-3.1-flash-lite -> gemini-2.5-flash
  const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-flash'];
  let responseText: string | null = null;
  let lastError: any = null;

  for (const modelName of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
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

      if (response && response.text) {
        responseText = response.text;
        break; // Sukses mendapatkan respon
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[OCR Scanner] Model ${modelName} kendala (${err.message || err}), mencoba model cadangan...`);
      // Jeda singkat 500ms sebelum beralih ke model cadangan
      await new Promise(r => setTimeout(r, 500));
    }
  }

  if (!responseText) {
    console.error('Semua model Gemini OCR gagal memproses foto:', lastError);
    return {
      isDetected: false,
      jenisFoto: 'LAINNYA',
      noMeterPln: null,
      noHp: null,
      idPelanggan: null,
      merkAtauModel: null,
      dayaAtauTarif: null,
      fullText: '',
      ringkasan: 'Gagal memindai gambar (seluruh model sibuk)'
    };
  }

  try {
    let raw = responseText.trim();
    if (raw.startsWith('```')) {
      raw = raw.replace(/^```[a-z]*\s*/i, '').replace(/\s*```$/, '').trim();
    }

    let parsed: any = {};
    try {
      parsed = JSON.parse(raw);
    } catch (pe) {
      parsed = {};
    }

    let noMeterPln = parsed.noMeterPln ? String(parsed.noMeterPln).replace(/\D/g, '') : null;
    let noHp = parsed.noHp ? String(parsed.noHp).replace(/\D/g, '') : null;
    let idPelanggan = parsed.idPelanggan ? String(parsed.idPelanggan).trim() : null;
    const fullText = parsed.fullText || raw || '';
    let jenisFoto = parsed.jenisFoto || 'LAINNYA';

    // SMART REGEX EXTRACTOR:
    // Jika noMeterPln belum terisi atau kurang dari 11 digit, ekstrak nomor 11-12 digit dari teks keseluruhan
    if (!noMeterPln || noMeterPln.length < 11) {
      const combinedSearchText = `${fullText} ${raw}`;
      const meterMatches = combinedSearchText.match(/\b\d{11,12}\b/g);
      if (meterMatches && meterMatches.length > 0) {
        noMeterPln = meterMatches[0];
      }
    }

    // Ekstrak No HP jika belum terisi
    if (!noHp || noHp.length < 10) {
      const hpMatches = `${fullText} ${raw}`.match(/\b(08|628)\d{8,11}\b/g);
      if (hpMatches && hpMatches.length > 0) {
        noHp = hpMatches[0].startsWith('628') ? '0' + hpMatches[0].slice(2) : hpMatches[0];
      }
    }

    // Jika nomor meteran 11-12 digit berhasil ditemukan, pastikan jenisFoto otomatis METERAN_PLN
    const hasValidMeter = Boolean(noMeterPln && noMeterPln.length >= 11);
    if (hasValidMeter) {
      jenisFoto = 'METERAN_PLN';
    }

    const isDetected = Boolean(
      hasValidMeter ||
      (noHp && noHp.length >= 10) ||
      idPelanggan ||
      (fullText && fullText.length > 5)
    );

    return {
      isDetected,
      jenisFoto: jenisFoto as any,
      noMeterPln: hasValidMeter ? noMeterPln : (noMeterPln && noMeterPln.length >= 8 ? noMeterPln : null),
      noHp: noHp && noHp.length >= 8 ? noHp : null,
      idPelanggan: idPelanggan || null,
      merkAtauModel: parsed.merkAtauModel || null,
      dayaAtauTarif: parsed.dayaAtauTarif || null,
      fullText,
      ringkasan: parsed.ringkasan || (hasValidMeter ? `Meteran PLN terdeteksi: ${noMeterPln}` : '')
    };
  } catch (err: any) {
    console.error('Error parsing hasil Gemini OCR:', err);
    return {
      isDetected: false,
      jenisFoto: 'LAINNYA',
      noMeterPln: null,
      noHp: null,
      idPelanggan: null,
      merkAtauModel: null,
      dayaAtauTarif: null,
      fullText: '',
      ringkasan: 'Gagal memproses teks gambar'
    };
  }
}

/**
 * Menghitung Harga Jual Owner resmi untuk Token PLN prabayar
 * Mengikuti data murni 'owner_fixed' (kolom ke-8 'Harga Jual (Owner)' di menu Kelola Produk toko E4 Store)
 */
export function getPlnTokenPrice(
  nominalStr: string,
  db?: any,
  getProductFee?: (sku: string) => any
): { sku: string; nominal: number; price: number; name: string; available: boolean } {
  const norm = nominalStr.toLowerCase().replace(/[\s\.\,]/g, '');
  let nominal = 20000;
  let skuBase = 'PLN20';

  if (/1000000|1jt|1000k|^1000$/.test(norm)) {
    skuBase = 'PLN1000';
    nominal = 1000000;
  } else if (/500000|500rb|500k|^500$/.test(norm)) {
    skuBase = 'PLN500';
    nominal = 500000;
  } else if (/200000|200rb|200k|^200$/.test(norm)) {
    skuBase = 'PLN200';
    nominal = 200000;
  } else if (/100000|100rb|100k|^100$/.test(norm)) {
    skuBase = 'PLN100';
    nominal = 100000;
  } else if (/50000|50rb|50k|^50$/.test(norm)) {
    skuBase = 'PLN50';
    nominal = 50000;
  } else if (/20000|20rb|20k|^20$/.test(norm)) {
    skuBase = 'PLN20';
    nominal = 20000;
  } else {
    const parsed = parseInt(norm.replace(/\D/g, ''), 10);
    if (!isNaN(parsed) && parsed > 0) {
      nominal = parsed;
      const kVal = Math.round(nominal / 1000);
      skuBase = `PLN${kVal}`;
    }
  }

  const kSuffix = Math.round(nominal / 1000);
  // Daftar variasi kode SKU untuk pencocokan fleksibel
  const candidateSkus = [
    skuBase,
    skuBase.toLowerCase(),
    `PLN${nominal}`,
    `pln${nominal}`,
    `PLN${kSuffix}K`,
    `pln${kSuffix}k`,
    `TOKENPLN${kSuffix}`,
    `tokenpln${kSuffix}`,
    `TOKENPLN${nominal}`,
    `tokenpln${nominal}`
  ];

  // Cari juga dari katalog savedPrepaidProducts jika ada
  if (db?.savedPrepaidProducts && Array.isArray(db.savedPrepaidProducts)) {
    const matchProd = db.savedPrepaidProducts.find((p: any) => {
      const b = (p.brand || '').toUpperCase();
      const c = (p.category || '').toUpperCase();
      const n = (p.product_name || '').toUpperCase();
      const s = (p.buyer_sku_code || '').toUpperCase();
      const isPln = b.includes('PLN') || c.includes('PLN') || s.includes('PLN');
      if (!isPln) return false;
      return n.includes(nominal.toLocaleString('id-ID')) || n.includes(String(nominal)) || s === skuBase || s === `PLN${nominal}`;
    });
    if (matchProd?.buyer_sku_code && !candidateSkus.includes(matchProd.buyer_sku_code)) {
      candidateSkus.unshift(matchProd.buyer_sku_code);
    }
  }

  // Ambil data 'owner_fixed' (kolom ke-8 'Harga Jual (Owner)' dari menu Kelola Produk)
  let ownerFixedPrice = 0;
  let matchedSku = skuBase;

  for (const cSku of candidateSkus) {
    if (typeof getProductFee === 'function') {
      const f = getProductFee(cSku);
      if (f && f.owner_fixed !== undefined && Number(f.owner_fixed) > 0) {
        ownerFixedPrice = Number(f.owner_fixed);
        matchedSku = cSku;
        break;
      }
    }
    if (db?.productFees && db.productFees[cSku]) {
      const f = db.productFees[cSku];
      if (f && f.owner_fixed !== undefined && Number(f.owner_fixed) > 0) {
        ownerFixedPrice = Number(f.owner_fixed);
        matchedSku = cSku;
        break;
      }
    }
  }

  const isAvailable = Boolean(ownerFixedPrice > 0);

  return {
    sku: matchedSku,
    nominal,
    price: ownerFixedPrice,
    name: `Token PLN ${nominal.toLocaleString('id-ID')}`,
    available: isAvailable
  };
}

/**
 * Membuat daftar pilihan nominal dan Harga Jual Owner untuk Token PLN
 * HANYA memasukkan nominal yang sudah memiliki 'owner_fixed' resmi dari Owner di dashboard.
 * Jika nominal belum diisi harganya oleh Owner, jangan dimasukkan ke dalam daftar list.
 */
export function getPlnPriceListMenu(db?: any, getProductFee?: (sku: string) => any): string {
  const nominals = ['20000', '50000', '100000', '200000', '500000', '1000000'];
  const availableItems: string[] = [];

  for (const n of nominals) {
    const info = getPlnTokenPrice(n, db, getProductFee);
    if (info.available && info.price > 0) {
      availableItems.push(`• *${info.nominal.toLocaleString('id-ID')}* = Rp ${info.price.toLocaleString('id-ID')}`);
    }
  }

  return availableItems.join('\n');
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

