const { instagramdl } = require('@bochilteam/scraper-instagram');
async function test() {
    console.log(await instagramdl('https://www.instagram.com/reel/C-PZ3Z_S9Nh/').catch(e => e.message));
}
test();
