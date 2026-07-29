import { fbdown, igdl } from 'ab-downloader';
async function run() {
    try {
        console.log("FB:", await fbdown('https://www.facebook.com/share/r/17QdMxWUX3/'));
    } catch(e) { console.log("fb err", e); }
    try {
        console.log("IG:", await igdl('https://www.instagram.com/reel/C-k2y1Fv-cZ/?igsh=MWZjdzd3ZmlzOHp3OQ=='));
    } catch(e) { console.log("ig err", e); }
}
run();
