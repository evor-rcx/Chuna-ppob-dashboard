import { youtube } from 'btch-downloader';
import fetch from 'node-fetch';

async function test() {
    try {
        const data = await youtube('https://youtu.be/yg3EXDKvUAw');
        console.log(data);
        
        console.log("Downloading video...");
        const res = await fetch(data.mp4);
        console.log("Video fetch status:", res.status);
        const buf = await res.arrayBuffer();
        console.log("Video buffer size:", buf.byteLength);
        
        console.log("Downloading audio...");
        const res2 = await fetch(data.mp3);
        console.log("Audio fetch status:", res2.status);
        const buf2 = await res2.arrayBuffer();
        console.log("Audio buffer size:", buf2.byteLength);
    } catch (e) {
        console.error(e);
    }
}
test();
