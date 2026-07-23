const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Replace the specific block
code = code.replace(/━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n     📢 PENGUMUMAN E4 STORE 📢\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n/g, '');

fs.writeFileSync('server.ts', code);
console.log("Removed duplicate header from templates.");
