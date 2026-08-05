const fg = require('api-dylux');
async function test() {
    try {
        const url = 'https://youtu.be/yg3EXDKvUAw';
        const res = await fg.ytv(url);
        console.log("Video:", res);
        
        const res2 = await fg.yta(url);
        console.log("Audio:", res2);
    } catch (e) {
        console.error(e.message);
    }
}
test();
