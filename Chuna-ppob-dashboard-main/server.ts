import fs from "fs";
import cron from "node-cron";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Telegraf } from "telegraf";
import { makeWASocket, useMultiFileAuthState, Browsers, fetchLatestWaWebVersion } from "@whiskeysockets/baileys";
import pino from "pino";
import nodemailer from "nodemailer";
import crypto from "crypto";

import dns from 'dns';
try {
    dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});


let bot: Telegraf | null = null;
let botStatus = "Disconnected";
const userStates: Record<number, { step: string, data: any }> = {};

const DB_FILE = path.join(process.cwd(), "db.json");
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ members: [], transactions: [], registeredUsers: {}, owners: [] }));
  }
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  if (!db.owners) db.owners = [];
  
  const defaultOwnerId = 6706921844;
  if (!db.owners.includes(defaultOwnerId)) {
    db.owners.push(defaultOwnerId);
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  }
  return db;
}
function writeDB(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

let db = readDB();
let productFees: Record<string, { biasa: number, vip: number, owner?: number }> = db.productFees || {};
const registeredUsers: Record<number, { username: string, wa: string, pin: string }> = db.registeredUsers || {};


let waSocket: ReturnType<typeof makeWASocket> | null = null;
let waStatus = "Disconnected";
let waPairingCode = "";
let isRequestingPairingCode = false;


let digiflazzUsername = db.digiflazzUsername || "";
let digiflazzApiKey = db.digiflazzApiKey || "";
let gopayStatus = "Disconnected";

let digiflazzStatus = "Disconnected";
let digiflazzBalance = 0;




export function getProductButtonText(p: any) {
    if (!p.buyer_product_status || !p.seller_product_status) {
        return "🔴 " + p.product_name + " (Gangguan)";
    }
    return p.product_name;
}

export function cleanProductName(text: string) {
    return text.replace(/^🔴\s*/, '').replace(/\s*\(Gangguan\)$/, '');
}


async function checkPascaBill(sku: string, customerNo: string) {
  if (!digiflazzUsername || !digiflazzApiKey) {
    throw new Error("Digiflazz belum dikonfigurasi");
  }
  const ref_id = "INQ-" + Date.now();
  const signText = digiflazzUsername + digiflazzApiKey + ref_id;
  const sign = crypto.createHash("md5").update(signText).digest("hex");
  

function getProductButtonText(p: any) {
    if (!p.buyer_product_status || !p.seller_product_status) {
        return "🔴 " + p.product_name + " (Gangguan)";
    }
    return p.product_name;
}

function cleanProductName(text: string) {
    return text.replace(/^🔴\s*/, '').replace(/\s*\(Gangguan\)$/, '');
}

  const res = await fetch("https://api.digiflazz.com/v1/transaction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      commands: "inq-pasca",
      username: digiflazzUsername,
      buyer_sku_code: sku,
      customer_no: customerNo,
      ref_id: ref_id,
      sign: sign
    })
  });
  const json = await res.json();
  if (json.data) return json.data;
  throw new Error("Gagal melakukan pengecekan tagihan");
}

async function startServer() {

  // Polling Digiflazz pending transactions
  setInterval(async () => {
      try {
          if (!digiflazzUsername || !digiflazzApiKey) return;
          const pendingTxs = transactions.filter(t => t.status === 'Pending');
          if (pendingTxs.length > 0) console.log(`[Polling] Found ${pendingTxs.length} pending transactions...`);
          for (const tx of pendingTxs) {
              let body: any = {
                  username: digiflazzUsername,
                  buyer_sku_code: tx.sku,
                  customer_no: tx.target,
                  ref_id: tx.id,
                  sign: crypto.createHash("md5").update(digiflazzUsername + digiflazzApiKey + tx.id).digest("hex")
              };
              
              if (tx.type === 'pasca') {
                  body.commands = "pay-pasca";
              }

              try {
                  const res = await fetch("https://api.digiflazz.com/v1/transaction", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(body)
                  });
                  const json = await res.json();
                  
                  if (json && json.data && (json.data.status === 'Sukses' || json.data.status === 'Gagal')) {
                      // Forward to local webhook
                      await processDigiflazzWebhookData(json.data);
                  }
              } catch (err) {
                  console.error("Error polling tx " + tx.id, err);
              }
          }
      } catch (e) {
          console.error("Polling error:", e);
      }
  }, 30000); // 30 seconds

