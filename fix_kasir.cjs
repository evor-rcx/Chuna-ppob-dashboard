const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/👑 DASHBOARD KASIR E4 STORE/g, '👑 DASHBOARD E4 STORE');

fs.writeFileSync('server.ts', code);
console.log("Fixed kasir!");
