const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Fix isOwnerSelf inside the polling function
let p = code.indexOf('const memberIndex = members.findIndex((m) => m.id === tx.memberId);');
if (p !== -1) {
    let p2 = code.indexOf('if (memberIndex >= 0) {', p);
    if (p2 !== -1) {
        code = code.substring(0, p2) + 'let isOwnerSelf = false;\n                ' + code.substring(p2);
        // remove the inner declaration
        code = code.replace('let isOwnerSelf = false;\n                    if (Array.isArray', 'if (Array.isArray');
    }
}

// Fix notaBuffer in Telegram bot callback
code = code.replace(/let tgPhotoSent = false;\s+if \(status === 'Sukses'\) \{\s+const buffer = await generateCanvasReceipt\("nota", tx\);\s+if \(buffer\) \{/g,
    `let tgPhotoSent = false;\n                        if (status === 'Sukses') {\n                            const buffer = await generateCanvasReceipt("nota", tx);\n                            if (buffer) {`);

fs.writeFileSync('server.ts', code);
