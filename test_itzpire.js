async function run() {
    try {
        const res = await fetch('https://itzpire.site/download/instagram?url=' + encodeURIComponent('https://www.instagram.com/reel/C-k2y1Fv-cZ/?igsh=MWZjdzd3ZmlzOHp3OQ=='));
        const json = await res.json();
        console.log("IG:", JSON.stringify(json, null, 2));
    } catch(e) { console.log(e); }
    try {
        const res = await fetch('https://itzpire.site/download/facebook?url=' + encodeURIComponent('https://www.facebook.com/share/r/17QdMxWUX3/'));
        const json = await res.json();
        console.log("FB:", JSON.stringify(json, null, 2));
    } catch(e) { console.log(e); }
}
run();
