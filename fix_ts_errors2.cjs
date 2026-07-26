const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// I will just add `let notaBuffer: any = null;` at the very beginning of the Sukses block
// and remove any existing declarations of it

// Remove all existing `let notaBuffer: any = null;` and `let notaBuffer;`
code = code.replace(/let notaBuffer: any = null;/g, '');
code = code.replace(/let notaBuffer;/g, '');

// Now add it back at the start of Sukses blocks
code = code.replace(/if \(status === 'Sukses'\) \{/g, "if (status === 'Sukses') {\n                    let notaBuffer: any = null;");

fs.writeFileSync('server.ts', code);
console.log("Fixed TS errors");
