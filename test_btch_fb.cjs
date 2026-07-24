const btch = require('btch-downloader');
async function test() {
    console.log("FB:", await btch.fbdown('https://www.facebook.com/watch?v=1107775530182888').catch(e => e.message));
}
test();
