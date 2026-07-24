const ig = require('instagram-url-downloader');
async function test() {
    console.log(await ig('https://www.instagram.com/reel/C-PZ3Z_S9Nh/'));
}
test();
