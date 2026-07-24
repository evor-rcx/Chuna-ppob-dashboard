const extractUrls = (res) => {
    if (!res) return [];
    if (typeof res === 'string' && res.startsWith('http')) return [res];
    if (Array.isArray(res)) return res.map(r => extractUrls(r)).flat();
    
    let urls = [];
    if (res.url) urls.push(res.url);
    if (res.video) urls.push(...extractUrls(res.video));
    if (res.audio) urls.push(...extractUrls(res.audio));
    if (res.image) urls.push(...extractUrls(res.image));
    if (res.images) urls.push(...extractUrls(res.images));
    if (res.mp4) urls.push(...extractUrls(res.mp4));
    if (res.mp3) urls.push(...extractUrls(res.mp3));
    if (res.thumbnail) urls.push(...extractUrls(res.thumbnail));
    return urls.flat();
};

const result = {
  "type": "video",
  "video": [
    {
      "playAddr": "https://video.tiktok.com/playAddr..."
    }
  ]
};

console.log(extractUrls(result));
