const btch = require('btch-downloader');
async function test() {
    console.log("IG:", await btch.igdl('https://www.instagram.com/reel/C-PZ3Z_S9Nh/').catch(e => e.message));
}
test();
