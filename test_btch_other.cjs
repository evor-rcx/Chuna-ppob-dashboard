const btch = require('btch-downloader');
async function test() {
    console.log("IG:", await btch.igdl('https://www.instagram.com/p/C-PZ3Z_S9Nh/').catch(e => e.message));
    console.log("YT:", await btch.youtube('https://www.youtube.com/watch?v=dQw4w9WgXcQ').catch(e => e.message));
    console.log("FB:", await btch.fbdown('https://www.facebook.com/watch/?v=1393572814172251').catch(e => e.message));
}
test();
