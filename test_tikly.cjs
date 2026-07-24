async function test() {
    const res = await fetch('https://api.tiklydown.eu.org/api/download?url=https://vt.tiktok.com/ZSXnjuuJX/');
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
}
test();
