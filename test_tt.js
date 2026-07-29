import { ttdl } from 'btch-downloader';
async function run() {
    try {
        const data = await ttdl('https://vt.tiktok.com/ZS2RjS8jG/'); // some tiktok slide link or just put any
        console.log(data);
    } catch(e) { console.log(e); }
}
run();
