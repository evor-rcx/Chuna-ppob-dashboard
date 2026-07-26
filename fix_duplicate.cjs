const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/if \(prepaidBrands\.includes\(text\) \&\& \(\!state \|\| \!state\.step\.startsWith\("PASCA_"\)\)\) \{/g, 'if (!handled && prepaidBrands.includes(text) && (!state || !state.step.startsWith("PASCA_"))) {');
code = code.replace(/if \(pascaBrands\.includes\(text\)\) \{/g, 'if (!handled && pascaBrands.includes(text)) {');

fs.writeFileSync('server.ts', code);
console.log("Fixed duplicate checks");
