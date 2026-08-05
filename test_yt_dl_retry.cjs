const { youtube } = require('btch-downloader');
const axios = require('axios');

async function test() {
    let data;
    for(let i=0; i<5; i++) {
        data = await youtube('https://youtu.be/yg3EXDKvUAw');
        if (data && data.status) break;
        console.log("Failed, retrying...", data);
        await new Promise(r => setTimeout(r, 2000));
    }
    
    if (!data || !data.status) {
        console.log("Failed all retries.");
        return;
    }
    
    console.log(data);
    
    try {
        console.log("Downloading video...");
        const res = await axios.get(data.mp4, { responseType: 'arraybuffer' });
        console.log("Video fetch status:", res.status);
        console.log("Video buffer size:", res.data.length);
    } catch(e) {
        console.error("Axios error on video:", e.message);
    }
}
test();
