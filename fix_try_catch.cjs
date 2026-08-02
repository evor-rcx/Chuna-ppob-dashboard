const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const broken = `                            try {
                                await waSocket.presenceSubscribe(jid);
                                await waSocket.sendPresenceUpdate("composing", jid);
                                await new Promise(r => setTimeout(r, 1200));
                                await waSocket.sendPresenceUpdate("paused", jid);
                                
                                if (true) {
                                        await waSocket.sendMessage(jid, { text: msg });
                                    }
                                } else {
                                    await waSocket.sendMessage(jid, { text: msg });
                                }
                                
                                if (status === 'Sukses' || status === 'Gagal') {`;

const fixed = `                            try {
                                await waSocket.presenceSubscribe(jid);
                                await waSocket.sendPresenceUpdate("composing", jid);
                                await new Promise(r => setTimeout(r, 1200));
                                await waSocket.sendPresenceUpdate("paused", jid);
                                
                                if (status === 'Sukses') {
                                    const buffer = await generateCanvasReceipt("nota", tx);
                                    if (buffer) {
                                        await waSocket.sendMessage(jid, { image: buffer, caption: "✅ *Transaksi Berhasil!* Berikut nota pembelian kamu ya, kak. Terima kasih sudah belanja di E4 Store! 🥰" });
                                    } else {
                                        await waSocket.sendMessage(jid, { text: msg });
                                    }
                                } else {
                                    await waSocket.sendMessage(jid, { text: msg });
                                }
                                
                                if (status === 'Sukses' || status === 'Gagal') {`;

code = code.replace(broken, fixed);
fs.writeFileSync('server.ts', code);
