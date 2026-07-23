const btch = require('btch-downloader');
async function test() {
    try {
        const res = await btch.ttdl('https://vt.tiktok.com/ZSXGKhpF6/');
        console.log(JSON.stringify(res, null, 2));
    } catch(e) {
        console.error(e);
    }
}
test();
