const ig = require('instagram-url-direct');
async function test() {
    let links = await ig.instagramGetUrl('https://www.instagram.com/p/C-PZ3Z_S9Nh/');
    console.log(links);
}
test();
