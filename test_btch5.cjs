const { youtube } = require('btch-downloader');
async function test() {
    try {
        console.log("Testing YouTube");
        const yt = await youtube('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
        console.log("YouTube:", yt);
    } catch (e) {
        console.log("YouTube Error:", e.message);
    }
}
test();
