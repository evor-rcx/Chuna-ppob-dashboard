const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// I will just use `var` to make it easy and avoid block scope issues
code = code.replace(/let notaBuffer: any = null;/g, '');
code = code.replace(/let notaBuffer;/g, '');
code = code.replace(/if \(pay_ref_id\) notaBuffer = await/g, 'if (pay_ref_id) { var notaBuffer: any = await');
// Also find where it generated receipt and make sure it assigns to var notaBuffer
code = code.replace(/if \(pay_ref_id\) \{ var notaBuffer: any = await (.*?); \}/g, 'var notaBuffer: any = null; if (pay_ref_id) { notaBuffer = await $1; }');

// Wait, the original code was: `if (pay_ref_id) notaBuffer = await generateCanvasReceipt(...)`
code = code.replace(/if \(pay_ref_id\) notaBuffer = await generateCanvasReceipt/g, 'var notaBuffer: any = null;\nif (pay_ref_id) notaBuffer = await generateCanvasReceipt');


// And the other error: `server.ts(2802,9): error TS2741: Property 'data' is missing`
code = code.replace(/userStates\[ctx\.from\.id\] = \{ step: 'AWAITING_DOWNLOAD_LINK' \};/g, "userStates[ctx.from.id] = { step: 'AWAITING_DOWNLOAD_LINK', data: {} };");

fs.writeFileSync('server.ts', code);
console.log("Fixed TS errors");
