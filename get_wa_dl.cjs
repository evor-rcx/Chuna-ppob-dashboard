const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf-8');
const lines = code.split('\n');
const waCode = lines.slice(1255, 2639).join('\n');
const start = waCode.indexOf("case 'AWAITING_DOWNLOAD':");
if (start > -1) {
    console.log(waCode.substring(start, start + 2000));
}
