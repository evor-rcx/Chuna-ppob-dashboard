import { createCanvas } from '@napi-rs/canvas';
const canvas = createCanvas(200, 200);
const ctx = canvas.getContext('2d');
try {
  ctx.roundRect(0, 0, 100, 100, 10);
  console.log("roundRect works");
} catch(e) {
  console.error("roundRect error:", e.message);
}
