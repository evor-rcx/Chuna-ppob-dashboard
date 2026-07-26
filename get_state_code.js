const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf8');
const lines = code.split('\n');
let start = 0;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('bot.on("text", async (ctx) => {')) {
        start = i;
        break;
    }
}
console.log(lines.slice(start, start+150).join('\n'));
