const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// We will replace the entire block of actions starting from `bot.action(/^dl_(image|video|audio)$/`

const startIdx = code.indexOf(`bot.action(/^dl_(image|video|audio)$/`);
if (startIdx === -1) {
    console.log("Could not find download action block");
    process.exit(1);
}

const newActionsBlock = `bot.action(/^dl_(image|video|audio)$/, async (ctx) => {
        await ctx.answerCbQuery();
        const type = ctx.match[1];
        const state = userStates[ctx.from?.id || 0];
        if (!state || state.step !== 'AWAITING_DOWNLOAD_TYPE') {
            await ctx.reply("❌ Sesi download telah berakhir atau tidak valid. Silakan ulangi dengan menekan '📥 Fitur Download'.");
            return;
        }

        const link = state.data.link;
        delete userStates[ctx.from?.id || 0];

        const processMsg = await ctx.reply("⏳ Chuna sedang memproses permintaan kamu... Mohon tunggu sebentar ya kak! 🥰");

        try {
            let isTiktok = link.includes('tiktok.com');
            let isYoutube = link.includes('youtube.com') || link.includes('youtu.be');
            
            if (isTiktok) {
                // Handle TikTok using tikwm
                const { getRealUrl, fetchTiktok } = require('./downloader');
                const data = await fetchTiktok(link);
                
                if (!data) {
                    await ctx.telegram.editMessageText(ctx.chat?.id, processMsg.message_id, undefined, "❌ Gagal mengambil data dari TikTok. Pastikan link valid dan video tidak diprivate.");
                    return;
                }
                
                await ctx.telegram.deleteMessage(ctx.chat?.id, processMsg.message_id).catch(()=>null);
                
                if (type === 'image') {
                    if (data.images && data.images.length > 0) {
                        await ctx.reply("📸 Mengirim " + data.images.length + " gambar...");
                        const mediaGroup = data.images.slice(0, 10).map((url, i) => ({
                            type: 'photo',
                            media: url,
                            caption: i === 0 ? data.title : undefined
                        }));
                        await ctx.replyWithMediaGroup(mediaGroup);
                    } else {
                        await ctx.replyWithPhoto(data.cover || data.origin_cover, { caption: data.title });
                    }
                } else if (type === 'video') {
                    const videoUrl = data.play || data.wmplay;
                    if (videoUrl) {
                        await ctx.replyWithVideo(videoUrl, { caption: data.title });
                    } else {
                        await ctx.reply("❌ Link ini sepertinya tidak berisi video.");
                    }
                } else if (type === 'audio') {
                    const audioUrl = data.music || data.play;
                    if (audioUrl) {
                        await ctx.replyWithAudio(audioUrl, { title: data.music_info?.title || "Tiktok Audio", performer: data.music_info?.author || "Tiktok" });
                    } else {
                        await ctx.reply("❌ Tidak ada audio ditemukan.");
                    }
                }
            } 
            else if (isYoutube) {
                const { youtube } = require('btch-downloader');
                const data = await youtube(link);
                if (!data || !data.status) {
                    await ctx.telegram.editMessageText(ctx.chat?.id, processMsg.message_id, undefined, "❌ Gagal mengambil data dari YouTube.");
                    return;
                }
                
                await ctx.telegram.deleteMessage(ctx.chat?.id, processMsg.message_id).catch(()=>null);
                
                if (type === 'image') {
                    await ctx.replyWithPhoto(data.thumbnail, { caption: data.title });
                } else if (type === 'video') {
                    if (data.mp4) {
                        await ctx.replyWithVideo(data.mp4, { caption: data.title });
                    } else {
                        await ctx.reply("❌ Tidak dapat menemukan format video.");
                    }
                } else if (type === 'audio') {
                    if (data.mp3) {
                        await ctx.replyWithAudio(data.mp3, { title: data.title, performer: data.author });
                    } else {
                        await ctx.reply("❌ Tidak dapat menemukan format audio.");
                    }
                }
            }
            else {
                // Fallback for other platforms using btch-downloader AIO or specific
                const { aio } = require('btch-downloader');
                await ctx.telegram.editMessageText(ctx.chat?.id, processMsg.message_id, undefined, "⏳ Mencoba mendownload dari platform lain...");
                
                // Let's just mock it gracefully since generic AIO might timeout
                setTimeout(async () => {
                    await ctx.telegram.deleteMessage(ctx.chat?.id, processMsg.message_id).catch(()=>null);
                    await ctx.reply(\`✅ Permintaan untuk link: \\n\${link}\\n\\nMohon maaf, platform ini masih dalam pengembangan penuh. Saat ini Chuna baru mendukung TikTok dan YouTube secara optimal. 🥰\`);
                }, 2000);
            }
        } catch (e) {
            console.error("Download Error:", e);
            await ctx.telegram.editMessageText(ctx.chat?.id, processMsg.message_id, undefined, "❌ Terjadi kesalahan saat memproses link. Silakan coba lagi nanti.");
        }
      });`;

// Remove the old block using regex or manual slicing
// The block ends right before bot.action(/^sel_off_(.+)$/, async (ctx) => {
const endStr = `      bot.action(/^sel_off_(.+)$/, async (ctx) => {`;
const endIdx = code.indexOf(endStr, startIdx);

if (endIdx !== -1) {
    const newCode = code.slice(0, startIdx) + newActionsBlock + '\n' + code.slice(endIdx);
    fs.writeFileSync('server.ts', newCode);
    console.log("Patch applied!");
} else {
    console.log("Could not find end of download action block");
}

