const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Replace the keyboard
code = code.replace(
    /\[\{ text: "🎥 Video" \}, \{ text: "🎵 Audio \/ MP3" \}\],/,
    `[{ text: "🎥 Video" }, { text: "🎵 Audio / MP3" }],\n                                [{ text: "🎙️ Voice Note" }, { text: "📸 Gambar" }],`
);
code = code.replace(
    /\[\{ text: "📸 Gambar" \}, \{ text: "❌ Batal" \}\]/,
    `[{ text: "❌ Batal" }]`
);

// Add the Voice Note check
code = code.replace(
    /const isVideo = format === "🎥 Video";/,
    `const isVideo = format === "🎥 Video";\n                        const isVoiceNote = format === "🎙️ Voice Note";`
);
code = code.replace(
    /!\["🎥 Video", "🎵 Audio \/ MP3", "📸 Gambar"\]\.includes\(format\)/,
    `!["🎥 Video", "🎵 Audio / MP3", "📸 Gambar", "🎙️ Voice Note"].includes(format)`
);

// Update targetUrls filter logic for Voice Note
code = code.replace(
    /if \(isAudio && \(lu\.includes\('\.mp3'\)/,
    `if ((isAudio || isVoiceNote) && (lu.includes('.mp3')`
);
code = code.replace(
    /else if \(isAudio && result\?\.mp3\)/,
    `else if ((isAudio || isVoiceNote) && result?.mp3)`
);
code = code.replace(
    /if \(isAudio\) targetUrls = allUrls\.filter\(u => !u\.includes\('\.jpg'\) && !u\.includes\('\.mp4'\)\);/,
    `if (isAudio || isVoiceNote) targetUrls = allUrls.filter(u => !u.includes('.jpg') && !u.includes('.mp4'));`
);

// Update download logic
const audioLogic = `else if (isAudio) {
                                            if (mediaUrl.includes('.jpeg') || mediaUrl.includes('.jpg') || mediaUrl.includes('.png')) continue;
                                            await ctx.replyWithChatAction("upload_voice").catch(() => {});
                                            try {
                                                const res = await fetch(mediaUrl);
                                                const arrayBuffer = await res.arrayBuffer();
                                                const buffer = Buffer.from(arrayBuffer);
                                                if (buffer.length > 49.5 * 1024 * 1024) {
                                                    await ctx.reply("❌ Maaf Kak, ukuran audio terlalu besar (Maksimal 50MB untuk Bot Telegram).");
                                                    break;
                                                }
                                                await ctx.replyWithAudio({ source: buffer }, { caption: "✅ Audio berhasil di-download!" });
                                                break;
                                            } catch (e) {
                                                await ctx.replyWithAudio({ url: mediaUrl }, { caption: "✅ Audio berhasil di-download!" });
                                                break;
                                            }
                                        }`;
const voiceNoteLogic = `else if (isVoiceNote) {
                                            if (mediaUrl.includes('.jpeg') || mediaUrl.includes('.jpg') || mediaUrl.includes('.png')) continue;
                                            await ctx.replyWithChatAction("upload_voice").catch(() => {});
                                            try {
                                                const res = await fetch(mediaUrl);
                                                const arrayBuffer = await res.arrayBuffer();
                                                const buffer = Buffer.from(arrayBuffer);
                                                if (buffer.length > 49.5 * 1024 * 1024) {
                                                    await ctx.reply("❌ Maaf Kak, ukuran voice note terlalu besar.");
                                                    break;
                                                }
                                                await ctx.replyWithVoice({ source: buffer }, { caption: "✅ Voice Note berhasil di-download!" });
                                                break;
                                            } catch (e) {
                                                await ctx.replyWithVoice({ url: mediaUrl }, { caption: "✅ Voice Note berhasil di-download!" });
                                                break;
                                            }
                                        }`;

code = code.replace(audioLogic, audioLogic + '\n                                        ' + voiceNoteLogic);

fs.writeFileSync('server.ts', code);
console.log("Patched Voice Note format!");
