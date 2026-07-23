const fs = require('fs');
let code = fs.readFileSync('src/components/views/Transaksi.tsx', 'utf8');

code = code.replace('fetch("/api/transactions")', 'fetch(`/api/transactions?t=${Date.now()}`)');

fs.writeFileSync('src/components/views/Transaksi.tsx', code);
console.log("Patched Transaksi.tsx fetch!");
