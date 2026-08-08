const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');
code = code.replace("base: './',", "base: '/',");
fs.writeFileSync('vite.config.ts', code);
