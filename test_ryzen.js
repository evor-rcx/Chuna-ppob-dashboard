async function run() {
    try {
        const url = 'https://www.facebook.com/share/r/17QdMxWUX3/';
        const res = await fetch(`https://api.ryzendesu.vip/api/downloader/fbdl?url=${encodeURIComponent(url)}`);
        const json = await res.json();
        console.log("ryzen FB:", JSON.stringify(json, null, 2));
    } catch(e) { console.error(e); }
    
    try {
        const url = 'https://www.instagram.com/reel/C-k2y1Fv-cZ/?igsh=MWZjdzd3ZmlzOHp3OQ==';
        const res = await fetch(`https://api.ryzendesu.vip/api/downloader/igdl?url=${encodeURIComponent(url)}`);
        const json = await res.json();
        console.log("ryzen IG:", JSON.stringify(json, null, 2));
    } catch(e) { console.error(e); }
}
run();
