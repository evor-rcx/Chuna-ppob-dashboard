const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf8');
const p1 = code.indexOf('// Check pasca brands');
console.log(code.substring(p1 - 1000, p1 + 1000));
