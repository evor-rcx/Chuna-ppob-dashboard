const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = '${member.name || ctx.from?.first_name || "kak"}';
const newStr = '${member.name || "Kisah"}';

code = code.replace(targetStr, newStr);

fs.writeFileSync('server.ts', code);
console.log("Welcome message name patched!");
