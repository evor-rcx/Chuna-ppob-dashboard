import { youtube } from 'btch-downloader';
import fetch from 'node-fetch';

async function test() {
    let data;
    for(let i=0; i<5; i++) {
        data = await youtube('https://youtu.be/yg3EXDKvUAw');
        if (data && data.status) break;
        await new Promise(r => setTimeout(r, 2000));
    }
    
    if (!data || !data.status) return console.log("Failed all");
    
    console.log("Audio URL:", data.mp3);
    const response = await fetch(data.mp3);
    console.log("Status:", response.status);
    console.log("Headers:", response.headers);
    const buf = await response.arrayBuffer();
    console.log("Buffer size:", buf.byteLength);
}
test();
