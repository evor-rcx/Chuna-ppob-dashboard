const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf-8');
const start = code.indexOf("case 'AWAITING_DOWNLOAD_FORMAT':");
console.log(code.substring(start, start + 3000));
