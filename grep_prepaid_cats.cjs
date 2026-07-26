const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf8');
const p1 = code.indexOf("case 'PASCA_INPUT_NUMBER':");
console.log(code.substring(p1 + 2000, p1 + 4500));
