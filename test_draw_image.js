import { createCanvas } from '@napi-rs/canvas';
try {
  const canvas1 = createCanvas(200, 200);
  const ctx1 = canvas1.getContext('2d');
  ctx1.fillRect(0,0,100,100);

  const canvas2 = createCanvas(100, 100);
  const ctx2 = canvas2.getContext('2d');
  ctx2.drawImage(canvas1, 0, 0);
  
  console.log("drawImage works");
} catch(e) {
  console.error("drawImage error:", e.message);
}
