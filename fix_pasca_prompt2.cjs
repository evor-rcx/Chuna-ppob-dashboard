const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = '✏️ *Silakan masukkan nomor tujuan/pelanggan untuk mengecek tagihan:*';
const replace = '${matchedProduct.brand.toLowerCase().includes("by.u") || matchedProduct.brand.toLowerCase().includes("byu") ? "✏️ *Silakan masukkan KODE PEMBAYARAN by.U (BUKAN Nomor HP):*" : "✏️ *Silakan masukkan nomor tujuan/pelanggan untuk mengecek tagihan:*"}';

const parts = code.split(target);
if (parts.length > 1) {
    code = parts.join(replace);
    fs.writeFileSync('server.ts', code);
    console.log("Replaced successfully!");
} else {
    console.log("Not found");
}
