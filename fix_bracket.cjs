const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace("if (state.data?.memberId) { {", "if (state.data?.memberId) {");

fs.writeFileSync('server.ts', code);
