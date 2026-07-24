const format = "🎥 Video";
const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

const isVideo = format === "🎥 Video";
const isVoiceNote = format === "🎙️ Voice Note";
const isAudio = format === "🎵 Audio / MP3";
const isImage = format === "📸 Gambar";

const result = {
  developer: '@prm2.0',
  status: true,
  title: 'Rick Astley - Never Gonna Give You Up (Official Video) (4K Remaster)',
  thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
  author: 'Rick Astley',
  mp3: 'https://c.ymcdn.org/api/v2/download/59f55c181c1da2f71d4bf6b1a0092271/dQw4w9WgXcQ?_=Dljm-HV2KfsE9LSTzCUw5KTaONvBbarnN_nuHRZS-_0jucX5s5U-e7jVamdNHCCFyNo9i6aWD0oa2X66RZgXsQ',
  mp4: 'https://c.ymcdn.org/api/v2/download/59f55c181c1da2f71d4bf6b1a0092271/dQw4w9WgXcQ?_=sMmKi2NxgCbtpTXj6bl3qTylBRyTeQ_8Z16G7Sg-ZGa06VGL28XzMHWjT3xDFRIX_gob10JvP3JnhcjQCzbISA'
};

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
let targetUrls = allUrls.filter(u => {
    const lu = u.toLowerCase();
    if ((isAudio || isVoiceNote) && (lu.includes('.mp3') || lu.includes('audio') || result?.mp3 === u || (result?.audio && JSON.stringify(result.audio).includes(u)))) return true;
    if (isVideo && (lu.includes('.mp4') || lu.includes('video') || result?.mp4 === u || (result?.video && JSON.stringify(result.video).includes(u)))) return true;
    if (isImage && (lu.includes('.jpg') || lu.includes('.jpeg') || lu.includes('.png') || lu.includes('image') || result?.thumbnail === u)) return true;
    return false;
});

if (targetUrls.length === 0) {
    if (isVideo && result?.mp4) targetUrls = [result.mp4];
    else if ((isAudio || isVoiceNote) && result?.mp3) targetUrls = [result.mp3];
    else if (isImage && result?.thumbnail) targetUrls = [result.thumbnail];
    else {
        if (isVideo) targetUrls = allUrls.filter(u => !u.includes('.jpg') && !u.includes('.mp3'));
        if (isAudio || isVoiceNote) targetUrls = allUrls.filter(u => !u.includes('.jpg') && !u.includes('.mp4'));
    }
}
targetUrls = [...new Set(targetUrls)];
console.log("Target:", targetUrls);
