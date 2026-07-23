import re

with open('server.ts', 'r') as f:
    content = f.read()

target = """                if (method === 'saldo') {
                    paymentInfo = `    💰 SALDO  : "Cusss! Saldo langsung kepotong,
                 beres dalam sekejap! Kamu jago
                 banget pake saldo, Chuna salut! 💰✨"`;
                } else if (method === 'cash') {
                    paymentInfo = `    💵 CASH   : "Duitnya Chuna terima dengan senyum
                 lebar! Bayar tunai tetap berkesan!
                 Makasih udah main ke E4 Store! 🫳🌸"`;
                } else {
                    paymentInfo = `    📝 JANJI   : "Chuna percaya 100% sama kamu! 😍 
    BAYAR      Kamu pasti bayar tepat waktu karena
    TEPAT       Chuna tahu kamu pelanggan baik hati.
    WAKTU       Nanti kalau sudah transfer, chat
                 Chuna aja, nanti Chuna proses dengan
                 senyum manis! Makasih udah jujur! 💖🤗"`;
                }
"""

after_target = """
                // PRE-REGISTER TRANSACTION TO PREVENT RACE CONDITION WITH WEBHOOK
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
                let tgMsgId: number | undefined;
                let waMsgKey: any | undefined;
                let waJid: string | undefined;
                let notaBuffer: Buffer | null = null;
"""

replacement1 = content.replace(target, target + after_target)

# Now, we need to remove the old unshift at the end, and the refund in the else block.
# We also need to add the refund right after the pre-register.

# Let's fix the else block refund
target2 = """                } else {
                    if (!isOwnerSelf && method === 'saldo') {
                        member.balance += total;
                        db.members = members;
                        writeDB(db);
                    }
                    let refundMsg ="""

replacement2 = replacement1.replace(target2, """                } else {
                    let refundMsg =""")

# Let's add the refund after pre-register
target3 = """                db.transactions = transactions;
                writeDB(db);

                let msg = "";"""

replacement3 = replacement2.replace(target3, """                db.transactions = transactions;
                writeDB(db);

                if (status === 'Gagal' && !isOwnerSelf && method === 'saldo') {
                    member.balance += total;
                    db.members = members;
                    writeDB(db);
                }

                let msg = "";""")

# Now remove the old unshift
target4 = """                // ALWAYS save to transaction history so it can be seen
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
                    waReceiptSent: status === 'Sukses' ? waImageSent : false,
                    tgMsgId,
                    waMsgKey,
                    tgChatId: ctx.chat?.id,
                    waJid
                });
                db.transactions = transactions;
                writeDB(db);"""

replacement4 = replacement3.replace(target4, """                const txIndex = transactions.findIndex(t => t.id === pay_ref_id);
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

print("Prepaid patched successfully")
