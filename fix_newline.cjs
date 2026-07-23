const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/👑 DASHBOARD KASIR E4 STORESelamat datang bosku! Mau kelola apa hari ini\?/g, '👑 DASHBOARD KASIR E4 STORE\\nSelamat datang bosku! Mau kelola apa hari ini?');

fs.writeFileSync('server.ts', code);
console.log("Fixed newline!");
