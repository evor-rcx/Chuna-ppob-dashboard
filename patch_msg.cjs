const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

let count = 0;

let target1 = "msg = `🎉 Horee! Sukses, Kak!\\n\\nPesanan sudah diproses otomatis oleh E4 Store. ${tx.product} sudah masuk ke akun ${nama || tx.target} dan siap digunakan! 💪🔥";
let new1 = "msg = `🎉 Horee! Sukses, Kak!\\n\\nPesanan sudah diproses otomatis oleh E4 Store. ${tx.product} sudah masuk ke ${isOwnerSelf ? 'nama' : 'akun'} ${nama || tx.target} ${isOwnerSelf ? '!' : 'dan siap digunakan!'} 💪🔥";
if (code.includes(target1)) {
    code = code.replace(target1, new1);
    count++;
}

let target2 = "msg = `🎉 Horee! Sukses, Kak!\\n\\nPesanan sudah diproses otomatis oleh E4 Store. ${product.product_name} sudah masuk ke akun ${member.name || targetDisplay} dan siap digunakan! 💪🔥";
let new2 = "msg = `🎉 Horee! Sukses, Kak!\\n\\nPesanan sudah diproses otomatis oleh E4 Store. ${product.product_name} sudah masuk ke ${isOwnerSelf ? 'nama' : 'akun'} ${member.name || targetDisplay} ${isOwnerSelf ? '!' : 'dan siap digunakan!'} 💪🔥";
if (code.includes(target2)) {
    code = code.replace(target2, new2);
    count++;
}

let target3 = "msg = `🎉 Horee! Sukses, Kak!\\n\\nPesanan sudah diproses otomatis oleh E4 Store. ${stateData.product.product_name} sudah masuk ke akun ${checkResult?.customer_name || customerNo} dan siap digunakan! 💪🔥";
let new3 = "msg = `🎉 Horee! Sukses, Kak!\\n\\nPesanan sudah diproses otomatis oleh E4 Store. ${stateData.product.product_name} sudah masuk ke ${isOwnerSelf ? 'nama' : 'akun'} ${checkResult?.customer_name || customerNo} ${isOwnerSelf ? '!' : 'dan siap digunakan!'} 💪🔥";
if (code.includes(target3)) {
    code = code.replace(target3, new3);
    count++;
}

fs.writeFileSync('server.ts', code);
console.log("Patched " + count + " messages!");
