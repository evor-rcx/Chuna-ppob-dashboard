const { createCanvas } = require('@napi-rs/canvas');
try {
    const canvas = createCanvas(600, 1000);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 600, 1000);
    ctx.fillStyle = '#000000';
    ctx.font = '36px Arial';
    ctx.fillText('Test Draw', 50, 50);

    const finalCanvas = createCanvas(600, 500);
    const finalCtx = finalCanvas.getContext('2d');
    finalCtx.drawImage(canvas, 0, 0);
    
    const buf = finalCanvas.toBuffer('image/png');
    console.log("Success! Buffer size:", buf.length);
} catch (e) {
    console.error("Error:", e);
}
