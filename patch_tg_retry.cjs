const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Add tgReceiptSent = false in webhook when moving from Pending
const target1 = `                // Initialize waReceiptSent to false when first moving from Pending
                tx.waReceiptSent = false;`;
const insert1 = `                // Initialize waReceiptSent to false when first moving from Pending
                tx.waReceiptSent = false;
                tx.tgReceiptSent = false;`;

code = code.replace(target1, insert1);

// 2. Set tgReceiptSent = true when Telegram message succeeds
const target2 = `                                try { await bot.telegram.deleteMessage(tx.tgChatId, tx.tgMsgId); } catch(e) {}
                                await bot.telegram.sendPhoto(tx.tgChatId, { source: buffer }, { caption: msg, parse_mode: "Markdown" });
                                tgPhotoSent = true;
                            }
                        }
                        if (!tgPhotoSent) {
                            try {
                                await bot.telegram.editMessageText(tx.tgChatId, tx.tgMsgId, undefined, msg, { parse_mode: "Markdown" });
                            } catch (e) {
                                try { await bot.telegram.sendMessage(tx.tgChatId, msg, { parse_mode: "Markdown" }); } catch(err) {}
                            }
                        }`;
const insert2 = `                                try { await bot.telegram.deleteMessage(tx.tgChatId, tx.tgMsgId); } catch(e) {}
                                await bot.telegram.sendPhoto(tx.tgChatId, { source: buffer }, { caption: msg, parse_mode: "Markdown" });
                                tgPhotoSent = true;
                            }
                        }
                        if (!tgPhotoSent) {
                            try {
                                await bot.telegram.editMessageText(tx.tgChatId, tx.tgMsgId, undefined, msg, { parse_mode: "Markdown" });
                            } catch (e) {
                                try { await bot.telegram.sendMessage(tx.tgChatId, msg, { parse_mode: "Markdown" }); } catch(err) {}
                            }
                        }
                        
                        const tIndex = db.transactions.findIndex((t: any) => t.id === tx.id);
                        if (tIndex >= 0) {
                            db.transactions[tIndex].tgReceiptSent = true;
                            writeDB(db);
                        }`;
code = code.replace(target2, insert2);

// 3. Add Telegram retry to the polling loop
const target3 = `          // Retry sending WA receipts for successful transactions that failed to send WA msg
          if (waSocket) {`;
const insert3 = `          // Retry sending TG receipts for successful transactions that failed to send TG msg
          if (bot) {
              const unsentTgTxs = transactions.filter((t: any) => t.status === 'Sukses' && t.tgReceiptSent === false && t.tgChatId);
              for (const tx of unsentTgTxs) {
                  try {
                      const msg = \`🎉 Horee! Sukses, Kak!\nPesanan sudah diproses otomatis oleh E4 Store. \${tx.product} sudah masuk ke akun \${tx.target} dan siap digunakan! 💪🔥\n\nTerima kasih telah berbelanja di E4 Store! 🐾\nChuna ~ Asisten Imutmu siap bantu 24 jam!\n\nKalau mau tanya-tanya atau order lagi, langsung chat Chuna di Bot Telegram:\n👉 https://t.me/ChunaChanbot\n\nChuna tunggu chat dari Kakak! 😊💖\`;
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
          }

          // Retry sending WA receipts for successful transactions that failed to send WA msg
          if (waSocket) {`;
code = code.replace(target3, insert3);

fs.writeFileSync('server.ts', code);
console.log("Patched Telegram retry");
