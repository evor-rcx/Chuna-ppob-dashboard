const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

let count = 0;

let re1 = /Pesanan sudah diproses otomatis oleh E4 Store\. \$\{tx\.product\} sudah masuk ke akun \$\{nama \|\| tx\.target\} dan siap digunakan!/g;
let new1 = 'Pesanan sudah diproses otomatis oleh E4 Store. ${tx.product} sudah masuk ke ${isOwnerSelf ? "nama" : "akun"} ${nama || tx.target} ${isOwnerSelf ? "!" : "dan siap digunakan!"}';
if (re1.test(code)) {
    code = code.replace(re1, new1);
    count++;
}

let re2 = /Pesanan sudah diproses otomatis oleh E4 Store\. \$\{product\.product_name\} sudah masuk ke akun \$\{member\.name \|\| targetDisplay\} dan siap digunakan!/g;
let new2 = 'Pesanan sudah diproses otomatis oleh E4 Store. ${product.product_name} sudah masuk ke ${isOwnerSelf ? "nama" : "akun"} ${member.name || targetDisplay} ${isOwnerSelf ? "!" : "dan siap digunakan!"}';
if (re2.test(code)) {
    code = code.replace(re2, new2);
    count++;
}

let re3 = /Pesanan sudah diproses otomatis oleh E4 Store\. \$\{stateData\.product\.product_name\} sudah masuk ke akun \$\{checkResult\?\.customer_name \|\| customerNo\} dan siap digunakan!/g;
let new3 = 'Pesanan sudah diproses otomatis oleh E4 Store. ${stateData.product.product_name} sudah masuk ke ${isOwnerSelf ? "nama" : "akun"} ${checkResult?.customer_name || customerNo} ${isOwnerSelf ? "!" : "dan siap digunakan!"}';
if (re3.test(code)) {
    code = code.replace(re3, new3);
    count++;
}

fs.writeFileSync('server.ts', code);
console.log("Patched " + count + " messages!");
