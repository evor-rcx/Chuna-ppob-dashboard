const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `        } catch (e) {
            console.error("Download Error:", e);
            await ctx.telegram.editMessageText(ctx.chat?.id, processMsg.message_id, undefined, "❌ Terjadi kesalahan saat memproses link. Silakan coba lagi nanti.");
        }`;

const replacement = `        } catch (e) {
            console.error("Download Error:", e);
            try {
                await ctx.telegram.editMessageText(ctx.chat?.id, processMsg.message_id, undefined, "❌ Terjadi kesalahan saat memproses link. Silakan coba lagi nanti.");
            } catch (editError) {
                await ctx.reply("❌ Terjadi kesalahan saat memproses link. Silakan coba lagi nanti.");
            }
        }`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server.ts', code);
    console.log("Patched catch successfully");
} else {
    console.log("Target not found!");
}
