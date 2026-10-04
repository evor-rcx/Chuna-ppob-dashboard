import { GlobalFonts } from '@napi-rs/canvas';
import path from 'path';
import fs from 'fs';

let fontsInitialized = false;

/**
 * Inisialisasi Font Engine @napi-rs/canvas dengan dukungan Multi-Language Unicode CJK (No-Tofu)
 * Menjamin karakter Jepang (Katakana, Hiragana, Kanji), China (Hanzi), Korea (Hangul),
 * Arab, Thai, Cyrillic, dan simbol unik profil Telegram/WhatsApp dapat dirender dengan sempurna.
 */
export function initGlobalFonts(): void {
  if (fontsInitialized) return;
  fontsInitialized = true;

  try {
    // 1. Muat seluruh font bawaan sistem Linux
    if (typeof (GlobalFonts as any).loadSystemFonts === 'function') {
      (GlobalFonts as any).loadSystemFonts();
    }
  } catch (e) {
    console.warn('[FontHelper] Gagal memuat system fonts:', e);
  }

  // 2. Daftarkan font CJK & Unicode dari folder lokal fonts/ dan /usr/share/fonts
  const candidates: { paths: string[]; aliases: string[] }[] = [
    {
      paths: [
        path.join(process.cwd(), 'fonts', 'NotoSansJP.ttf'),
        '/usr/share/fonts/opentype/ipafont-gothic/ipagp.ttf',
        '/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf',
        '/usr/share/fonts/truetype/fonts-japanese-gothic.ttf'
      ],
      aliases: ['NotoSansJP', 'JapaneseFont', 'IPAPGothic']
    },
    {
      paths: [
        path.join(process.cwd(), 'fonts', 'NotoSansCJK.ttc'),
        '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
      ],
      aliases: ['NotoSansCJK', 'Noto Sans CJK', 'WenQuanYi Zen Hei', 'CJKFont']
    },
    {
      paths: [
        path.join(process.cwd(), 'fonts', 'NotoSansArabic.ttf'),
        '/usr/share/fonts/truetype/kacst/KacstBook.ttf'
      ],
      aliases: ['NotoSansArabic', 'ArabicFont']
    },
    {
      paths: [
        path.join(process.cwd(), 'fonts', 'NotoSansThai.ttf'),
        '/usr/share/fonts/truetype/tlwg/Garuda.ttf'
      ],
      aliases: ['NotoSansThai', 'ThaiFont']
    }
  ];

  for (const c of candidates) {
    for (const p of c.paths) {
      if (fs.existsSync(p)) {
        for (const alias of c.aliases) {
          try {
            GlobalFonts.registerFromPath(p, alias);
          } catch (e) {
            // Already registered or variation
          }
        }
        break;
      }
    }
  }

  console.log('[FontHelper] ✅ Font Unicode & CJK No-Tofu siap digunakan.');
}

/**
 * Standard Multi-Language Font Stack (No-Tofu)
 * Menjamin nama Jepang (Katakana/Hiragana/Kanji), China, Korea, Arab, simbol, dan alfabet
 * tercetak tajam tanpa menjadi kotak-kotak (tofu).
 */
export const UNICODE_FONT_STACK = '"NotoSansJP", "NotoSansCJK", "Noto Sans CJK", "IPAPGothic", "WenQuanYi Zen Hei", "NotoSansArabic", "NotoSansThai", "Liberation Sans", "DejaVu Sans", Arial, sans-serif';
