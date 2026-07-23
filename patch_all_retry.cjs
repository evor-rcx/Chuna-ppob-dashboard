const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Fix TG retry logic in polling (lines 600-630)
const tgRetryRegex = /\/\/ Retry sending TG receipts[\s\S]*?\/\/ Retry sending WA receipts/;
const newTgRetry = `// Retry sending TG receipts for successful/failed transactions that failed to send TG msg
          if (bot) {
              const unsentTgTxs = transactions.filter((t: any) => (t.status === 'Sukses' || t.status === 'Gagal') && t.tgReceiptSent === false && t.tgChatId);
              for (const tx of unsentTgTxs) {
                  try {
                      await bot.telegram.sendChatAction(tx.tgChatId, "typing");
                      await new Promise(r => setTimeout(r, 1500));
                      let msg = "";
                      let buffer = null;
                      if (tx.status === 'Sukses') {
                          msg = \`🎉 Horee! Sukses, Kak!\\nPesanan sudah diproses otomatis oleh E4 Store. \${tx.product} sudah masuk ke akun \${tx.target} dan siap digunakan! 💪🔥\\n\\nTerima kasih telah berbelanja di E4 Store! 🐾\\nChuna ~ Asisten Imutmu siap bantu 24 jam!\\n\\nKalau mau tanya-tanya atau order lagi, langsung chat Chuna di Bot Telegram:\\n👉 https://t.me/ChunaChanbot\\n\\nChuna tunggu chat dari Kakak! 😊💖\`;
                          buffer = await generateCanvasReceipt("nota", tx);
                      } else {
                          let refundMsg = tx.method === 'saldo' ? '✅ Saldo sebesar Rp ' + (tx.price||0).toLocaleString('id-ID') + ' telah dikembalikan ke akunmu!' : (tx.method === 'utang' ? '✅ Utang sebesar Rp ' + (tx.price||0).toLocaleString('id-ID') + ' telah dibatalkan!' : '✅ Mohon kembalikan uang tunai sebesar Rp ' + (tx.price||0).toLocaleString('id-ID') + ' kepada pelanggan.');
                          msg = \`❌ *Transaksi Gagal!*\\n\\nMaaf Kak, pembayaran untuk pesanan Anda (\${tx.product}) gagal diproses.\\n\\n\${refundMsg}\\n\\nTenang saja, Kakak bisa mencoba ulang kapan pun.\`;
                      }
                      
                      if (buffer) {
                          try { await bot.telegram.deleteMessage(tx.tgChatId, tx.tgMsgId); } catch(e) {}
                          await bot.telegram.sendPhoto(tx.tgChatId, { source: buffer }, { caption: msg, parse_mode: "Markdown" });
                      } else {
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
                      }
                  } catch (e) {
                      console.error("Failed to retry TG receipt for", tx.id, e);
                  }
              }
          }

          // Retry sending WA receipts`;
code = code.replace(tgRetryRegex, newTgRetry);

fs.writeFileSync('server.ts', code);
console.log("Patched TG retry!");
