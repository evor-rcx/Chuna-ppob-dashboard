const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const brokenStr = 'let filtered = brandProducts.filter((p: any) => p.type === t} e} else {';
const fixStr = 'let filtered = brandProducts.filter((p: any) => p.type === text);\n                    // (This was PREPAID_SELECT_TYPE)';

code = code.replace(brokenStr, fixStr);
fs.writeFileSync('server.ts', code);
