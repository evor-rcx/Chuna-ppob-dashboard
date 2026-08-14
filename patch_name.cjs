const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `lines.push(['Nama', data.nama || '-']);`;
const replacement = `let cleanName = data.nama || '-';
            if (cleanName.includes('*')) {
                cleanName = cleanName.replace(/\\*/g, '');
            }
            lines.push(['Nama', cleanName]);`;

code = code.replace(target, replacement);

fs.writeFileSync('server.ts', code);
