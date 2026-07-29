import re

with open('server.ts', 'r') as f:
    code = f.read()

# Fix TikTok all images
tt_old = """                    if (data.images && data.images.length > 0) {
                        await ctx.reply("📸 Mengirim " + data.images.length + " gambar...");
                        const mediaGroup = data.images.slice(0, 10).map((url, i) => ({
                            type: 'photo',
                            media: url,
                            caption: i === 0 ? data.title : undefined
                        }));
                        await ctx.replyWithMediaGroup(mediaGroup);
                    } else {"""
                    
tt_new = """                    if (data.images && data.images.length > 0) {
                        await ctx.reply("📸 Mengirim " + data.images.length + " gambar...");
                        const allImages = data.images.map((url: string, i: number) => ({
                            type: 'photo',
                            media: url,
                            caption: i === 0 ? data.title : undefined
                        }));
                        
                        // Send in chunks of 10 due to telegram limits
                        for (let i = 0; i < allImages.length; i += 10) {
                            await ctx.replyWithMediaGroup(allImages.slice(i, i + 10));
                        }
                    } else {"""

code = code.replace(tt_old, tt_new)

# Fix FB / IG error message
fbig_old = """            else {
                
                let data;
                try {
                    const { fbdown, igdl } = await import('btch-downloader');
                    await ctx.telegram.editMessageText(ctx.chat?.id, processMsg.message_id, undefined, "⏳ Mencoba mendownload dari platform lain...");
                    if (link.includes('facebook.com') || link.includes('fb.watch') || link.includes('fb.gg')) {
                        let data = await fbdown(link);
                        if (!data || (!data.Normal_video && !data.HD)) throw new Error("Gagal mengambil data dari Facebook");
                        
                        let videoUrl = data.HD || data.Normal_video;
                        await ctx.telegram.editMessageText(ctx.chat?.id, processMsg.message_id, undefined, "⏳ Sedang mengunduh video dari Facebook... Mohon tunggu.");
                        
                        const response = await fetch(videoUrl);
                        if (!response.ok) throw new Error("Gagal mengunduh file media");
                        const buffer = Buffer.from(await response.arrayBuffer());

                        await ctx.telegram.deleteMessage(ctx.chat?.id, processMsg.message_id).catch(()=>null);
                        if (type === 'video' || type === 'audio') {
                            await ctx.replyWithVideo({ source: buffer }, { caption: "Facebook Video" });
                        } else {
                            await ctx.reply("❌ Gambar tidak tersedia untuk link ini.");
                        }
                        return;
                    } else if (link.includes('instagram.com') || link.includes('ig.me')) {
                        const igData = await igdl(link);
                        if (!igData || igData.length === 0) throw new Error("Gagal mengambil data dari Instagram");
                        await ctx.telegram.deleteMessage(ctx.chat?.id, processMsg.message_id).catch(()=>null);
                        if (type === 'image') {
                            const img = igData.find((d: any) => d.url.includes('.jpg') || d.url.includes('.webp') || d.url.includes('.png'));
                            if (img) await ctx.replyWithPhoto(img.url, { caption: "Instagram Photo" });
                            else await ctx.reply("❌ Tidak ada foto ditemukan di link ini.");
                        } else {
                            const vid = igData.find((d: any) => d.url.includes('.mp4'));
                            if (vid) {
                                await ctx.replyWithVideo(vid.url, { caption: "Instagram Video" });
                            } else {
                                await ctx.reply("❌ Tidak ada video ditemukan di link ini.");
                            }
                        }
                        return;
                    } else {
                        await ctx.telegram.deleteMessage(ctx.chat?.id, processMsg.message_id).catch(()=>null);
                        await ctx.reply(`✅ Permintaan untuk link: ${link}\nMohon maaf, platform ini masih dalam pengembangan penuh. Saat ini Chuna baru mendukung TikTok, YouTube, Facebook, dan Instagram secara optimal. 🥰`);
                    }
                } catch (e: any) {
                    await ctx.telegram.deleteMessage(ctx.chat?.id, processMsg.message_id).catch(()=>null);
                    await ctx.reply("❌ Gagal mendownload media: " + e.message);
                }
            }"""

fbig_new = """            else {
                await ctx.telegram.deleteMessage(ctx.chat?.id, processMsg.message_id).catch(()=>null);
                if (link.includes('facebook.com') || link.includes('fb.watch') || link.includes('fb.gg') || link.includes('instagram.com') || link.includes('ig.me')) {
                    await ctx.reply("Mohon maaf kak, layanan download untuk Facebook dan Instagram saat ini sedang dalam tahap perbaikan (maintenance) karena server pihak ketiga sedang mengalami pemblokiran API. 🙏\\n\\nSilakan gunakan Chuna untuk link TikTok atau YouTube ya! 🥰");
                } else {
                    await ctx.reply(`✅ Permintaan untuk link: ${link}\\n\\nMohon maaf, platform ini belum didukung atau sedang dalam pengembangan. Saat ini Chuna baru mendukung TikTok dan YouTube secara optimal. 🥰`);
                }
            }"""

code = code.replace(fbig_old, fbig_new)

with open('server.ts', 'w') as f:
    f.write(code)

print("Updated server.ts!")
