const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /\/\/ \-\-\- VOICE NOTE GENERATION \-\-\-[\s\S]*?\/\/ \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-/g;
code = code.replace(regex, '');
fs.writeFileSync('server.ts', code);
console.log("Reverted VN from success block.");
