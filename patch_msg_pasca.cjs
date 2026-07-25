const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetSuccessMsgPasca = 'Pesanan sudah diproses otomatis oleh E4 Store. ${stateData.product.product_name} sudah masuk ke akun ${checkResult?.customer_name || customerNo} dan siap digunakan! 💪🔥';
const newSuccessMsgPasca = 'Pesanan sudah diproses otomatis oleh E4 Store. ${stateData.product.product_name} sudah masuk ke akun ${checkResult?.customer_name || customerNo} dan siap digunakan! 💪🔥${stateData.kembalianText ? "\\n" + stateData.kembalianText : ""}';

const targetFailMsgPasca = '🎯 Tujuan   : ${customerNo} (${payJson.data?.customer_name || checkResult?.customer_name || "-"})\\n\\n${refundMsg}';
const newFailMsgPasca = '🎯 Tujuan   : ${customerNo} (${payJson.data?.customer_name || checkResult?.customer_name || "-"})\\n\\n${refundMsg}${stateData.kembalianText ? "\\n" + stateData.kembalianText : ""}';

code = code.replace(targetSuccessMsgPasca, newSuccessMsgPasca);
code = code.replace(targetFailMsgPasca, newFailMsgPasca);

fs.writeFileSync('server.ts', code);
console.log("Msg pasca patched!");
