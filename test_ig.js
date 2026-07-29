import { igdl } from 'btch-downloader';
async function run() {
    try {
        console.log("IG:", await igdl('https://www.instagram.com/reel/C-k2y1Fv-cZ/?igsh=MWZjdzd3ZmlzOHp3OQ==')); // random ig link
    } catch(e) {
        console.log("IG Error:", e);
    }
}
run();
