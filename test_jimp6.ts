import Jimp from 'jimp';
import path from 'path';
async function run() {
    const bgPath = path.join(process.cwd(), 'src/assets/bg_nota.png');
    const image = await Jimp.read(bgPath);
    const cloned = image.clone();
    console.log("Cloned MIME:", cloned.getMIME());
    const buf = await cloned.getBufferAsync(Jimp.MIME_PNG);
    console.log("Buffer size:", buf.length);
}
run().catch(console.error);
