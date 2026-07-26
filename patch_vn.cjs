const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `await waSocket.sendMessage(jid, { image: buffer, caption: "✅ *Transaksi Berhasil!* Berikut nota pembelian kamu ya, kak. Terima kasih sudah belanja di E4 Store! 🥰" });`;

const replacement = `await waSocket.sendMessage(jid, { image: buffer, caption: "✅ *Transaksi Berhasil!* Berikut nota pembelian kamu ya, kak. Terima kasih sudah belanja di E4 Store! 🥰" });
                                        // --- VOICE NOTE GENERATION ---
                                        try {
                                            const customerName = (member && member.name) ? member.name : tx.target;
                                            const vnText = \`Sama-sama, Kak \${customerName}! Terima kasih sudah berbelanja di E4 Store. Semoga pulsa atau kuotanya langsung terpakai dengan lancar. Kalau ada kendala atau mau order lagi, jangan sungkan chat Chuna lagi ya! 😊\`;
                                            const vnPath = \`./tmp_vn_\${Date.now()}_\${Math.floor(Math.random()*1000)}.mp3\`;
                                            const tts = new EdgeTTS({ voice: 'id-ID-GadisNeural', lang: 'id-ID', outputFormat: 'audio-24khz-48kbitrate-mono-mp3' });
                                            await tts.ttsPromise(vnText, vnPath);
                                            await waSocket.sendPresenceUpdate("recording", jid);
                                            await new Promise(r => setTimeout(r, 4000));
                                            await waSocket.sendPresenceUpdate("paused", jid);
                                            await waSocket.sendMessage(jid, { audio: { url: vnPath }, mimetype: 'audio/mp4', ptt: true });
                                            setTimeout(() => { try { fs.unlinkSync(vnPath); } catch(e){} }, 5000);
                                        } catch (e) { console.error("Gagal kirim VN:", e); }
                                        // -----------------------------`;

if (code.includes(targetStr)) {
    code = code.split(targetStr).join(replacement);
    fs.writeFileSync('server.ts', code);
    console.log("Patched successfully!");
} else {
    console.log("Target string not found.");
}
