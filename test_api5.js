async function run() {
    try {
        const url = 'https://www.instagram.com/reel/C-k2y1Fv-cZ/';
        const res = await fetch(`https://api.vreden.my.id/api/igdownload?url=${encodeURIComponent(url)}`);
        console.log(await res.text());
    } catch(e) { console.log(e); }
}
run();
