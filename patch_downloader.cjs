const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex = /try \{\s*const btch = \(await import\('btch-downloader'\)\)[\s\S]*?delete userStates\[userId\];/;

const replacement = `try {
                        const btch = (await import('btch-downloader')).default || await import('btch-downloader');
                        let result;
                        let targetUrls: string[] = [];
                        
                        const isVideo = format === "🎥 Video";
                        const isAudio = format === "🎵 Audio / MP3";
                        const isImage = format === "📸 Gambar";

                        if (url.includes('tiktok.com')) {
                            try {
                                const { Downloader } = require('@tobyg74/tiktok-api-dl');
                                const tdl = await Downloader(url, { version: 'v1' });
                                if (tdl.status === 'success' && tdl.result) {
                                    if (isVideo && tdl.result.type === 'video') targetUrls = [tdl.result.video.playAddr || tdl.result.video[0]];
                                    else if (isAudio && tdl.result.music?.playUrl) targetUrls = [tdl.result.music.playUrl];
                                    else if (isImage && tdl.result.type === 'image') targetUrls = tdl.result.images || [];
                                    else if (isImage && tdl.result.type === 'video') targetUrls = [tdl.result.cover[0]]; // fallback cover
                                }
                            } catch(e) { console.error("TobyG74 Error:", e.message); }
                        }

                        if (targetUrls.length === 0) {
                            if (url.includes('tiktok.com')) result = await btch.ttdl(url);
                            else if (url.includes('instagram.com')) result = await btch.igdl(url);
                            else if (url.includes('youtube.com') || url.includes('youtu.be')) result = await btch.youtube(url);
                            else if (url.includes('facebook.com') || url.includes('fb.watch')) result = await btch.fbdown(url);
                            else if (url.includes('twitter.com') || url.includes('x.com')) result = await btch.twitter(url);
                            else result = await btch.aio(url);
                            
                            const extractUrls = (res: any): string[] => {
                                if (!res) return [];
                                if (typeof res === 'string' && res.startsWith('http')) return [res];
                                if (Array.isArray(res)) return res.map(r => extractUrls(r)).flat();
                                
                                let urls: string[] = [];
                                if (res.url) urls.push(res.url);
                                if (res.video) urls.push(...extractUrls(res.video));
                                if (res.audio) urls.push(...extractUrls(res.audio));
                                if (res.image) urls.push(...extractUrls(res.image));
                                if (res.images) urls.push(...extractUrls(res.images));
                                if (res.mp4) urls.push(...extractUrls(res.mp4));
                                if (res.mp3) urls.push(...extractUrls(res.mp3));
                                if (res.thumbnail) urls.push(...extractUrls(res.thumbnail));
                                return urls.flat();
                            };
                            
                            let allUrls = extractUrls(result);
                            
                            targetUrls = allUrls.filter(u => {
                                const lu = u.toLowerCase();
                                if (isAudio && (lu.includes('.mp3') || lu.includes('audio') || result?.mp3 === u || (result?.audio && JSON.stringify(result.audio).includes(u)))) return true;
                                if (isVideo && (lu.includes('.mp4') || lu.includes('video') || result?.mp4 === u || (result?.video && JSON.stringify(result.video).includes(u)))) return true;
                                if (isImage && (lu.includes('.jpg') || lu.includes('.jpeg') || lu.includes('.png') || lu.includes('image') || result?.thumbnail === u || (result?.thumbnail && JSON.stringify(result.thumbnail).includes(u)))) return true;
                                return false;
                            });
                            
                            if (targetUrls.length === 0) {
                                if (isVideo && result?.mp4) targetUrls = [result.mp4];
                                else if (isAudio && result?.mp3) targetUrls = [result.mp3];
                                else if (isImage && result?.thumbnail) targetUrls = Array.isArray(result.thumbnail) ? result.thumbnail : [result.thumbnail];
                                else {
                                    if (isVideo) targetUrls = allUrls.filter(u => !u.includes('.jpg') && !u.includes('.mp3'));
                                    if (isAudio) targetUrls = allUrls.filter(u => !u.includes('.jpg') && !u.includes('.mp4'));
                                }
                            }
                        }
                        
                        targetUrls = [...new Set(targetUrls)];
                        
                        if (targetUrls.length > 0) {
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
                        } else {
                             await ctx.reply("❌ Gagal mendapatkan format " + format + " dari link tersebut.");
                        }

                    } catch (e: any) {
                        await ctx.reply("❌ Terjadi kesalahan saat mendownload media. " + e.message);
                    }
                    
                    delete userStates[userId];`;

const match = regex.exec(code);
if (match) {
    code = code.replace(match[0], replacement);
    fs.writeFileSync('server.ts', code);
    console.log("Patched successfully!");
} else {
    console.log("Failed to find code block to patch.");
}
