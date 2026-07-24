const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex1 = /const buffer = Buffer\.from\(arrayBuffer\);\s*await ctx\.replyWithVideo\(\{ source: buffer \}, \{ caption: "✅ Video berhasil di-download!" \}\);\s*break;/g;

const replace1 = `const buffer = Buffer.from(arrayBuffer);
                                            if (buffer.length > 49.5 * 1024 * 1024) {
                                                await ctx.reply("❌ Maaf Kak, ukuran video terlalu besar (Maksimal 50MB untuk Bot Telegram).");
                                                break;
                                            }
                                            await ctx.replyWithVideo({ source: buffer }, { caption: "✅ Video berhasil di-download!" });
                                            break;`;

if (regex1.test(code)) {
    code = code.replace(regex1, replace1);
    console.log("Patched video size check!");
}

const regex2 = /const buffer = Buffer\.from\(arrayBuffer\);\s*await ctx\.replyWithAudio\(\{ source: buffer \}, \{ caption: "✅ Audio berhasil di-download!" \}\);\s*break;/g;

const replace2 = `const buffer = Buffer.from(arrayBuffer);
                                            if (buffer.length > 49.5 * 1024 * 1024) {
                                                await ctx.reply("❌ Maaf Kak, ukuran audio terlalu besar (Maksimal 50MB untuk Bot Telegram).");
                                                break;
                                            }
                                            await ctx.replyWithAudio({ source: buffer }, { caption: "✅ Audio berhasil di-download!" });
                                            break;`;

if (regex2.test(code)) {
    code = code.replace(regex2, replace2);
    console.log("Patched audio size check!");
}

fs.writeFileSync('server.ts', code);
