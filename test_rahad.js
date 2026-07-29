import rahad from 'rahad-media-downloader';
async function run() {
    try {
        console.log("FB:", await rahad.rahadfbdl('https://www.facebook.com/share/r/17QdMxWUX3/'));
    } catch(e) { console.log("FB err", e); }
    try {
        console.log("IG:", await rahad.rahadinsta('https://www.instagram.com/reel/C-k2y1Fv-cZ/?igsh=MWZjdzd3ZmlzOHp3OQ=='));
    } catch(e) { console.log("IG err", e); }
}
run();
