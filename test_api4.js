import * as cheerio from 'cheerio';
async function run() {
    try {
        const url = 'https://www.facebook.com/share/r/17QdMxWUX3/';
        const res = await fetch('https://dlpanda.com/id?url=' + encodeURIComponent(url));
        const text = await res.text();
        const $ = cheerio.load(text);
        const vids = [];
        $('video source').each((i, el) => vids.push($(el).attr('src')));
        $('a.btn').each((i, el) => {
           if ($(el).attr('href')?.includes('mp4')) vids.push($(el).attr('href'));
        });
        console.log("DLPanda FB:", vids);
    } catch(e) { console.error(e); }
    
    try {
        const url = 'https://www.instagram.com/reel/C-k2y1Fv-cZ/?igsh=MWZjdzd3ZmlzOHp3OQ==';
        const res = await fetch('https://dlpanda.com/id?url=' + encodeURIComponent(url));
        const text = await res.text();
        const $ = cheerio.load(text);
        const vids = [];
        $('video source').each((i, el) => vids.push($(el).attr('src')));
        $('a.btn').each((i, el) => {
           if ($(el).attr('href')?.includes('mp4') || $(el).attr('href')?.includes('jpg') || $(el).attr('href')?.includes('webp')) vids.push($(el).attr('href'));
        });
        console.log("DLPanda IG vids:", vids);
    } catch(e) { console.error(e); }
}
run();
