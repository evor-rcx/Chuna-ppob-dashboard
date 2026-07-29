import { snapsave } from 'snapsave-media-downloader';
async function run() {
    try {
        console.log("FB:", JSON.stringify(await snapsave('https://www.facebook.com/share/r/17QdMxWUX3/'), null, 2));
    } catch(e) { console.log(e); }
    try {
        console.log("IG:", JSON.stringify(await snapsave('https://www.instagram.com/reel/C-k2y1Fv-cZ/?igsh=MWZjdzd3ZmlzOHp3OQ=='), null, 2));
    } catch(e) { console.log(e); }
}
run();
