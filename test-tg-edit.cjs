const { Telegraf } = require('telegraf');
const fs = require('fs');
const db = JSON.parse(fs.readFileSync('db.json', 'utf-8'));
const bot = new Telegraf(db.telegramToken);

async function test() {
    try {
        const msg = await bot.telegram.sendMessage(6726593414, "⏳ Hai Kak!\n\nPesanan Anda sedang diproses.", {
            reply_markup: {
                keyboard: [[{ text: "Menu" }]],
                resize_keyboard: true
            }
        });
        console.log("Sent msg", msg.message_id);
        
        await new Promise(r => setTimeout(r, 2000));
        
        try {
            await bot.telegram.editMessageText(6726593414, msg.message_id, undefined, "❌ Gagal", { parse_mode: "Markdown" });
            console.log("Edit succeeded");
        } catch (e) {
            console.log("Edit failed:", e.message);
        }
    } catch (e) {
        console.log(e);
    }
}
test();
