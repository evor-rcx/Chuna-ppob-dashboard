const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/msg \+= \`\*\$\{i\+1\}\. \$\{tx\.product\}\*\`;/, 'msg += `*${i+1}. ${tx.product}*\\n`;');
code = code.replace(/msg \+= \`Tujuan: \$\{tx\.target\}\`;/, 'msg += `Tujuan: ${tx.target}\\n`;');
code = code.replace(/msg \+= \`Harga: Rp \$\{\(tx\.price \|\| 0\)\.toLocaleString\('id-ID'\)\}\`;/, 'msg += `Harga: Rp ${(tx.price || 0).toLocaleString("id-ID")}\\n\\n`;');

fs.writeFileSync('server.ts', code);
