const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Case 1: Single line replacements
code = code.replace(/\[\{ text: "📥 Download" \}, \{ text: "🎵 Lirik Lagu" \}\], \[\{ text: "🔙 Kembali ke Menu Owner" \}\]/g, '[{ text: "🔙 Kembali ke Menu Owner" }]');

// Case 2: Multi-line replacements
code = code.replace(/\[\{ text: "📥 Download" \}, \{ text: "🎵 Lirik Lagu" \}\],\s*\[\{ text: "🔙 Kembali ke Menu Owner" \}\]/g, '[{ text: "🔙 Kembali ke Menu Owner" }]');

fs.writeFileSync('server.ts', code);
console.log("Fixed owner menus!");
