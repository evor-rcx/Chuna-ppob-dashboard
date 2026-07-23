import re

with open('/app/applet/server.ts', 'r') as f:
    content = f.read()

match = re.search(r'  app\.post\("/api/wa/start".*?res\.status\(500\)\.json\(\{ success: false, error: err\.message \}\);\n    \}\n  \}\);', content, re.DOTALL)
if match:
    target = match.group(0)
    print("Found target! Length:", len(target))
    replacement = """  let globalWaPhoneNumber = "";
  let waReconnectAttempts = 0;
  
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
    const { version } = await fetchLatestWaWebVersion().catch(() => ({ version: [2, 3000, 1015901307] as [number, number, number] }));
    
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
           try { fs.rmSync(path.join(process.cwd(), "wa_auth"), { recursive: true, force: true }); } catch (e) { }
           waSocket = null;
        } else {
           if (waReconnectAttempts < 5) {
             waReconnectAttempts++;
             console.log("Reconnecting WA in 3 seconds...");
             setTimeout(startWaSocket, 3000);
           }
        }
      } else if (connection === "open") {
        waReconnectAttempts = 0;
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
          const replyMsg = `Maaf banget, Kak! Chuna nggak bisa angkat telepon sekarang (lagi sibuk ngurus pelanggan lain, hihi). Tapi jangan khawatir, mending langsung chat Bot Telegram resmi E4Store aja! Di sana Chuna 24 jam siap bantu jawab semua pertanyaan kamu dengan cepat dan ramah~\\n\\n👉 https://t.me/Chuna_Chan_bot\\n\\nChuna asisten E4Store, transaksi langsung otomatis kok, tetap aman dan terpercaya! Yuk, mampir~ Chuna tunggu, ya! 😘🐾`;
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

    if (!state.creds.registered && !isRequestingPairingCode && globalWaPhoneNumber) {
      isRequestingPairingCode = true;
      setTimeout(async () => {
        try {
          let cleanNumber = globalWaPhoneNumber.replace(/\\D/g, "");
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

  import fs2 from 'fs';
  if (fs2.existsSync(path.join(process.cwd(), "wa_auth"))) {
      startWaSocket();
  }

  app.post("/api/wa/start", async (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    try {
      waStatus = "Connecting...";
      waPairingCode = "";
      globalWaPhoneNumber = phoneNumber;
      
      if (waSocket) {
        waSocket.ev.removeAllListeners("connection.update");
        waSocket.end(undefined);
        waSocket = null;
      }
      
      waReconnectAttempts = 0;
      await startWaSocket();
      
      res.json({ success: true, message: "Requesting pairing code in background...", status: "Connecting..." });

    } catch (err: any) {
      waStatus = "Error: " + err.message;
      res.status(500).json({ success: false, error: err.message });
    }
  });"""
    content = content.replace(target, replacement)
    with open('/app/applet/server.ts', 'w') as f:
        f.write(content)
else:
    print("Match not found!")

