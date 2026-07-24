const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex = /if \(targetUrls\.length > 0\) \{\s*for \(const mediaUrl of targetUrls\) \{[\s\S]*?\} catch\(e\) \{\}\s*\}\s*\}/g;

const match = regex.exec(code);
if (match) {
    const replace = `if (targetUrls.length > 0) {
                            if (isImage && targetUrls.length > 1) {
                                await ctx.replyWithChatAction("upload_photo").catch(() => {});
                                const mediaGroup = targetUrls.map((u, i) => ({
                                    type: 'photo',
                                    media: u,
                                    caption: i === 0 ? "✅ Semua gambar berhasil di-download!" : undefined
                                }));
                                try {
                                    for (let i = 0; i < mediaGroup.length; i += 10) {
                                        await ctx.telegram.sendMediaGroup(ctx.chat.id, mediaGroup.slice(i, i + 10));
                                    }
                                } catch (e) {
                                    for (const mediaUrl of targetUrls) {
                                        await ctx.replyWithPhoto(mediaUrl).catch(()=>{});
                                    }
                                    await ctx.reply("✅ Semua gambar berhasil di-download!");
                                }
                            } else {
                                for (const mediaUrl of targetUrls) {
                                    try {
                                        if (isVideo) {
                                            if (mediaUrl.includes('.jpeg') || mediaUrl.includes('.jpg') || mediaUrl.includes('.png')) continue;
                                            await ctx.replyWithChatAction("upload_video").catch(() => {});
                                            try {
                                                const res = await fetch(mediaUrl);
                                                const arrayBuffer = await res.arrayBuffer();
                                                const buffer = Buffer.from(arrayBuffer);
                                                if (buffer.length > 49.5 * 1024 * 1024) {
                                                    await ctx.reply("❌ Maaf Kak, ukuran video terlalu besar (Maksimal 50MB untuk Bot Telegram).");
                                                    break;
                                                }
                                                await ctx.replyWithVideo({ source: buffer }, { caption: "✅ Video berhasil di-download!" });
                                                break;
                                            } catch (e) {
                                                await ctx.replyWithVideo({ url: mediaUrl }, { caption: "✅ Video berhasil di-download!" });
                                                break;
                                            }
                                        } 
                                        else if (isAudio) {
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
                                        } else {
                                            await ctx.replyWithPhoto(mediaUrl, { caption: "✅ Gambar berhasil di-download!" });
                                            break;
                                        }
                                    } catch(e) {}
                                }
                            }
                        }`;

    code = code.replace(match[0], replace);
    fs.writeFileSync('server.ts', code);
    console.log("Patched media group for images!");
} else {
    console.log("Could not find the target code to patch!");
}
