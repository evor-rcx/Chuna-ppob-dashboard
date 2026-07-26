const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf8');
const p1 = code.indexOf('// Check pasca brands');
const p2 = code.indexOf('// Check pasca categories', p1);
console.log(code.substring(p1, p1 + 1000));
