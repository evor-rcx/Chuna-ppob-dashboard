const http = require('btch-downloader/dist/Utils/http');
const config = require('btch-downloader/dist/Watermark/config').default;
const pkg = require('btch-downloader/package.json');
async function test() {
    try {
        const data = await http.HttpGet('ttdl', 'https://vt.tiktok.com/ZSXnjuuJX/', pkg.version, 50000, config.baseUrl);
        console.log(JSON.stringify(data, null, 2));
    } catch(e) { console.log(e); }
}
test();
