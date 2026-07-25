const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const brokenStr = `"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   👑  E4 STORE  👑
   OFFICIAL MANAGEMENT PANEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Selamat datang, Administrator.
Semua fitur resmi telah siap dioperasikan.

Mau kelola apa hari ini?"`;

const newStr = "`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n   👑  E4 STORE  👑\\n   OFFICIAL MANAGEMENT PANEL\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n\\nSelamat datang, Administrator.\\nSemua fitur resmi telah siap dioperasikan.\\n\\nMau kelola apa hari ini?`";

code = code.replace(new RegExp(brokenStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newStr);

fs.writeFileSync('server.ts', code);
console.log("Greeting patched again!");
