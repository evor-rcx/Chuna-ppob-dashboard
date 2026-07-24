async function test() {
    try {
        const res = await fetch('https://www.tikwm.com/api/?url=https://vt.tiktok.com/ZSYP87rJw/');
        const json = await res.json();
        if (json.data && json.data.images) {
             console.log("Got", json.data.images.length, "images!");
        } else {
             console.log(json);
        }
    } catch(e) { console.error(e.message); }
}
test();
