const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/const tagihan = result\.price \|\| 0;/g, "const tagihan = result.selling_price || 0;");

fs.writeFileSync('server.ts', code);
