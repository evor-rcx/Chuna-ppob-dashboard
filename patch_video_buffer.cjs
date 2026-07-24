const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex = /if \(isVideo\) \{\s*if \(mediaUrl\.includes\('\.jpeg'\) \|\| mediaUrl\.includes\('\.jpg'\) \|\| mediaUrl\.includes\('\.png'\)\) continue;\s*await ctx\.replyWithVideo\(\{ url: mediaUrl \}, \{ caption: "✅ Video berhasil di-download!" \}\);\s*break;\s*\}/g;

const replace = `if (isVideo) {
                                        if (mediaUrl.includes('.jpeg') || mediaUrl.includes('.jpg') || mediaUrl.includes('.png')) continue;
                                        await ctx.replyWithChatAction("upload_video").catch(() => {});
                                        try {
                                            const res = await fetch(mediaUrl);
                                            const arrayBuffer = await res.arrayBuffer();
                                            const buffer = Buffer.from(arrayBuffer);
                                            await ctx.replyWithVideo({ source: buffer }, { caption: "✅ Video berhasil di-download!" });
                                            break;
                                        } catch (e) {
                                            await ctx.replyWithVideo({ url: mediaUrl }, { caption: "✅ Video berhasil di-download!" });
                                            break;
                                        }
                                    }`;

if (regex.test(code)) {
    code = code.replace(regex, replace);
    fs.writeFileSync('server.ts', code);
    console.log("Patched!");
} else {
    console.log("Regex not found!");
}
