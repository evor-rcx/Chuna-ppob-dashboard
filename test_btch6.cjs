const { fbdown, twitter, igdl } = require('btch-downloader');

async function test() {
    try {
        console.log("Testing IG");
        const ig = await igdl('https://www.instagram.com/p/DB1R1m6ShX-/');
        console.log("IG:", ig);
    } catch (e) { console.log(e.message); }
    try {
        console.log("Testing FB");
        const fb = await fbdown('https://www.facebook.com/watch/?v=1234567890');
        console.log("FB:", fb);
    } catch (e) { console.log(e.message); }
    try {
        console.log("Testing Twitter");
        const tw = await twitter('https://twitter.com/X/status/1715024222030582236');
        console.log("TW:", tw);
    } catch (e) { console.log(e.message); }
}
test();
