import re

with open('server.ts', 'r') as f:
    content = f.read()

old_logic = """                  }
              } catch (err) {
                  console.error("Error polling tx " + tx.id, err);
              }
          }
      } catch (e) {
          console.error("Polling error:", e);
      }
  }, 30000); // 30 seconds"""

new_logic = """                  }
              } catch (err) {
                  console.error("Error polling tx " + tx.id, err);
              }
          }
          
          // Retry sending WA receipts for successful transactions that failed to send WA msg
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
          }
          
      } catch (e) {
          console.error("Polling error:", e);
      }
  }, 30000); // 30 seconds"""

content = content.replace(old_logic, new_logic)

with open('server.ts', 'w') as f:
    f.write(content)
