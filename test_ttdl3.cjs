const btch = require('btch-downloader');
async function test() {
    try {
        const result = await btch.ttdl('https://vt.tiktok.com/ZSXGKhpF6/');
        console.log(JSON.stringify(result, null, 2));
    } catch(e) {
        console.error(e);
    }
}
test();
