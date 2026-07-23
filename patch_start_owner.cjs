const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStart = `                 keyboard: [
                   [{ text: "📒 Cek Utang Member" }],
                   [{ text: "📝 Tambah Member" }, { text: "👑 List Member" }],
                   [{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }],
                      [{ text: "📢 Pengumuman WA" }]
                 ],`;

const replacementStart = `                 keyboard: [
                   [{ text: "📒 Cek Utang Member" }],
                   [{ text: "📝 Tambah Member" }, { text: "👑 List Member" }],
                   [{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }],
                   [{ text: "📢 Pengumuman WA" }],
                   [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]
                 ],`;

code = code.replace(targetStart, replacementStart);
fs.writeFileSync('server.ts', code);
console.log("Patched start owner menu!");
