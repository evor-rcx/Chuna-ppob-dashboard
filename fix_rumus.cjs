const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The user's requested formula: Admin - komisi + harga asli
// We will replace `const tagihan = result.price || 0;`
// with `const tagihan = (result.admin || 0) - (result.commission || 0) + (result.selling_price || 0);`

code = code.replace(/const tagihan = result\.price \|\| 0;/g, "const tagihan = (result.admin || 0) - (result.commission || 0) + (result.selling_price || 0);");

fs.writeFileSync('server.ts', code);
