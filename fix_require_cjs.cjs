const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/import \{ createRequire \} from "module";\nconst require = createRequire\(import.meta.url\);\n/g, "");
code = code.replace(/const btch = require\('btch-downloader'\);/g, "const btch = (await import('btch-downloader')).default || await import('btch-downloader');");

fs.writeFileSync('server.ts', code);
console.log("Fixed require for CJS!");
