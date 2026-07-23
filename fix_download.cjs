const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldRegex = /const format = text;[\s\S]*?delete userStates\[userId\];/;

const replacement = `const format = text;
                    if (!["🎥 Video", "🎵 Audio / MP3", "📸 Gambar"].includes(format)) {
                        await ctx.reply("❌ Silakan pilih format menggunakan tombol di bawah.");
                        return;
                    }
                    
                    const url = state.url;
                    await ctx.reply("⏳ Tunggu sebentar ya, Chuna sedang mendownload media...");
                    
                    try {
                        const isVideo = format === "🎥 Video";
                        const isAudio = format === "🎵 Audio / MP3";
                        const isImage = format === "📸 Gambar";
                        
                        const axios = (await import('axios')).default || await import('axios');
                        let targetUrl = null;
                        
                        if (url.includes('tiktok.com') || url.includes('vt.tiktok.com')) {
                            const res = await axios.get('https://tikwm.com/api/', { params: { url } });
                            if (res.data && res.data.data) {
                                if (isVideo) targetUrl = res.data.data.play;
                                else if (isAudio) targetUrl = res.data.data.music;
                                else if (isImage) targetUrl = res.data.data.cover;
                            }
                        }
                        
                        if (!targetUrl) {
                            // Fallback to btch-downloader
                            const btch = (await import('btch-downloader')).default || await import('btch-downloader');
                            let result;
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
                                if (res.mp4) urls.push(...extractUrls(res.mp4));
                                if (res.mp3) urls.push(...extractUrls(res.mp3));
                                if (res.thumbnail) urls.push(...extractUrls(res.thumbnail));
                                return urls.flat();
                            };
                            
                            let allUrls = extractUrls(result);
                            let targetUrls = allUrls.filter(u => {
                                const lu = u.toLowerCase();
                                if (isAudio && (lu.includes('.mp3') || lu.includes('audio') || result?.mp3 === u || (result?.audio && JSON.stringify(result.audio).includes(u)))) return true;
                                if (isVideo && (lu.includes('.mp4') || lu.includes('video') || result?.mp4 === u || (result?.video && JSON.stringify(result.video).includes(u)))) return true;
                                if (isImage && (lu.includes('.jpg') || lu.includes('.jpeg') || lu.includes('.png') || lu.includes('image') || result?.thumbnail === u)) return true;
                                return false;
                            });
                            
                            if (targetUrls.length === 0) {
                                if (isVideo && result?.mp4) targetUrls = [result.mp4];
                                else if (isAudio && result?.mp3) targetUrls = [result.mp3];
                                else if (isImage && result?.thumbnail) targetUrls = [result.thumbnail];
                                else {
                                    if (isVideo) targetUrls = allUrls.filter(u => !u.includes('.jpg') && !u.includes('.mp3'));
                                    if (isAudio) targetUrls = allUrls.filter(u => !u.includes('.jpg') && !u.includes('.mp4'));
                                }
                            }
                            targetUrl = targetUrls[0];
                        }
                        
                        if (targetUrl) {
                            try {
                                const fileRes = await axios.get(targetUrl, { responseType: 'arraybuffer' });
                                const buffer = Buffer.from(fileRes.data);
                                if (isVideo) {
                                    await ctx.replyWithVideo({ source: buffer }, { caption: "✅ Video berhasil di-download!" });
                                } else if (isAudio) {
                                    await ctx.replyWithAudio({ source: buffer }, { caption: "✅ Audio berhasil di-download!" });
                                } else {
                                    await ctx.replyWithPhoto({ source: buffer }, { caption: "✅ Gambar berhasil di-download!" });
                                }
                            } catch(downloadErr: any) {
                                // Direct URL try if buffer fails
                                if (isVideo) await ctx.replyWithVideo(targetUrl, { caption: "✅ Video berhasil di-download!" });
                                else if (isAudio) await ctx.replyWithAudio(targetUrl, { caption: "✅ Audio berhasil di-download!" });
                                else await ctx.replyWithPhoto(targetUrl, { caption: "✅ Gambar berhasil di-download!" });
                            }
                        } else {
                             await ctx.reply("❌ Gagal mendapatkan format " + format + " dari link tersebut.");
                        }
                    } catch (e: any) {
                        await ctx.reply("❌ Terjadi kesalahan saat mendownload media. " + e.message);
                    }
                    
                    delete userStates[userId];`;

code = code.replace(oldRegex, replacement);
fs.writeFileSync('server.ts', code);
