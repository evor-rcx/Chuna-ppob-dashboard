const btch = require('btch-downloader');
async function test() {
    console.log(await btch.aio('https://vt.tiktok.com/ZS8yLcxpX/'));
}
test();
