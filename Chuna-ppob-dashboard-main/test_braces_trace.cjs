const fs = require('fs');
const lines = fs.readFileSync('server.ts', 'utf8').split('\n');

let open = 0;
let started = false;
let startLine = 1871;

for (let i = 1870; i < 2642; i++) {
    const line = lines[i] || '';
    if (line.includes('bot.on("text"')) started = true;
    if (started) {
        const o = (line.match(/\{/g) || []).length;
        const c = (line.match(/\}/g) || []).length;
        open += o;
        open -= c;
        if (open === 0 && i > 1871) {
            console.log(`bot.on ended at line ${i + 1}`);
            console.log(`Next lines: ${lines[i+1]}, ${lines[i+2]}`);
            break;
        }
    }
}
