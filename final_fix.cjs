const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const kodebayarIdx = code.indexOf(`case 'KODEBAYAR_SELECT_PACKAGE':`);
const omniIdx = code.indexOf(`case 'OMNI_SELECT_PACKAGE':`);

let kodebayarPart = code.substring(kodebayarIdx, omniIdx);
kodebayarPart = kodebayarPart.replace(/let detail = selectedPkg\.name;/g, "let detail = selectedKodebayarPkg.name;");

let omniPart = code.substring(omniIdx);
omniPart = omniPart.replace(/let detail = selectedKodebayarPkg\.name;/g, "let detail = selectedPkg.name;");

code = code.substring(0, kodebayarIdx) + kodebayarPart + omniPart;

fs.writeFileSync('server.ts', code);
console.log("Final fix done");
