const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/const appUrl = "http:\/\/localhost:3000";\s+let notaBuffer = null;/g, 'const appUrl = "http://localhost:3000";');
code = code.replace(/let msg = "";\s+if \(status === 'Sukses'\)/g, 'let msg = "";\n                let notaBuffer = null;\n                if (status === \'Sukses\')');

fs.writeFileSync('server.ts', code);
