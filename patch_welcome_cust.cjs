const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = '"✅ Welcome back kak di E4 Store Official! 🥰Mau transaksi apa hari ini kak bareng Chuna?"';
const newStr = '`━━━━━━━━━━━━━━━━━━━━━\\n   👥️ E4 STORE OFFICIAL\\n━━━━━━━━━━━━━━━━━━━━━\\n\\n✅ Welcome back, kak ${member.name || ctx.from?.first_name || "kak"}! 🥰\\nSenang banget lihat kamu lagi!\\n\\nMau transaksi apa hari ini kak bareng Chuna?\\nYuk pilih produk favoritmu! 🛍️`';

code = code.replace(targetStr, newStr);

fs.writeFileSync('server.ts', code);
console.log("Welcome message patched!");
