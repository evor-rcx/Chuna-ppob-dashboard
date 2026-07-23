const { createCanvas, GlobalFonts } = require("@napi-rs/canvas");
try {
    const canvas = createCanvas(600, 1000);
    const ctx = canvas.getContext("2d");
    ctx.font = 'bold 36px Arial, sans-serif';
    ctx.fillText('E4 STORE', 300, 60);
    console.log("Status: Canvas font Arial OK!");
} catch(e) {
    console.error("Canvas Error:", e);
}
