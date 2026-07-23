const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetTg = `          // Retry sending TG receipts for successful transactions that failed to send TG msg
          if (bot) {
              const unsentTgTxs = transactions.filter((t: any) => t.status === 'Sukses' && t.tgReceiptSent === false && t.tgChatId);
              for (const tx of unsentTgTxs) {
                  try {
                      const msg = \`🎉 Horee! Sukses, Kak!\\nPesanan sudah diproses otomatis oleh E4 Store. \${tx.product} sudah masuk ke akun \${tx.target} dan siap digunakan! 💪🔥\\n\\nTerima kasih telah berbelanja di E4 Store! 🐾\\nChuna ~ Asisten Imutmu siap bantu 24 jam!\\n\\nKalau mau tanya-tanya atau order lagi, langsung chat Chuna di Bot Telegram:\\n👉 https://t.me/ChunaChanbot\\n\\nChuna tunggu chat dari Kakak! 😊💖\`;
                      const buffer = await generateCanvasReceipt("nota", tx);
                      if (buffer) {
                          try { await bot.telegram.deleteMessage(tx.tgChatId, tx.tgMsgId); } catch(e) {}
                          await bot.telegram.sendPhoto(tx.tgChatId, { source: buffer }, { caption: msg, parse_mode: "Markdown" });
                      } else {
                          try { await bot.telegram.editMessageText(tx.tgChatId, tx.tgMsgId, undefined, msg, { parse_mode: "Markdown" }); } catch (e) {
                              try { await bot.telegram.sendMessage(tx.tgChatId, msg, { parse_mode: "Markdown" }); } catch(err) {}
                          }
                      }
                      const tIndex = db.transactions.findIndex((t: any) => t.id === tx.id);
                      if (tIndex >= 0) {
                          db.transactions[tIndex].tgReceiptSent = true;
                          writeDB(db);
                      }
                  } catch (e) {
                      console.error("Failed to retry TG receipt for", tx.id, e);
                  }
              }
          }`;

const replacementTg = `          // Retry sending TG receipts for successful/failed transactions that failed to send TG msg
          if (bot) {
              const unsentTgTxs = transactions.filter((t: any) => (t.status === 'Sukses' || t.status === 'Gagal') && t.tgReceiptSent !== true && t.tgChatId);
              for (const tx of unsentTgTxs) {
                  try {
                      let msg = "";
                      let buffer = null;
                      if (tx.status === 'Sukses') {
                          msg = \`🎉 Horee! Sukses, Kak!\\nPesanan sudah diproses otomatis oleh E4 Store. \${tx.product} sudah masuk ke akun \${tx.target} dan siap digunakan! 💪🔥\\n\\nTerima kasih telah berbelanja di E4 Store! 🐾\\nChuna ~ Asisten Imutmu siap bantu 24 jam!\\n\\nKalau mau tanya-tanya atau order lagi, langsung chat Chuna di Bot Telegram:\\n👉 https://t.me/ChunaChanbot\\n\\nChuna tunggu chat dari Kakak! 😊💖\`;
                          buffer = await generateCanvasReceipt("nota", tx);
                      } else {
                          let refundMsg = tx.method === 'saldo' ? '✅ Saldo sebesar Rp ' + tx.price.toLocaleString('id-ID') + ' telah dikembalikan ke akunmu!' : (tx.method === 'utang' ? '✅ Utang sebesar Rp ' + tx.price.toLocaleString('id-ID') + ' telah dibatalkan!' : '✅ Mohon kembalikan uang tunai sebesar Rp ' + tx.price.toLocaleString('id-ID') + ' kepada pelanggan.');
                          msg = \`❌ Maaf Kak, pembayaran untuk pesanan Anda gagal diproses.\\n\\nKemungkinan ada kesalahan data atau saldo kurang. Silakan cek kembali, atau hubungi Chuna untuk bantuan.\\n\\nKeterangan : Transaksi Gagal\\n📦 Produk  : \${tx.product}\\n🎯 Tujuan   : \${tx.target}\\n\\n\${refundMsg}\\n\\nTenang saja, Kakak bisa mencoba ulang kapan pun.\\n\\nButuh bantuan? Chat Chuna di Bot Telegram:\\n👉 https://t.me/ChunaChanbot\\n\\nChuna siap bantu! 😊💪\`;
                      }
                      
                      if (buffer) {
                          try { await bot.telegram.deleteMessage(tx.tgChatId, tx.tgMsgId); } catch(e) {}
                          await bot.telegram.sendPhoto(tx.tgChatId, { source: buffer }, { caption: msg, parse_mode: "Markdown" });
                      } else {
                          try { await bot.telegram.editMessageText(tx.tgChatId, tx.tgMsgId, undefined, msg, { parse_mode: "Markdown" }); } catch (e) {
                              try { await bot.telegram.sendMessage(tx.tgChatId, msg, { parse_mode: "Markdown" }); } catch(err) {}
                          }
                      }
                      const tIndex = db.transactions.findIndex((t: any) => t.id === tx.id);
                      if (tIndex >= 0) {
                          db.transactions[tIndex].tgReceiptSent = true;
                          writeDB(db);
                      }
                  } catch (e) {
                      console.error("Failed to retry TG receipt for", tx.id, e);
                  }
              }
          }`;

