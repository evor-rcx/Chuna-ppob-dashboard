const { Telegraf } = require('telegraf');
const btch = require('btch-downloader');

async function test() {
    const bot = new Telegraf('8907328115:AAGb4g5h7U36G09o5X-Q-Y2uP72m6LWe_O4');
    try {
        const result = await btch.ttdl('https://vt.tiktok.com/ZSXGKhpF6/');
        const url = result.video[0];
        console.log("Trying to send video:", url);
        await bot.telegram.sendVideo(7376015219, url, { caption: "Test" });
        console.log("Success");
    } catch(e) {
        console.error("Error:", e.message);
    }
}
test();
