const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf8');
const p1 = code.indexOf("switch (state.step) {");
console.log("Switch starts at index:", p1);
const p2 = code.indexOf("} // end switch", p1);
console.log("Switch might end around:", p2);
