const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const broken = "msg += `*${i+1}. ${tx.product}*`;";
const fixed = "msg += `*${i+1}. ${tx.product}*\\n`;";
code = code.replace(broken, fixed);

const broken2 = "msg += `Tujuan: ${tx.target}`;";
const fixed2 = "msg += `Tujuan: ${tx.target}\\n`;";
code = code.replace(broken2, fixed2);

const broken3 = "msg += `Harga: Rp ${(tx.price || 0).toLocaleString('id-ID')}`;";
const fixed3 = "msg += `Harga: Rp ${(tx.price || 0).toLocaleString('id-ID')}\\n\\n`;";
code = code.replace(broken3, fixed3);

fs.writeFileSync('server.ts', code);
