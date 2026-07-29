async function run() {
    try {
        const url = 'https://www.facebook.com/share/r/17QdMxWUX3/';
        // Let's test a known free API like api.siputzx.my.id
        const res = await fetch(`https://api.siputzx.my.id/api/d/facebook?url=${encodeURIComponent(url)}`);
        const json = await res.json();
        console.log("siputzx FB:", JSON.stringify(json, null, 2));
    } catch(e) { console.error(e); }
    
    try {
        const url = 'https://www.instagram.com/reel/C-k2y1Fv-cZ/?igsh=MWZjdzd3ZmlzOHp3OQ==';
        const res = await fetch(`https://api.siputzx.my.id/api/d/igdl?url=${encodeURIComponent(url)}`);
        const json = await res.json();
        console.log("siputzx IG:", JSON.stringify(json, null, 2));
    } catch(e) { console.error(e); }
}
run();
