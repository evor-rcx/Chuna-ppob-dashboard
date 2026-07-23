const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetAwaitingDownload = `                case 'AWAITING_DOWNLOAD': {
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
                        const btch = (await import('btch-downloader')).default || await import('btch-downloader');
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
                }`;

const replacementAwaitingDownload = `                case 'AWAITING_DOWNLOAD': {
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
                    userStates[userId] = { step: 'AWAITING_DOWNLOAD_FORMAT', url };
                    await ctx.reply("Pilih format yang ingin didownload 👇", {
                        reply_markup: {
                            keyboard: [
                                [{ text: "🎥 Video" }, { text: "🎵 Audio / MP3" }],
                                [{ text: "📸 Gambar" }, { text: "❌ Batal" }]
                            ],
                            resize_keyboard: true
                        }
                    });
                    return;
                }
                
                case 'AWAITING_DOWNLOAD_FORMAT': {
                    if (text === '❌ Batal') {
                        delete userStates[userId];
                        await ctx.reply("❌ Download dibatalkan.", { reply_markup: { keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]], resize_keyboard: true } });
                        return;
                    }
                    
                    const format = text;
                    if (!["🎥 Video", "🎵 Audio / MP3", "📸 Gambar"].includes(format)) {
                        await ctx.reply("❌ Silakan pilih format menggunakan tombol di bawah.");
                        return;
                    }
                    
                    const url = state.url;
                    await ctx.reply("⏳ Tunggu sebentar ya, Chuna sedang mendownload media...");
                    
                    try {
                        const btch = (await import('btch-downloader')).default || await import('btch-downloader');
                        let result;
                        if (url.includes('tiktok.com')) result = await btch.ttdl(url);
                        else if (url.includes('instagram.com')) result = await btch.igdl(url);
                        else if (url.includes('youtube.com') || url.includes('youtu.be')) result = await btch.youtube(url);
                        else if (url.includes('facebook.com') || url.includes('fb.watch')) result = await btch.fbdown(url);
                        else if (url.includes('twitter.com') || url.includes('x.com')) result = await btch.twitter(url);
                        else result = await btch.aio(url);

                        const isVideo = format === "🎥 Video";
                        const isAudio = format === "🎵 Audio / MP3";
                        const isImage = format === "📸 Gambar";
                        
                        // Helper to find URL recursively or in array
                        const extractUrls = (res: any): string[] => {
                            if (!res) return [];
                            if (typeof res === 'string' && res.startsWith('http')) return [res];
                            if (Array.isArray(res)) return res.map(r => extractUrls(r)).flat();
                            
                            let urls: string[] = [];
                            if (res.url) urls.push(res.url);
                            if (res.video) urls.push(...extractUrls(res.video));
                            if (res.audio) urls.push(...extractUrls(res.audio));
                            if (res.image) urls.push(...extractUrls(res.image));
                            if (res.mp4) urls.push(...extractUrls(res.mp4));
                            if (res.mp3) urls.push(...extractUrls(res.mp3));
                            if (res.thumbnail) urls.push(...extractUrls(res.thumbnail));
                            return urls.flat();
                        };
                        
                        let allUrls = extractUrls(result);
                        
                        // Filter by extension roughly
                        let targetUrls = allUrls.filter(u => {
                            const lu = u.toLowerCase();
                            if (isAudio && (lu.includes('.mp3') || lu.includes('audio') || result?.mp3 === u || (result?.audio && JSON.stringify(result.audio).includes(u)))) return true;
                            if (isVideo && (lu.includes('.mp4') || lu.includes('video') || result?.mp4 === u || (result?.video && JSON.stringify(result.video).includes(u)))) return true;
                            if (isImage && (lu.includes('.jpg') || lu.includes('.jpeg') || lu.includes('.png') || lu.includes('image') || result?.thumbnail === u)) return true;
                            return false;
                        });
                        
                        if (targetUrls.length === 0) {
                            // fallback, if nothing specific matched, maybe just use the first few if we can guess
                            if (isVideo && result?.mp4) targetUrls = [result.mp4];
                            else if (isAudio && result?.mp3) targetUrls = [result.mp3];
                            else if (isImage && result?.thumbnail) targetUrls = [result.thumbnail];
                            else {
                                // If still nothing, just give whatever we got based on what the API usually returns
                                if (isVideo) targetUrls = allUrls.filter(u => !u.includes('.jpg') && !u.includes('.mp3'));
                                if (isAudio) targetUrls = allUrls.filter(u => !u.includes('.jpg') && !u.includes('.mp4'));
                            }
                        }
                        
                        // Remove duplicates
                        targetUrls = [...new Set(targetUrls)];
                        
                        if (targetUrls.length > 0) {
                            for (const mediaUrl of targetUrls) {
                                try {
                                    if (isVideo) {
                                        await ctx.replyWithVideo(mediaUrl, { caption: "✅ Video berhasil di-download!" });
                                        break; // Only send the first video to avoid spamming multiple qualities
                                    } else if (isAudio) {
                                        await ctx.replyWithAudio(mediaUrl, { caption: "✅ Audio berhasil di-download!" });
                                        break;
                                    } else {
                                        await ctx.replyWithPhoto(mediaUrl, { caption: "✅ Gambar berhasil di-download!" });
                                    }
                                } catch(e) {}
                            }
                        } else {
                             await ctx.reply("❌ Gagal mendapatkan format " + format + " dari link tersebut.");
                        }

                    } catch (e: any) {
                        await ctx.reply("❌ Terjadi kesalahan saat mendownload media. " + e.message);
                    }
                    
                    delete userStates[userId];
                    await ctx.reply("Menu Utama", { reply_markup: { keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]], resize_keyboard: true } });
                    return;
                }`;

if (!code.includes("Pilih format yang ingin didownload 👇")) {
    code = code.replace(targetAwaitingDownload, replacementAwaitingDownload);
    fs.writeFileSync('server.ts', code);
    console.log("Patched telegram download flow!");
} else {
    console.log("Already patched");
}
