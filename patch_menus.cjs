const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Update Customer Menu (multiple places)
code = code.replace(/\[\{ text: "💵 Cek Saldo" \}\],\s*\[\{ text: "🧾 Cek Tagihan" \}\],\s*\[\{ text: "📋 Menu Produk" \}\]/g, 
  `[{ text: "💵 Cek Saldo" }],
                  [{ text: "🧾 Cek Tagihan" }],
                  [{ text: "📋 Menu Produk" }],
                  [{ text: "📥 Fitur Download" }]`);

code = code.replace(/\[\{ text: "💵 Cek Saldo" \}\], \[\{ text: "🧾 Cek Tagihan" \}\], \[\{ text: "📋 Menu Produk" \}\]/g,
  `[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Fitur Download" }]`);

// Update Owner Menu (multiple places)
code = code.replace(/\[\{ text: "📒 Cek Utang Member" \}\],\s*\[\{ text: "📝 Tambah Member" \}, \{ text: "👑 List Member" \}\],\s*\[\{ text: "💳 Saldo Pusat" \}, \{ text: "⚙️ Pengaturan" \}\],\s*\[\{ text: "📢 Pengumuman WA" \}\]/g,
  `[{ text: "📒 Cek Utang Member" }],
                      [{ text: "📝 Tambah Member" }, { text: "👑 List Member" }],
                      [{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }],
                      [{ text: "📢 Pengumuman WA" }, { text: "📥 Fitur Download" }]`);

// Update Locked Member Menu
code = code.replace(/\[\{ text: "🧾 Cek Tagihan" \}\],\s*\[\{ text: "📋 Menu Produk" \}\],\s*\[\{ text: "🔙 Kembali ke Menu Owner" \}\]/g,
  `[{ text: "🧾 Cek Tagihan" }],
              [{ text: "📋 Menu Produk" }],
              [{ text: "📥 Fitur Download" }],
              [{ text: "🔙 Kembali ke Menu Owner" }]`);
              
code = code.replace(/\[\{ text: "🧾 Cek Tagihan" \}\], \[\{ text: "📋 Menu Produk" \}\], \[\{ text: "🔙 Kembali ke Menu Owner" \}\]/g,
  `[{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Fitur Download" }], [{ text: "🔙 Kembali ke Menu Owner" }]`);

fs.writeFileSync('server.ts', code);
console.log("Menus updated!");
