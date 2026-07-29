import re

with open('server.ts', 'r') as f:
    code = f.read()

# Remove Twitter from intro
code = code.replace("🐦 Twitter/X\\n", "")

# Update the downloader block
old_block_pattern = re.compile(r"try \{\s*const \{ ttdl, ytdl \} = await import\('btch-downloader'\);.*?Saat ini Chuna baru mendukung TikTok, YouTube, Facebook, dan Instagram secara optimal\. 🥰`\);\s*\}\s*\}\s*\} catch \(e: any\) \{", re.DOTALL)

new_block = """try {
                    const { ttdl, ytdl } = await import('btch-downloader');
                    
                    if (link.includes('tiktok.com') || link.includes('vt.tiktok.com')) {
                        await ctx.telegram.editMessageText(ctx.chat?.id, processMsg.message_id, undefined, "⏳ Sedang mengunduh dari TikTok... Mohon tunggu.");
                        const data = await ttdl(link);
                        if (!data) throw new Error("Gagal mengambil data dari TikTok");
                        
                        await ctx.telegram.deleteMessage(ctx.chat?.id, processMsg.message_id).catch(()=>null);
                        
                        if (type === 'image') {
                            const images = data.video.filter((url: string) => url.includes('.jpeg') || url.includes('.jpg') || url.includes('.webp') || url.includes('.png'));
                            if (images && images.length > 0) {
                                // Send as media group if there are multiple images
                                const mediaGroup = images.map((url: string, index: number) => ({
                                    type: 'photo',
                                    media: url,
                                    caption: index === 0 ? (data.title || "TikTok Photo") : ""
                                }));
                                
                                // Telegram only allows 10 items per media group, so we slice or chunk
                                for (let i = 0; i < mediaGroup.length; i += 10) {
                                    await ctx.replyWithMediaGroup(mediaGroup.slice(i, i + 10));
                                }
                            } else {
                                await ctx.reply("❌ Tidak ada foto ditemukan di link ini.");
                            }
                        } else if (type === 'audio') {
                            if (data.audio && data.audio.length > 0) {
                                await ctx.replyWithAudio(data.audio[0], { caption: data.title_audio || "TikTok Audio" });
                            } else {
                                await ctx.reply("❌ Audio tidak tersedia untuk link ini.");
                            }
                        } else {
                            const vid = data.video.find((url: string) => url.includes('.mp4'));
                            if (vid) {
                                await ctx.replyWithVideo(vid, { caption: data.title || "TikTok Video" });
                            } else {
                                await ctx.reply("❌ Video MP4 tidak ditemukan di link ini.");
                            }
                        }
                    } else if (link.includes('youtube.com') || link.includes('youtu.be')) {
                        await ctx.telegram.editMessageText(ctx.chat?.id, processMsg.message_id, undefined, "⏳ Sedang mengunduh dari YouTube... Mohon tunggu.");
                        const data = await ytdl(link);
                        if (!data) throw new Error("Gagal mengambil data dari YouTube");
                        
                        await ctx.telegram.deleteMessage(ctx.chat?.id, processMsg.message_id).catch(()=>null);
                        if (type === 'audio') {
                            await ctx.replyWithAudio(data.audio, { caption: data.title || "YouTube Audio" });
                        } else if (type === 'image') {
                            await ctx.reply("❌ Video YouTube tidak bisa didownload sebagai gambar.");
                        } else {
                            await ctx.replyWithVideo(data.video, { caption: data.title || "YouTube Video" });
                        }
                    } else if (link.includes('facebook.com') || link.includes('fb.watch') || link.includes('fb.gg') || link.includes('instagram.com') || link.includes('ig.me')) {
                        await ctx.telegram.deleteMessage(ctx.chat?.id, processMsg.message_id).catch(()=>null);
                        await ctx.reply("Mohon maaf, layanan download untuk Facebook dan Instagram sedang dalam tahap perbaikan / maintenance karena server dari penyedia layanan pihak ketiga sedang bermasalah. Silakan gunakan untuk link TikTok atau YouTube! 🙏");
                    } else {
                        await ctx.telegram.deleteMessage(ctx.chat?.id, processMsg.message_id).catch(()=>null);
                        await ctx.reply(`✅ Permintaan untuk link: \\n${link}\\n\\nMohon maaf, platform ini masih dalam pengembangan penuh. Saat ini Chuna baru mendukung TikTok dan YouTube secara optimal. 🥰`);
                    }
                } catch (e: any) {"""

code = old_block_pattern.sub(new_block, code)

with open('server.ts', 'w') as f:
    f.write(code)

