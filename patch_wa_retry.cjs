const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const waRetryRegex = /\/\/ Retry sending WA receipts[\s\S]*?\/\/ Check if auto-reset/;
const newWaRetry = `// Retry sending WA receipts for successful/failed transactions that failed to send WA msg
          if (waSocket) {
              const unsentTxs = transactions.filter((t: any) => (t.status === 'Sukses' || t.status === 'Gagal') && t.waReceiptSent !== true);
              for (const tx of unsentTxs) {
                  const member = members.find((m: any) => m.id === tx.memberId);
                  let jid = tx.waJid;
                  if (!jid && member && member.whatsapp) {
                      let cleanWa = member.whatsapp.replace(/\\D/g, "");
                      if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
                      jid = cleanWa + "@s.whatsapp.net";
                  }
                  if (jid) {
                      try {
                          let buffer = null;
                          let caption = "";
                          if (tx.status === 'Sukses') {
                              buffer = await generateCanvasReceipt("nota", tx);
                              caption = "✅ *Transaksi Berhasil!* Berikut nota pembelian kamu ya, kak. Terima kasih sudah belanja di E4 Store! 🥰";
                          } else {
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
                          console.log("Retry WA delivery error:", e);
                      }
                  } else {
                      const tIndex = db.transactions.findIndex((t: any) => t.id === tx.id);
                      if (tIndex >= 0) {
                          db.transactions[tIndex].waReceiptSent = true;
                          writeDB(db);
                      }
                  }
              }
          }

          // Check if auto-reset`;
code = code.replace(waRetryRegex, newWaRetry);
fs.writeFileSync('server.ts', code);
console.log("Patched WA retry!");
