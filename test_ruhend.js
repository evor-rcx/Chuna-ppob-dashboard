import ruhend from 'ruhend-scraper';
async function run() {
    try {
        console.log("FB:", await ruhend.fbdl('https://www.facebook.com/share/r/17QdMxWUX3/'));
    } catch(e) { console.log(e); }
    try {
        console.log("IG:", await ruhend.igdl('https://www.instagram.com/reel/C-k2y1Fv-cZ/?igsh=MWZjdzd3ZmlzOHp3OQ=='));
    } catch(e) { console.log(e); }
}
run();
