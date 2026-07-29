import { fbdown } from 'btch-downloader';
async function run() {
    try {
        console.log("FB:", await fbdown('https://www.facebook.com/share/r/17QdMxWUX3/'));
    } catch(e) {
        console.log("FB Error:", e);
    }
}
run();
