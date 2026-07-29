import ShadowXFB from 'shadowx-fbdl';
async function run() {
    try {
        const dl = new ShadowXFB();
        console.log("FB:", await dl.download('https://www.facebook.com/share/r/17QdMxWUX3/'));
    } catch(e) { console.log(e); }
}
run();
