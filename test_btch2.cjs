const { ttdl, igdl, youtube, fbdown, twitter } = require('btch-downloader');

async function test() {
    try {
        console.log("Testing TikTok");
        const tt = await ttdl('https://vt.tiktok.com/ZS23M7H1s/');
        console.log("TikTok:", tt);
    } catch (e) {
        console.log("TikTok Error:", e.message);
    }
}
test();
