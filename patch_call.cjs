const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `    waSocket.ev.on("call", async (calls) => {
      for (const call of calls) {
        if (call.status === "offer") {
          const replyMsg = \`Maaf banget, Kak! Chuna nggak bisa angkat telepon sekarang (lagi sibuk ngurus pelanggan lain, hihi). Tapi jangan khawatir, mending langsung chat Bot Telegram resmi E4Store aja! Di sana Chuna 24 jam siap bantu jawab semua pertanyaan kamu dengan cepat dan ramah~Chuna asisten E4Store, transaksi langsung otomatis kok, tetap aman dan terpercaya! Yuk, mampir~ Chuna tunggu, ya! 😘🐾\`;
          try {
            if (waSocket) {
              await waSocket.rejectCall(call.id, call.from);
              await waSocket.presenceSubscribe(call.from);
              await waSocket.sendPresenceUpdate('composing', call.from);
              await new Promise(r => setTimeout(r, 1200));
              await waSocket.sendPresenceUpdate('paused', call.from);
              await waSocket.sendMessage(call.from, { text: replyMsg });
            }
          } catch (e) {
            console.error("Failed to reject call", e);
          }
        }
      }
    });`;

const replacement = `    waSocket.ev.on("call", async (calls) => {
      for (const call of calls) {
        if (call.status === "offer") {
          try {
            if (waSocket) {
              await waSocket.rejectCall(call.id, call.from);
              
              let customerName = "";
              const cleanJid = call.from.split('@')[0];
              const member = db.members.find((m: any) => m.whatsapp && m.whatsapp.replace(/\\D/g, '').includes(cleanJid));
              if (member && member.name) {
                  customerName = " " + member.name;
              }
              
              const replyMsg = \`Maaf banget, Kak\${customerName}! Chuna nggak bisa angkat telepon sekarang (lagi sibuk ngurus pelanggan lain, hihi). Tapi jangan khawatir, mending langsung chat Bot Telegram resmi E4Store aja! Di sana Chuna 24 jam siap bantu jawab semua pertanyaan kamu dengan cepat dan ramah~Chuna asisten E4Store, transaksi langsung otomatis kok, tetap aman dan terpercaya! Yuk, mampir~ Chuna tunggu, ya! 😘🐾\`;
              
              const baseVnName = path.join(process.cwd(), \`tmp_call_vn_\${Date.now()}_\${Math.floor(Math.random()*1000)}\`);
              const vnPathMp3 = \`\${baseVnName}.mp3\`;
              const vnPathOgg = \`\${baseVnName}.ogg\`;
              const tts = new EdgeTTS({ voice: 'id-ID-GadisNeural', lang: 'id-ID', outputFormat: 'audio-24khz-48kbitrate-mono-mp3', pitch: '+20Hz', rate: '+15%' });
              
              await tts.ttsPromise(replyMsg, vnPathMp3);
              
              await waSocket.presenceSubscribe(call.from);
              await waSocket.sendPresenceUpdate("recording", call.from);
              await new Promise(r => setTimeout(r, 4500));
              await waSocket.sendPresenceUpdate("paused", call.from);
              
              const { exec } = await import('child_process');
              await new Promise((resolve, reject) => {
                  exec(\`ffmpeg -y -i \${vnPathMp3} -c:a libopus -b:a 48k -vbr on -compression_level 10 -frame_duration 20 -application voip \${vnPathOgg}\`, (error) => {
                      if (error) {
                          console.error("FFmpeg error:", error);
                          reject(error);
                      } else {
                          resolve(true);
                      }
                  });
              });
              
              const audioBuffer = fs.readFileSync(vnPathOgg);
              await waSocket.sendMessage(call.from, { audio: audioBuffer, mimetype: 'audio/mp4', ptt: true });
              
              setTimeout(() => { 
                   try { fs.unlinkSync(vnPathMp3); } catch(e){} 
                   try { fs.unlinkSync(vnPathOgg); } catch(e){} 
              }, 5000);
            }
          } catch (e) {
            console.error("Failed to reject call or send VN", e);
          }
        }
      }
    });`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server.ts', code);
    console.log("Patched call rejection successfully");
} else {
    console.log("Target not found!");
}
