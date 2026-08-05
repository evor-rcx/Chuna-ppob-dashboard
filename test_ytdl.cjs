const youtubedl = require('youtube-dl-exec');

async function test() {
    try {
        const info = await youtubedl('https://youtu.be/yg3EXDKvUAw', {
            dumpJson: true,
            noWarnings: true,
            noCallHome: true,
            noCheckCertificate: true,
            preferFreeFormats: true,
            youtubeSkipDashManifest: true,
        });
        
        console.log("Title:", info.title);
        console.log("Thumbnail:", info.thumbnail);
        
        // Find format for video
        const videoFormat = info.formats.find(f => f.ext === 'mp4' && f.acodec !== 'none' && f.vcodec !== 'none');
        console.log("Video URL:", videoFormat ? videoFormat.url : 'Not found');
        
        // Find format for audio
        const audioFormat = info.formats.reverse().find(f => f.ext === 'm4a' || f.acodec !== 'none');
        console.log("Audio URL:", audioFormat ? audioFormat.url : 'Not found');
        
    } catch (e) {
        console.error(e);
    }
}
test();