code = code.replace(targetTg, replacementTg);

const targetWa = `          // Retry sending WA receipts for successful transactions that failed to send WA msg
          if (waSocket) {
              const unsentTxs = transactions.filter((t: any) => t.status === 'Sukses' && t.waReceiptSent === false);
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
                          const buffer = await generateCanvasReceipt("nota", tx);
                          if (buffer) {
                              await waSocket.sendPresenceUpdate("composing", jid);
                              await new Promise(r => setTimeout(r, 1200));
                              await waSocket.sendPresenceUpdate("paused", jid);
                              await waSocket.sendMessage(jid, { image: buffer, caption: "✅ *Transaksi Berhasil!* Berikut nota pembelian kamu ya, kak. Terima kasih sudah belanja di E4 Store! 🥰" });
                              
                              const tIndex = db.transactions.findIndex((t: any) => t.id === tx.id);
                              if (tIndex >= 0) {
                                  db.transactions[tIndex].waReceiptSent = true;
                                  writeDB(db);
                              }
                          }
                      } catch (e) {
                          console.log("Retry WA delivery error:", e);
                      }
                  } else {
                      // No JID means we can never send to WA, so mark as sent to avoid infinite loop
                      const tIndex = db.transactions.findIndex((t: any) => t.id === tx.id);
                      if (tIndex >= 0) {
                          db.transactions[tIndex].waReceiptSent = true;
                          writeDB(db);
                      }
                  }
              }
          }`;

const replacementWa = `          // Retry sending WA receipts for successful/failed transactions that failed to send WA msg
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
                              let refundMsg = tx.method === 'saldo' ? '✅ Saldo sebesar Rp ' + tx.price.toLocaleString('id-ID') + ' telah dikembalikan ke akunmu!' : (tx.method === 'utang' ? '✅ Utang sebesar Rp ' + tx.price.toLocaleString('id-ID') + ' telah dibatalkan!' : '✅ Mohon kembalikan uang tunai sebesar Rp ' + tx.price.toLocaleString('id-ID') + ' kepada pelanggan.');
                              caption = \`❌ *Transaksi Gagal!*\\n\\nMaaf Kak, pembayaran untuk pesanan Anda (\${tx.product}) gagal diproses.\\n\\n\${refundMsg}\\n\\nTenang saja, Kakak bisa mencoba ulang kapan pun.\`;
                          }
                          
                          await waSocket.sendPresenceUpdate("composing", jid);
                          await new Promise(r => setTimeout(r, 1200));
                          await waSocket.sendPresenceUpdate("paused", jid);
                          if (buffer) {
                              await waSocket.sendMessage(jid, { image: buffer, caption: caption });
                          } else {
                              await waSocket.sendMessage(jid, { text: caption });
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
                      // No JID means we can never send to WA, so mark as sent to avoid infinite loop
                      const tIndex = db.transactions.findIndex((t: any) => t.id === tx.id);
                      if (tIndex >= 0) {
                          db.transactions[tIndex].waReceiptSent = true;
                          writeDB(db);
                      }
                  }
              }
          }`;

code = code.replace(targetWa, replacementWa);

fs.writeFileSync('server.ts', code);
console.log("Patched retry logic!");
