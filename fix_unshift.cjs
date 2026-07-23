const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target1 = `                }
                
                let msg = "";
                let tgMsgId: number | undefined;`;

const insert1 = `                }
                
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

code = code.replace(target1, insert1);
fs.writeFileSync('server.ts', code);
console.log("Done replace 1");
