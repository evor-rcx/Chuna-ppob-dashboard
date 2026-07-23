const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace the broken template string
const brokenString = 'Kirimkan teks, gambar, atau video (dengan caption) yang ingin dikirimkan ke target *${target}*:\\n\\n(Bisa multi-baris)\\n\\n💡 *TIPS OTOMATIS HARGA:*\\nKamu bisa pakai kode seperti ini agar harga update otomatis sesuai setting produk & Digiflazz:\\n`{{KODE_SKU:REGULER}}` -> Harga Biasa\\n`{{KODE_SKU:VIP}}` -> Harga VIP\\n`{{KODE_SKU:STATUS}}` -> 🟢 NORMAL / 🔴 CLOSE\\n`{{KODE_SKU:HEMAT}}` -> Selisih Harga\\n\\nContoh:\\n💎 ML 170DM: `{{ML170:REGULER}}`\\n⭐ VIP Cuma: `{{ML170:VIP}}`';
const fixedString = 'Kirimkan teks, gambar, atau video (dengan caption) yang ingin dikirimkan ke target *${target}*:\\n\\n(Bisa multi-baris)\\n\\n💡 *TIPS OTOMATIS HARGA:*\\nKamu bisa pakai kode seperti ini agar harga update otomatis sesuai setting produk & Digiflazz:\\n\\`{{KODE_SKU:REGULER}}\\` -> Harga Biasa\\n\\`{{KODE_SKU:VIP}}\\` -> Harga VIP\\n\\`{{KODE_SKU:STATUS}}\\` -> 🟢 NORMAL / 🔴 CLOSE\\n\\`{{KODE_SKU:HEMAT}}\\` -> Selisih Harga\\n\\nContoh:\\n💎 ML 170DM: \\`{{ML170:REGULER}}\\`\\n⭐ VIP Cuma: \\`{{ML170:VIP}}\\`';

code = code.replace(brokenString, fixedString);

fs.writeFileSync('server.ts', code);
