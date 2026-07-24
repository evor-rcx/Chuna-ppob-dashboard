const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// The code block for Pasca Payment
const pascaRegex = /const methodDisplay = method === 'cash' \? '💵 Tunai \(Cash\)' : method === 'utang' \? '📝 Utang' : '💳 Saldo';\s*await ctx\.reply\(`⏳ Status: Sedang memproses pembayaran tagihan untuk nomor \$\{customerNo\} melalui metode \$\{methodDisplay\}\. Mohon ditunggu\.`\);\s*const pay_ref_id = ref_id;\s*try \{\s*const signText = digiflazzUsername \+ digiflazzApiKey \+ pay_ref_id;[\s\S]*?(?=if \(status === 'Pending'\) \{)if \(status === 'Pending'\) \{\s*msg = `⏳ Hai Kak![\s\S]*?tgMsgId = tgMsg\.message_id;\s*\}/;

const pascaReplace = `const methodDisplay = method === 'cash' ? '💵 Tunai (Cash)' : method === 'utang' ? '📝 Utang' : '💳 Saldo';
        await ctx.reply(\`⏳ Status: Sedang memproses pembayaran tagihan untuk nomor \${customerNo} melalui metode \${methodDisplay}. Mohon ditunggu.\`);
        
        let pendingMsg = \`⏳ Hai Kak!

Pesanan Anda sedang diproses oleh sistem pusat E4 Store. Mohon tunggu beberapa saat, nanti akan kami kabari setelah selesai.

📦 Tagihan : \${stateData.product.product_name}
🎯 Tujuan   : \${customerNo} (\${checkResult?.customer_name || "-"})

Untuk cek status atau bertanya, langsung chat Chuna di Bot Telegram, ya!
👉 https://t.me/ChunaChanbot

Chuna menunggu kabar baik dari Kakak! 😊\`;
        
        const tgMsg = await ctx.reply(pendingMsg, { reply_markup: returnMarkup });
        let tgMsgId = tgMsg.message_id;

        const pay_ref_id = ref_id;
        
        // PRE-REGISTER TRANSACTION
        transactions.unshift({
            id: pay_ref_id,
            memberId: member.id,
            type: "pasca",
            product: stateData.product.product_name,
            sku: stateData.product.buyer_sku_code,
            target: customerNo,
            price: total,
            modal: 0,
            cuan: 0,
            status: "Pending",
            method: method,
            sn: "-",
            date: new Date().toISOString(),
            waReceiptSent: false,
            tgReceiptSent: false,
            tgMsgId: tgMsgId,
            tgChatId: ctx.chat?.id
        });
        db.transactions = transactions;
        writeDB(db);

        try {
            const signText = digiflazzUsername + digiflazzApiKey + pay_ref_id;
            const sign = crypto.createHash("md5").update(signText).digest("hex");
            const res = await fetch("https://api.digiflazz.com/v1/transaction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    commands: "pay-pasca",
                    username: digiflazzUsername,
                    buyer_sku_code: stateData.product.buyer_sku_code,
                    customer_no: customerNo,
                    ref_id: pay_ref_id,
                    sign: sign
                })
            });
            const payJson = await res.json();
            
            // Reload transactions
            let currTxIndex = transactions.findIndex(t => t.id === pay_ref_id);
            if (currTxIndex >= 0 && transactions[currTxIndex].status !== 'Pending') {
                transactions[currTxIndex].modal = payJson.data?.price || 0;
                transactions[currTxIndex].cuan = total - (payJson.data?.price || 0);
                writeDB(db);
                return;
            }

            if (payJson.data) {
                const status = payJson.data.status || 'Gagal';
                const digiflazzPrice = payJson.data.price || 0;
                const cuan = total - digiflazzPrice;
                
                let paymentInfo = "";
                if (method === 'saldo') {
                    paymentInfo = \`    💰 SALDO  : "Cusss! Saldo langsung kepotong,
                 beres dalam sekejap! Kamu jago
                 banget pake saldo, Chuna salut! 💰✨"\`;
                } else if (method === 'cash') {
                    paymentInfo = \`    💵 CASH   : "Duitnya Chuna terima dengan senyum
                 lebar! Bayar tunai tetap berkesan!
                 Makasih udah main ke E4 Store! 🫳🌸"\`;
                } else {
                    paymentInfo = \`    📝 JANJI   : "Chuna percaya 100% sama kamu! 😍
     BAYAR      Kamu pasti bayar tepat waktu karena
    TEPAT       Chuna tahu kamu pelanggan baik hati.
    WAKTU       Nanti kalau sudah transfer, chat
                 Chuna aja, nanti Chuna proses dengan
                 senyum manis! Makasih udah jujur! 💖🤗"\`;
                }
                
                transactions[currTxIndex].status = status;
                transactions[currTxIndex].modal = digiflazzPrice;
                transactions[currTxIndex].cuan = cuan > 0 ? cuan : 0;
                transactions[currTxIndex].sn = payJson.data?.sn || "-";
                db.transactions = transactions;
                writeDB(db);
                
                let msg = "";
                let waMsgKey;
                let notaBuffer;

                if (status === 'Pending') {
                    // Already sent before fetch
                }`;

if (pascaRegex.test(code)) {
    console.log("Regex matched pasca!");
    code = code.replace(pascaRegex, pascaReplace);
} else {
    console.log("Pasca regex did not match!");
}

fs.writeFileSync('server.ts', code);
