const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf8');
const p1 = code.indexOf('if (types.length > 1) {');
console.log(code.substring(p1, p1 + 2500));
