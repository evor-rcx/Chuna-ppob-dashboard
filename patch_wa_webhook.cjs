const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const webhookRegex = /} else if \(bot && member && member\.telegram[\s\S]*?res\.json\(\{ success: true \}\);/m;

const newWebhook = `} else if (bot && member && member.telegram && member.telegram.length > 0) {
                    (async () => {
                    try {
                        const tgId = Array.isArray(member.telegram) ? member.telegram[0] : member.telegram.replace(/\\D/g, '');
                        let tgPhotoSent = false;
                        if (status === 'Sukses') {
                            const buffer = await generateCanvasReceipt("nota", tx);
                            if (buffer) {
                                await bot.telegram.sendPhoto(tgId, { source: buffer }, { caption: msg, parse_mode: "Markdown" });
                                tgPhotoSent = true;
                            }
                        }
                        if (!tgPhotoSent) {
                            await bot.telegram.sendMessage(tgId, msg, { parse_mode: "Markdown" });
                        }
                        const tIndex = db.transactions.findIndex((t: any) => t.id === tx.id);
                        if (tIndex >= 0) {
                            db.transactions[tIndex].tgReceiptSent = true;
                            writeDB(db);
                        }
                    } catch (e) {
                    }
                    })();
                }
                
                if (waSocket && member && member.whatsapp) {
                    (async () => {
                    try {
                        let cleanWa = member.whatsapp.replace(/\\D/g, "");
                        if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
                        const jid = cleanWa + "@s.whatsapp.net";
                        
                        let caption = "";
                        let buffer = null;
                        if (status === 'Sukses') {
                            buffer = await generateCanvasReceipt("nota", tx);
                            caption = "✅ *Transaksi Berhasil!* Berikut nota pembelian kamu ya, kak. Terima kasih sudah belanja di E4 Store! 🥰";
                        } else if (status === 'Gagal') {
                            let refundMsg = tx.method === 'saldo' ? '✅ Saldo sebesar Rp ' + (tx.price||0).toLocaleString('id-ID') + ' telah dikembalikan ke akunmu!' : (tx.method === 'utang' ? '✅ Utang sebesar Rp ' + (tx.price||0).toLocaleString('id-ID') + ' telah dibatalkan!' : '✅ Mohon kembalikan uang tunai sebesar Rp ' + (tx.price||0).toLocaleString('id-ID') + ' kepada pelanggan.');
                            caption = \`❌ *Transaksi Gagal!*\\n\\nMaaf Kak, pembayaran untuk pesanan Anda (\${tx.product}) gagal diproses.\\n\\n\${refundMsg}\\n\\nTenang saja, Kakak bisa mencoba ulang kapan pun.\`;
                        }
                        
                        await waSocket.sendPresenceUpdate("composing", jid);
                        await new Promise(r => setTimeout(r, 1200));
                        await waSocket.sendPresenceUpdate("paused", jid);
                        
                        if (buffer) {
                            await waSocket.sendMessage(jid, { image: buffer, caption: caption });
                        } else {
                            if (tx.waMsgKey) {
                                try { await waSocket.sendMessage(jid, { text: caption, edit: tx.waMsgKey }); } catch(e) {
                                    await waSocket.sendMessage(jid, { text: caption });
                                }
                            } else {
                                await waSocket.sendMessage(jid, { text: caption });
                            }
                        }
                        
                        const tIndex = db.transactions.findIndex((t: any) => t.id === tx.id);
                        if (tIndex >= 0) {
                            db.transactions[tIndex].waReceiptSent = true;
                            writeDB(db);
                        }
                    } catch (e) {
                    }
                    })();
                }
            }
        }
        res.json({ success: true });`;

code = code.replace(webhookRegex, newWebhook);
fs.writeFileSync('server.ts', code);
console.log("Patched Webhook logic!");
