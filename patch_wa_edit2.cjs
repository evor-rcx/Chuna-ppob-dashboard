const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/let edited = false;([\s\S]*?)if \(!edited\) \{/g, "if (true) {");
code = code.replace(/\} else if \(!edited\) \{/g, "} else {");

fs.writeFileSync('server.ts', code);
