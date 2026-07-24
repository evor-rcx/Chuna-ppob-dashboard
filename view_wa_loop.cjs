const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf-8');
const lines = code.split('\n');
const start = lines.findIndex(l => l.includes('case \'WAIT_DOWNLOAD_URL\':'));
const end = lines.findIndex((l, i) => i > start && l.includes('delete userStates[userId]'));
console.log(lines.slice(start, end + 1).join('\n'));
