import { snapsave } from 'snapsave-media-downloader';

async function test() {
    try {
        const url = 'https://www.instagram.com/p/C0gQoFEvR6b/'; // example post
        const res = await snapsave(url);
        console.log("RESULT:", JSON.stringify(res, null, 2));
    } catch(e) {
        console.error("ERROR:", e);
    }
}
test();
