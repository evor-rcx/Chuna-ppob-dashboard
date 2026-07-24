async function test() {
    try {
        const res = await fetch('https://aemt.me/download/tiktokslide?url=https://vt.tiktok.com/ZSXnjuuJX/');
        const json = await res.json();
        console.log(JSON.stringify(json, null, 2));
    } catch(e) { console.error(e.message); }
}
test();
