import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf-8');

const oldLogic = `                                let sentPhoto = false;
                                if (status === 'Sukses') {
                                    const appUrl = "http://localhost:3000";
                                    const buffer = await generateCanvasReceipt("nota", tx);
                                    if (buffer) {
                                        await waSocket.sendMessage(jid, { image: buffer, caption: msg });
                                        sentPhoto = true;
                                    }
                                }
                                
                                if (!sentPhoto) {
                                    if (tx.waMsgKey) {
                                        try {
                                            await waSocket.sendMessage(jid, { text: msg, edit: tx.waMsgKey });
                                        } catch (e) {
                                            await waSocket.sendMessage(jid, { text: msg });
                                        }
                                    } else {
                                        await waSocket.sendMessage(jid, { text: msg });
                                    }
                                }`;

const newLogic = `                                let edited = false;
                                if (tx.waMsgKey) {
                                    try {
                                        await waSocket.sendMessage(jid, { text: msg, edit: tx.waMsgKey });
                                        edited = true;
                                    } catch (e) { }
                                }
                                
                                if (status === 'Sukses') {
                                    const buffer = await generateCanvasReceipt("nota", tx);
                                    if (buffer) {
                                        // Wait a little bit for realistic flow
                                        await new Promise(r => setTimeout(r, 1000));
                                        await waSocket.sendPresenceUpdate("composing", jid);
                                        await new Promise(r => setTimeout(r, 1200));
                                        await waSocket.sendPresenceUpdate("paused", jid);
                                        await waSocket.sendMessage(jid, { image: buffer, caption: "✅ *Transaksi Berhasil!* Berikut nota pembelian kamu ya, kak. Terima kasih sudah belanja di E4 Store! 🥰" });
                                    } else if (!edited) {
                                        await waSocket.sendMessage(jid, { text: msg });
                                    }
                                } else if (!edited) {
                                    await waSocket.sendMessage(jid, { text: msg });
                                }`;

if (code.includes(oldLogic)) {
    code = code.replace(oldLogic, newLogic);
    fs.writeFileSync('server.ts', code);
    console.log("Patched successfully!");
} else {
    console.log("Old logic not found.");
}
