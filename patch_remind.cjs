const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');
code = code.replace(
    "const cleanWa = member.whatsapp.replace(/\\D/g, '');",
    "let cleanWa = member.whatsapp.replace(/\\D/g, '');\n      if (cleanWa.startsWith('0')) cleanWa = '62' + cleanWa.substring(1);"
);
fs.writeFileSync('server.ts', code);
