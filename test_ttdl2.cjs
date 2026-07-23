const btch = require('btch-downloader');
async function test() {
    try {
        const result = await btch.ttdl('https://vt.tiktok.com/ZSXGKhpF6/');
        const extractUrls = (res) => {
            if (!res) return [];
            if (typeof res === 'string' && res.startsWith('http')) return [res];
            if (Array.isArray(res)) return res.map(r => extractUrls(r)).flat();
            
            let urls = [];
            if (res.url) urls.push(res.url);
            if (res.video) urls.push(...extractUrls(res.video));
            if (res.audio) urls.push(...extractUrls(res.audio));
            if (res.image) urls.push(...extractUrls(res.image));
            if (res.mp4) urls.push(...extractUrls(res.mp4));
            if (res.mp3) urls.push(...extractUrls(res.mp3));
            if (res.thumbnail) urls.push(...extractUrls(res.thumbnail));
            return urls.flat();
        };

        let allUrls = extractUrls(result);
        console.log("All URLs:", allUrls);

        const format = "🎥 Video";
        const isVideo = format === "🎥 Video";
        const isAudio = format === "🎵 Audio / MP3";
        const isImage = format === "📸 Gambar";

        let targetUrls = allUrls.filter(u => {
            const lu = u.toLowerCase();
            if (isAudio && (lu.includes('.mp3') || lu.includes('audio') || result?.mp3 === u || (result?.audio && JSON.stringify(result.audio).includes(u)))) return true;
            if (isVideo && (lu.includes('.mp4') || lu.includes('video') || result?.mp4 === u || (result?.video && JSON.stringify(result.video).includes(u)))) return true;
            if (isImage && (lu.includes('.jpg') || lu.includes('.jpeg') || lu.includes('.png') || lu.includes('image') || result?.thumbnail === u)) return true;
            return false;
        });
        
        console.log("Target URLs (filter):", targetUrls);

        if (targetUrls.length === 0) {
            if (isVideo && result?.mp4) targetUrls = [result.mp4];
            else if (isAudio && result?.mp3) targetUrls = [result.mp3];
            else if (isImage && result?.thumbnail) targetUrls = [result.thumbnail];
            else {
                if (isVideo) targetUrls = allUrls.filter(u => !u.includes('.jpg') && !u.includes('.mp3'));
                if (isAudio) targetUrls = allUrls.filter(u => !u.includes('.jpg') && !u.includes('.mp4'));
            }
        }
        
        console.log("Target URLs (final):", targetUrls);
        
    } catch(e) {
        console.error(e);
    }
}
test();
