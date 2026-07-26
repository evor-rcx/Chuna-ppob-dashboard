const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = '✏️ Silakan masukkan nomor tujuan (HP/ID) untuk melanjutkan pembelian.';
const replace = '${matchedProduct.brand.toLowerCase().includes("by.u") || matchedProduct.brand.toLowerCase().includes("byu") ? "✏️ Silakan masukkan *Kode Pembayaran* by.U (BUKAN Nomor HP).\\n\\n_(Atau Anda dapat menggenerate otomatis di web: https://kodebayar.web.id/byu)_" : "✏️ Silakan masukkan nomor tujuan (HP/ID) untuk melanjutkan pembelian."}';

if (code.includes(target)) {
    code = code.replace(target, replace);
    fs.writeFileSync('server.ts', code);
    console.log("Updated prepaid prompt!");
} else {
    console.log("Not found");
}
