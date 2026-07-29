import ig from '@mrnima/instagram-downloader';
async function run() {
    try {
        console.log("IG:", await ig.igdl('https://www.instagram.com/reel/C-k2y1Fv-cZ/?igsh=MWZjdzd3ZmlzOHp3OQ=='));
    } catch(e) { console.log(e); }
}
run();
