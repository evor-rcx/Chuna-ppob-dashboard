const { instagramGetUrl } = require('instagram-url-direct');

async function test() {
    try {
        const url = 'https://www.instagram.com/reel/C8_z0vHpxqJ/';
        const res = await instagramGetUrl(url);
        console.log("RESULT:", JSON.stringify(res, null, 2));
    } catch(e) {
        console.error("ERROR:", e);
    }
}
test();
