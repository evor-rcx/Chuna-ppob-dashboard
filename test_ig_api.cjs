async function test() {
    try {
        const url = 'https://www.instagram.com/reel/C8_z0vHpxqJ/';
        const res = await fetch(`https://api.vreden.my.id/api/igdownload?url=${url}`);
        const data = await res.json();
        console.log("RESULT:", JSON.stringify(data, null, 2));
    } catch(e) {
        console.error("ERROR:", e);
    }
}
test();
