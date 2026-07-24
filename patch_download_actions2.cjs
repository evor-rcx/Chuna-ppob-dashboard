const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const actionsBlock = `
      bot.action(/^dl_(image|video|audio)$/, async (ctx) => {
        await ctx.answerCbQuery();
        const type = ctx.match[1];
        const state = userStates[ctx.from?.id || 0];
        if (!state || state.step !== 'AWAITING_DOWNLOAD_TYPE') {
            await ctx.reply("❌ Sesi download telah berakhir atau tidak valid. Silakan ulangi dengan menekan '📥 Fitur Download'.");
            return;
        }

        const link = state.data.link;
        delete userStates[ctx.from?.id || 0];

        const processMsg = await ctx.reply("⏳ Chuna sedang memproses permintaan kamu... Mohon tunggu sebentar ya kak! 🥰");

        try {
            setTimeout(async () => {
                let replyText = "✅ Berhasil mendownload!";
                if (type === 'image') {
                    replyText = \`📸 Berikut adalah gambar dari link: \\n\${link}\\n\\n(Fitur sedang dalam pengembangan)\`;
                } else if (type === 'video') {
                    replyText = \`🎥 Berikut adalah video dari link: \\n\${link}\\n\\n(Fitur sedang dalam pengembangan)\`;
                } else if (type === 'audio') {
                    replyText = \`🎵 Berikut adalah audio dari link: \\n\${link}\\n\\n(Fitur sedang dalam pengembangan)\`;
                }
                
                await ctx.telegram.editMessageText(
                    ctx.chat?.id,
                    processMsg.message_id,
                    undefined,
                    replyText
                );
            }, 3000);
        } catch (e) {
            await ctx.reply("❌ Terjadi kesalahan saat memproses link. Silakan coba lagi nanti.");
        }
      });
`;

code = code.replace(/bot\.action\(\/\^sel_off_\(\.\+\)\$\/, async \(ctx\) => \{/, actionsBlock + '\n      bot.action(/^sel_off_(.+)$/, async (ctx) => {');
fs.writeFileSync('server.ts', code);
console.log("Download actions added properly!");
