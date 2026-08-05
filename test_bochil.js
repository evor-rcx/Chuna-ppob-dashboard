import { youtubedl, youtubedlv2 } from '@bochilteam/scraper';

async function test() {
    try {
        const res = await youtubedl('https://youtu.be/yg3EXDKvUAw');
        console.log(res);
        const video = await Object.values(res.video)[0].download();
        console.log("Video URL:", video);
        
        const res2 = await youtubedlv2('https://youtu.be/yg3EXDKvUAw');
        console.log(res2);
        
    } catch (e) {
        console.error("Error:", e.message);
    }
}
test();
