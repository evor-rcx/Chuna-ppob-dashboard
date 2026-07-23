const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace the bad line
code = code.replace(/let msg = "🧾 \*Daftar Tagihan Aktif:\*\n\n";/, 'let msg = "🧾 *Daftar Tagihan Aktif:*\\n\\n";');

// Also fix any other \n in quotes that might have broken
code = code.replace(/"🧾 \*Daftar Tagihan Aktif:\*[\r\n]+"/g, '"🧾 *Daftar Tagihan Aktif:*\\n\\n"');

// Fix the \n issue correctly
const brokenLines = code.split('\n');
for (let i = 0; i < brokenLines.length; i++) {
    if (brokenLines[i].includes('let msg = "🧾 *Daftar Tagihan Aktif:*')) {
        if (!brokenLines[i].endsWith('";')) {
            brokenLines[i] = '          let msg = "🧾 *Daftar Tagihan Aktif:*\\n\\n";';
            // if next line is empty and part of the string, remove it
            if (brokenLines[i+1] === '') {
                brokenLines[i+1] = '// removed newline';
            }
        }
    }
}
fs.writeFileSync('server.ts', brokenLines.join('\n'));
