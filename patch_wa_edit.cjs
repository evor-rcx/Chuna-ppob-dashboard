const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldLogic = `                                let edited = false;
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

const newLogic = `                                if (status === 'Sukses') {
                                    const buffer = await generateCanvasReceipt("nota", tx);
                                    if (buffer) {
                                        // Wait a little bit for realistic flow
                                        await new Promise(r => setTimeout(r, 1000));
                                        await waSocket.sendPresenceUpdate("composing", jid);
                                        await new Promise(r => setTimeout(r, 1200));
                                        await waSocket.sendPresenceUpdate("paused", jid);
                                        const sendOpts = { image: buffer, caption: "✅ *Transaksi Berhasil!* Berikut nota pembelian kamu ya, kak. Terima kasih sudah belanja di E4 Store! 🥰" };
                                        await waSocket.sendMessage(jid, sendOpts, { quoted: tx.waMsgKey ? { key: tx.waMsgKey, message: { conversation: "Pesanan diproses" } } : undefined });
                                    } else {
                                        await waSocket.sendMessage(jid, { text: msg }, { quoted: tx.waMsgKey ? { key: tx.waMsgKey, message: { conversation: "Pesanan diproses" } } : undefined });
                                    }
                                } else {
                                    await waSocket.sendMessage(jid, { text: msg }, { quoted: tx.waMsgKey ? { key: tx.waMsgKey, message: { conversation: "Pesanan diproses" } } : undefined });
                                }`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('server.ts', code);
