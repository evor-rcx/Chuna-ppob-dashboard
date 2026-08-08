const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');
code = code.replace('<link rel="icon" type="image/png" href="/app-icon.png" />', '<link rel="icon" type="image/png" href="/icon-192.png" />');
code = code.replace('<link rel="apple-touch-icon" href="/app-icon.png" />', '<link rel="apple-touch-icon" href="/icon-192.png" />');
fs.writeFileSync('index.html', code);
