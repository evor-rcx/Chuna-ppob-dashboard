const { Downloader } = require('@tobyg74/tiktok-api-dl');
async function test() {
    try {
        const result = await Downloader('https://vt.tiktok.com/ZSYP87rJw/', { version: 'v1' });
        console.log(JSON.stringify(result, null, 2));
    } catch(e) {
        console.error(e);
    }
}
test();
