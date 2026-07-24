const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf-8');
const lines = code.split('\n');
const waCode = lines.slice(1255, 2639).join('\n');
console.log("WA handles download:", waCode.includes('📥 Download'));
