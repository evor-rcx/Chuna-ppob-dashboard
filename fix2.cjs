const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

let p = code.indexOf('const memberIndex = members.findIndex((m) => m.id === tx.memberId);');
if (p !== -1) {
    let p2 = code.indexOf('if (memberIndex >= 0) {', p);
    if (p2 !== -1 && !code.substring(p, p2).includes('let isOwnerSelf')) {
        code = code.substring(0, p2) + 'let isOwnerSelf = false;\n                ' + code.substring(p2);
        code = code.replace('let isOwnerSelf = false;\n                    if (Array.isArray', 'if (Array.isArray');
    }
}

// Check other TS errors
code = code.replace(/userStates\[userId\] = \{ step: 'OWNER_MENU' \};/g, `userStates[userId] = { step: 'OWNER_MENU', data: {} };`);
code = code.replace(/\{ text: lunasText \}/g, `{ text: "✅ Tandai Lunas" }`);
code = code.replace(/\{ text: "❌ Batal" \}/g, `{ text: "❌ Batal" }`);

fs.writeFileSync('server.ts', code);
