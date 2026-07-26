const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `const vnText = \`Sama-sama, Kak \${customerName}! Terima kasih sudah berbelanja di E4 Store. Semoga pulsa atau kuotanya langsung terpakai dengan lancar. Kalau ada kendala atau mau order lagi, jangan sungkan chat Chuna lagi ya!\`;
                    const vnPath = \`./tmp_vn_\${Date.now()}_\${Math.floor(Math.random()*1000)}.mp3\`;
                    const tts = new EdgeTTS({ voice: 'id-ID-GadisNeural', lang: 'id-ID', outputFormat: 'audio-24khz-48kbitrate-mono-mp3' });
                    await tts.ttsPromise(vnText, vnPath);
                    await waSocket.sendPresenceUpdate("recording", jid);
                    await new Promise(r => setTimeout(r, 4500));
                    await waSocket.sendPresenceUpdate("paused", jid);
                    await waSocket.sendMessage(jid, { audio: { url: vnPath }, mimetype: 'audio/mp4', ptt: true }, { quoted: msg });
                    setTimeout(() => { try { fs.unlinkSync(vnPath); } catch(e){} }, 5000);`;

const replacement = `const vnText = \`Sama-sama, Kak \${customerName}! Terima kasih sudah berbelanja di E4 Store. Semoga pulsa/kuotanya langsung terpakai dengan lancar. Kalau ada kendala atau mau order lagi, jangan sungkan chat Chuna lagi ya! 😊\`;
                    const baseVnName = \`./tmp_vn_\${Date.now()}_\${Math.floor(Math.random()*1000)}\`;
                    const vnPathMp3 = \`\${baseVnName}.mp3\`;
                    const vnPathOgg = \`\${baseVnName}.ogg\`;
                    const tts = new EdgeTTS({ voice: 'id-ID-GadisNeural', lang: 'id-ID', outputFormat: 'audio-24khz-48kbitrate-mono-mp3' });
                    await tts.ttsPromise(vnText, vnPathMp3);
                    await waSocket.sendPresenceUpdate("recording", jid);
                    await new Promise(r => setTimeout(r, 4500));
                    await waSocket.sendPresenceUpdate("paused", jid);
                    
                    const { exec } = await import('child_process');
                    await new Promise((resolve, reject) => {
                        exec(\`ffmpeg -i \${vnPathMp3} -c:a libopus -vbr on -compression_level 10 -frame_duration 20 -application voip \${vnPathOgg}\`, (error) => {
                            if (error) {
                                console.error("FFmpeg error:", error);
                                reject(error);
                            } else {
                                resolve(true);
                            }
                        });
                    });

                    await waSocket.sendMessage(jid, { audio: { url: vnPathOgg }, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: msg });
                    setTimeout(() => { 
                        try { fs.unlinkSync(vnPathMp3); } catch(e){} 
                        try { fs.unlinkSync(vnPathOgg); } catch(e){} 
                    }, 5000);`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, replacement);
    fs.writeFileSync('server.ts', code);
    console.log("Patched messages.upsert ffmpeg successfully!");
} else {
    console.log("Target string not found.");
}