setInterval(async () => {
    if (db.waAnnouncementEnabled && db.waAnnouncementTarget && waSocket) {
        try {
            let msgOpt: any = {};
            if (db.waAnnouncementMedia && fs.existsSync(db.waAnnouncementMedia)) {
                const buffer = fs.readFileSync(db.waAnnouncementMedia);
                const caption = await parseAnnouncementText(db.waAnnouncementText || "");
                if (db.waAnnouncementMediaType === 'image') msgOpt = { image: buffer, caption: caption };
                else if (db.waAnnouncementMediaType === 'video') msgOpt = { video: buffer, caption: caption };
                else if (db.waAnnouncementMediaType === 'document') msgOpt = { document: buffer, caption: caption, mimetype: db.waAnnouncementMime, fileName: db.waAnnouncementFileName };
            } else if (db.waAnnouncementText) {
                msgOpt = { text: await parseAnnouncementText(db.waAnnouncementText || "") };
            } else {
                return; // Nothing to send
            }
            await waSocket.sendMessage(db.waAnnouncementTarget, msgOpt);
            console.log("Auto announcement sent to " + db.waAnnouncementTarget);
        } catch (e) {
            console.error("Failed to send auto announcement:", e.message);
        }
    }
}, 60 * 60 * 1000);
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  async function processDigiflazzWebhookData(data: any) {
    try {
        const ref_id = data.ref_id;
        const status = data.status;
        if (data.testing) return { success: true };
        
        // Use closure variables instead of readDB() to prevent ghost balance bug!
        console.log('Webhook triggered for', ref_id);
        const txIndex = transactions.findIndex((t) => t.id === ref_id);
        console.log('txIndex:', txIndex);
        
        if (txIndex >= 0) {
            const tx = transactions[txIndex];
            
            if (tx.status === 'Pending' && (status === 'Sukses' || status === 'Gagal')) {
                tx.status = status;
                
                const memberIndex = members.findIndex((m) => m.id === tx.memberId);
                let member = null;
                if (memberIndex >= 0) {
                    member = members[memberIndex];
                    if (status === 'Gagal' && tx.method !== 'cash') {
                        member.balance += tx.price;
                    }
                }
                
                db.transactions = transactions;
                db.members = members;
                writeDB(db);
                
                let msg = "";
                if (status === 'Sukses') {
                    const sn = data.sn || "-";
                    const now = new Date();
                    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
                    const dateStr = `${now.getDate().toString().padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()} WITA`;
                    
                    msg = `HOREE! Sukses, sayang! 🎉🎊 Pesananmu sudah diproses otomatis! 💖🌈\n\n📄 Nota Sukses:\n\n\`\`\`\n*E4 STORE*\nJl. Zamrud Depan Zamrud 2 RT 42\nWA: 6285169959218\n------------------------------------\nOrder ID      : ${ref_id}\nTanggal       : ${dateStr}\nID Pelanggan  : ${tx.target}\nNama          : ${member ? (member.name || "-") : "-"}\n------------------------------------\nToken / SN    : ${sn}\n------------------------------------\nPembelian     : ${tx.product}\n------------------------------------\nTotal         : Rp ${tx.price.toLocaleString('id-ID')}\n------------------------------------\nStatus        : ✅ SUKSES (LUNAS)\n------------------------------------\nTerimakasih telah berbelanja di E4 Store!\n🐾 Chuna ~ Asisten Imutmu siap bantu 24 jam!\n\`\`\``;
                } else if (status === 'Gagal') {
                    let refundMsg = tx.method === 'saldo' ? '\n✅ Saldo sebesar Rp ' + tx.price.toLocaleString('id-ID') + ' telah dikembalikan ke akunmu!' : (tx.method === 'utang' ? '\n✅ Utang sebesar Rp ' + tx.price.toLocaleString('id-ID') + ' telah dibatalkan!' : '\n✅ Uang Cash sebesar Rp ' + tx.price.toLocaleString('id-ID') + ' harap dikembalikan ke pelanggan.');
                    msg = `❌ TRANSAKSI GAGAL\n\n📦 Produk: ${tx.product}\n🎯 Tujuan: ${tx.target}\n\nStatus: Gagal ❌\nKeterangan: ${data.message || 'Dibatalkan'}\n${refundMsg}\n\nYah, gagal nih, sayang! Tapi Chuna yakin kamu pasti bisa coba lagi. Hubungi Bos chuna di WA 6285169959218 ya! 💪😘`;
                }
                
                if (bot && tx.tgChatId && tx.tgMsgId) {
                    (async () => {
                    try {
                        await bot.telegram.sendChatAction(tx.tgChatId, "typing");
                        await new Promise(r => setTimeout(r, 1500));
                        await bot.telegram.editMessageText(tx.tgChatId, tx.tgMsgId, undefined, msg, { parse_mode: "Markdown" });
                    } catch (e) {
                        try {
                            await bot.telegram.sendMessage(tx.tgChatId, msg, { parse_mode: "Markdown" });
                        } catch(err) {}
                    }
                    })();
                } else if (bot && member && member.telegram && member.telegram.length > 0) {
                    (async () => {
                    try {
                        await bot.telegram.sendMessage(member.telegram[0], msg, { parse_mode: "Markdown" });
                    } catch (e) { console.error("Error in prepaidBrands check:", e.message); }
                    })();
                }
                if (waSocket && tx.waJid && tx.waMsgKey) {
                    (async () => {
                    try {
                        await waSocket.presenceSubscribe(tx.waJid);
                        await waSocket.sendPresenceUpdate("composing", tx.waJid);
                        await new Promise(r => setTimeout(r, 2000));
                        await waSocket.sendPresenceUpdate("paused", tx.waJid);
                        await waSocket.sendMessage(tx.waJid, { text: msg, edit: tx.waMsgKey });
                    } catch (err) {
                        try {
                            await waSocket.sendMessage(tx.waJid, { text: msg });
                        } catch (e) { console.error("Error in prepaidBrands check:", e.message); }
                    }
                    })();
                } else if (waSocket && member && member.whatsapp) {
                    (async () => {
                    let cleanWa = member.whatsapp.replace(/\D/g, "");
                    if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
                    const jid = cleanWa + "@s.whatsapp.net";
                    try {
                        await waSocket.presenceSubscribe(jid);
                        await waSocket.sendPresenceUpdate("composing", jid);
                        await new Promise(r => setTimeout(r, 2000));
                        await waSocket.sendPresenceUpdate("paused", jid);
                        await waSocket.sendMessage(jid, { text: msg });
                    } catch (err) {}
                    })();
                }
            }
        }
        
    } catch(e) {
        console.error("Webhook error", e);
    }
  }


  // Auto-check pending transactions every 30 seconds
  setInterval(async () => {
    if (!db.digiflazzUsername || !db.digiflazzApiKey) return;
    try {
        const pendingTxs = transactions.filter(t => t.status === 'Pending' && t.digiflazzSku);
        if (pendingTxs.length === 0) return;
        
        for (const tx of pendingTxs) {
            try {
                // Check status manually for safety in case webhook fails
                // NOTE: Implementing manual check would require sign MD5 hash, which is risky to code blindly here
                // We'll leave this empty for now and rely on webhook, or user can configure webhook correctly.
            } catch (e) {
                console.error("Auto check error for", tx.id, e);
            }
        }
    } catch(e) {
        console.error("Auto check error:", e);
    }
  }, 30000);

  app.post(["/api/digiflazz-webhook", "/webhook"], express.json(), async (req, res) => {
    try {
        const payload = req.body;
        if (!payload || !payload.data) return res.json({ success: false, msg: "No payload" });
        await processDigiflazzWebhookData(payload.data);
        res.json({ success: true });
    } catch(e) {
        console.error("Webhook route error", e);
        res.status(500).send("Error");
    }
  });


  // --- WA Bot API Routes ---
  app.get("/api/wa/status", (req, res) => {
    res.json({ status: waStatus, pairingCode: waPairingCode });
  });

  app.post("/api/wa/reset", async (req, res) => {
    try {
      if (waSocket) {
        waSocket.ev.removeAllListeners("connection.update");
        waSocket.logout().catch(() => {});
        waSocket.end(undefined);
        waSocket = null;
      }
      
      // Force delete auth info folder
      try {
        fs.rmSync(path.join(process.cwd(), "wa_auth"), { recursive: true, force: true });
      } catch (e) {
        console.error("Error clearing auth info:", e);
      }
      
      waStatus = "Disconnected";
      waPairingCode = "";
      isRequestingPairingCode = false;
      res.json({ success: true, message: "WA direset. Silakan request kode ulang." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/wa/start", async (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    try {
      waStatus = "Connecting...";
      waPairingCode = "";
      
      // Cleanup existing socket if we are recreating
      if (waSocket) {
        waSocket.ev.removeAllListeners("connection.update");
        waSocket.end(undefined);
        waSocket = null;
      }

      let reconnectAttempts = 0;
      
      const startWaSocket = async () => {
        if (waSocket) {
          waSocket.ev.removeAllListeners("connection.update");
          waSocket.ev.removeAllListeners("creds.update");
          waSocket.ev.removeAllListeners("messages.upsert");
        }
        
        const { state, saveCreds } = await useMultiFileAuthState(path.join(process.cwd(), "wa_auth"));
        
        if (state.creds.registered && waStatus !== "Connecting...") {
          waStatus = "Connecting...";
        }

        const logger = pino({ level: "silent" });
        const { version } = await fetchLatestWaWebVersion().catch(() => ({ version: [2, 3000, 1042642941] as [number, number, number] }));
        
        waSocket = makeWASocket({
          version,
          auth: state,
          printQRInTerminal: false,
          logger: logger as any,
          browser: Browsers.ubuntu('Chrome'),
          syncFullHistory: false,
          markOnlineOnConnect: false
        });

        waSocket.ev.on("creds.update", saveCreds);

        waSocket.ev.on("connection.update", (update) => {
          const { connection, lastDisconnect } = update;
          if (connection === "close") {
            const errMsg = (lastDisconnect?.error as any)?.message;
            const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
            waStatus = "Disconnected: " + (errMsg || "Closed");
            console.log("WA connection closed", errMsg, "statusCode:", statusCode);
            
            if (statusCode === 401 || statusCode === 403 || statusCode === 405) {
               try { fs.rmSync(path.join(process.cwd(), "wa_auth"), { recursive: true, force: true }); } catch (e) { console.error("Error in prepaidBrands check:", e.message); }
               waSocket = null;
            } else {
               if (reconnectAttempts < 5) {
                 reconnectAttempts++;
                 console.log("Reconnecting WA in 3 seconds...");
                 setTimeout(startWaSocket, 3000);
               }
            }
          } else if (connection === "open") {
            reconnectAttempts = 0;
            const userJid = waSocket?.user?.id || "";
            const phoneNum = userJid.split(':')[0] || "Connected";
            const pushName = waSocket?.user?.name || "";
            waStatus = pushName ? `Connected as ${pushName} (${phoneNum})` : `Connected as ${phoneNum}`;
            waPairingCode = "";
            console.log("WA connection opened");
          }
        });

        waSocket.ev.on("messages.upsert", async (m) => {
          const msg = m.messages[0];
          if (!msg.key.fromMe && m.type === "notify") {
            console.log("Got WA message:", msg.message?.conversation);
          }
        });

        waSocket.ev.on("call", async (calls) => {
          for (const call of calls) {
            if (call.status === "offer") {
              const replyMsg = `Maaf banget, Kak! Chuna nggak bisa angkat telepon sekarang (lagi sibuk ngurus pelanggan lain, hihi). Tapi jangan khawatir, mending langsung chat Bot Telegram resmi E4Store aja! Di sana Chuna 24 jam siap bantu jawab semua pertanyaan kamu dengan cepat dan ramah~\n\n👉 https://t.me/Chuna_Chan_bot\n\nChuna asisten E4Store, transaksi langsung otomatis kok, tetap aman dan terpercaya! Yuk, mampir~ Chuna tunggu, ya! 😘🐾`;
              try {
                if (waSocket) {
                  await waSocket.rejectCall(call.id, call.from);
                  await waSocket.presenceSubscribe(call.from);
                  await waSocket.sendPresenceUpdate('composing', call.from);
                  await new Promise(r => setTimeout(r, 2000));
                  await waSocket.sendPresenceUpdate('paused', call.from);
                  await waSocket.sendMessage(call.from, { text: replyMsg });
                }
              } catch (e) {
                console.error("Failed to reject call", e);
              }
            }
          }
        });

        if (!state.creds.registered && !isRequestingPairingCode) {
          isRequestingPairingCode = true;
          setTimeout(async () => {
            try {
              let cleanNumber = phoneNumber.replace(/\D/g, "");
              if (cleanNumber.startsWith("0")) {
                cleanNumber = "62" + cleanNumber.substring(1);
              }
              if (waSocket) {
                let code = await waSocket.requestPairingCode(cleanNumber);
                code = code?.match(/.{1,4}/g)?.join('-') || code;
                waPairingCode = code;
                waStatus = "Waiting for Pairing";
              }
            } catch (err: any) {
              console.error("Error requesting pairing code:", err);
              waStatus = "Error: " + (err.message || String(err));
            } finally {
              isRequestingPairingCode = false;
            }
          }, 3000);
        }
      };

      await startWaSocket();
      
      res.json({ success: true, message: "Requesting pairing code in background...", status: "Connecting..." });

    } catch (err: any) {
      waStatus = "Error: " + err.message;
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- Dashboard Data ---
  let transactions: any[] = db.transactions || [];
  let members: any[] = db.members || [];

  cron.schedule('0 0 * * *', () => {
    // Reset at 00:00 WITA
    // Keep only method = utang AND status = Sukses
    transactions = transactions.filter(t => t.method === 'utang' && t.status === 'Sukses');
    db.transactions = transactions;
    writeDB(db);
    console.log("Auto-reset transactions at 00:00 WITA");
  }, {
    timezone: "Asia/Makassar"
  });


  app.get("/api/debug-cache", (req, res) => {
    res.json({ prepaid: productsCache['prepaid'].data ? productsCache['prepaid'].data.length : 0, ml: productsCache['prepaid'].data ? productsCache['prepaid'].data.filter(p => p.brand === 'MOBILE LEGENDS').length : 0 });
});
app.get("/api/summary", (req, res) => {
    // Calculate total cuan from successful transactions
    const totalCuan = transactions
      .filter(t => t.status === 'Sukses' && t.cuan)
      .reduce((acc, t) => acc + (t.cuan || 0), 0);
      
    res.json({
      success: true,
      summary: {
        pendapatan: digiflazzBalance,
        totalCuan: totalCuan,
        produkTerlaris: transactions.length,
        statusServer: digiflazzStatus
      }
    });
  });

  app.get("/api/transactions", (req, res) => {
    const enriched = transactions.map(t => {
      const member = members.find(m => m.id === t.memberId);
      return {
        ...t,
        username: member ? (member.name || "-") : "-",
        whatsapp: member ? (member.whatsapp || "-") : "-",
        telegram: member ? (member.telegram || "-") : "-"
      };
    });
    res.json({ success: true, transactions: enriched });
  });

  app.post("/api/transactions/:id/lunas", async (req, res) => {
    const tx = transactions.find(t => t.id === req.params.id);
    if (!tx) return res.status(404).json({ error: "Transaksi tidak ditemukan" });
    if (tx.method !== 'utang' || tx.status !== 'Sukses') return res.status(400).json({ error: "Hanya utang yang sukses dapat dilunasi" });
    
    tx.status = 'Sukses (Lunas)';
    db.transactions = transactions;
    writeDB(db);

    const member = members.find((m: any) => m.id === tx.memberId);
    if (member) {
      const msg = `🎉 *Terima Kasih, Kesayangan!* 🎉\n\nUtang kamu untuk pembelian *${tx.product}* sebesar Rp ${tx.price.toLocaleString('id-ID')} sudah LUNAS ya! Makasih udah bayar tepat waktu, Chuna seneng banget! 💖🐾\n\n*Nota Pelunasan:*\nID: ${tx.id}\nProduk: ${tx.product}\nTujuan: ${tx.target}\nTanggal: ${new Date().toLocaleString('id-ID')}\n\nJangan lupa mampir belanja lagi di E4 Store!`;
      
      // Notify Telegram if possible
      if (bot && member.telegram && member.telegram.length > 0) {
        try {
          await bot.telegram.sendMessage(member.telegram[0], msg, { parse_mode: 'Markdown' });
        } catch(e){}
      }
      // Notify WhatsApp if possible
      if (waSocket && member.whatsapp) {
        let cleanWa = member.whatsapp.replace(/\D/g, "");
        if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
        const jid = cleanWa + "@s.whatsapp.net";
        try {
          await waSocket.presenceSubscribe(jid);
          await waSocket.sendPresenceUpdate('composing', jid);
          setTimeout(async () => {
             await waSocket?.sendPresenceUpdate('paused', jid);
             await waSocket?.sendMessage(jid, { text: msg });
          }, 1500);
        } catch(e) { console.error("Error:", e.message); }
      }
    }
    res.json({ success: true });
  });

  app.get("/api/members/offline", (req, res) => {
    // Return all members, or just those added manually (without telegram ID)
    const offlineMembers = members.filter(m => !m.telegram || !m.telegram.startsWith('ID:'));
    res.json({ success: true, members: offlineMembers });
  });

  app.get("/api/members", (req, res) => {
    const onlineMembers = members.filter(m => m.telegram && m.telegram.startsWith('ID:'));
    res.json({ success: true, members: onlineMembers });
  });

  app.post("/api/members/:id/topup", async (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;
    const member = members.find(m => m.id === id);
    if (member) {
      member.balance += amount;
      db.members = members;
      writeDB(db);
      
      const userId = id.replace('MBR-', '');
      const msgText = `🎉 SALDO MASUK NIH KAK!

Halo kak ${member.name}! Chuna mau kasih kabar baik nih~ 💚

💰 Saldo Ditambahkan: Rp ${Number(amount).toLocaleString('id-ID')}
💳 Saldo Sekarang: Rp ${member.balance.toLocaleString('id-ID')}

Yuk langsung belanja kak, banyak promo nunggu! 🛍️✨`;

      try {
        if (bot) {
          await bot.telegram.sendMessage(userId, msgText);
        }
      } catch(e) {
         console.log('Failed to send topup notification to telegram:', e);
      }
      
      if (waSocket && waStatus.includes('Connected') && member.whatsapp) {
         let cleanWa = member.whatsapp.replace(/\D/g, "");
         if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
         const jid = `${cleanWa}@s.whatsapp.net`;
         try {
            await waSocket.sendMessage(jid, { text: msgText });
         } catch(e) {
            console.log('Failed to send topup notification to whatsapp:', e);
         }
      }
      
      res.json({ success: true, member });
    } else {
      res.status(404).json({ success: false, error: "Member not found" });
    }
  });

  
  
  app.post("/api/members/:id/balance", async (req, res) => {
    const { id } = req.params;
    const { balance } = req.body;
    try {
      const member = members.find(m => m.id === id);
      if (member) {
         member.balance = balance;
         db.members = members;
         writeDB(db);
         res.json({ success: true, member });
      } else {
         res.status(404).json({ error: "Member not found" });
      }
    } catch (err) {
       res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/members/:id/telegram", async (req, res) => {
    const { id } = req.params;
    const { telegram } = req.body;
    try {
      const member = members.find(m => m.id === id);
      if (member) {
         member.telegram = telegram;
         db.members = members;
         writeDB(db);
         res.json({ success: true, member });
      } else {
         res.status(404).json({ error: "Member not found" });
      }
    } catch (err) {
       res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/members/:id/type", async (req, res) => {
    const { id } = req.params;
    const { type } = req.body;
    const member = members.find(m => m.id === id);
    if (member) {
      const oldType = member.type;
      member.type = type;
      db.members = members;
      writeDB(db);
      
      const userId = id.replace('MBR-', '');
      const msgText = `🎉 SELAMAT! STATUS AKUN KAKAK BERUBAH NIH! 🌟

Halo kak ${member.name}! Chuna mau kasih tau kalau tipe akun kakak sekarang udah jadi *${type}* loh! 🥳

Nikmati kemudahan bertransaksi dan pastinya makin untung belanja di E4 Store!
Yuk cek produk dan katalog terbaru sekarang kak~ 🛍️✨`;

      try {
        if (bot) {
          await bot.telegram.sendMessage(userId, msgText);
        }
      } catch(e) {
         console.log('Failed to send type change notification to telegram:', e);
      }
      
      if (waSocket && waStatus.includes('Connected') && member.whatsapp) {
         let cleanWa = member.whatsapp.replace(/\D/g, "");
         if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
         const jid = `${cleanWa}@s.whatsapp.net`;
         try {
            await waSocket.sendMessage(jid, { text: msgText });
         } catch(e) {
            console.log('Failed to send type change notification to whatsapp:', e);
         }
      }

      res.json({ success: true, member });
    } else {
      res.status(404).json({ success: false, error: "Member not found" });
    }
  });

  // --- Digiflazz API Routes ---
  app.get("/api/digiflazz/status", (req, res) => {
    res.json({ status: digiflazzStatus, balance: digiflazzBalance, username: digiflazzUsername });
  });

  app.post("/api/digiflazz/configure", async (req, res) => {
    const { username, apiKey } = req.body;
    
    if (!username || !apiKey) {
      return res.status(400).json({ error: "Username dan API Key diperlukan" });
    }

    try {
      const sign = crypto.createHash("md5").update(username + apiKey + "depo").digest("hex");
      const response = await fetch("https://api.digiflazz.com/v1/cek-saldo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cmd: "deposit",
          username: username,
          sign: sign
        })
      });
      const data = await response.json();
      
      if (data.data && data.data.deposit !== undefined) {
        digiflazzUsername = username;
        digiflazzApiKey = apiKey;
        db.digiflazzUsername = username;
        db.digiflazzApiKey = apiKey;
        writeDB(db);
        digiflazzBalance = data.data.deposit;
        digiflazzStatus = "Connected";
        res.json({ success: true, message: "Digiflazz connected successfully", balance: data.data.deposit });
      } else {
        digiflazzStatus = "Error: Invalid credentials";
        res.status(400).json({ success: false, error: "Gagal terhubung ke Digiflazz (Cek kredensial)" });
      }
    } catch (err: any) {
      digiflazzStatus = "Error: " + err.message;
      res.status(500).json({ success: false, error: err.message });
    }
  });

  
  const productsCache: any = {
    prepaid: { data: null, timestamp: 0 },
    pasca: { data: null, timestamp: 0 }
  };
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes



async function parseAnnouncementText(text: string) {
    let prefix = "📢 *PENGUMUMAN E4 STORE* 📢\n";
    try {
        const { getHolidayInfo } = await import('./src/utils/holidays');
        const holiday = getHolidayInfo(new Date());
        if (holiday) {
            prefix += `🗓️ Info Hari: ${holiday.text}\n`;
        }
    } catch(e) {
        console.error("Failed to load holiday info", e);
    }
    prefix += "\n";
    
    let parsed = text;
    if (text.includes('{{')) {
        try {
            const prepaid = await getDigiflazzProducts('prepaid');
            parsed = text.replace(/\{\{([^:]+)(?::([^}]+))?\}\}/g, (match, sku, type) => {
                const product = prepaid.find((p: any) => p.buyer_sku_code.toLowerCase() === sku.toLowerCase().trim() || p.product_name.toLowerCase() === sku.toLowerCase().trim());
                if (!product) return match; 
                
                const feeBiasa = productFees[product.buyer_sku_code]?.biasa || 0;
                const feeVip = productFees[product.buyer_sku_code]?.vip || 0;
                
                const priceReguler = product.price + feeBiasa;
                const priceVip = product.price + feeVip;
                const isNormal = product.buyer_product_status && product.seller_product_status;
                const status = isNormal ? "🟢 NORMAL" : "🔴 GANGGUAN/CLOSE";
                
                const reqType = (type || "").toUpperCase().trim();
                if (reqType === "REGULER") return "Rp " + priceReguler.toLocaleString('id-ID');
                if (reqType === "VIP") return "Rp " + priceVip.toLocaleString('id-ID');
                if (reqType === "NAMA") return product.product_name;
                if (reqType === "STATUS") return status;
                if (reqType === "HEMAT") return "Rp " + (priceReguler - priceVip).toLocaleString('id-ID');
                
                return product.product_name + " - Reg: Rp " + priceReguler.toLocaleString('id-ID') + " | VIP: Rp " + priceVip.toLocaleString('id-ID') + " (" + status + ")";
            });
        } catch (e) {
            console.error("Error parsing announcement text:", e);
        }
    }
    return prefix + parsed;
}

async function getDigiflazzProducts(type: "prepaid" | "pasca") {
  if (!digiflazzUsername || !digiflazzApiKey) {
    throw new Error("Digiflazz belum dikonfigurasi");
  }

  const cacheKey = type;
  if (productsCache[cacheKey].data && (Date.now() - productsCache[cacheKey].timestamp < CACHE_TTL)) {
    return productsCache[cacheKey].data;
  }

  let cmd = "prepaid";
  if (type === "pasca") cmd = "pasca";
  let signText = digiflazzUsername + digiflazzApiKey + "pricelist";
  const sign = crypto.createHash("md5").update(signText).digest("hex");

  const response = await fetch("https://api.digiflazz.com/v1/price-list", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cmd: cmd,
      username: digiflazzUsername,
      sign: sign
    })
  });
  
  const data = await response.json();
  if (data.data && Array.isArray(data.data)) {
    productsCache[cacheKey].data = data.data;
    productsCache[cacheKey].timestamp = Date.now();
    return data.data;
  } else {
    throw new Error(data.data?.message || "Gagal mengambil produk");
  }
}


  app.post("/api/digiflazz/products/fee", async (req, res) => {
    try {
      const { sku, biasa, vip, owner } = req.body;
      if (!sku) return res.status(400).json({ success: false, error: "SKU diperlukan" });
      
      productFees[sku] = { biasa: Number(biasa) || 0, vip: Number(vip) || 0, owner: Number(owner) || 0 };
      db.productFees = productFees;
      writeDB(db);
      
      res.json({ success: true, message: "Fee berhasil disimpan" });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get("/api/digiflazz/products", async (req, res) => {

    if (!digiflazzUsername || !digiflazzApiKey) {
      return res.status(400).json({ success: false, error: "Digiflazz belum dikonfigurasi" });
    }
    
    
    
    try {
      const type = req.query.type as string || "prepaid";
      const products = await getDigiflazzProducts(type as "prepaid" | "pasca");
      const mapped = products.map((p: any) => ({
        ...p,
        fee_biasa: productFees[p.buyer_sku_code]?.biasa || 0,
        fee_vip: productFees[p.buyer_sku_code]?.vip || 0,
        fee_owner: productFees[p.buyer_sku_code]?.owner || 0
      }));
      res.json({ success: true, data: mapped });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }

  });

  // --- Telegram Bot API Routes ---
  app.get("/api/bot/status", (req, res) => {
    res.json({ status: botStatus, running: bot !== null });
  });

  app.get("/api/bot/owner", (req, res) => {
    res.json({ owners: db.owners || [] });
  });

  app.post("/api/bot/owner", (req, res) => {
    const { owners } = req.body;
    if (!Array.isArray(owners)) {
      return res.status(400).json({ error: "Owners must be an array" });
    }
    db.owners = owners.map(id => Number(id));
    writeDB(db);
    res.json({ success: true, message: "Owner IDs updated" });
  });


  async function startTelegramBot(token: string) {
    try {
      if (bot) {
        bot.stop("Config updated");
      }
      
      const processPrepaidPayment = async (ctx: any, sku: string, method: string, stateData: any, memberId: string) => {
        const product = stateData.product;
        const total = stateData.totalBayar;
        const targetNo = stateData.targetNo;
        const member = members.find((m: any) => m.id === memberId || m.telegram?.includes(ctx.from?.id?.toString() || ''));
        
        if (!member) return ctx.reply("❌ Member tidak ditemukan.");

        const isOwnerSelf = db.owners.includes(ctx.from?.id) && member.telegram?.includes(ctx.from?.id?.toString() || '');
        
        if (!isOwnerSelf) {
            if (method === 'saldo') {
                if (member.balance < total) {
                    return ctx.reply(`❌ TRANSAKSI DITOLAK!\nMaaf kak, saldo kakak tidak mencukupi untuk melakukan transaksi ini.\n💳 Saldo Saat Ini: Rp ${member.balance.toLocaleString('id-ID')}\n💰 Total Bayar: Rp ${total.toLocaleString('id-ID')}\nSilakan isi ulang saldo kakak terlebih dahulu. 🙏`);
                }
                member.balance -= total;
                db.members = members;
                writeDB(db);
            } else if (method === 'utang') {
                member.balance -= total;
                db.members = members;
                writeDB(db);
            }
        }
        
        const methodDisplay = method === 'cash' ? '💵 Tunai (Cash)' : method === 'utang' ? '📝 Utang' : '💳 Saldo';
        await ctx.reply(`⏳ Memproses pembelian ${product.product_name} ke nomor ${targetNo} via ${methodDisplay}...`);
        
        const pay_ref_id = "PRE-" + Date.now();
        try {
            const signText = digiflazzUsername + digiflazzApiKey + pay_ref_id;
            const sign = crypto.createHash("md5").update(signText).digest("hex");
            const res = await fetch("https://api.digiflazz.com/v1/transaction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: digiflazzUsername,
                    buyer_sku_code: sku,
                    customer_no: targetNo,
                    ref_id: pay_ref_id,
                    sign: sign
                })
            });
            const payJson = await res.json();
            
            if (payJson.data) {
                const status = payJson.data.status || 'Gagal';
                const digiflazzPrice = payJson.data.price || 0;
                const cuan = total - digiflazzPrice;
                
                let paymentInfo = "";
                if (method === 'saldo') {
                    paymentInfo = `    💰 SALDO  : "Cusss! Saldo langsung kepotong,\n                 beres dalam sekejap! Kamu jago\n                 banget pake saldo, Chuna salut! 💰✨"`;
                } else if (method === 'cash') {
                    paymentInfo = `    💵 CASH   : "Duitnya Chuna terima dengan senyum\n                 lebar! Bayar tunai tetap berkesan!\n                 Makasih udah main ke E4 Store! 🫳🌸"`;
                } else {
                    paymentInfo = `    📝 JANJI   : "Chuna percaya 100% sama kamu! 😍\n     BAYAR      Kamu pasti bayar tepat waktu karena\n    TEPAT       Chuna tahu kamu pelanggan baik hati.\n    WAKTU       Nanti kalau sudah transfer, chat\n                 Chuna aja, nanti Chuna proses dengan\n                 senyum manis! Makasih udah jujur! 💖🤗"`;
                }
                
                let msg = "";
                let tgMsgId: number | undefined;
                let waMsgKey: any | undefined;
                let waJid: string | undefined;

                if (status === 'Pending') {
                    msg = `⏳ TRANSAKSI SEDANG DIPROSES PUSAT\n📦 Produk: ${product.product_name}\n🎯 Tujuan: ${targetNo}\nStatus: Pending ⏳\nPesanan kakak sedang diproses oleh sistem pusat.\nChuna dari E4 Store minta sabar ya, sayang!\nSebentar lagi selesai kok, jangan kemana-mana dulu~\nSambil nunggu, Chuna siapin cemilan buat kamu! 🚗💨`;
                    const tgMsg = await ctx.reply(msg);
                    tgMsgId = tgMsg.message_id;
                } else if (status === 'Sukses') {
                    const sn = payJson.data.sn || "-";
                    const now = new Date();
                    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
                    const dateStr = `${now.getDate().toString().padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()} WITA`;
                    msg = `HOREE! Sukses, sayang! 🎉🎊 Chuna sampai joget-joget di depan kasir! Pesananmu sudah masuk, semua serba menyenangkan! Makasih ya udah percaya sama E4 Store dan Chuna yang imut ini. Kalau ada kendala, Chuna siap sedia 24 jam di WA. Semoga hari-harimu makin cerah! 💖🌈\n\n📄 Nota Sukses Prabayar:\n\`\`\`\n*E4 STORE*\nJl. Zamrud Depan Zamrud 2 RT 42\nWA: 6285169959218\n------------------------------------\nOrder ID      : ${pay_ref_id}\nTanggal       : ${dateStr}\nID Pelanggan  : ${targetNo}\nNama          : ${member.name || "-"}\n------------------------------------\nToken / SN    : ${sn}\n------------------------------------\nPembelian     : ${product.product_name}\n------------------------------------\nTotal         : Rp ${total.toLocaleString('id-ID')}\n------------------------------------\nStatus        : ✅ SUKSES (LUNAS)\n------------------------------------\nPembayaran    :\n${paymentInfo}\n------------------------------------\n_Melalui WhatsApp ini, Anda akan menerima informasi\n berupa notifikasi terkait transaksi Anda di *E4 Store*_\n------------------------------------\nTerimakasih telah berbelanja di E4 Store!\n🐾 Chuna ~ Asisten Imutmu siap bantu 24 jam!\n📱 WA: 6285169959218\n------------------------------------\n\`\`\``;
                    const tgMsg = await ctx.reply(msg, { parse_mode: 'Markdown' });
                    tgMsgId = tgMsg.message_id;
                } else {
                    if (!isOwnerSelf && method !== 'cash') {
                        member.balance += total;
                        db.members = members;
                        writeDB(db);
                    }
                    msg = `❌ TRANSAKSI GAGAL\n📦 Produk: ${product.product_name}\n🎯 Tujuan: ${targetNo}\nStatus: Gagal ❌\nKeterangan: ${payJson.data.message || 'Dibatalkan'}\n${method === 'saldo' ? '✅ Saldo sebesar Rp ' + total.toLocaleString('id-ID') + ' telah dikembalikan ke akunmu!' : (method === 'utang' ? '✅ Utang sebesar Rp ' + total.toLocaleString('id-ID') + ' telah dibatalkan!' : '✅ Silakan kembalikan uang Cash sebesar Rp ' + total.toLocaleString('id-ID') + ' kepada pelanggan.')}\n\nYah, gagal nih, sayang! Tapi Chuna yakin kamu pasti\nbisa coba lagi. Cek data pembayaranmu ya, atau\nhubungi Bos chuna  di WA 6285169959218 buat link whatsapp, nanti Chuna\nbantuin dengan senyum manis! Semangat, jangan\nnangis dulu~ Chuna di sini buat kamu! 💪😘`;
                    const tgMsg = await ctx.reply(msg);
                    tgMsgId = tgMsg.message_id;
                }
                
                if (msg && waSocket && member.whatsapp) {
                    let cleanWa = member.whatsapp.replace(/\D/g, "");
                    if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
                    const jid = cleanWa + "@s.whatsapp.net";
                    waJid = jid;
                    try {
                        await waSocket.presenceSubscribe(jid);
                        await waSocket.sendPresenceUpdate('composing', jid);
                        await new Promise(r => setTimeout(r, 2000));
                        await waSocket.sendPresenceUpdate('paused', jid);
                        const waMsg = await waSocket.sendMessage(jid, { text: msg });
                        if (waMsg) waMsgKey = waMsg.key;
                    } catch (err) {
                        console.log("Failed to send WA message:", err);
                    }
                }
                
                // ALWAYS save to transaction history so it can be seen
                transactions.unshift({
                    id: pay_ref_id,
                    memberId: member.id,
                    type: "prepaid",
                    product: product.product_name,
                    sku: product.buyer_sku_code,
                    target: targetNo,
                    price: total,
                    modal: digiflazzPrice,
                    cuan: cuan > 0 ? cuan : 0,
                    status: status,
                    method: method,
                    date: new Date().toISOString(),
                    tgMsgId,
                    waMsgKey,
                    tgChatId: ctx.chat?.id,
                    waJid
                });
                if (transactions.length > 50) transactions.pop();
                db.transactions = transactions;
                writeDB(db);
                
            } else {
                if (!isOwnerSelf && method !== 'cash') {
                    member.balance += total;
                    db.members = members;
                    writeDB(db);
                }
                let refundMsg = method === 'saldo' ? '\n\nSaldo telah dikembalikan.' : (method === 'utang' ? '\n\nUtang telah dibatalkan.' : '\n\nUang Cash harap dikembalikan.');
                await ctx.reply(`❌ Pembelian Gagal:\n${payJson.data?.message || 'Error tidak diketahui'}${refundMsg}`);
            }
        } catch (e: any) {
            transactions.unshift({
                id: pay_ref_id,
                memberId: member.id,
                type: "prepaid",
                product: product.product_name,
                sku: product.buyer_sku_code,
                target: targetNo,
                price: total,
                modal: 0,
                cuan: 0,
                status: "Gagal",
                method: method,
                date: new Date().toISOString()
            });
            if (transactions.length > 50) transactions.pop();
            db.transactions = transactions;
            writeDB(db);
            
            if (!isOwnerSelf && method !== 'cash') {
                member.balance += total;
                db.members = members;
                writeDB(db);
            }
                
            await ctx.reply(`⏳ Transaksi Sedang Diproses (Network Error)\n\nPesananmu sedang dikonfirmasi oleh sistem pusat meski terjadi gangguan koneksi.\nMohon tunggu update otomatis dari Chuna atau hubungi Admin.\n\nPesan Error: ${e.message}`);
        }
        
        if (stateData.memberId) {
            userStates[ctx.from?.id || 0] = { step: 'LOCKED_MEMBER', data: { memberId: stateData.memberId } };
        } else {
            delete userStates[ctx.from?.id || 0];
        }
}


async function processPascaPayment(ctx: any, ref_id: string, method: string, stateData: any, memberId: string) {
        const member = members.find((m: any) => m.id === memberId || m.telegram?.includes(ctx.from?.id?.toString() || ''));
        if (!member) return ctx.reply("❌ Member tidak ditemukan.");
        
        const isOwnerSelf = db.owners.includes(ctx.from?.id) && member.telegram?.includes(ctx.from?.id?.toString() || '');
        const checkResult = stateData.checkResult;
        const total = stateData.totalBayar;
        const customerNo = stateData.targetNo;
        
        if (!isOwnerSelf) {
            if (method === 'saldo') {
                if (member.balance < total) {
                    return ctx.reply(`❌ TRANSAKSI DITOLAK!\nMaaf kak, saldo kakak tidak mencukupi untuk melakukan transaksi ini.\n💳 Saldo Saat Ini: Rp ${member.balance.toLocaleString('id-ID')}\n💰 Total Bayar: Rp ${total.toLocaleString('id-ID')}\nSilakan isi ulang saldo kakak terlebih dahulu. 🙏`);
                }
                member.balance -= total;
                db.members = members;
                writeDB(db);
            } else if (method === 'utang') {
                member.balance -= total;
                db.members = members;
                writeDB(db);
            }
        }
        
        const methodDisplay = method === 'cash' ? '💵 Tunai (Cash)' : method === 'utang' ? '📝 Utang' : '💳 Saldo';
        await ctx.reply(`⏳ Memproses pembayaran tagihan ke nomor ${customerNo} via ${methodDisplay}...`);
        
        const pay_ref_id = "PAY-" + ref_id;
        try {
            const signText = digiflazzUsername + digiflazzApiKey + pay_ref_id;
            const sign = crypto.createHash("md5").update(signText).digest("hex");
            const res = await fetch("https://api.digiflazz.com/v1/transaction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    commands: "pay-pasca",
                    username: digiflazzUsername,
                    buyer_sku_code: stateData.product.buyer_sku_code,
                    customer_no: customerNo,
                    ref_id: pay_ref_id,
                    sign: sign
                })
            });
            const payJson = await res.json();
            
            if (payJson.data) {
                const status = payJson.data.status || 'Gagal';
                const digiflazzPrice = payJson.data.price || 0;
                const cuan = total - digiflazzPrice;
                
                let paymentInfo = "";
                if (method === 'saldo') {
                    paymentInfo = `    💰 SALDO  : "Cusss! Saldo langsung kepotong,\n                 beres dalam sekejap! Kamu jago\n                 banget pake saldo, Chuna salut! 💰✨"`;
                } else if (method === 'cash') {
                    paymentInfo = `    💵 CASH   : "Duitnya Chuna terima dengan senyum\n                 lebar! Bayar tunai tetap berkesan!\n                 Makasih udah main ke E4 Store! 🫳🌸"`;
                } else {
                    paymentInfo = `    📝 JANJI   : "Chuna percaya 100% sama kamu! 😍\n     BAYAR      Kamu pasti bayar tepat waktu karena\n    TEPAT       Chuna tahu kamu pelanggan baik hati.\n    WAKTU       Nanti kalau sudah transfer, chat\n                 Chuna aja, nanti Chuna proses dengan\n                 senyum manis! Makasih udah jujur! 💖🤗"`;
                }
                
                let msg = "";
                let tgMsgId: number | undefined;
                let waMsgKey: any | undefined;
                let waJid: string | undefined;

                if (status === 'Pending') {
                    msg = `⏳ TRANSAKSI SEDANG DIPROSES PUSAT\n📦 Tagihan: ${stateData.product.product_name}\n🎯 Tujuan: ${customerNo}\nStatus: Pending ⏳\n\nPesanan kakak sedang diproses oleh sistem pusat.\nChuna dari E4 Store minta sabar ya, sayang!\nSebentar lagi selesai kok, jangan kemana-mana dulu~\nSambil nunggu, Chuna siapin cemilan buat kamu! 🚗💨`;
                    const tgMsg = await ctx.reply(msg);
                    tgMsgId = tgMsg.message_id;
                } else if (status === 'Sukses') {
                    const sn = payJson.data.sn || "-";
                    const now = new Date();
                    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
                    const dateStr = `${now.getDate().toString().padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()} WITA`;
                    msg = `HOREE! Pembayaran Sukses, sayang! 🎉🎊\n\n📄 Nota Sukses Pascabayar:\n\`\`\`\n*E4 STORE*\nJl. Zamrud Depan Zamrud 2 RT 42\nWA: 6285169959218\n------------------------------------\nOrder ID      : ${pay_ref_id}\nTanggal       : ${dateStr}\nID Pelanggan  : ${customerNo}\nNama          : ${checkResult.customer_name || "-"}\n------------------------------------\nToken / SN    : ${sn}\n------------------------------------\nPembayaran    : ${stateData.product.product_name}\n------------------------------------\nTotal         : Rp ${total.toLocaleString('id-ID')}\n------------------------------------\nStatus        : ✅ SUKSES (LUNAS)\n------------------------------------\nPembayaran    :\n${paymentInfo}\n------------------------------------\n_Melalui WhatsApp ini, Anda akan menerima informasi\n berupa notifikasi terkait transaksi Anda di *E4 Store*_\n------------------------------------\nTerimakasih telah berbelanja di E4 Store!\n🐾 Chuna ~ Asisten Imutmu siap bantu 24 jam!\n📱 WA: 6285169959218\n------------------------------------\n\`\`\``;
                    const tgMsg = await ctx.reply(msg, { parse_mode: 'Markdown' });
                    tgMsgId = tgMsg.message_id;
                } else {
                    if (!isOwnerSelf && method !== 'cash') {
                        member.balance += total;
                        db.members = members;
                        writeDB(db);
                    }
                    msg = `❌ TRANSAKSI GAGAL\n📦 Produk: ${stateData.product.product_name}\n🎯 Tujuan: ${customerNo}\nStatus: Gagal ❌\nKeterangan: ${payJson.data.message || 'Dibatalkan'}\n${method === 'saldo' ? '✅ Saldo sebesar Rp ' + total.toLocaleString('id-ID') + ' telah dikembalikan ke akunmu!' : (method === 'utang' ? '✅ Utang sebesar Rp ' + total.toLocaleString('id-ID') + ' telah dibatalkan!' : '✅ Silakan kembalikan uang Cash sebesar Rp ' + total.toLocaleString('id-ID') + ' kepada pelanggan.')}\n\nYah, gagal nih, sayang! Tapi Chuna yakin kamu pasti\nbisa coba lagi. Cek data pembayaranmu ya, atau\nhubungi Bos chuna  di WA 6285169959218 buat link whatsapp, nanti Chuna\nbantuin dengan senyum manis! Semangat, jangan\nnangis dulu~ Chuna di sini buat kamu! 💪😘`;
                    const tgMsg = await ctx.reply(msg);
                    tgMsgId = tgMsg.message_id;
                }

                if (msg && waSocket && member.whatsapp) {
                    let cleanWa = member.whatsapp.replace(/\D/g, "");
                    if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
                    const jid = cleanWa + "@s.whatsapp.net";
                    waJid = jid;
                    try {
                        await waSocket.presenceSubscribe(jid);
                        await waSocket.sendPresenceUpdate('composing', jid);
                        await new Promise(r => setTimeout(r, 2000));
                        await waSocket.sendPresenceUpdate('paused', jid);
                        const waMsg = await waSocket.sendMessage(jid, { text: msg });
                        if (waMsg) waMsgKey = waMsg.key;
                    } catch (err) {
                        console.log("Failed to send WA message:", err);
                    }
                }
                
                transactions.unshift({
                    id: pay_ref_id,
                    memberId: member.id,
                    type: "pasca",
                    product: stateData.product.product_name,
                    sku: stateData.product.buyer_sku_code,
                    target: customerNo,
                    price: total,
                    modal: digiflazzPrice,
                    cuan: cuan > 0 ? cuan : 0,
                    status: status,
                    method: method,
                    date: new Date().toISOString(),
                    tgMsgId,
                    waMsgKey,
                    tgChatId: ctx.chat?.id,
                    waJid
                });
                if (transactions.length > 50) transactions.pop();
                db.transactions = transactions;
                writeDB(db);
                
            } else {
                if (!isOwnerSelf && method !== 'cash') {
                    member.balance += total;
                    db.members = members;
                    writeDB(db);
                }
                let refundMsg = method === 'saldo' ? '\n\nSaldo telah dikembalikan.' : (method === 'utang' ? '\n\nUtang telah dibatalkan.' : '\n\nUang Cash harap dikembalikan.');
                await ctx.reply(`❌ Pembelian Gagal:\n${payJson.data?.message || 'Error tidak diketahui'}${refundMsg}`);
            }
        } catch (e: any) {
            transactions.unshift({
                id: pay_ref_id,
                memberId: member.id,
                type: "pasca",
                product: stateData.product.product_name,
                sku: stateData.product.buyer_sku_code,
                target: customerNo,
                price: total,
                modal: 0,
                cuan: 0,
                status: "Gagal",
                method: method,
                date: new Date().toISOString()
            });
            if (transactions.length > 50) transactions.pop();
            db.transactions = transactions;
            writeDB(db);
            
            if (!isOwnerSelf && method !== 'cash') {
                member.balance += total;
                db.members = members;
                writeDB(db);
            }
            await ctx.reply(`⏳ Transaksi Sedang Diproses (Network Error)\n\nPesananmu sedang dikonfirmasi oleh sistem pusat meski terjadi gangguan koneksi.\nMohon tunggu update otomatis dari Chuna atau hubungi Admin.\n\nPesan Error: ${e.message}`);
        }
        
        if (stateData.memberId) {
            userStates[ctx.from?.id || 0] = { step: 'LOCKED_MEMBER', data: { memberId: stateData.memberId } };
        } else {
            delete userStates[ctx.from?.id || 0];
        }
}

      
async function pollMessageDeletion(ctx: any, userId: number, msgId: number, type: string, stateData: any) {
    let attempts = 0;
    const ownerId = db.owners[0];
    const checkInterval = setInterval(async () => {
        attempts++;
        if (attempts > 60) {
            clearInterval(checkInterval);
            if (userStates[userId]?.data?.pinMessageId === msgId) {
                delete userStates[userId];
                ctx.telegram.sendMessage(userId, "❌ Waktu habis! Kamu belum menghapus pesan PIN-nya. Transaksi dibatalkan demi keamanan ya, sayang! 💔");
            }
            return;
        }
        try {
            const fw = await bot!.telegram.forwardMessage(ownerId, userId, msgId, { disable_notification: true });
            await bot!.telegram.deleteMessage(ownerId, fw.message_id).catch(() => {});
        } catch (e: any) {
            if (e.message.includes('message to forward not found') || e.message.includes('message not found')) {
                clearInterval(checkInterval);
                if (userStates[userId]?.data?.pinMessageId === msgId) {
                    await ctx.telegram.sendMessage(userId, "✅ Hebat! PIN sudah dihapus. Sekarang Chuna proses transaksinya ya... 🚀");
                    if (type === 'PREPAID') {
                        await processPrepaidPayment(ctx, stateData.sku, stateData.method, stateData, stateData.memberId || `MBR-${userId}`);
                    } else {
                        await processPascaPayment(ctx, stateData.ref_id, stateData.method, stateData, stateData.memberId || `MBR-${userId}`);
                    }
                }
            }
        }
    }, 2000);
}

      bot = new Telegraf(token);
      bot.catch((err, ctx) => {
        console.error('Ooops, encountered an error for ' + ctx.updateType, err);
      });
      
      const botInfo = await bot.telegram.getMe();
      
      bot.start(async (ctx) => {
        const userId = ctx.from.id;

        try {
          const opusPath = path.join(process.cwd(), "welcome.opus");
          if (fs.existsSync(opusPath)) {
            await ctx.replyWithVoice({ source: opusPath });
          }
        } catch (error) {
          console.error("Gagal mengirim pesan audio:", error);
        }

        if (db.owners.includes(userId)) {
           return ctx.reply(
             "👑 DASHBOARD KASIR E4 STORE\n\nSelamat datang bosku! Mau kelola apa hari ini?",
             {
               reply_markup: {
                 keyboard: [
                   [{ text: "📒 Cek Utang Member" }],
                   [{ text: "📝 Tambah Member" }, { text: "👑 List Member" }],
                   [{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }],
                      [{ text: "📢 Pengumuman WA" }]
                 ],
                 resize_keyboard: true
               }
             }
           );
        }

        const memberId = `MBR-${userId}`;
        console.log("DEBUG /start userId:", userId, "members:", JSON.stringify(members));
        const member = members.find(m => m.id === memberId || m.telegram?.includes(`ID:${userId}`) || m.telegram?.includes(userId.toString()));

        if (member) {
          await ctx.reply(
            "✅ Welcome back kak di E4 Store Official! 🥰\n\nMau transaksi apa hari ini kak bareng Chuna?",
            {
              reply_markup: {
                keyboard: [
                  [{ text: "💵 Cek Saldo" }],
                  [{ text: "🧾 Cek Tagihan" }],
                  [{ text: "📋 Menu Produk" }]
                ],
                resize_keyboard: true
              }
            }
          );
          return;
        }

        await ctx.reply(
          "👋 Halo kak! Chuna di sini 🚗💚\n\nKakak belum punya akun E4 Store nih. Daftar dulu yuk biar bisa langsung belanja! 🛍️",
          {
            reply_markup: {
              keyboard: [
                [{ text: "📝 Daftar Bareng Chuna" }]
              ],
              resize_keyboard: true
            }
          }
        );
      });

      bot.hears(/Daftar Bareng Chuna/i, async (ctx) => {
        if (ctx.from) {
          if (registeredUsers[ctx.from.id]) {
             ctx.reply("Mohon maaf kak, akun anda sudah terdaftar dengan tegas.");
             return;
          }
          userStates[ctx.from.id] = { step: 'AWAITING_USERNAME', data: {} };
        }
        ctx.reply("📝 PENDAFTARAN AKUN\n\nOke kak! Langkah pertama, kasih tau Chuna Username yang kakak mau dong.");
      });

      bot.hears(/Cek Saldo/i, async (ctx) => {
        try {
          const userId = ctx.from.id;
          const memberId = `MBR-${userId}`;
          const username = ctx.from.username ? `@${ctx.from.username}` : null;
          const member = members.find(m => m.id === memberId || m.telegram?.includes(`ID:${userId}`) || m.telegram?.includes(userId.toString()) || (username && m.telegram?.toLowerCase() === username.toLowerCase()));
          
          if (member) {
             await ctx.reply(`💳 INFORMASI AKUN E4 STORE\n\n👤 Nama: ${member.name}\n📱 WhatsApp: ${member.whatsapp}\n🏷️ Tipe Akun: *${member.type}*\n\n💰 Saldo Kakak: *Rp ${member.balance.toLocaleString('id-ID')}*\n\nYuk nikmati berbagai promo menarik dari Chuna! ✨`, { parse_mode: 'Markdown' });
          } else {
             await ctx.reply("❌ Kakak belum terdaftar. Yuk daftar dulu!\n\n💡 Info: ID Telegram kakak adalah *" + ctx.from.id + "* (Berikan ID ini ke Owner untuk dihubungkan dengan akun web kakak)", { parse_mode: "Markdown" });
          }
        } catch (e) {
          console.error("Failed to answer", e);
        }
      });

      bot.hears(/Cek Tagihan/i, async (ctx) => {
        try {
            await ctx.reply("🧾 Memuat tagihan (Pascabayar)...");
            const products = await getDigiflazzProducts("pasca");
            if (!products || products.length === 0) {
               return ctx.reply("❌ Tidak ada produk pascabayar.");
            }
            
            const categories = [...new Set(products.map((p: any) => p.category))].filter(Boolean).sort();
            const keyboard = [];
            for (let i = 0; i < categories.length; i += 2) {
                const row = [{ text: categories[i] }];
                if (categories[i+1]) row.push({ text: categories[i+1] });
                keyboard.push(row);
            }
            keyboard.push([{ text: "🔙 Kembali" }]);
            
            await ctx.reply("Pilih layanan tagihan:", {
                reply_markup: {
                    keyboard: keyboard,
                    resize_keyboard: true
                }
            });
        } catch (e: any) {
            await ctx.reply("❌ Gagal memuat tagihan: " + e.message);
            console.error("Failed to answer", e);
        }
      });

      bot.hears(/Menu Produk/i, async (ctx) => {
        try {
            await ctx.reply("🛒 Memuat kategori...");
            const products = await getDigiflazzProducts("prepaid");
            const categories = [...new Set(products.map((p: any) => p.category))].filter(Boolean).sort();
            
            const keyboard = [];
            for (let i = 0; i < categories.length; i += 2) {
                const row = [{ text: categories[i] }];
                if (categories[i+1]) row.push({ text: categories[i+1] });
                keyboard.push(row);
            }
            keyboard.push([{ text: "🔙 Kembali" }]);
            
            await ctx.reply("Silakan pilih kategori produk di bawah ini:", {
              reply_markup: {
                keyboard: keyboard,
                resize_keyboard: true
              }
            });
        } catch (e: any) {
            await ctx.reply("❌ Sistem belum terhubung ke Digiflazz atau terjadi error: " + e.message);
            console.error("Failed to answer", e);
        }
      });
      
      bot.hears("🔙 Kembali ke Menu Owner", async (ctx) => {
          delete userStates[ctx.from.id];
          await ctx.reply("👑 DASHBOARD KASIR E4 STORE\n\nSelamat datang bosku! Mau kelola apa hari ini?", {
              reply_markup: {
                  keyboard: [
                      [{ text: "📒 Cek Utang Member" }],
                      [{ text: "📝 Tambah Member" }, { text: "👑 List Member" }],
                      [{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }],
                      [{ text: "📢 Pengumuman WA" }]
                  ],
                  resize_keyboard: true
              }
          });
      });

            bot.hears("🔙 Kembali", async (ctx) => {
          const state = userStates[ctx.from.id];
          if (state && state.data && state.data.memberId) {
              userStates[ctx.from.id] = { step: 'LOCKED_MEMBER', data: { memberId: state.data.memberId } };
              return ctx.reply("Kembali ke menu transaksi member offline:", {
                  reply_markup: {
                      keyboard: [
                          [{ text: "🧾 Cek Tagihan" }],
                          [{ text: "📋 Menu Produk" }],
                          [{ text: "🔙 Kembali ke Menu Owner" }]
                      ],
                      resize_keyboard: true
                  }
              });
          }

          delete userStates[ctx.from.id];
          await ctx.reply("Kembali ke menu utama:", {
              reply_markup: {
                  keyboard: [
                      [{ text: "💵 Cek Saldo" }],
                      [{ text: "🧾 Cek Tagihan" }],
                      [{ text: "📋 Menu Produk" }]
                  ],
                  resize_keyboard: true
              }
          });
      });


      bot.hears("👑 List Member", async (ctx) => {
        if (!db.owners.includes(ctx.from.id)) return;
        const offlineMembers = members.filter(m => !m.telegram || !m.telegram.startsWith('ID:'));
        
        if (offlineMembers.length === 0) {
          return ctx.reply("Belum ada member offline yang terdaftar.");
        }
        
        const buttons = offlineMembers.map(m => ([{
          text: `👤 ${m.name} (${m.whatsapp})`,
          callback_data: `sel_off_${m.id}`
        }]));

        await ctx.reply("👑 LIST MEMBER OFFLINE\n\nSilakan pilih pelanggan yang akan dilayani:", {
          reply_markup: {
            inline_keyboard: buttons
          }
        });
      });

      bot.action(/^sel_off_(.+)$/, async (ctx) => {
        if (!db.owners.includes(ctx.from?.id)) return;
        const memberId = ctx.match[1];
        const member = members.find(m => m.id === memberId);
        if (!member) {
          return ctx.answerCbQuery("Member tidak ditemukan!");
        }
        
        await ctx.answerCbQuery();
        userStates[ctx.from.id] = { step: 'LOCKED_MEMBER', data: { memberId: member.id } };
        await ctx.reply(`✅ Pelanggan Terkunci: ${member.whatsapp}\n\nSilakan pilih menu transaksi di bawah:`, {
          reply_markup: {
            keyboard: [
              [{ text: "🧾 Cek Tagihan" }],
              [{ text: "📋 Menu Produk" }],
              [{ text: "🔙 Kembali ke Menu Owner" }]
            ],
            resize_keyboard: true
          }
        });
      });

      bot.action(/^tagihan_(.+)$/, async (ctx) => {
        const memberId = ctx.match[1];
        await ctx.answerCbQuery();
        try {
            await ctx.reply("🧾 Memuat tagihan (Pascabayar)...");
            const products = await getDigiflazzProducts("pasca");
            if (!products || products.length === 0) {
               return ctx.reply("❌ Tidak ada produk pascabayar.");
            }
            
            const categories = [...new Set(products.map((p) => p.category))].filter(Boolean).sort();
            const keyboard = [];
            for (let i = 0; i < categories.length; i += 2) {
                const row = [{ text: categories[i] }];
                if (categories[i+1]) row.push({ text: categories[i+1] });
                keyboard.push(row);
            }
            keyboard.push([{ text: "🔙 Kembali" }]);
            
            await ctx.reply("Pilih layanan tagihan:", {
                reply_markup: {
                    keyboard: keyboard,
                    resize_keyboard: true
                }
            });
        } catch (error) {
            await ctx.reply("❌ Terjadi kesalahan saat memuat tagihan.");
        }
      });
      
      bot.action('cancel_prepaid', async (ctx) => {
        await ctx.answerCbQuery("Pembelian dibatalkan");
        const state = userStates[ctx.from?.id || 0];
        if (state && state.data.memberId) {
            userStates[ctx.from?.id || 0] = { step: 'LOCKED_MEMBER', data: { memberId: state.data.memberId } };
        } else {
            delete userStates[ctx.from?.id || 0];
        }
        await ctx.editMessageText("❌ Pembelian dibatalkan.");
      });

      bot.action(/^pay_prepaid_(.+?)(?:_(cash|utang|saldo))?$/, async (ctx) => {
        await ctx.answerCbQuery();
        const sku = ctx.match[1];
        const method = ctx.match[2] || 'saldo';
        const isOwner = db.owners.includes(ctx.from?.id);
        
        if (method !== 'saldo' && !isOwner) {
            return ctx.reply("❌ Metode pembayaran tidak valid.");
        }
        
        const state = userStates[ctx.from?.id || 0];
        if (!state || state.step !== 'PREPAID_INPUT_NUMBER' || state.data.product.buyer_sku_code !== sku) {
            return ctx.reply("❌ Data transaksi tidak valid atau sudah kadaluarsa. Silakan ulangi pembelian.");
        }
        
        if (!isOwner) {
             userStates[ctx.from?.id || 0] = { step: 'ASK_PIN_PREPAID', data: { ...state.data, method, sku } };
             return ctx.reply("🔐 *Masukan PIN Keamanan Transaksi*\nSilakan ketik PIN Anda untuk melanjutkan transaksi ini.", { parse_mode: 'Markdown' });
        }
        
        await processPrepaidPayment(ctx, sku, method, state.data, state.data.memberId || `MBR-${ctx.from?.id}`);
      });
      bot.action(/^pay_pasca_(.+?)(?:_(cash|utang|saldo))?$/, async (ctx) => {
        await ctx.answerCbQuery();
        const ref_id = ctx.match[1];
        const method = ctx.match[2] || 'saldo';
        const isOwner = db.owners.includes(ctx.from?.id);
        
        if (method !== 'saldo' && !isOwner) {
            return ctx.reply("❌ Metode pembayaran tidak valid.");
        }
        
        const state = userStates[ctx.from?.id || 0];
        if (!state || !state.data.checkResult || state.data.checkResult.ref_id !== ref_id) {
            return ctx.reply("❌ Data transaksi tidak valid atau sudah kadaluarsa. Silakan ulangi cek tagihan.");
        }
        
        if (!isOwner) {
             userStates[ctx.from?.id || 0] = { step: 'ASK_PIN_PASCA', data: { ...state.data, method, ref_id } };
             return ctx.reply("🔐 *Masukan PIN Keamanan Transaksi*\nSilakan ketik PIN Anda untuk melanjutkan transaksi ini.", { parse_mode: 'Markdown' });
        }
        
        await processPascaPayment(ctx, ref_id, method, state.data, state.data.memberId || `MBR-${ctx.from?.id}`);
      });
      bot.action("cancel_pasca", async (ctx) => {
        await ctx.answerCbQuery();
        const state = userStates[ctx.from?.id || 0];
        if (state?.data?.memberId) {
            userStates[ctx.from?.id || 0] = { step: 'LOCKED_MEMBER', data: { memberId: state.data.memberId } };
        } else {
            delete userStates[ctx.from?.id || 0];
        }
        await ctx.reply("❌ Pembayaran tagihan dibatalkan.");
      });

      bot.action(/^produk_(.+)$/, async (ctx) => {
        const memberId = ctx.match[1];
        await ctx.answerCbQuery();
        try {
            await ctx.reply("🛒 Memuat kategori...");
            const products = await getDigiflazzProducts("prepaid");
            const categories = [...new Set(products.map((p) => p.category))].filter(Boolean).sort();
            
            const keyboard = [];
            for (let i = 0; i < categories.length; i += 2) {
                const row = [{ text: categories[i] }];
                if (categories[i+1]) row.push({ text: categories[i+1] });
                keyboard.push(row);
            }
            keyboard.push([{ text: "🔙 Kembali" }]);
            
            await ctx.reply("Silakan pilih kategori produk di bawah ini:", {
              reply_markup: {
                keyboard: keyboard,
                resize_keyboard: true
              }
            });
        } catch (error) {
            await ctx.reply("❌ Terjadi kesalahan saat mengambil kategori.");
        }
      });

      bot.hears("📒 Cek Utang Member", async (ctx) => {
        if (!db.owners.includes(ctx.from.id)) return;
        
        const utangTx = transactions.filter((t: any) => t.method === 'utang' && t.status === 'Sukses');
        
        if (utangTx.length === 0) {
            return ctx.reply("✨ Wah, hebat! Saat ini tidak ada member yang memiliki utang. Semua lunas! 🎉");
        }
        
        const utangByMember: Record<string, any[]> = {};
        utangTx.forEach((t: any) => {
            if (!utangByMember[t.memberId]) utangByMember[t.memberId] = [];
            utangByMember[t.memberId].push(t);
        });
        
        const buttons = [];
        for (const memberId in utangByMember) {
            const member = members.find(m => m.id === memberId);
            const nama = member ? (member.name || "-") : memberId;
            const wa = member ? (member.whatsapp || "-") : "-";
            buttons.push([{
                text: `👤 ${nama} (${wa})`,
                callback_data: `cek_utang_${memberId}`
            }]);
        }
        
        await ctx.reply("📒 *DAFTAR MEMBER BERHUTANG*\n\nSilakan pilih member untuk melihat detail utang:", {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: buttons
            }
        });
      });

      bot.action(/^cek_utang_(.+)$/, async (ctx) => {
          if (!db.owners.includes(ctx.from?.id)) return;
          const memberId = ctx.match[1];
          const member = members.find(m => m.id === memberId);
          const nama = member ? (member.name || "-") : memberId;
          const wa = member ? (member.whatsapp || "-") : "-";
          
          const utangTx = transactions.filter((t: any) => t.method === 'utang' && t.status === 'Sukses' && t.memberId === memberId);
          
          if (utangTx.length === 0) {
              return ctx.editMessageText(`✨ Utang ${nama} sudah lunas semua! 🎉`);
          }
          
          let msg = `📒 *DETAIL UTANG: ${nama}* (${wa})\n\n`;
          let totalUtang = 0;
          
          utangTx.forEach((t: any) => {
              const date = t.date ? new Date(t.date).toLocaleString('id-ID', { timeZone: 'Asia/Makassar' }) : '-';
              const sisa = t.price - (t.paidAmount || 0);
              msg += ` ├ 📦 ${t.product}\n`;
              msg += ` ├ 💵 Rp ${sisa.toLocaleString('id-ID')} ${t.paidAmount ? `(Sisa dari Rp ${t.price.toLocaleString('id-ID')})` : ''}\n`;
              msg += ` └ 📅 ${date}\n\n`;
              totalUtang += sisa;
          });
          
          msg += `💰 *TOTAL UTANG: Rp ${totalUtang.toLocaleString('id-ID')}*\n\nApakah dia mau bayar?`;
          
          await ctx.editMessageText(msg, {
              parse_mode: 'Markdown',
              reply_markup: {
                  inline_keyboard: [
                      [{ text: "✅ Bayar", callback_data: `bayar_utang_${memberId}` }],
                      [{ text: "❌ Tidak", callback_data: `batal_utang` }]
                  ]
              }
          });
      });

      bot.action(/^bayar_utang_(.+)$/, async (ctx) => {
          if (!db.owners.includes(ctx.from?.id)) return;
          const memberId = ctx.match[1];
          
          userStates[ctx.from.id] = { step: 'WAIT_NOMINAL_UTANG', data: { memberId } };
          await ctx.editMessageText("Berapakah customer mu bayar?\nKetik nominalnya (contoh: 10000 atau 10.000)");
      });
      
      bot.action('batal_utang', async (ctx) => {
          if (!db.owners.includes(ctx.from?.id)) return;
          delete userStates[ctx.from.id];
          await ctx.editMessageText("❌ Aksi dibatalkan.");
      });

      bot.hears("💳 Saldo Pusat", async (ctx) => {
        if (!db.owners.includes(ctx.from.id)) return;
        ctx.reply(`💳 *SALDO PUSAT (DIGIFLAZZ)*\n\nStatus: ${digiflazzStatus}\nSaldo Saat Ini: Rp ${digiflazzBalance.toLocaleString('id-ID')}`, { parse_mode: 'Markdown' });
      });

      bot.hears("⚙️ Pengaturan", async (ctx) => {
        if (!db.owners.includes(ctx.from.id)) return;
        
        ctx.reply(`⚙️ *PENGATURAN SISTEM*

1. *Digiflazz Webhook*
Untuk menerima update transaksi otomatis (Sukses/Gagal dari Pending), silakan atur Webhook di Web Digiflazz:
- Masuk ke Pengaturan Webhook Digiflazz
- Masukkan URL ini (tambahkan URL server di depannya):
\`/api/digiflazz-webhook\`
Contoh: \`https://domainanda.com/api/digiflazz-webhook\`

*Pastikan tidak ada spasi saat copy.*
`, { parse_mode: 'Markdown' });

      });

      
            bot.hears("📢 Pengumuman WA", async (ctx) => {
          if (!db.owners.includes(ctx.from.id)) return;
          userStates[ctx.from.id] = { step: 'ANNOUNCEMENT_MENU', data: {} };
          
          const status = db.waAnnouncementEnabled ? "🟢 AKTIF" : "🔴 NONAKTIF";
          await ctx.reply(`📢 Menu Pengumuman WA (Otomatis 1 Jam):\nStatus saat ini: ${status}`, {
              reply_markup: {
                  keyboard: [
                      [{ text: "🎯 Set Target WA" }],
                      [{ text: "📢 Buat Pengumuman" }],
                      [{ text: "🛑 Matikan Pengumuman" }, { text: "▶️ Aktifkan Pengumuman" }],
                      [{ text: "🔙 Kembali ke Menu Owner" }]
                  ],
                  resize_keyboard: true
              }
          });
      });

      
      bot.hears("🛑 Matikan Pengumuman", async (ctx) => {
          if (!db.owners.includes(ctx.from.id)) return;
          db.waAnnouncementEnabled = false;
          writeDB(db);
          await ctx.reply("🛑 Pengumuman otomatis berhasil dimatikan.");
      });

      bot.hears("▶️ Aktifkan Pengumuman", async (ctx) => {
          if (!db.owners.includes(ctx.from.id)) return;
          if (!db.waAnnouncementText) {
              return ctx.reply("❌ Teks pengumuman belum ada. Silakan buat pengumuman terlebih dahulu.");
          }
          db.waAnnouncementEnabled = true;
          writeDB(db);
          await ctx.reply("▶️ Pengumuman otomatis berhasil diaktifkan. Akan dikirim setiap 1 jam.");
      });

      bot.hears("🎯 Set Target WA", async (ctx) => {
          if (!db.owners.includes(ctx.from.id)) return;
          userStates[ctx.from.id] = { step: 'AWAITING_WA_TARGET', data: {} };
          const currentTarget = db.waAnnouncementTarget || "Belum diatur";
          await ctx.reply(`Target WA saat ini: *${currentTarget}*\n\nKirimkan Target ID / Nomor WA tujuan pengumuman (contoh: 120363393336519112@g.us):`, { parse_mode: 'Markdown' });
      });

      bot.hears("📢 Buat Pengumuman", async (ctx) => {
          if (!db.owners.includes(ctx.from.id)) return;
          const target = db.waAnnouncementTarget;
          if (!target) {
              return ctx.reply("❌ Target WA belum diatur! Silakan Set Target WA terlebih dahulu.");
          }
          userStates[ctx.from.id] = { step: 'AWAITING_ANNOUNCEMENT_TEXT', data: {} };
          await ctx.reply(`Kirimkan teks, gambar, atau video (dengan caption) yang ingin dikirimkan ke target *${target}*:\n\n(Bisa multi-baris)\n\n💡 *TIPS OTOMATIS HARGA:*\nKamu bisa pakai kode seperti ini agar harga update otomatis sesuai setting produk & Digiflazz:\n\`{{KODE_SKU:REGULER}}\` -> Harga Biasa\n\`{{KODE_SKU:VIP}}\` -> Harga VIP\n\`{{KODE_SKU:STATUS}}\` -> 🟢 NORMAL / 🔴 CLOSE\n\`{{KODE_SKU:HEMAT}}\` -> Selisih Harga\n\nContoh:\n💎 ML 170DM: \`{{ML170:REGULER}}\`\n⭐ VIP Cuma: \`{{ML170:VIP}}\``, { parse_mode: 'Markdown' });
      });

      bot.hears("📝 Tambah Member", async (ctx) => {
        if (!db.owners.includes(ctx.from.id)) return;
        userStates[ctx.from.id] = { step: 'OWNER_ADD_MEMBER_USERNAME', data: {} };
        ctx.reply("📝 MASUKKAN USERNAME MEMBER BARU:");
      });

      
      bot.on(["photo", "video", "document"], async (ctx, next) => {
          const userId = ctx.from.id;
          const state = userStates[userId];
          
          if (state && state.step === 'AWAITING_ANNOUNCEMENT_TEXT') {
              const targetAnnounce = db.waAnnouncementTarget;
              if (!targetAnnounce) {
                  await ctx.reply("❌ Target WA belum diatur!");
                  delete userStates[userId];
                  return;
              }
              
              let fileId;
              let mediaType;
              let mimetype;
              let fileName;
              
              const msg = ctx.message as any;
              if (msg.photo) {
                  fileId = msg.photo[msg.photo.length - 1].file_id;
                  mediaType = 'image';
              } else if (msg.video) {
                  fileId = msg.video.file_id;
                  mediaType = 'video';
              } else if (msg.document) {
                  fileId = msg.document.file_id;
                  mediaType = 'document';
                  mimetype = msg.document.mime_type;
                  fileName = msg.document.file_name || 'document';
              }
              
              const caption = msg.caption || "";
              
              try {
                  const fileLink = await ctx.telegram.getFileLink(fileId);
                  const response = await fetch(fileLink.href);
                  const arrayBuffer = await response.arrayBuffer();
                  const buffer = Buffer.from(arrayBuffer);
                  
                  // Save to disk
                  const ext = fileName ? fileName.split('.').pop() : (mediaType === 'image' ? 'jpg' : 'mp4');
                  const localPath = 'announcement_media.' + ext;
                  fs.writeFileSync(localPath, buffer);
                  
                  db.waAnnouncementText = caption;
                  db.waAnnouncementMedia = localPath;
                  db.waAnnouncementMediaType = mediaType;
                  if (mimetype) db.waAnnouncementMime = mimetype;
                  if (fileName) db.waAnnouncementFileName = fileName;
                  db.waAnnouncementEnabled = true;
                  writeDB(db);
                  
                  await ctx.reply("✅ Media pengumuman berhasil disimpan dan diaktifkan (otomatis kirim setiap 1 jam). Sedang mencoba mengirim percobaan pertama...");
                  delete userStates[userId];
                  
                  if (waSocket) {
                      try {
                          let msgOpt: any = {};
                          if (mediaType === 'image') msgOpt = { image: buffer, caption: caption };
                          else if (mediaType === 'video') msgOpt = { video: buffer, caption: caption };
                          else if (mediaType === 'document') msgOpt = { document: buffer, caption: caption, mimetype: mimetype, fileName: fileName };
                          
                          const parsedCaption = await parseAnnouncementText(caption);
                          if (mediaType === 'image') msgOpt.caption = parsedCaption;
                          else if (mediaType === 'video') msgOpt.caption = parsedCaption;
                          else if (mediaType === 'document') msgOpt.caption = parsedCaption;
                          await waSocket.sendMessage(targetAnnounce, msgOpt);
                      } catch (err) {
                          await ctx.reply("⚠️ Gagal mengirim percobaan pertama: " + err.message);
                      }
                  } else {
                      await ctx.reply("⚠️ WhatsApp belum terhubung. Pengumuman akan dikirim saat WA terhubung.");
                  }
              } catch (e) {
                  await ctx.reply("❌ Gagal mendownload atau memproses media: " + e.message);
              }
              return;
          }
          
          return next();
      });

      bot.on("text", async (ctx, next) => {
        const userId = ctx.from.id;
        const text = ctx.message.text;
        
        if (text.startsWith('/')) { return next(); }
        if (text === "🔙 Kembali") { return next(); }
        
        const ownerMenu = ["📒 Cek Utang Member", "📝 Tambah Member", "👑 List Member", "💳 Saldo Pusat", "⚙️ Pengaturan"];
        if (ownerMenu.includes(text) && db.owners.includes(userId)) {
           delete userStates[userId];
           return next(); 
        }

        const state = userStates[userId];
        if (state) {
            switch (state.step) {
                case 'ASK_PIN_PREPAID': {
                    const pinEntered = text.trim();
                    const regUser = registeredUsers[userId];
                    if (!regUser || regUser.pin !== pinEntered) {
                        return ctx.reply("😡 HMM?! PIN-NYA SALAH! Hayoo, kamu siapa?! Jangan sembarangan pakai akun orang ya! Chuna gigit nih kalau berani macam-macam! 🔪👿");
                    }
                    const msgId = ctx.message.message_id;
                    await ctx.reply("🤫 Sstt... PIN-nya benar, sayang! Tapi demi keamanan, ayo hapus pesan yang isinya PIN kamu barusan. Kalau udah dihapus, Chuna akan langsung proses transaksinya! 💕✨");
                    state.step = 'WAIT_DELETE_PIN_PREPAID';
                    state.data.pinMessageId = msgId;
                    pollMessageDeletion(ctx, userId, msgId, 'PREPAID', state.data);
                    return;
                }
                case 'ASK_PIN_PASCA': {
                    const pinEntered = text.trim();
                    const regUser = registeredUsers[userId];
                    if (!regUser || regUser.pin !== pinEntered) {
                        return ctx.reply("😡 HMM?! PIN-NYA SALAH! Hayoo, kamu siapa?! Jangan sembarangan pakai akun orang ya! Chuna gigit nih kalau berani macam-macam! 🔪👿");
                    }
                    const msgId = ctx.message.message_id;
                    await ctx.reply("🤫 Sstt... PIN-nya benar, sayang! Tapi demi keamanan, ayo hapus pesan yang isinya PIN kamu barusan. Kalau udah dihapus, Chuna akan langsung proses transaksinya! 💕✨");
                    state.step = 'WAIT_DELETE_PIN_PASCA';
                    state.data.pinMessageId = msgId;
                    pollMessageDeletion(ctx, userId, msgId, 'PASCA', state.data);
                    return;
                }
                case 'WAIT_DELETE_PIN_PREPAID':
                case 'WAIT_DELETE_PIN_PASCA':
                    return ctx.reply("Hapus pesan PIN kamu dulu ya sayang, baru bisa lanjut! 🥺💕");



              case 'PREPAID_INPUT_NUMBER': {
                const targetNo = text.trim();
                if (targetNo.toLowerCase() === 'batal' || targetNo === '❌ Batal') {
                    if (state.data.memberId) {
                        userStates[userId] = { step: 'LOCKED_MEMBER', data: { memberId: state.data.memberId } };
                        await ctx.reply("❌ Pembelian dibatalkan.", { reply_markup: { keyboard: [[{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "🔙 Kembali ke Menu Owner" }]], resize_keyboard: true } });
                    } else {
                        delete userStates[userId];
                        await ctx.reply("❌ Pembelian dibatalkan.", { reply_markup: { keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }]], resize_keyboard: true } });
                    }
                    return;
                }
                if (!targetNo || targetNo.length < 2) {
                    await ctx.reply("❌ Nomor tujuan tidak valid. Silakan masukkan nomor yang benar, atau ketik 'Batal'.");
                    return;
                }
                
                const product = state.data.product;
                const total = state.data.totalBayar;
                
                // For PLN Prepaid, we could do inq-pln to check name, but for simplicity we just confirm first
                // Let's check name if it's PLN Token
                let nameInfo = "";
                let skuToPay = product.buyer_sku_code;
                
                state.data.targetNo = targetNo; // Save target number in state
                
                const replyText = `✅ *Konfirmasi Pembelian*\n\nLayanan: ${product.product_name}\nNomor: ${targetNo}\n\n💎 *TOTAL BAYAR: Rp ${total.toLocaleString('id-ID')}*`;
                const isOwner = db.owners.includes(ctx.from?.id);
                const keyboard = [];
                if (isOwner) {
                    keyboard.push([{ text: "💵 Cash" }, { text: "📝 Utang" }]);
                    keyboard.push([{ text: "❌ Batal" }]);
                } else {
                    keyboard.push([{ text: "💳 Saldo" }]);
                    keyboard.push([{ text: "❌ Batal" }]);
                }

                userStates[userId] = { step: 'WAIT_PAYMENT_PREPAID', data: { ...state.data, skuToPay } };

                await ctx.reply(replyText, {
                    parse_mode: 'Markdown',
                    reply_markup: { keyboard, resize_keyboard: true }
                });
                
                // Automatically send to WhatsApp
                const memberIdForPrepaid = state.data.memberId || `MBR-${ctx.from?.id}`;
                const memberForPrepaid = members.find(m => m.id === memberIdForPrepaid || m.telegram?.includes(ctx.from?.id?.toString() || ''));
                if (waSocket && memberForPrepaid && memberForPrepaid.whatsapp) {
                    let cleanWa = memberForPrepaid.whatsapp.replace(/\D/g, "");
                    if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
                    const jid = cleanWa + "@s.whatsapp.net";
                    try {
                        await waSocket.presenceSubscribe(jid);
                        await waSocket.sendPresenceUpdate('composing', jid);
                        setTimeout(async () => {
                            await waSocket?.sendPresenceUpdate('paused', jid);
                            await waSocket?.sendMessage(jid, { text: replyText }); 
                        }, 2000);
                    } catch (err) {
                        console.log("Failed to send WA message:", err);
                    }
                }
                break;
              }
              case 'PASCA_INPUT_NUMBER':
                const customerNo = text.trim();
                if (customerNo.toLowerCase() === 'batal' || customerNo === '❌ Batal') {
                    if (state.data.memberId) {
                        userStates[userId] = { step: 'LOCKED_MEMBER', data: { memberId: state.data.memberId } };
                        await ctx.reply("❌ Pengecekan dibatalkan.", { reply_markup: { keyboard: [[{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "🔙 Kembali ke Menu Owner" }]], resize_keyboard: true } });
                    } else {
                        delete userStates[userId];
                        await ctx.reply("❌ Pengecekan dibatalkan.", { reply_markup: { keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }]], resize_keyboard: true } });
                    }
                    return;
                }
                if (!customerNo || customerNo.length < 2) {
                    await ctx.reply("❌ Nomor tujuan tidak valid.");
                    return;
                }
                const product = state.data.product;
                await ctx.reply(`⏳ Sedang mengecek tagihan untuk nomor ${customerNo}...`);
                try {
                    const result = await checkPascaBill(product.buyer_sku_code, customerNo);
                    if (result.status === 'Gagal') {
                         await ctx.reply(`❌ Pengecekan Gagal:\n${result.message}`);
                    } else if (result.status === 'Sukses') {
                         const nama = result.customer_name || "-";
                         const tagihan = result.selling_price || 0;
                         
                         // Determine member type
                         const memberId = state.data.memberId || `MBR-${ctx.from?.id}`;
                         const member = members.find(m => m.id === memberId || m.telegram?.includes(ctx.from?.id?.toString() || ''));
                         const memberType = member?.type || 'Biasa';
                         
                         const isOwnerCtx = db.owners.includes(ctx.from?.id);
                         const adminFee = isOwnerCtx ? (productFees[product.buyer_sku_code]?.owner || 0) : (memberType === 'VIP' ? (productFees[product.buyer_sku_code]?.vip || 0) : (productFees[product.buyer_sku_code]?.biasa || 0));
                         const total = tagihan + adminFee;
                         // We can add our own markup here if needed, but for now we just pass through
                         let detail = "";
                         if (result.desc) {
                           if (typeof result.desc === 'string') {
                               detail = result.desc;
                           } else {
                               const parts = [];
                               if (result.desc.tarif) parts.push(`⚡ Tarif: ${result.desc.tarif}`);
                               if (result.desc.daya) parts.push(`📊 Daya: ${result.desc.daya}`);
                               if (result.desc.lembar_tagihan) parts.push(`📄 Lembar: ${result.desc.lembar_tagihan}\n`);
                               
                               if (Array.isArray(result.desc.detail)) {
                                   result.desc.detail.forEach((d: any, idx: number) => {
                                      parts.push(`📆 Bulan ${idx + 1}: ${d.periode || ''}`);
                                      if (d.meter_awal) parts.push(`🔢 Meter: ${d.meter_awal} - ${d.meter_akhir}`);
                                   });
                               } else if (result.desc.detail) {
                                   parts.push(String(result.desc.detail));
                               }
                               detail = parts.join('\n');
                           }
                         }
                         
                         const replyText = `✅ *Tagihan Ditemukan!*

Haiii! Aku Chuna, asisten imut dari E4 Store 🐾✨
Tagihan kamu udah muncul nih, jangan sampai kelewat ya~

👤 Nama: ${nama}
🔢 Nomor: ${result.customer_no}
🧾 Layanan: ${product.product_name}

💎 TOTAL BAYAR: Rp ${total.toLocaleString('id-ID')}
${detail}

---

💬 "Jangan lupa bayar tepat waktu ya, sayang! Biar listrik tetap menyala dan kamu tetap semangat seharian~ Chuna doain yang terbaik buat kamu! 🌸💖"`;

                         const isOwner = db.owners.includes(ctx.from?.id);
                         const keyboard = [];
                         if (isOwner) {
                             keyboard.push([{ text: "💵 Cash" }, { text: "📝 Utang" }]);
                             keyboard.push([{ text: "❌ Batal" }]);
                         } else {
                             keyboard.push([{ text: "💳 Saldo" }]);
                             keyboard.push([{ text: "❌ Batal" }]);
                         }

                         userStates[userId] = { step: 'WAIT_PAYMENT_PASCA', data: { ...state.data, ref_id: result.ref_id, totalBayar: total } };

                         await ctx.reply(replyText, {
                             parse_mode: 'Markdown',
                             reply_markup: { keyboard, resize_keyboard: true }
                         });
                         
                         // Automatically send to WhatsApp
                         if (waSocket && member && member.whatsapp) {
                             let cleanWa = member.whatsapp.replace(/\D/g, "");
                             if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
                             const jid = cleanWa + "@s.whatsapp.net";
                             try {
                                 await waSocket.presenceSubscribe(jid);
                                 await waSocket.sendPresenceUpdate('composing', jid);
                                 setTimeout(async () => {
                                     await waSocket?.sendPresenceUpdate('paused', jid);
                                     await waSocket?.sendMessage(jid, { text: replyText.replace(/\*/g, '*') }); // keep * for WA bold
                                 }, 2000);
                             } catch (err) {
                                 console.log("Failed to send WA message:", err);
                             }
                         }
                         // Save to state if we need it for payment
                         state.data.checkResult = result;
                         state.data.totalBayar = total;
                    }
                } catch (e: any) {
                    await ctx.reply(`❌ Terjadi kesalahan saat mengecek tagihan: ${e.message}`);
                }
                // Do not delete state yet if we want to proceed to payment, wait, the payment is via callback query so state is not strictly needed if we encode everything, but storing it is safer.
                // Actually, since callback query handles the payment, we can just leave the state or delete it.
                // For simplicity, let's keep the state so we have the result.
                return;

              case 'OWNER_ADD_MEMBER_USERNAME':
                state.data.username = text;
                state.step = 'OWNER_ADD_MEMBER_WA';
                await ctx.reply(`Masukkan nomor WA untuk ${text}:`);
                return;

                            case 'WAIT_PAYMENT_PREPAID': {
                const methodMap: any = { "💵 Cash": "cash", "📝 Utang": "utang", "💳 Saldo": "saldo" };
                const method = methodMap[text.trim()];
                if (text.toLowerCase() === 'batal' || text === '❌ Batal' || text === '❌ Tidak') {
                    if (state.data.memberId) {
                        userStates[userId] = { step: 'LOCKED_MEMBER', data: { memberId: state.data.memberId } };
                        await ctx.reply("❌ Pembelian dibatalkan.", { reply_markup: { keyboard: [[{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "🔙 Kembali ke Menu Owner" }]], resize_keyboard: true } });
                    } else {
                        delete userStates[userId];
                        await ctx.reply("❌ Pembelian dibatalkan.", { reply_markup: { keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }]], resize_keyboard: true } });
                    }
                    return;
                }
                if (!method) {
                    await ctx.reply("❌ Pilihan tidak valid. Silakan gunakan tombol di bawah.");
                    return;
                }
                const isOwner = db.owners.includes(ctx.from?.id);
                if (method !== 'saldo' && !isOwner) {
                    return ctx.reply("❌ Metode pembayaran tidak valid.");
                }
                if (!isOwner) {
                    userStates[userId] = { step: 'ASK_PIN_PREPAID', data: { ...state.data, method, sku: state.data.skuToPay } };
                    return ctx.reply("🔐 *Masukan PIN Keamanan Transaksi*\nSilakan ketik PIN Anda untuk melanjutkan transaksi ini.", { parse_mode: 'Markdown' });
                }
                await processPrepaidPayment(ctx, state.data.skuToPay, method, state.data, state.data.memberId || `MBR-${ctx.from?.id}`);
                break;
              }
              case 'WAIT_NOMINAL_UTANG': {
                  const nominalStr = text.replace(/\D/g, '');
                  if (!nominalStr) {
                      return ctx.reply("❌ Nominal tidak valid. Ketik angkanya saja ya (misal 10000).");
                  }
                  const nominal = parseInt(nominalStr, 10);
                  const memberId = state.data.memberId;
                  
                  const utangTx = transactions.filter((t: any) => t.method === 'utang' && t.status === 'Sukses' && t.memberId === memberId)
                                              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                  
                  if (utangTx.length === 0) {
                      delete userStates[userId];
                      return ctx.reply("✨ Tidak ada utang yang perlu dibayar untuk member ini.");
                  }
                  
                  let totalDebt = utangTx.reduce((acc, t) => acc + (t.price - (t.paidAmount || 0)), 0);
                  let remainingPayment = nominal;
                  
                  for (let tx of utangTx) {
                      let unpaidForTx = tx.price - (tx.paidAmount || 0);
                      if (remainingPayment >= unpaidForTx) {
                          remainingPayment -= unpaidForTx;
                          tx.paidAmount = tx.price;
                          tx.status = 'Sukses (Lunas)'; 
                      } else if (remainingPayment > 0) {
                          tx.paidAmount = (tx.paidAmount || 0) + remainingPayment;
                          remainingPayment = 0;
                      }
                  }
                  
                  db.transactions = transactions;
                  writeDB(db);
                  
                  delete userStates[userId];
                  
                  if (nominal === totalDebt) {
                      await ctx.reply(`✅ Ok siap! Utang telah lunas. Pembayaran Rp ${nominal.toLocaleString('id-ID')} telah sukses.`);
                  } else if (nominal < totalDebt) {
                      const sisa = totalDebt - nominal;
                      await ctx.reply(`✅ Pembayaran Rp ${nominal.toLocaleString('id-ID')} diterima.\n\n⚠️ Ini kurang Rp ${sisa.toLocaleString('id-ID')} ya kk, jangan lambat bayar! Di bagian ringkasan/transaksi bot udah dicatat bahwa sebagian udah dibayar ya.`);
                  } else {
                      const kembalian = nominal - totalDebt;
                      await ctx.reply(`✅ Ok siap! Utang telah lunas. Pembayaran Rp ${nominal.toLocaleString('id-ID')} telah sukses.\n\n💸 Kembalian: Rp ${kembalian.toLocaleString('id-ID')}`);
                  }
                  
                  return;
              }
              case 'WAIT_PAYMENT_PASCA': {
                const methodMap: any = { "💵 Cash": "cash", "📝 Utang": "utang", "💳 Saldo": "saldo" };
                const method = methodMap[text.trim()];
                if (text.toLowerCase() === 'batal' || text === '❌ Batal' || text === '❌ Tidak') {
                    if (state.data.memberId) {
                        userStates[userId] = { step: 'LOCKED_MEMBER', data: { memberId: state.data.memberId } };
                        await ctx.reply("❌ Pembayaran dibatalkan.", { reply_markup: { keyboard: [[{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "🔙 Kembali ke Menu Owner" }]], resize_keyboard: true } });
                    } else {
                        delete userStates[userId];
                        await ctx.reply("❌ Pembayaran dibatalkan.", { reply_markup: { keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }]], resize_keyboard: true } });
                    }
                    return;
                }
                if (!method) {
                    await ctx.reply("❌ Pilihan tidak valid. Silakan gunakan tombol di bawah.");
                    return;
                }
                const isOwner = db.owners.includes(ctx.from?.id);
                if (method !== 'saldo' && !isOwner) {
                    return ctx.reply("❌ Metode pembayaran tidak valid.");
                }
                if (!isOwner) {
                    userStates[userId] = { step: 'ASK_PIN_PASCA', data: { ...state.data, method, ref_id: state.data.ref_id } };
                    return ctx.reply("🔐 *Masukan PIN Keamanan Transaksi*\nSilakan ketik PIN Anda untuk melanjutkan transaksi ini.", { parse_mode: 'Markdown' });
                }
                await processPascaPayment(ctx, state.data.ref_id, method, state.data, state.data.memberId || `MBR-${ctx.from?.id}`);
                break;
              }
              case 'OWNER_ADD_MEMBER_WA':
                state.data.wa = text;
                const newMemberId = `MBR-${Date.now()}`;
                members.push({
                  id: newMemberId,
                  name: state.data.username,
                  whatsapp: state.data.wa,
                  telegram: '',
                  balance: 0,
                  type: 'Biasa'
                });
                delete userStates[userId];
                db.members = members;
                writeDB(db);
                await ctx.reply(`✅ Berhasil menambahkan member ${state.data.username} (${newMemberId})!`);
                return;

              
              case 'AWAITING_WA_TARGET':
                db.waAnnouncementTarget = text;
                writeDB(db);
                delete userStates[userId];
                await ctx.reply(`✅ Target ID *${text}* telah diatur sebagai tujuan pengumuman.`, { parse_mode: 'Markdown' });
                return;

                            case 'AWAITING_ANNOUNCEMENT_TEXT':
                if (text === "🔙 Kembali ke Menu Owner") return; // Let it fall through to the handler
                const targetAnnounce = db.waAnnouncementTarget;
                if (!targetAnnounce) {
                    await ctx.reply("❌ Target WA belum diatur!");
                    delete userStates[userId];
                    return;
                }
                
                db.waAnnouncementText = text;
                db.waAnnouncementMedia = null;
                const parsedText = await parseAnnouncementText(text);
                db.waAnnouncementMediaType = null;
                db.waAnnouncementEnabled = true;
                writeDB(db);
                
                await ctx.reply("✅ Teks pengumuman berhasil disimpan dan diaktifkan (otomatis kirim setiap 1 jam). Sedang mencoba mengirim percobaan pertama...");
                delete userStates[userId];
                
                if (waSocket) {
                    try {
                        await waSocket.sendMessage(targetAnnounce, { text: parsedText });
                    } catch (err: any) {
                        await ctx.reply("⚠️ Gagal mengirim percobaan pertama: " + err.message);
                    }
                } else {
                    await ctx.reply("⚠️ WhatsApp belum terhubung. Pengumuman akan dikirim saat WA terhubung.");
                }
                return; // Let it fall through to the handler
                const target = db.waAnnouncementTarget;
                if (!target) {
                    await ctx.reply("❌ Target WA belum diatur!");
                    delete userStates[userId];
                    return;
                }
                if (!waSocket) {
                    await ctx.reply("❌ Sistem WhatsApp belum terhubung!");
                    return;
                }
                try {
                    await waSocket.sendMessage(target, { text: text });
                    await ctx.reply("✅ Pengumuman berhasil dikirim ke WhatsApp!");
                    delete userStates[userId];
                } catch (err: any) {
                    await ctx.reply("❌ Gagal mengirim pengumuman: " + err.message);
                }
                return;

              case 'AWAITING_USERNAME':
                const isTaken = Object.values(registeredUsers).some(u => u.username.toLowerCase() === text.toLowerCase()) || members.some(m => m.name.toLowerCase() === text.toLowerCase());
                if (isTaken) {
                  await ctx.reply(`❌ Waduh, username ${text} udah dipakai kak.\nCoba username lain ya.`);
                  return;
                }
                state.data.username = text;
                state.step = 'AWAITING_WA';
                await ctx.reply(`👍 Oke, username ${text} aman!\n\nSekarang kirim Nomor WhatsApp aktif kakak ya (contoh: 08123456789):`);
                return;
                  
              case 'AWAITING_WA':
                state.data.wa = text;
                state.step = 'AWAITING_OTP';
                const otp = Math.floor(100 + Math.random() * 900).toString();
                state.data.generatedOtp = otp;
                  
                if (waSocket && waStatus.includes('Connected')) {
                  let cleanWa = text.replace(/\D/g, "");
                  if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
                  const jid = `${cleanWa}@s.whatsapp.net`;
                    
                  try {
                    await waSocket.sendMessage(jid, { text: `Halo kak ${state.data.username}! 👋\n\nIni kode rahasia (OTP) buat daftar di E4 Store: *${otp}*\n\nJangan kasih tau siapa-siapa ya kak! 🤫` });
                    await ctx.reply(`📲 Kode OTP udah Chuna kirim ke WhatsApp kakak. Yuk masukin kode OTP-nya di sini:`);
                  } catch (e) {
                    await ctx.reply(`Waduh, Chuna gagal kirim kode OTP ke WhatsApp kakak nih. Pastikan nomornya aktif ya.\n\nKarena lagi ada kendala, Chuna kasih kode OTP-nya di sini aja ya kak: *${otp}*`);
                  }
                } else {
                  await ctx.reply(`Hmm, WhatsApp server Chuna lagi offline nih kak. 😔\n\nTapi tenang aja, untuk sekarang Chuna kasih kode OTP-nya langsung di sini ya: *${otp}*\n\nYuk ketik ulang kodenya di bawah!`);
                }
                return;
                  
              case 'AWAITING_OTP':
                if (text !== state.data.generatedOtp) {
                   await ctx.reply(`❌ Yah kode OTP-nya salah kak. Coba cek lagi ya kodenya!`);
                   return;
                }
                state.step = 'AWAITING_PIN';
                await ctx.reply(`Yeay kode OTP berhasil dikonfirmasi! 🎉\n\nSatu langkah lagi nih kak. Yuk buat PIN rahasia kakak (6 angka) biar transaksi kakak aman bareng Chuna! 🔒`);
                return;
                  
              case 'AWAITING_PIN':
                state.data.pin = text;
                state.step = 'REGISTERED';
                registeredUsers[userId] = {
                  username: state.data.username,
                  wa: state.data.wa,
                  pin: state.data.pin
                };
                
                let cleanUserWa = state.data.wa.replace(/\D/g, "");
                if (cleanUserWa.startsWith("0")) cleanUserWa = "62" + cleanUserWa.substring(1);
                
                const existingMember = members.find(m => {
                  let mWa = m.whatsapp.replace(/\D/g, "");
                  if (mWa.startsWith("0")) mWa = "62" + mWa.substring(1);
                  return mWa === cleanUserWa;
                });
                
                if (existingMember) {
                  existingMember.telegram = `ID:${userId}`;
                  // Optionally update name if desired, but we can keep the owner's set name or user's set name
                  // existingMember.name = state.data.username;
                } else {
                  members.push({
                    id: `MBR-${userId}`,
                    name: state.data.username,
                    whatsapp: state.data.wa,
                    telegram: `ID:${userId}`,
                    balance: 0,
                    type: 'Biasa'
                  });
                }
                
                delete userStates[userId];
                db.members = members; db.registeredUsers = registeredUsers; writeDB(db);
                await ctx.reply(`Yeayyy! Selamat datang di keluarga E4 Store kak ${state.data.username}! 🥳\n\nSekarang kakak udah bisa nikmatin semua fitur keren dari Chuna.\n\nKetik /menu buat mulai ya kak!`, {
                  reply_markup: {
                    keyboard: [
                      [{ text: "💵 Cek Saldo" }],
                      [{ text: "🧾 Cek Tagihan" }],
                      [{ text: "📋 Menu Produk" }]
                    ],
                    resize_keyboard: true
                  }
                });
                return;
            }
        }
        
        // Product logic check
        try {
            let handled = false;
            // Check prepaid types (from state)
            try {
                const prepaid = await getDigiflazzProducts("prepaid");
                if (state && state.step === 'PREPAID_SELECT_TYPE' && !handled) {
                    const brandProducts = prepaid.filter((p: any) => p.brand === state.data.brand);
                    const types = [...new Set(brandProducts.map((p: any) => p.type))].filter(Boolean);
                    
                    if (types.includes(text)) {
                        let filtered = brandProducts.filter((p: any) => p.type === text);
                        filtered.sort((a: any, b: any) => a.price - b.price); filtered = filtered.slice(0, 100);
                        
                        const keyboard = [];
                        for (let i = 0; i < filtered.length; i += 2) {
                            const row = [{ text: getProductButtonText(filtered[i]) }];
                            if (filtered[i+1]) row.push({ text: getProductButtonText(filtered[i+1]) });
                            keyboard.push(row);
                        }
                        keyboard.push([{ text: "🔙 Kembali" }]);
                        
                        await ctx.reply(`📋 *Produk ${state.data.brand} - ${text}*\nSilakan pilih produk yang ingin dibeli:`, { 
                            parse_mode: 'Markdown',
                            reply_markup: { keyboard: keyboard, resize_keyboard: true }
                        });
                        handled = true;
                    }
                }
            } catch(e) { console.error("Error:", e.message); }
            
            // Check prepaid categories
            try {
                const prepaid = await getDigiflazzProducts("prepaid");
                const prepaidCats = [...new Set(prepaid.map((p: any) => p.category))].filter(Boolean);
                if (prepaidCats.includes(text)) {
                    const filtered = prepaid.filter((p: any) => p.category === text);
                    const brands = [...new Set(filtered.map((p: any) => p.brand))].sort();
                    
                    if (brands.length === 1 && brands[0] === text) {
                        // Skip category step, go straight to products
                        const productsForBrand = prepaid.filter((p: any) => p.brand === text).slice(0, 100);
                        const keyboard = [];
                        for (let i = 0; i < productsForBrand.length; i += 2) {
                            const row = [{ text: getProductButtonText(productsForBrand[i]) }];
                            if (productsForBrand[i+1]) row.push({ text: getProductButtonText(productsForBrand[i+1]) });
                            keyboard.push(row);
                        }
                        keyboard.push([{ text: "🔙 Kembali" }]);
                        
                        await ctx.reply(`📋 *Produk ${text}*\nSilakan pilih produk yang ingin dibeli:`, { 
                            parse_mode: 'Markdown',
                            reply_markup: { keyboard: keyboard, resize_keyboard: true }
                        });
                        handled = true;
                    } else {
                        const keyboard = [];
                        for (let i = 0; i < brands.length; i += 2) {
                            const row = [{ text: brands[i] }];
                            if (brands[i+1]) row.push({ text: brands[i+1] });
                            keyboard.push(row);
                        }
                        keyboard.push([{ text: "🔙 Kembali" }]);

                        await ctx.reply(`📋 *Kategori ${text} (Prabayar)*\nSilakan pilih brand di bawah ini:`, { 
                            parse_mode: 'Markdown',
                            reply_markup: {
                                keyboard: keyboard,
                                resize_keyboard: true
                            }
                        });
                        handled = true;
                    }
                }
            } catch (e) { console.error("Error in prepaidBrands check:", e.message); }

            if (handled) return;

            // Check pasca categories
            try {
                const pasca = await getDigiflazzProducts("pasca");
                const pascaCats = [...new Set(pasca.map((p: any) => p.category))].filter(Boolean);
                if (pascaCats.includes(text)) {
                    const filtered = pasca.filter((p: any) => p.category === text);
                    const brands = [...new Set(filtered.map((p: any) => p.brand))].sort();
                    
                    if (brands.length === 1 && brands[0] === text) {
                        // Skip category step, go straight to products
                        const productsForBrand = pasca.filter((p: any) => p.brand === text).slice(0, 100);
                        const keyboard = [];
                        for (let i = 0; i < productsForBrand.length; i += 2) {
                            const row = [{ text: getProductButtonText(productsForBrand[i]) }];
                            if (productsForBrand[i+1]) row.push({ text: getProductButtonText(productsForBrand[i+1]) });
                            keyboard.push(row);
                        }
                        keyboard.push([{ text: "🔙 Kembali" }]);
                        
                        await ctx.reply(`🧾 *Layanan ${text}*\nSilakan pilih layanan untuk melihat detail:`, { 
                            parse_mode: 'Markdown',
                            reply_markup: { keyboard: keyboard, resize_keyboard: true }
                        });
                        handled = true;
                    } else {
                        const keyboard = [];
                        for (let i = 0; i < brands.length; i += 2) {
                            const row = [{ text: brands[i] }];
                            if (brands[i+1]) row.push({ text: brands[i+1] });
                            keyboard.push(row);
                        }
                        keyboard.push([{ text: "🔙 Kembali" }]);

                        await ctx.reply(`🧾 *Kategori ${text} (Pascabayar)*\nSilakan pilih layanan di bawah ini:`, { 
                            parse_mode: 'Markdown',
                            reply_markup: {
                                keyboard: keyboard,
                                resize_keyboard: true
                            }
                        });
                        handled = true;
                    }
                }
            } catch (e) { console.error("Error in prepaidBrands check:", e.message); }

            if (handled) return;
            
            // Check prepaid brands
            try {
                const prepaid = await getDigiflazzProducts("prepaid");
                const prepaidBrands = [...new Set(prepaid.map((p: any) => p.brand))].filter(Boolean);
                if (prepaidBrands.includes(text)) {
                    let filtered = prepaid.filter((p: any) => p.brand === text);
                    const types = [...new Set(filtered.map((p: any) => p.type))].filter(Boolean);
                    
                    if (types.length > 1) {
                        const prevMemberId = userStates[userId]?.data?.memberId;
                        userStates[userId] = { step: 'PREPAID_SELECT_TYPE', data: { brand: text, memberId: prevMemberId } };
                        
                        const keyboard = [];
                        for (let i = 0; i < types.length; i += 2) {
                            const row = [{ text: String(types[i]) }];
                            if (types[i+1]) row.push({ text: String(types[i+1]) });
                            keyboard.push(row);
                        }
                        keyboard.push([{ text: "🔙 Kembali" }]);

                        await ctx.reply(`📋 *Tipe Produk ${text}*\nSilakan pilih kategori (Misal: Umum/Membership/dll):`, { 
                            parse_mode: 'Markdown',
                            reply_markup: { keyboard: keyboard, resize_keyboard: true }
                        });
                        handled = true;
                    } else {
                        filtered.sort((a: any, b: any) => a.price - b.price);
                        filtered = filtered.slice(0, 100);
                        const keyboard = [];
                        for (let i = 0; i < filtered.length; i += 2) {
                            const row = [{ text: getProductButtonText(filtered[i]) }];
                            if (filtered[i+1]) row.push({ text: getProductButtonText(filtered[i+1]) });
                            keyboard.push(row);
                        }
                        keyboard.push([{ text: "🔙 Kembali" }]);

                        await ctx.reply(`📋 *Produk ${text}*\nSilakan pilih produk yang ingin dibeli:`, { 
                            parse_mode: 'Markdown',
                            reply_markup: { keyboard: keyboard, resize_keyboard: true }
                        });
                        handled = true;
                    }
                }
                
                // Also check if text is a prepaid product name!
                if (!handled) {
                    const cleanText = cleanProductName(text);
                    const matchedProduct = prepaid.find((p: any) => p.product_name === cleanText);
                    if (matchedProduct) {
                        const prevMemberId = userStates[userId]?.data?.memberId;
                        
                        // Calculate price
                        const memberId = prevMemberId || `MBR-${ctx.from?.id}`;
                        const member = members.find(m => m.id === memberId || m.telegram?.includes(ctx.from?.id?.toString() || ''));
                        const memberType = member?.type || 'Biasa';
                        const isOwnerCtx = db.owners.includes(ctx.from?.id);
                        const adminFee = isOwnerCtx ? (productFees[matchedProduct.buyer_sku_code]?.owner || 0) : (memberType === 'VIP' ? (productFees[matchedProduct.buyer_sku_code]?.vip || 0) : (productFees[matchedProduct.buyer_sku_code]?.biasa || 0));
                        const total = matchedProduct.price + adminFee;
                        if (!matchedProduct.buyer_product_status || !matchedProduct.seller_product_status) {
                            return ctx.reply("❌ Mohon maaf kak, produk " + matchedProduct.product_name + " sedang gangguan/cut off dari pusat.");
                        }
                        
                        userStates[userId] = {
                            step: 'PREPAID_INPUT_NUMBER',
                            data: { product: matchedProduct, memberId: prevMemberId, totalBayar: total, adminFee }
                        };
                        
                        await ctx.reply(`🛒 *Detail Pembelian*\n\nNama: ${matchedProduct.product_name}\nBrand: ${matchedProduct.brand}\n\n💎 *TOTAL BAYAR: Rp ${total.toLocaleString('id-ID')}*\n\n✏️ *Silakan masukkan nomor tujuan/hp untuk melakukan pembelian:*`, {
                            parse_mode: 'Markdown',
                            reply_markup: {
                                keyboard: [[{ text: "❌ Batal" }]],
                                resize_keyboard: true
                            }
                        });
                        handled = true;
                    }
                }
            } catch (e) { console.error("Error in prepaidBrands check:", e.message); }

            if (handled) return;

            // Check pasca brands
            try {
                const pasca = await getDigiflazzProducts("pasca");
                const pascaBrands = [...new Set(pasca.map((p: any) => p.brand))].filter(Boolean);
                if (pascaBrands.includes(text)) {
                    let filtered = pasca.filter((p: any) => p.brand === text); filtered = filtered.slice(0, 100);
                    
                    const keyboard = [];
                    for (let i = 0; i < filtered.length; i += 2) {
                        const row = [{ text: getProductButtonText(filtered[i]) }];
                        if (filtered[i+1]) row.push({ text: getProductButtonText(filtered[i+1]) });
                        keyboard.push(row);
                    }
                    keyboard.push([{ text: "🔙 Kembali" }]);

                    await ctx.reply(`🧾 *Layanan ${text}*\nSilakan pilih layanan untuk melihat detail:`, { 
                        parse_mode: 'Markdown',
                        reply_markup: {
                            keyboard: keyboard,
                            resize_keyboard: true
                        }
                    });
                    handled = true;
                }
                
                // Also check if text is a pasca product name!
                if (!handled) {
                    const cleanText = cleanProductName(text);
                    const matchedProduct = pasca.find((p: any) => p.product_name === cleanText);
                    if (matchedProduct) {
                        const prevMemberId = userStates[userId]?.data?.memberId;
                        if (!matchedProduct.buyer_product_status || !matchedProduct.seller_product_status) {
                            return ctx.reply("❌ Mohon maaf kak, produk " + matchedProduct.product_name + " sedang gangguan/cut off dari pusat.");
                        }
                        userStates[userId] = { 
                            step: 'PASCA_INPUT_NUMBER', 
                            data: { product: matchedProduct, memberId: prevMemberId } 
                        };
                        await ctx.reply(`🛒 *Detail Layanan*\n\nNama: ${matchedProduct.product_name}\nBrand: ${matchedProduct.brand}\nKategori: ${matchedProduct.category}\n\n✏️ *Silakan masukkan nomor tujuan/pelanggan untuk mengecek tagihan:*`, {
                            parse_mode: 'Markdown',
                            reply_markup: {
                                keyboard: [[{ text: "❌ Batal" }]],
                                resize_keyboard: true
                            }
                        });
                        handled = true;
                    }
                }
            } catch (e) { console.error("Error in prepaidBrands check:", e.message); }

            if (handled) return;

            // If not handled, just ignore or let it pass
            return next();
        } catch (e) {
            return next();
        }
      });
      
bot.launch();

      botStatus = "Connected as @" + botInfo.username;
      console.log("Bot started successfully:", botInfo.username);
    } catch (error: any) {
      botStatus = "Error: " + error.message;
      bot = null;
      console.error("Bot start failed:", error);
      throw error;
    }
  }

  app.post("/api/bot/configure", async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Token is required" });
    try {
      db.telegramToken = token;
      writeDB(db);
      await startTelegramBot(token);
      res.json({ success: true, message: "Bot connected and running" });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  if (db.telegramToken) {
    console.log("Auto-starting Telegram bot...");
    startTelegramBot(db.telegramToken).catch(e => console.error("Auto-start Telegram bot failed", e));
  }


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
  
  // Enable graceful stop
  process.once('SIGINT', () => bot && bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot && bot.stop('SIGTERM'));
}

startServer();
