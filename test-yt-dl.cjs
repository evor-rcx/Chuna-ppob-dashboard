const axios = require('axios');
const { youtube } = require('btch-downloader');

async function run() {
    try {
        const data = await youtube('https://youtu.be/7SeQg9X4N0c?si=98n-xX48FGfDzqbR');
        console.log("Got URLs");
        console.log("Downloading MP4...");
        const response = await axios.get(data.mp4, { responseType: 'arraybuffer' });
        console.log("MP4 Downloaded size:", response.data.length);
    } catch(e) {
        console.error("Error:", e.message);
    }
}
run();
