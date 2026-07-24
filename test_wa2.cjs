const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf-8');
const lines = code.split('\n');
const waStart = 1255;
const waEnd = lines.findIndex(l => l.includes('export const startTelegramBot'));
const waCode = lines.slice(waStart, waEnd).join('\n');
console.log("WA handles download:", waCode.includes("AWAITING_DOWNLOAD"));
console.log("WA has Download menu:", waCode.includes("📥 Download"));
