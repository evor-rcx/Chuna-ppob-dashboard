const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf-8');
const lines = code.split('\n');
const waStart = 1255;
const tgStart = lines.findIndex(l => l.includes('bot.on(\'message\','));
const waCode = lines.slice(waStart, tgStart).join('\n');
if (waCode.includes("AWAITING_DOWNLOAD")) {
    console.log("WA handles download");
} else {
    console.log("WA DOES NOT handle download");
}
if (waCode.includes("📥 Download")) {
    console.log("WA HAS download menu");
}
