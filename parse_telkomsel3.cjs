const fs = require('fs');
const html = fs.readFileSync('telkomsel.html', 'utf8');
const lines = html.split('\n');
let i = 0;
for (const line of lines) {
    if (line.includes('Surprise Deal') || line.includes('order(') || line.includes('Rp ')) {
        console.log(line.trim().substring(0, 150));
        i++;
        if (i > 20) break;
    }
}
