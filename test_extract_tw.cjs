const format = "🎥 Video";
const isVideo = format === "🎥 Video";
const isVoiceNote = format === "🎙️ Voice Note";
const isAudio = format === "🎵 Audio / MP3";
const isImage = format === "📸 Gambar";

const result = {
  url: [
    {
      hd: 'https://video.twimg.com/ext_tw_video/1229369724728795137/pu/vid/1280x720/SuTvfL_dASk0eIsa.mp4?tag=10'
    },
    {
      sd: 'https://video.twimg.com/ext_tw_video/1229369724728795137/pu/vid/640x360/tPTTVboT8tFR3f6A.mp4?tag=10'
    }
  ]
};

const extractUrls = (res) => {
    if (!res) return [];
    if (typeof res === 'string' && res.startsWith('http')) return [res];
    if (Array.isArray(res)) return res.map(r => extractUrls(r)).flat();
    
    let urls = [];
    if (res.url) urls.push(res.url); // MISTAKE! Should be ...extractUrls(res.url)
    if (res.video) urls.push(...extractUrls(res.video));
    if (res.audio) urls.push(...extractUrls(res.audio));
    if (res.image) urls.push(...extractUrls(res.image));
    if (res.mp4) urls.push(...extractUrls(res.mp4));
    if (res.mp3) urls.push(...extractUrls(res.mp3));
    if (res.thumbnail) urls.push(...extractUrls(res.thumbnail));
    return urls.flat();
};
                            
let allUrls = extractUrls(result);
try {
    let targetUrls = allUrls.filter(u => {
        const lu = u.toLowerCase();
        return false;
    });
    console.log("Success");
} catch(e) {
    console.log("Error:", e.message);
}
