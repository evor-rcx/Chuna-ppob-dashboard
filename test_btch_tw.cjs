const btch = require('btch-downloader');
async function test() {
    console.log("TW:", await btch.twitter('https://x.com/gofoodindonesia/status/1229369819511709697').catch(e => e.message));
}
test();
