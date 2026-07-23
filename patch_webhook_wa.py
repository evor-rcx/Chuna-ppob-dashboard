import re

with open('server.ts', 'r') as f:
    content = f.read()

old_logic = """                                        await waSocket.sendMessage(jid, { image: buffer, caption: "✅ *Transaksi Berhasil!* Berikut nota pembelian kamu ya, kak. Terima kasih sudah belanja di E4 Store! 🥰" });
                                    } else if (!edited) {
                                        await waSocket.sendMessage(jid, { text: msg });
                                    }
                                } else if (!edited) {
                                    await waSocket.sendMessage(jid, { text: msg });
                                }
                            } catch (e) {
                                console.log("WA delivery error:", e.message);
                            }
                        }
                    })();
                }"""

new_logic = """                                        await waSocket.sendMessage(jid, { image: buffer, caption: "✅ *Transaksi Berhasil!* Berikut nota pembelian kamu ya, kak. Terima kasih sudah belanja di E4 Store! 🥰" });
                                    } else if (!edited) {
                                        await waSocket.sendMessage(jid, { text: msg });
                                    }
                                } else if (!edited) {
                                    await waSocket.sendMessage(jid, { text: msg });
                                }
                                
                                if (status === 'Sukses' || status === 'Gagal') {
                                    const tIndex = db.transactions.findIndex((t: any) => t.id === tx.id);
                                    if (tIndex >= 0) {
                                        db.transactions[tIndex].waReceiptSent = true;
                                        writeDB(db);
                                    }
                                }
                            } catch (e: any) {
                                console.log("WA delivery error:", e.message);
                            }
                        }
                    })();
                }"""

content = content.replace(old_logic, new_logic)

with open('server.ts', 'w') as f:
    f.write(content)
