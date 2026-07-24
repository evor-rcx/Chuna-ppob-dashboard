const { ttdl, igdl } = require('btch-downloader');

async function test() {
    try {
        console.log("Testing TikTok");
        const tt = await ttdl('https://www.tiktok.com/@mrbeast/video/7331575971439971626');
        console.log("TikTok:", tt);
    } catch (e) {
        console.log("TikTok Error:", e.message);
    }
}
test();
