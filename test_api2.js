async function run() {
    try {
        const res = await fetch(`https://api.vreden.my.id/api/fbdl?url=` + encodeURIComponent('https://www.facebook.com/share/r/17QdMxWUX3/'));
        const json = await res.json();
        console.log("vreden FB:", JSON.stringify(json, null, 2));
    } catch(e) { console.error("vreden:", e); }
    
    try {
        const res = await fetch(`https://api.lolhuman.xyz/api/facebook?apikey=sgwn&url=` + encodeURIComponent('https://www.facebook.com/share/r/17QdMxWUX3/'));
        const json = await res.json();
        console.log("lolhuman FB:", JSON.stringify(json, null, 2));
    } catch(e) { console.error("lolhuman:", e); }
}
run();
