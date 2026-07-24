const btch = require('btch-downloader');
async function test() {
    const res = await btch.ttdl('https://vt.tiktok.com/ZSYP87rJw/');
    console.log("TTDL:", JSON.stringify(res, null, 2));
}
test();
