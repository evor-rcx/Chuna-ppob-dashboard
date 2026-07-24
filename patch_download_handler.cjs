const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const downloadHandler = `
      bot.hears("📥 Fitur Download", async (ctx) => {
        delete userStates[ctx.from.id]; // Reset state
        userStates[ctx.from.id] = { step: 'AWAITING_DOWNLOAD_LINK' };
        await ctx.reply(\`Fitur Download 📥

Halo kak! Silakan kirimkan link video/audio yang ingin didownload.
Chuna mendukung download dari:
🎵 TikTok
📸 Instagram
🎬 YouTube
📘 Facebook
🐦 Twitter

Kirim linknya sekarang ya! 🥰
Contoh link
https://vt.tiktok.com/ZSXWsjbFd/\`);
      });
`;

if (!code.includes('Fitur Download 📥')) {
    code = code.replace(/(bot\.hears\(\/Cek Saldo\/i, async \(ctx\) => \{)/, downloadHandler + '\n$1');
    fs.writeFileSync('server.ts', code);
    console.log("Download handler added!");
} else {
    console.log("Download handler already exists.");
}

