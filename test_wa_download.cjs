const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf-8');
const lines = code.split('\n');
const waStart = 1255;
const waCode = lines.slice(waStart).join('\n');
const isWaHandled = waCode.includes('AWAITING_DOWNLOAD') || waCode.includes('📥 Download');
console.log("WA Handler/Menu exists:", isWaHandled);
