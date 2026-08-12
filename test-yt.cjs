const { youtube } = require('btch-downloader');

async function run() {
    try {
        console.log("Fetching YT...");
        const data = await youtube('https://youtu.be/7SeQg9X4N0c?si=98n-xX48FGfDzqbR');
        console.log("Result:", data);
    } catch(e) {
        console.error("Error:", e);
    }
}
run();
