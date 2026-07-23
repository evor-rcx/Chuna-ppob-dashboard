import re

with open('server.ts', 'r') as f:
    content = f.read()

target = """                let paymentInfo = "";
                if (method === 'saldo') {
                    paymentInfo = `    💰 SALDO  : "Beres dalam sekejap! Kamu jago
                 banget pake saldo, Chuna salut! 💰✨"`;
                } else if (method === 'cash') {
                    paymentInfo = `    💵 CASH   : "Bayar tunai tetap berkesan!
                 Makasih udah main ke E4 Store! 🫳🌸"`;
                } else {
                    paymentInfo = `    📝 JANJI   : "Chuna percaya 100% sama kamu! 😍 
    BAYAR      Kamu pasti bayar tepat waktu.
    TEPAT       Nanti kalau sudah transfer, chat
    WAKTU       Chuna aja ya! Makasih udah jujur! 💖🤗"`;
                }"""

after_target = """
                // PRE-REGISTER TRANSACTION TO PREVENT RACE CONDITION WITH WEBHOOK
                transactions.unshift({
                    id: pay_ref_id,
                    memberId: member.id,
                    type: "pasca",
                    product: stateData.product.product_name,
                    sku: stateData.product.buyer_sku_code,
                    target: customerNo,
                    price: total,
                    modal: digiflazzPrice,
                    cuan: cuan > 0 ? cuan : 0,
                    tagihan: stateData.checkResult?.selling_price || 0,
                    admin_pel: stateData.adminFee || 0,
                    status: status,
                    method: method,
                    sn: payJson.data?.sn || "-",
                    date: new Date().toISOString(),
                    waReceiptSent: false
                });
                db.transactions = transactions;
                writeDB(db);

                if (status === 'Gagal' && !isOwnerSelf && method === 'saldo') {
                    member.balance += total;
                    db.members = members;
                    writeDB(db);
                }
"""

replacement1 = content.replace(target, target + after_target)

target2 = """                } else {
                    if (!isOwnerSelf && method === 'saldo') {
                        member.balance += total;
                        db.members = members;
                        writeDB(db);
                    }
                    let refundMsg ="""

replacement2 = replacement1.replace(target2, """                } else {
                    let refundMsg =""")

target4 = """                // ALWAYS save to transaction history so it can be seen
                transactions.unshift({
                    id: pay_ref_id,
                    memberId: member.id,
                    type: "pasca",
                    product: stateData.product.product_name,
                    sku: stateData.product.buyer_sku_code,
                    target: customerNo,
                    price: total,
                    modal: digiflazzPrice,
                    cuan: cuan > 0 ? cuan : 0,
                    tagihan: stateData.checkResult?.selling_price || 0,
                    admin_pel: stateData.adminFee || 0,
                    status: status,
                    method: method,
                    sn: payJson.data?.sn || "-",
                    date: new Date().toISOString(),
                    waReceiptSent: status === 'Sukses' ? waImageSent : false,
                    tgMsgId,
                    waMsgKey,
                    tgChatId: ctx.chat?.id,
                    waJid
                });
                db.transactions = transactions;
                writeDB(db);"""

replacement4 = replacement2.replace(target4, """                const txIndex = transactions.findIndex(t => t.id === pay_ref_id);
                if (txIndex >= 0) {
                    transactions[txIndex].waReceiptSent = status === 'Sukses' ? waImageSent : false;
                    transactions[txIndex].tgMsgId = tgMsgId;
                    transactions[txIndex].waMsgKey = waMsgKey;
                    transactions[txIndex].tgChatId = ctx.chat?.id;
                    transactions[txIndex].waJid = waJid;
                    db.transactions = transactions;
                    writeDB(db);
                }""")

with open('server.ts', 'w') as f:
    f.write(replacement4)

print("Pasca patched successfully")
