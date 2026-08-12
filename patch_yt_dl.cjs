const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `
                            } catch (err: any) {
                                console.log("YT Video send failed:", err.message);
                                try {
                                    await ctx.reply(\`⚠️ Video tidak dapat dikirim langsung oleh bot (mungkin karena ukuran terlalu besar).\\n\\n🔗 Silakan download melalui link ini:\\n\${data.mp4}\`);
                                } catch (e) {
                                    throw err;
                                }
                            }
`;

code = code.replace(
    /                        } catch \(err: any\) \{\s*if \(err\.message && err\.message\.includes\('failed to get HTTP URL content'\)\) \{\s*console\.log\("Direct YT video send failed, downloading buffer\.\.\."\);\s*const axios = require\('axios'\);\s*const response = await axios\.get\(data\.mp4, \{ responseType: 'arraybuffer' \}\);\s*const buffer = Buffer\.from\(response\.data\);\s*await ctx\.replyWithVideo\(\{ source: buffer \}, \{ caption: data\.title \? \(data\.title\.length > 1000 \? data\.title\.substring\(0, 1000\) \+ '\.\.\.' : data\.title\) : undefined \}\);\s*\} else \{\s*throw err;\s*\}\s*\}/g,
    replacement
);

const replacementAudio = `
                            } catch (err: any) {
                                console.log("YT Audio send failed:", err.message);
                                try {
                                    await ctx.reply(\`⚠️ Audio tidak dapat dikirim langsung oleh bot.\\n\\n🔗 Silakan download melalui link ini:\\n\${data.mp3}\`);
                                } catch (e) {
                                    throw err;
                                }
                            }
`;

code = code.replace(
    /                        } catch \(err: any\) \{\s*if \(err\.message && err\.message\.includes\('failed to get HTTP URL content'\)\) \{\s*console\.log\("Direct YT audio send failed, downloading buffer\.\.\."\);\s*const axios = require\('axios'\);\s*const response = await axios\.get\(data\.mp3, \{ responseType: 'arraybuffer' \}\);\s*const buffer = Buffer\.from\(response\.data\);\s*await ctx\.replyWithAudio\(\{ source: buffer \}, \{ title: data\.title, performer: data\.author \}\);\s*\} else \{\s*throw err;\s*\}\s*\}/g,
    replacementAudio
);

// We should also do this for TikTok video
const replacementTiktokVideo = `
                            } catch (err: any) {
                                console.log("TikTok Video send failed:", err.message);
                                try {
                                    await ctx.reply(\`⚠️ Video tidak dapat dikirim langsung oleh bot.\\n\\n🔗 Silakan download melalui link ini:\\n\${videoUrl}\`);
                                } catch (e) {
                                    throw err;
                                }
                            }
`;

code = code.replace(
    /                        } catch \(err: any\) \{\s*if \(err\.message && err\.message\.includes\('failed to get HTTP URL content'\)\) \{\s*console\.log\("Direct video send failed, downloading buffer\.\.\."\);\s*const axios = require\('axios'\);\s*const response = await axios\.get\(videoUrl, \{ responseType: 'arraybuffer' \}\);\s*const buffer = Buffer\.from\(response\.data\);\s*await ctx\.replyWithVideo\(\{ source: buffer \}, \{ caption: data\.title \? \(data\.title\.length > 1000 \? data\.title\.substring\(0, 1000\) \+ '\.\.\.' : data\.title\) : undefined \}\);\s*\} else \{\s*throw err;\s*\}\s*\}/g,
    replacementTiktokVideo
);

// We should also do this for TikTok Audio
const replacementTiktokAudio = `
                            } catch (err: any) {
                                console.log("TikTok Audio send failed:", err.message);
                                try {
                                    await ctx.reply(\`⚠️ Audio tidak dapat dikirim langsung oleh bot.\\n\\n🔗 Silakan download melalui link ini:\\n\${audioUrl}\`);
                                } catch (e) {
                                    throw err;
                                }
                            }
`;

code = code.replace(
    /                        } catch \(err: any\) \{\s*if \(err\.message && err\.message\.includes\('failed to get HTTP URL content'\)\) \{\s*console\.log\("Direct audio send failed, downloading buffer\.\.\."\);\s*const axios = require\('axios'\);\s*const response = await axios\.get\(audioUrl, \{ responseType: 'arraybuffer' \}\);\s*const buffer = Buffer\.from\(response\.data\);\s*await ctx\.replyWithAudio\(\{ source: buffer \}, \{ title: data\.music_info\?\.title \|\| "Tiktok Audio", performer: data\.music_info\?\.author \|\| "Tiktok" \}\);\s*\} else \{\s*throw err;\s*\}\s*\}/g,
    replacementTiktokAudio
);

fs.writeFileSync('server.ts', code);
