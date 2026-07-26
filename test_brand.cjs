const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf8');
const p1 = code.indexOf('const pascaBrands = [...new Set(pasca.map((p: any) => p.brand))].filter(Boolean);');
console.log(code.substring(p1, p1 + 1000));
