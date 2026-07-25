const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = "👑 DASHBOARD KASIR E4 STORESelamat datang bosku! Mau kelola apa hari ini?";
const newStr = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   👑  E4 STORE  👑
   OFFICIAL MANAGEMENT PANEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Selamat datang, Administrator.
Semua fitur resmi telah siap dioperasikan.

Mau kelola apa hari ini?`;

code = code.replace(new RegExp(targetStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newStr);

fs.writeFileSync('server.ts', code);
console.log("Greeting patched!");
