const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Fix isOwnerSelf scope
code = code.replace(/let member = null;\s+let nama = "-";\s+if \(memberIndex >= 0\)/g, 
    'let member = null;\n                let nama = "-";\n                let isOwnerSelf = false;\n                if (memberIndex >= 0)');
code = code.replace(/let isOwnerSelf = false;/g, function(match, offset) {
    // Only remove the inner ones if they are inside the if statement
    if (offset > code.indexOf('if (memberIndex >= 0)') && offset < code.indexOf('if (status === \'Gagal\'')) {
        return '';
    }
    return match;
});

// 2. Fix notaBuffer unused / undefined scope
code = code.replace(/const appUrl = "http:\/\/localhost:3000";/g, ''); // not needed anyway

fs.writeFileSync('server.ts', code);
