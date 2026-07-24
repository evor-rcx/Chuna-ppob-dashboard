const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex = /else if \(isAudio\) \{\s*await ctx\.replyWithAudio\(mediaUrl, \{ caption: "✅ Audio berhasil di-download!" \}\);\s*break;\s*\}/g;

const replace = `else if (isAudio) {
                                        if (mediaUrl.includes('.jpeg') || mediaUrl.includes('.jpg') || mediaUrl.includes('.png')) continue;
                                        await ctx.replyWithChatAction("upload_voice").catch(() => {});
                                        try {
                                            const res = await fetch(mediaUrl);
                                            const arrayBuffer = await res.arrayBuffer();
                                            const buffer = Buffer.from(arrayBuffer);
                                            await ctx.replyWithAudio({ source: buffer }, { caption: "✅ Audio berhasil di-download!" });
                                            break;
                                        } catch (e) {
                                            await ctx.replyWithAudio({ url: mediaUrl }, { caption: "✅ Audio berhasil di-download!" });
                                            break;
                                        }
                                    }`;

if (regex.test(code)) {
    code = code.replace(regex, replace);
    fs.writeFileSync('server.ts', code);
    console.log("Patched audio!");
} else {
    console.log("Audio regex not found!");
}
