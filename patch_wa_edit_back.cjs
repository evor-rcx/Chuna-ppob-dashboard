const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `                                if (status === 'Sukses') {
                                    const buffer = await generateCanvasReceipt("nota", tx);
                                    if (buffer) {
                                        await waSocket.sendMessage(jid, { image: buffer, caption: "✅ *Transaksi Berhasil!* Berikut nota pembelian kamu ya, kak. Terima kasih sudah belanja di E4 Store! 🥰" });
                                    } else {
                                        await waSocket.sendMessage(jid, { text: msg });
                                    }
                                } else {
                                    await waSocket.sendMessage(jid, { text: msg });
                                }`;

const replacement = `                                let edited = false;
                                if (tx.waMsgKey) {
                                    try {
                                        await waSocket.sendMessage(jid, { text: msg, edit: tx.waMsgKey });
                                        edited = true;
                                    } catch (e) { console.log("Failed to edit msg", e); }
                                }
                                
                                if (status === 'Sukses') {
                                    const buffer = await generateCanvasReceipt("nota", tx);
                                    if (buffer) {
                                        await waSocket.sendMessage(jid, { image: buffer, caption: "✅ *Transaksi Berhasil!* Berikut nota pembelian kamu ya, kak. Terima kasih sudah belanja di E4 Store! 🥰" });
                                    } else if (!edited) {
                                        await waSocket.sendMessage(jid, { text: msg });
                                    }
                                } else if (!edited) {
                                    await waSocket.sendMessage(jid, { text: msg });
                                }`;

if(code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server.ts', code);
    console.log("Patched successfully");
} else {
    console.log("Target not found!");
}
