const path = require('path');
const fs = require('fs');

async function test() {
    let createCanvas, loadImage, canvasLibLoaded = false;
    try {
        const canvasLib = require('@napi-rs/canvas');
        createCanvas = canvasLib.createCanvas;
        loadImage = canvasLib.loadImage;
        canvasLibLoaded = true;
    } catch (e) {
        console.error("WARN: Failed to load @napi-rs/canvas.", e);
    }
    
    if (!canvasLibLoaded) return;
    
    try {
        const bgPath = path.join(process.cwd(), 'src/assets/bg_nota.png');
        console.log("Loading image from", bgPath);
        const bgImage = await loadImage(bgPath);
        console.log("Image loaded", bgImage.width, bgImage.height);
        
        const canvas = createCanvas(bgImage.width, bgImage.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bgImage, 0, 0, bgImage.width, bgImage.height);
        ctx.font = '30px Courier New';
        ctx.fillText('Test', 100, 100);
        
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync('test_napi.png', buffer);
        console.log('Saved test_napi.png');
    } catch (e) {
        console.error("Error", e);
    }
}
test();
