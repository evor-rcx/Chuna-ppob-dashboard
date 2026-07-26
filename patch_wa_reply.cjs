const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `waSocket.ev.on("messages.upsert", async (m) => {
      const msg = m.messages[0];
      if (!msg.key.fromMe && m.type === "notify") {
        console.log("Got WA message:", msg.message?.conversation);
      }
    });`;

const replacement = `const repliedThanks = new Set<string>();
    waSocket.ev.on("messages.upsert", async (m) => {
      const msg = m.messages[0];
      if (!msg.key.fromMe && m.type === "notify" && msg.message) {
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes("makasih") || lowerText.includes("mksih") || lowerText.includes("makasi") || lowerText.includes("terima kasih") || lowerText.includes("thanks") || lowerText.includes("tq") || lowerText.includes("suwun")) {
            const jid = msg.key.remoteJid;
            
            if (jid && !repliedThanks.has(jid)) {
                repliedThanks.add(jid);
                // Hapus dari cache setelah 1 jam
                setTimeout(() => repliedThanks.delete(jid), 3600000);
                
                let customerName = msg.pushName || "Kakak";
                const cleanJid = jid.split('@')[0];
                const member = db.members.find((m: any) => m.whatsapp && m.whatsapp.replace(/\\D/g, '').includes(cleanJid));
                if (member && member.name) {
                    customerName = member.name;
                } else {
                    // Cari di db.transactions siapa tau ada target (nama)
                    const tx = db.transactions.slice().reverse().find((t: any) => t.waJid === jid || (member && t.memberId === member.id));
                    if (tx && tx.target && !tx.target.match(/^\\d+$/)) {
                        customerName = tx.target;
                    }
                }
                
                try {
                    const vnText = \`Sama-sama, Kak \${customerName}! Terima kasih sudah berbelanja di E4 Store. Semoga pulsa atau kuotanya langsung terpakai dengan lancar. Kalau ada kendala atau mau order lagi, jangan sungkan chat Chuna lagi ya!\`;
                    const vnPath = \`./tmp_vn_\${Date.now()}_\${Math.floor(Math.random()*1000)}.mp3\`;
                    const tts = new EdgeTTS({ voice: 'id-ID-GadisNeural', lang: 'id-ID', outputFormat: 'audio-24khz-48kbitrate-mono-mp3' });
                    await tts.ttsPromise(vnText, vnPath);
                    await waSocket.sendPresenceUpdate("recording", jid);
                    await new Promise(r => setTimeout(r, 4500));
                    await waSocket.sendPresenceUpdate("paused", jid);
                    await waSocket.sendMessage(jid, { audio: { url: vnPath }, mimetype: 'audio/mp4', ptt: true }, { quoted: msg });
                    setTimeout(() => { try { fs.unlinkSync(vnPath); } catch(e){} }, 5000);
                } catch (e) {
                    console.error("Gagal kirim balasan makasih VN:", e);
                }
            }
        }
      }
    });`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, replacement);
    fs.writeFileSync('server.ts', code);
    console.log("Patched messages.upsert successfully!");
} else {
    console.log("Target string not found.");
}
