const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

let target1 = "msg = `🎉 Horee! Sukses, Kak!\\n\\nPesanan sudah diproses otomatis oleh E4 Store. ${tx.product} sudah masuk ke akun ${nama || tx.target} dan siap digunakan! 💪🔥";
let new1 = "msg = `🎉 Horee! Sukses, Kak!\\n\\nPesanan sudah diproses otomatis oleh E4 Store. ${tx.product} sudah masuk ke ${isOwnerSelf ? 'nama' : 'akun'} ${nama || tx.target} ${isOwnerSelf ? '!' : 'dan siap digunakan!'} 💪🔥";
code = code.replace(target1, new1);

let target2 = "msg = `🎉 Horee! Sukses, Kak!\\n\\nPesanan sudah diproses otomatis oleh E4 Store. ${product.product_name} sudah masuk ke akun ${member.name || targetDisplay} dan siap digunakan! 💪🔥";
let new2 = "msg = `🎉 Horee! Sukses, Kak!\\n\\nPesanan sudah diproses otomatis oleh E4 Store. ${product.product_name} sudah masuk ke ${isOwnerSelf ? 'nama' : 'akun'} ${member.name || targetDisplay} ${isOwnerSelf ? '!' : 'dan siap digunakan!'} 💪🔥";
code = code.replace(target2, new2);

let target3 = "msg = `🎉 Horee! Sukses, Kak!\\n\\nPesanan sudah diproses otomatis oleh E4 Store. ${stateData.product.product_name} sudah masuk ke akun ${checkResult?.customer_name || customerNo} dan siap digunakan! 💪🔥";
let new3 = "msg = `🎉 Horee! Sukses, Kak!\\n\\nPesanan sudah diproses otomatis oleh E4 Store. ${stateData.product.product_name} sudah masuk ke ${isOwnerSelf ? 'nama' : 'akun'} ${checkResult?.customer_name || customerNo} ${isOwnerSelf ? '!' : 'dan siap digunakan!'} 💪🔥";
code = code.replace(target3, new3);

fs.writeFileSync('server.ts', code);
console.log("Patched messages!");
