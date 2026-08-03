const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `      bot.action(/^dl_(image|video|audio)$/, async (ctx) => {
        await ctx.answerCbQuery();
        const type = ctx.match[1];
        const state = userStates[ctx.from?.id || 0];
        if (!state || state.step !== 'AWAITING_DOWNLOAD_TYPE') {
            await ctx.reply("❌ Sesi download telah berakhir atau tidak valid. Silakan ulangi dengan menekan '📥 Fitur Download'.");
            return;
        }

        const link = state.data.link;
        delete userStates[ctx.from?.id || 0];

        const processMsg = await ctx.reply("⏳ Chuna sedang memproses permintaan kamu... Mohon tunggu sebentar ya kak! 🥰");`;

const replacement = `      bot.action(/^dl_(image|video|audio)$/, async (ctx) => {
        try { await ctx.answerCbQuery().catch(() => {}); } catch(e) {}
        try {
            const type = ctx.match[1];
            const state = userStates[ctx.from?.id || 0];
            if (!state || state.step !== 'AWAITING_DOWNLOAD_TYPE') {
                await ctx.reply("❌ Sesi download telah berakhir atau tidak valid. Silakan ulangi dengan menekan '📥 Fitur Download'.");
                return;
            }

            const link = state.data.link;
            delete userStates[ctx.from?.id || 0];

            const processMsg = await ctx.reply("⏳ Chuna sedang memproses permintaan kamu... Mohon tunggu sebentar ya kak! 🥰");`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    
    // Also add closing brace for try block at the end of bot.action
    const targetEnd = `                }
            }
        } catch (error) {
            console.error("Gagal mendownload:", error);
            await ctx.reply("❌ Terjadi kesalahan saat memproses link. Pastikan link valid dan tidak diprivate.");
        }
      });`;
      
    const replacementEnd = `                }
            }
        } catch (error) {
            console.error("Gagal mendownload:", error);
            await ctx.reply("❌ Terjadi kesalahan saat memproses link. Pastikan link valid dan tidak diprivate.");
        }
        } catch (globalErr) {
            console.error("Critical error in dl_ action:", globalErr);
            try { await ctx.reply("❌ Terjadi kesalahan sistem saat memproses."); } catch(e) {}
        }
      });`;
      
    if (code.includes(targetEnd)) {
        code = code.replace(targetEnd, replacementEnd);
        fs.writeFileSync('server.ts', code);
        console.log("Patched successfully");
    } else {
        console.log("Target end not found!");
    }
} else {
    console.log("Target start not found!");
}
