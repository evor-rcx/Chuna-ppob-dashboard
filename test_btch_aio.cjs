const { aio } = require('btch-downloader');

async function test() {
    try {
        console.log("Testing AIO TikTok");
        const tt = await aio('https://vt.tiktok.com/ZS23M7H1s/');
        console.log("TikTok:", tt);
    } catch (e) {
        console.log("TikTok Error:", e.message);
    }
}
test();
