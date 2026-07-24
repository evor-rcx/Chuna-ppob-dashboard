const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf-8');
const lines = code.split('\n');
const waStart = 1255;
const tgStart = 2639;
const waCode = lines.slice(waStart, tgStart).join('\n');
const match = waCode.includes("AWAITING_DOWNLOAD");
console.log("WA AWAITING_DOWNLOAD:", match);
