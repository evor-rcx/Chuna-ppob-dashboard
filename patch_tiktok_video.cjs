const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetVid = `                        await ctx.replyWithVideo(videoUrl, { caption: data.title ? (data.title.length > 1000 ? data.title.substring(0, 1000) + '...' : data.title) : undefined });`;

const replaceVid = `                        try {
                            await ctx.replyWithVideo(videoUrl, { caption: data.title ? (data.title.length > 1000 ? data.title.substring(0, 1000) + '...' : data.title) : undefined });
                        } catch (err: any) {
                            if (err.message && err.message.includes('failed to get HTTP URL content')) {
                                console.log("Direct video send failed, downloading buffer...");
                                const fetch = require('node-fetch') || global.fetch;
                                const response = await fetch(videoUrl);
                                const arrayBuffer = await response.arrayBuffer();
                                const buffer = Buffer.from(arrayBuffer);
                                await ctx.replyWithVideo({ source: buffer }, { caption: data.title ? (data.title.length > 1000 ? data.title.substring(0, 1000) + '...' : data.title) : undefined });
                            } else {
                                throw err;
                            }
                        }`;

if (code.includes(targetVid)) {
    code = code.replace(targetVid, replaceVid);
    console.log("Patched TikTok video");
}

const targetAud = `                        await ctx.replyWithAudio(audioUrl, { title: data.music_info?.title || "Tiktok Audio", performer: data.music_info?.author || "Tiktok" });`;

const replaceAud = `                        try {
                            await ctx.replyWithAudio(audioUrl, { title: data.music_info?.title || "Tiktok Audio", performer: data.music_info?.author || "Tiktok" });
                        } catch (err: any) {
                            if (err.message && err.message.includes('failed to get HTTP URL content')) {
                                console.log("Direct audio send failed, downloading buffer...");
                                const fetch = require('node-fetch') || global.fetch;
                                const response = await fetch(audioUrl);
                                const arrayBuffer = await response.arrayBuffer();
                                const buffer = Buffer.from(arrayBuffer);
                                await ctx.replyWithAudio({ source: buffer }, { title: data.music_info?.title || "Tiktok Audio", performer: data.music_info?.author || "Tiktok" });
                            } else {
                                throw err;
                            }
                        }`;

if (code.includes(targetAud)) {
    code = code.replace(targetAud, replaceAud);
    console.log("Patched TikTok audio");
}


// Youtube patches
const targetYTVid = `                        await ctx.replyWithVideo(data.mp4, { caption: data.title ? (data.title.length > 1000 ? data.title.substring(0, 1000) + '...' : data.title) : undefined });`;

const replaceYTVid = `                        try {
                            await ctx.replyWithVideo(data.mp4, { caption: data.title ? (data.title.length > 1000 ? data.title.substring(0, 1000) + '...' : data.title) : undefined });
                        } catch (err: any) {
                            if (err.message && err.message.includes('failed to get HTTP URL content')) {
                                console.log("Direct YT video send failed, downloading buffer...");
                                const fetch = require('node-fetch') || global.fetch;
                                const response = await fetch(data.mp4);
                                const arrayBuffer = await response.arrayBuffer();
                                const buffer = Buffer.from(arrayBuffer);
                                await ctx.replyWithVideo({ source: buffer }, { caption: data.title ? (data.title.length > 1000 ? data.title.substring(0, 1000) + '...' : data.title) : undefined });
                            } else {
                                throw err;
                            }
                        }`;

if (code.includes(targetYTVid)) {
    code = code.replace(targetYTVid, replaceYTVid);
    console.log("Patched YT video");
}

const targetYTAud = `                        await ctx.replyWithAudio(data.mp3, { title: data.title, performer: data.author });`;

const replaceYTAud = `                        try {
                            await ctx.replyWithAudio(data.mp3, { title: data.title, performer: data.author });
                        } catch (err: any) {
                            if (err.message && err.message.includes('failed to get HTTP URL content')) {
                                console.log("Direct YT audio send failed, downloading buffer...");
                                const fetch = require('node-fetch') || global.fetch;
                                const response = await fetch(data.mp3);
                                const arrayBuffer = await response.arrayBuffer();
                                const buffer = Buffer.from(arrayBuffer);
                                await ctx.replyWithAudio({ source: buffer }, { title: data.title, performer: data.author });
                            } else {
                                throw err;
                            }
                        }`;

if (code.includes(targetYTAud)) {
    code = code.replace(targetYTAud, replaceYTAud);
    console.log("Patched YT audio");
}

fs.writeFileSync('server.ts', code);
