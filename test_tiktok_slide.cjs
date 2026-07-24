const btch = require('btch-downloader');
async function test() {
    const res = await btch.ttdl('https://vt.tiktok.com/ZSXnjuuJX/');
    console.log(JSON.stringify(res, null, 2));
}
test();
