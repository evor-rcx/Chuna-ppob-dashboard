const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Patch in generateStruk function (around line 196)
code = code.replace(
    /const badgeText = type === 'nota' \? \`Status: \$\{data\.status\.toUpperCase\(\)\} \$\{\(isSukses\?'\(LUNAS\)':''\)\}\` : \`Tagihan Ditemukan!\`;/g,
    `let lunasStr = '';
        if (isSukses) {
            if (data.method === 'utang') lunasStr = ' (TIDAK LUNAS)';
            else lunasStr = ' (LUNAS)';
        }
        const badgeText = type === 'nota' ? \`Status: \${data.status.toUpperCase()}\${lunasStr}\` : \`Tagihan Ditemukan!\`;`
);

// Patch in /api/nota/:id HTML route (around line 5843)
code = code.replace(
    /let statusText = \`Status: \$\{tx\.status\.toUpperCase\(\)\} \$\{\(isSukses \? '\(LUNAS\)' : ''\)\}\`;/g,
    `let lunasStr = '';
    if (isSukses) {
        if (tx.method === 'utang') lunasStr = ' (TIDAK LUNAS)';
        else lunasStr = ' (LUNAS)';
    }
    let statusText = \`Status: \${tx.status.toUpperCase()}\${lunasStr}\`;`
);

fs.writeFileSync('server.ts', code);
