const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldLine = `const customerNo = stateData.targetNo || stateData.customerNo || stateData.checkResult?.customer_no || "-";`;
const newLine = `const displayCustomerNo = stateData.customerNo || stateData.checkResult?.customer_no || stateData.targetNo || "-";
        const customerNo = stateData.targetNo || stateData.customerNo || stateData.checkResult?.customer_no || "-";`;

code = code.replace(oldLine, newLine);

// Now replace all uses of customerNo in messages with displayCustomerNo
// In processPascaPayment:
const regex1 = /Sedang memproses pembayaran tagihan untuk nomor \$\{customerNo\}/g;
code = code.replace(regex1, 'Sedang memproses pembayaran tagihan untuk nomor ${displayCustomerNo}');

const regex2 = /Tujuan   : \$\{customerNo\}/g;
code = code.replace(regex2, 'Tujuan   : ${displayCustomerNo}');

const regex3 = /target: customerNo/g;
code = code.replace(regex3, 'target: displayCustomerNo'); // For the receipt

const regex4 = /customerNo \} \$\{isOwnerSelf/g;
code = code.replace(regex4, 'displayCustomerNo } ${isOwnerSelf'); // For the success message

fs.writeFileSync('server.ts', code);
console.log("Fixed processPascaPayment display numbers");

