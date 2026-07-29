async function testApi(url) {
    try {
        const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }});
        const text = await res.text();
        console.log("Result for", url.substring(0, 50), text.substring(0, 150));
    } catch(e) {
        console.log("Failed", url.substring(0, 50));
    }
}
async function run() {
    const fb = encodeURIComponent('https://www.facebook.com/share/r/17QdMxWUX3/');
    const ig = encodeURIComponent('https://www.instagram.com/reel/C-k2y1Fv-cZ/?igsh=MWZjdzd3ZmlzOHp3OQ==');
    
    await testApi(`https://aemt.me/download/fbdl?url=${fb}`);
    await testApi(`https://aemt.me/download/igdl?url=${ig}`);
    
    await testApi(`https://api.agatz.xyz/api/facebook?url=${fb}`);
    await testApi(`https://api.agatz.xyz/api/instagram?url=${ig}`);
    
    await testApi(`https://api.botcahx.eu.org/api/dowloader/fbdown?url=${fb}`);
    await testApi(`https://api.botcahx.eu.org/api/dowloader/igdowloader?url=${ig}`);
}
run();
