const ytdl = require('@distube/ytdl-core');
const fs = require('fs');

async function run() {
    try {
        console.log("Fetching YT info...");
        const url = 'https://youtu.be/7SeQg9X4N0c?si=98n-xX48FGfDzqbR';
        const info = await ytdl.getInfo(url);
        console.log("Title:", info.videoDetails.title);
        console.log("Thumbnail:", info.videoDetails.thumbnails[0]?.url);
        
        let format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
        console.log("Audio Format URL:", format.url);
        
        // You can't just get the URL for video+audio combined usually, you'd download it. But wait, for Telegram we need to send a buffer if the URL isn't directly usable, or we can pipe it.
    } catch(e) {
        console.error("Error:", e.message);
    }
}
run();
