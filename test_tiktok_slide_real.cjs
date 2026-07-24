const btch = require('btch-downloader');
async function test() {
    // an actual tiktok slide
    const res = await btch.ttdl('https://vt.tiktok.com/ZS8yLcxpX/'); // random slide, wait, maybe just pass a known slide link if i can find one. Let's just mock what might happen if btch returns an array of images.
    console.log(res);
}
test();
