const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetInsert = `    waSocket.ev.on("messages.upsert", async (m) => {
      const msg = m.messages[0];
      if (!msg.key.fromMe && m.type === "notify" && msg.message) {`;

const viewOnceLogic = `
        // Anti View Once Logic
        const isViewOnce = msg.message?.viewOnceMessage || msg.message?.viewOnceMessageV2 || msg.message?.viewOnceMessageV2Extension;
        if (isViewOnce) {
            try {
                const messageType = Object.keys(isViewOnce.message)[0];
                const mediaMessage = isViewOnce.message[messageType];
                
                const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
                const stream = await downloadContentFromMessage(mediaMessage, messageType.replace('Message', ''));
                let buffer = Buffer.from([]);
                for await(const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                
                if (db.waAnnouncementTarget && waSocket) {
                    const senderJid = msg.key.remoteJid;
                    const senderNum = senderJid ? senderJid.split('@')[0] : 'Tidak diketahui';
                    const senderName = msg.pushName || 'Pelanggan';
                    
                    const caption = \`🤫 *ANTI VIEW ONCE DETECTED*\\n👤 Dari: \${senderName} (\${senderNum})\\n\\nPelanggan mengirim pesan sekali lihat, ini adalah salinannya.\`;
                    
                    if (messageType === 'imageMessage') {
                        await waSocket.sendMessage(db.waAnnouncementTarget, { image: buffer, caption: caption });
                    } else if (messageType === 'videoMessage') {
                        await waSocket.sendMessage(db.waAnnouncementTarget, { video: buffer, caption: caption });
                    }
                }
            } catch (error) {
                console.error("Gagal memproses view once message:", error);
            }
        }
`;

if (code.includes(targetInsert) && !code.includes("Anti View Once Logic")) {
    code = code.replace(targetInsert, targetInsert + viewOnceLogic);
    fs.writeFileSync('server.ts', code);
    console.log("View Once logic injected successfully!");
} else {
    console.log("Target insertion point not found or logic already exists.");
}
