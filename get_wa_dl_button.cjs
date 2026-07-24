const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf-8');
const lines = code.split('\n');
const waCode = lines.slice(1255, 2639).join('\n');
const match = waCode.match(/📥 Download/g);
console.log("📥 Download count in WA:", match ? match.length : 0);
const start = waCode.indexOf('📥 Download');
if (start > -1) {
    console.log(waCode.substring(start - 200, start + 500));
}
