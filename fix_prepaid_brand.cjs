const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const p1 = code.indexOf('if (prepaidBrands.includes(text)) {');
if (p1 !== -1) {
    const replace = 'if (prepaidBrands.includes(text) && (!state || !state.step.startsWith("PASCA_"))) {';
    code = code.substring(0, p1) + replace + code.substring(p1 + 35);
    console.log("Prepaid brand logic ignored for PASCA state!");
} else {
    console.log("Target not found");
}
fs.writeFileSync('server.ts', code);
