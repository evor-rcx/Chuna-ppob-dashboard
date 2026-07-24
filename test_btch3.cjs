const { ttdl, igdl } = require('btch-downloader');

async function test() {
    try {
        console.log("Testing IG");
        const ig = await igdl('https://www.instagram.com/p/DB1R1m6ShX-/');
        console.log("IG:", ig);
    } catch (e) {
        console.log("IG Error:", e.message);
    }
}
test();
