const { Telegraf } = require('telegraf');
const fs = require('fs');
const db = JSON.parse(fs.readFileSync('db.json', 'utf-8'));
const bot = new Telegraf(db.telegramToken);

async function test() {
    try {
        await bot.telegram.sendVideo(6726593414, 'https://p19-common-sign.tiktokcdn-us.com/tos-useast5-p-0068-tx/beee36ba02ef449397b2d128bc32dd9d_1654632931~tplv-tiktokx-cropcenter-q:300:400:q70.jpeg?dr=8596&refresh_token=2bd7d024&x-expires=1784962800&x-signature=er14t0xP46vrUNcrHqH2z7U6nKI%3D&t=bacd0480&ps=933b5bde&shp=d05b14bd&shcp=1d1a97fc&idc=useast5&biz_tag=tt_video&s=AWEME_DETAIL&sc=cover');
        console.log("Sent photo as video!");
    } catch (e) {
        console.log("Failed:", e.message);
    }
}
test();
