const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const prepaidTarget = `                }
                
                let msg = "";
                let tgMsgId: number | undefined;`;

const prepaidInsert = `                }
                
                // PRE-REGISTER TRANSACTION
                transactions.unshift({
                    id: pay_ref_id,
                    memberId: member.id,
                    type: "prepaid",
                    product: product.product_name,
                    sku: product.buyer_sku_code,
                    target: targetDisplay,
                    price: total,
                    modal: digiflazzPrice,
                    cuan: cuan > 0 ? cuan : 0,
                    status: status,
                    method: method,
                    sn: payJson.data?.sn || "-",
                    date: new Date().toISOString(),
                    waReceiptSent: false
                });
                db.transactions = transactions;
                writeDB(db);
                
                let msg = "";
                let tgMsgId: number | undefined;`;

if (code.includes(prepaidTarget)) {
    code = code.replace(prepaidTarget, prepaidInsert);
    console.log("Prepaid target found and replaced!");
} else {
    console.log("Prepaid target NOT found!");
}

const pascaTarget = `                }
                
                let msg = "";
                let tgMsgId: number | undefined;`;

// Wait, I should just replace BOTH occurrences of pascaTarget if there are multiple?
// No, the first one is for prepaid, the second for pasca!
fs.writeFileSync('server.ts', code);
