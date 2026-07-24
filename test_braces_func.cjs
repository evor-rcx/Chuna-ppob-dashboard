const fs = require('fs');
const lines = fs.readFileSync('server.ts', 'utf8').split('\n');

let open = 0;
let started = false;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('async function startTelegramBot')) started = true;
    if (started) {
        const o = (line.match(/\{/g) || []).length;
        const c = (line.match(/\}/g) || []).length;
        open += o;
        open -= c;
        if (open === 0) {
            console.log(`Function ended at line ${i + 1}`);
            console.log(`Line: ${line}`);
            break;
        }
    }
}
