const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');
code = code.replace('<link rel="icon" type="image/svg+xml" href="/icon.svg" />', '<link rel="icon" type="image/png" href="/app-icon.png" />');
code = code.replace('<link rel="apple-touch-icon" href="/icon.svg" />', '<link rel="apple-touch-icon" href="/app-icon.png" />');
fs.writeFileSync('index.html', code);
