const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf8');
const p1 = code.indexOf('const prepaidBrands = [...new Set(prepaid.map((p: any) => p.brand))].filter(Boolean);');
console.log(code.substring(p1, p1 + 2500));
