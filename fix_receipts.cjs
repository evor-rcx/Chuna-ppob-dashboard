const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Add tgReceiptSent: false to prepaid pre-register
code = code.replace(/waReceiptSent: false\n                \}\);\n                db.transactions = transactions;/, 'waReceiptSent: false,\n                    tgReceiptSent: false\n                });\n                db.transactions = transactions;');

// 2. Fix prepaid update after sending
code = code.replace(/transactions\[txIndex\]\.waReceiptSent = status === 'Sukses' \? waImageSent : false;/g, 'transactions[txIndex].waReceiptSent = true;\n                    transactions[txIndex].tgReceiptSent = true;');

// 3. Fix pasca duplicate unshift to become an update
code = code.replace(/transactions\.unshift\(\{\n                    id: pay_ref_id,\n                    memberId: member\.id,\n                    type: "pasca",\n                    product: stateData\.product\.product_name,\n                    sku: stateData\.product\.buyer_sku_code,\n                    target: customerNo,\n                    price: total,\n                    modal: digiflazzPrice,\n                    cuan: cuan > 0 \? cuan : 0,\n                    tagihan: stateData\.checkResult\?\.selling_price \|\| 0,\n                    admin_pel: stateData\.adminFee \|\| 0,\n                    status: status,\n                    method: method,\n                    sn: payJson\.data\?\.sn \|\| "-",\n                    date: new Date\(\)\.toISOString\(\),\n                    waReceiptSent: status === 'Sukses' \? waImageSent : false,\n                    tgMsgId,\n                    waMsgKey,\n                    tgChatId: ctx\.chat\?\.id,\n                    waJid\n                \}\);/g, `const txIndex = transactions.findIndex(t => t.id === pay_ref_id);\n                if (txIndex >= 0) {\n                    transactions[txIndex].waReceiptSent = true;\n                    transactions[txIndex].tgReceiptSent = true;\n                    transactions[txIndex].tgMsgId = tgMsgId;\n                    transactions[txIndex].waMsgKey = waMsgKey;\n                    transactions[txIndex].tgChatId = ctx.chat?.id;\n                    transactions[txIndex].waJid = waJid;\n                }`);

// 4. Add waReceiptSent: false and tgReceiptSent: false to pasca pre-register
code = code.replace(/sn: payJson\.data\?\.sn \|\| "-",\n                    date: new Date\(\)\.toISOString\(\)\n                \}\);\n                db.transactions = transactions;/g, 'sn: payJson.data?.sn || "-",\n                    date: new Date().toISOString(),\n                    waReceiptSent: false,\n                    tgReceiptSent: false\n                });\n                db.transactions = transactions;');

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts");
