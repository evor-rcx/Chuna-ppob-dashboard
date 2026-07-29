import { facebookdl, instagramdl, instagramdlv4 } from '@bochilteam/scraper';
async function run() {
    try {
        console.log("FB:", await facebookdl('https://www.facebook.com/share/r/17QdMxWUX3/'));
    } catch(e) { console.log("FB err", e); }
    try {
        console.log("IG:", await instagramdl('https://www.instagram.com/reel/C-k2y1Fv-cZ/?igsh=MWZjdzd3ZmlzOHp3OQ=='));
    } catch(e) { console.log("IG err", e); }
}
run();
