const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/let tgMsg;/g, 'let tgMsg;\n                    let notaBuffer: any = null;');

fs.writeFileSync('server.ts', code);
