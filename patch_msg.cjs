const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetSuccessMsgPrepaid = 'Pesanan sudah diproses otomatis oleh E4 Store. ${product.product_name} sudah masuk ke akun ${member.name || targetDisplay} dan siap digunakan! 💪🔥';
const newSuccessMsgPrepaid = 'Pesanan sudah diproses otomatis oleh E4 Store. ${product.product_name} sudah masuk ke akun ${member.name || targetDisplay} dan siap digunakan! 💪🔥${stateData.kembalianText ? "\\n" + stateData.kembalianText : ""}';

const targetFailMsgPrepaid = '🎯 Tujuan   : ${targetDisplay} (${member.name || "-"})\\n\\n${refundMsg}';
const newFailMsgPrepaid = '🎯 Tujuan   : ${targetDisplay} (${member.name || "-"})\\n\\n${refundMsg}${stateData.kembalianText ? "\\n" + stateData.kembalianText : ""}';

code = code.replace(targetSuccessMsgPrepaid, newSuccessMsgPrepaid);
code = code.replace(targetFailMsgPrepaid, newFailMsgPrepaid);

fs.writeFileSync('server.ts', code);
console.log("Msg patched!");
