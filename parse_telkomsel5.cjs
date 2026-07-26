const fs = require('fs');
const html = fs.readFileSync('telkomsel.html', 'utf8');

const parts = html.split('<h4 class="modal-title">');
for (let i = 1; i < 3; i++) {
    console.log("================================");
    console.log(parts[i].substring(0, 500));
}

