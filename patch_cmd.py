import re

with open('server.ts', 'r') as f:
    content = f.read()

commands = """
        // COMMANDS DARI FILE
        if (text.startsWith('.tt ') || text.startsWith('.tiktok ')) {
            const url = text.split(' ')[1];
            if (!url) return ctx.reply("❌ Link TikTok-nya mana kak?");
            await ctx.reply("⏳ Tunggu sebentar ya, Chuna sedang mendownload TikTok...");
            try {
                const btch = require('btch-downloader');
                const result = await btch.ttdl(url);
                if (result && result.video) {
                    await ctx.replyWithVideo(result.video, { caption: "✅ Berhasil di-download oleh Chuna!" });
                } else if (result && result.audio) {
                    await ctx.replyWithVideo(result.audio[0] || result.audio, { caption: "✅ Berhasil di-download oleh Chuna!" }).catch(async () => {
                        await ctx.replyWithAudio(result.audio[0] || result.audio);
                    });
                } else {
                    await ctx.reply("❌ Gagal mendownload.");
                }
            } catch (e: any) { await ctx.reply("❌ Error: " + e.message); }
            return;
        }

        if (text.startsWith('.ig ') || text.startsWith('.instagram ')) {
            const url = text.split(' ')[1];
            if (!url) return ctx.reply("❌ Link Instagram-nya mana kak?");
            await ctx.reply("⏳ Tunggu sebentar ya, Chuna sedang mendownload IG...");
            try {
                const btch = require('btch-downloader');
                const result = await btch.igdl(url);
                if (result && Array.isArray(result) && result.length > 0) {
                    for (const media of result) {
                        if (media.url) {
                            if (media.url.includes('.mp4')) await ctx.replyWithVideo(media.url, { caption: "✅ Berhasil!" });
                            else await ctx.replyWithPhoto(media.url, { caption: "✅ Berhasil!" });
                        }
                    }
                } else {
                    await ctx.reply("❌ Gagal mendownload.");
                }
            } catch (e: any) { await ctx.reply("❌ Error: " + e.message); }
            return;
        }

        if (text.startsWith('.ytmp4 ')) {
            const url = text.split(' ')[1];
            if (!url) return ctx.reply("❌ Link YouTube-nya mana kak?");
            await ctx.reply("⏳ Tunggu sebentar ya, Chuna sedang mendownload YT MP4...");
            try {
                const btch = require('btch-downloader');
                const result = await btch.youtube(url);
                if (result && result.video) {
                    await ctx.replyWithVideo(result.video, { caption: "✅ Berhasil!" });
                } else { await ctx.reply("❌ Gagal mendownload."); }
            } catch (e: any) { await ctx.reply("❌ Error: " + e.message); }
            return;
        }

        if (text.startsWith('.ytmp3 ')) {
            const url = text.split(' ')[1];
            if (!url) return ctx.reply("❌ Link YouTube-nya mana kak?");
            await ctx.reply("⏳ Tunggu sebentar ya, Chuna sedang mendownload YT MP3...");
            try {
                const btch = require('btch-downloader');
                const result = await btch.youtube(url);
                if (result && result.audio) {
                    await ctx.replyWithAudio(result.audio, { caption: "✅ Berhasil!" });
                } else { await ctx.reply("❌ Gagal mendownload."); }
            } catch (e: any) { await ctx.reply("❌ Error: " + e.message); }
            return;
        }

        if (text.startsWith('.fb ')) {
            const url = text.split(' ')[1];
            if (!url) return ctx.reply("❌ Link Facebook-nya mana kak?");
            await ctx.reply("⏳ Tunggu sebentar ya, Chuna sedang mendownload FB...");
            try {
                const btch = require('btch-downloader');
                const result = await btch.fbdown(url);
                if (result && result.video) {
                    await ctx.replyWithVideo(result.video, { caption: "✅ Berhasil!" });
                } else if (result && result.Normal_video) {
                    await ctx.replyWithVideo(result.Normal_video, { caption: "✅ Berhasil!" });
                } else { await ctx.reply("❌ Gagal mendownload."); }
            } catch (e: any) { await ctx.reply("❌ Error: " + e.message); }
            return;
        }

        if (text.startsWith('.tw ') || text.startsWith('.twitter ')) {
            const url = text.split(' ')[1];
            if (!url) return ctx.reply("❌ Link Twitter-nya mana kak?");
            await ctx.reply("⏳ Tunggu sebentar ya, Chuna sedang mendownload Twitter...");
            try {
                const btch = require('btch-downloader');
                const result = await btch.twitter(url);
                if (result && result.url) {
                    if (result.url[0] && result.url[0].hd) {
                        await ctx.replyWithVideo(result.url[0].hd, { caption: "✅ Berhasil!" });
                    } else {
                        await ctx.reply("❌ Gagal mendownload.");
                    }
                } else { await ctx.reply("❌ Gagal mendownload."); }
            } catch (e: any) { await ctx.reply("❌ Error: " + e.message); }
            return;
        }

        if (text.startsWith('.spotify ')) {
            const url = text.split(' ')[1];
            if (!url) return ctx.reply("❌ Link Spotify-nya mana kak?");
            await ctx.reply("⏳ Tunggu sebentar ya, Chuna sedang mendownload Spotify...");
            try {
                const btch = require('btch-downloader');
                const result = await btch.spotify(url);
                if (result && result.audio) {
                    await ctx.replyWithAudio(result.audio, { caption: `✅ ${result.title || 'Berhasil!'}` });
                } else { await ctx.reply("❌ Gagal mendownload."); }
            } catch (e: any) { await ctx.reply("❌ Error: " + e.message); }
            return;
        }

        if (text.startsWith('.pinterest ') || text.startsWith('.pin ')) {
            const url = text.split(' ')[1];
            if (!url) return ctx.reply("❌ Link Pinterest-nya mana kak?");
            await ctx.reply("⏳ Tunggu sebentar ya, Chuna sedang mendownload Pinterest...");
            try {
                const btch = require('btch-downloader');
                const result = await btch.pinterest(url);
                if (result && Array.isArray(result) && result.length > 0) {
                    for (const url of result) {
                        await ctx.replyWithPhoto(url);
                    }
                } else if (result) {
                    await ctx.replyWithPhoto(result);
                } else { await ctx.reply("❌ Gagal mendownload."); }
            } catch (e: any) { await ctx.reply("❌ Error: " + e.message); }
            return;
        }

        if (text.startsWith('.lirik ') || text.startsWith('.play ')) {
            const query = text.substring(text.indexOf(' ') + 1).trim();
            if (!query) return ctx.reply("❌ Judul lagunya apa kak?");
            await ctx.reply("⏳ Chuna sedang mencari '" + query + "'...");
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
                    
                    try {
                        const axios = require('axios');
                        const lyricsRes = await axios.get(`https://some-random-api.com/lyrics?title=${encodeURIComponent(query)}`);
                        if (lyricsRes.data && lyricsRes.data.lyrics) {
                            msg += `\\n*Lirik Lagu:*\\n\\n${lyricsRes.data.lyrics.substring(0, 2000)}`;
                        }
                    } catch (e) {}
                    
                    await ctx.replyWithPhoto(photoUrl, { caption: msg.substring(0, 1024), parse_mode: 'Markdown' });
                    if (msg.length > 1024) await ctx.reply(msg, { parse_mode: 'Markdown' });
                } else {
                    await ctx.reply("❌ Lagu tidak ditemukan.");
                }
            } catch (e: any) { await ctx.reply("❌ Error: " + e.message); }
            return;
        }
"""

target = 'if (text === "🔙 Kembali") { return next(); }'
content = content.replace(target, target + "\n" + commands)

with open('server.ts', 'w') as f:
    f.write(content)

print("Commands patched")
