const insta = require('cakkatrok-instagram-downloader');

async function test() {
    try {
        const url = 'https://www.instagram.com/reel/C8_z0vHpxqJ/'; // generic public reel
        const res = await insta.media(url);
        console.log("RESULT:", JSON.stringify(res, null, 2));
    } catch(e) {
        console.error("ERROR:", e);
    }
}
test();
