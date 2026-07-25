const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/\[\{ text: "🧾 Cek Tagihan" \}\],\s*\[\{ text: "📋 Menu Produk" \}\],\s*\[\{ text: "📥 Fitur Download" \}\],\s*\[\{ text: "🔙 Kembali ke Menu Owner" \}\]/g, 
`[{ text: "🧾 Cek Tagihan" }],
              [{ text: "📋 Menu Produk" }],
              [{ text: "🔙 Kembali ke Menu Owner" }]`);

fs.writeFileSync('server.ts', code);
console.log("Keyboard patched!");
