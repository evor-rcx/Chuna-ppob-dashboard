const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Fix notaBuffer in processPascaPayment
// Look for `let notaBuffer: any = null;` and move it UP
const notaBufferDecl = `                    let notaBuffer: any = null;`;
code = code.replace(notaBufferDecl, ''); // remove it from below
// Find `if (pay_ref_id) notaBuffer = await generateCanvasReceipt("nota",` and insert it before
code = code.replace(/if \(pay_ref_id\) notaBuffer = await generateCanvasReceipt\("nota",/g, 'let notaBuffer: any = null;\n                    if (pay_ref_id) notaBuffer = await generateCanvasReceipt("nota",');


// 2. Fix lunasText error in PASCA_INPUT_NUMBER
// Replace `await bot.telegram.sendMessage(cleanTgId, lunasText);` with `await bot.telegram.sendMessage(cleanTgId, replyText);`
code = code.replace(/await bot\.telegram\.sendMessage\(cleanTgId, lunasText\);/g, 'await bot.telegram.sendMessage(cleanTgId, replyText);');


// 3. Fix processPascaPayment also had notaBuffer used before declaration? Let me just use a generic regex for notaBuffer
code = code.replace(/let tgMsg;\n\s+let notaBuffer: any = null;/g, 'let tgMsg;');

fs.writeFileSync('server.ts', code);
console.log("Fixed TS errors");
