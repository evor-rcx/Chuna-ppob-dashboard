const fs = require('fs');
const html = fs.readFileSync('telkomsel.html', 'utf8');

const parts = html.split('<h4 class="modal-title">');
console.log(parts[1].substring(0, 1500));

