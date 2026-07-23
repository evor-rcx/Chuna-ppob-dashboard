import re

with open('server.ts', 'r') as f:
    content = f.read()

download_case = """
                case 'AWAITING_DOWNLOAD': {
                    if (text === '❌ Batal') {
                        delete userStates[userId];
                        await ctx.reply("❌ Download dibatalkan.", { reply_markup: { keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]], resize_keyboard: true } });
                        return;
                    }
                    const url = text.trim();
                    if (!url.startsWith('http')) {
                        await ctx.reply("❌ Mohon kirimkan link (URL) yang valid!");
                        return;
                    }
                    await ctx.reply("⏳ Tunggu sebentar ya, Chuna sedang mendownload media...");
                    try {
                        const btch = require('btch-downloader');
                        let result;
                        if (url.includes('tiktok.com')) result = await btch.ttdl(url);
                        else if (url.includes('instagram.com')) result = await btch.igdl(url);
                        else if (url.includes('youtube.com') || url.includes('youtu.be')) result = await btch.youtube(url);
                        else if (url.includes('facebook.com') || url.includes('fb.watch')) result = await btch.fbdown(url);
                        else if (url.includes('twitter.com') || url.includes('x.com')) result = await btch.twitter(url);
                        else result = await btch.aio(url);

                        if (result && Array.isArray(result) && result.length > 0) {
                            for (const media of result) {
                                if (media.url) {
                                    if (media.url.includes('.mp4') || url.includes('tiktok') || url.includes('youtube') || url.includes('twitter')) {
                                        await ctx.replyWithVideo(media.url, { caption: "✅ Berhasil di-download oleh Chuna!" });
                                    } else {
                                        await ctx.replyWithPhoto(media.url, { caption: "✅ Berhasil di-download oleh Chuna!" });
                                    }
                                } else {
                                    await ctx.replyWithVideo(media.video || media, { caption: "✅ Berhasil di-download oleh Chuna!" }).catch(async () => {
                                        await ctx.replyWithPhoto(media.image || media, { caption: "✅ Berhasil di-download oleh Chuna!" }).catch(() => {});
                                    });
                                }
                            }
                        } else if (result && result.video) {
                            await ctx.replyWithVideo(result.video, { caption: "✅ Berhasil di-download oleh Chuna!" });
                        } else if (result && result.audio) {
                            await ctx.replyWithAudio(result.audio, { caption: "✅ Audio berhasil di-download oleh Chuna!" });
                        } else {
                            await ctx.reply("❌ Gagal mendapatkan media dari link tersebut. Pastikan akun tidak diprivate.");
                        }
                    } catch (e: any) {
                        await ctx.reply("❌ Terjadi kesalahan saat mendownload media. " + e.message);
                    }
                    delete userStates[userId];
                    return;
                }

                case 'AWAITING_LIRIK': {
                    if (text === '❌ Batal') {
                        delete userStates[userId];
                        await ctx.reply("❌ Pencarian dibatalkan.", { reply_markup: { keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]], resize_keyboard: true } });
                        return;
                    }
                    const query = text.trim();
                    await ctx.reply("⏳ Chuna sedang mencari lirik lagu '" + query + "'...");
                    try {
                        const ytSearch = require('yt-search');
                        const searchResult = await ytSearch(query);
                        let msg = "🎵 *Hasil Pencarian YouTube* 🎵\\n\\n";
                        if (searchResult && searchResult.videos.length > 0) {
                            const top = searchResult.videos.slice(0, 3);
                            top.forEach((v: any, i: number) => {
                                msg += `*${i+1}. ${v.title}*\\n⏱️ ${v.timestamp} | 👁️ ${v.views}\\n🔗 ${v.url}\\n\\n`;
                            });
                            const photoUrl = top[0].thumbnail;
                            
                            // Let's try lyrics api
                            try {
                                const axios = require('axios');
                                const lyricsRes = await axios.get(`https://some-random-api.com/lyrics?title=${encodeURIComponent(query)}`);
                                if (lyricsRes.data && lyricsRes.data.lyrics) {
                                    msg += `\\n*Lirik Lagu:*\\n\\n${lyricsRes.data.lyrics.substring(0, 3000)}`;
                                }
                            } catch (e) {
                                msg += "\\n_(Lirik lagu tidak ditemukan di database kami)_";
                            }
                            
                            await ctx.replyWithPhoto(photoUrl, { caption: msg.substring(0, 1024), parse_mode: 'Markdown' });
                            if (msg.length > 1024) {
                                await ctx.reply(msg, { parse_mode: 'Markdown' });
                            }
                        } else {
                            await ctx.reply("❌ Lagu tidak ditemukan.");
                        }
                    } catch (e: any) {
                        await ctx.reply("❌ Terjadi kesalahan saat mencari lagu. " + e.message);
                    }
                    delete userStates[userId];
                    return;
                }
"""

content = content.replace("switch (state.step) {", "switch (state.step) {\n" + download_case)

with open('server.ts', 'w') as f:
    f.write(content)
print("Switch cases patched")
