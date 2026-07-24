const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex = /if \(isVideo\) \{\s*await ctx\.replyWithVideo\(mediaUrl, \{ caption: "✅ Video berhasil di-download!" \}\);\s*break;/g;

const replace = `if (isVideo) {
                                        if (mediaUrl.includes('.jpeg') || mediaUrl.includes('.jpg') || mediaUrl.includes('.png')) continue;
                                        await ctx.replyWithVideo({ url: mediaUrl }, { caption: "✅ Video berhasil di-download!" });
                                        break;
                                    }`;

if (regex.test(code)) {
    code = code.replace(regex, replace);
    fs.writeFileSync('server.ts', code);
    console.log("Patched!");
} else {
    console.log("Regex not found!");
}
