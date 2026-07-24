const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex = /\$\{\(data\.message \|\| 'Transaksi Gagal'\)\.replace\(\/\[_\*\[\\\]\(\)~`>#\+\\\-=\|\{\}\.!\]\/g, '\\\\\$\\{data\.message \|\| 'Transaksi Gagal'\}'\)\}/g;
const replace = "${(data.message || 'Transaksi Gagal').replace(/[_*[\\]()~`>#+\\-=|{}.!]/g, '\\\\$&')}";

if (regex.test(code)) {
    code = code.replace(regex, () => replace); // use function to avoid $& interpolation
    fs.writeFileSync('server.ts', code);
    console.log("Patched escape 2!");
} else {
    console.log("Escape regex 2 not found!");
}
