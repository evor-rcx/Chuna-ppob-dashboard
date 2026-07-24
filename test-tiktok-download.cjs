const btch = require('btch-downloader');
const fetch = require('node-fetch');
const { Telegraf } = require('telegraf');
const fs = require('fs');

async function test() {
    try {
        const db = JSON.parse(fs.readFileSync('db.json', 'utf-8'));
        const bot = new Telegraf(db.telegramToken);
        const result = await btch.ttdl('https://vt.tiktok.com/ZSXnjuuJX/');
        let targetUrls = result.video;
        
        console.log("Target URLs:", targetUrls);
        
        for (const mediaUrl of targetUrls) {
            console.log("Fetching", mediaUrl);
            const res = await fetch(mediaUrl);
            console.log("Status:", res.status);
            if (res.status === 200) {
                const arrayBuffer = await res.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                console.log("Buffer size:", buffer.length);
                
                await bot.telegram.sendVideo(6726593414, { source: buffer }, { caption: "Test video" });
                console.log("Sent successfully!");
                break;
            }
        }
    } catch(e) {
        console.error(e);
    }
}
test();
