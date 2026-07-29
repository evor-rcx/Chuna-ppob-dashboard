import { ndown } from "nayan-media-downloaders";

async function run() {
    try {
        console.log("FB:", await ndown('https://www.facebook.com/share/r/17QdMxWUX3/'));
    } catch(e) { console.log(e); }
    try {
        console.log("IG:", await ndown('https://www.instagram.com/reel/C-k2y1Fv-cZ/?igsh=MWZjdzd3ZmlzOHp3OQ=='));
    } catch(e) { console.log(e); }
}
run();
