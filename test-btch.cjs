const btch = require('btch-downloader');

async function test() {
    const result = await btch.ttdl('https://www.tiktok.com/@tiktok/video/7106594312292453675');
    
    const isVideo = true;
    const isAudio = false;
    const isImage = false;

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
    console.log("All:", allUrls);
    
    let targetUrls = allUrls.filter(u => {
        const lu = u.toLowerCase();
        if (isVideo && (lu.includes('.mp4') || lu.includes('video') || result?.mp4 === u || (result?.video && JSON.stringify(result.video).includes(u)))) return true;
        return false;
    });
    
    console.log("Target:", targetUrls);
}
test();
