const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(`Fitur Download 📥

Halo kak! Silakan kirimkan link video/audio yang ingin didownload.
Chuna mendukung download dari:
🎵 TikTok
📸 Instagram
🎬 YouTube
📘 Facebook
🐦 Twitter

Kirim linknya sekarang ya! 🥰
Contoh link
https://vt.tiktok.com/ZSXWsjbFd/`, `Fitur Download 📥

Halo kak! Silakan kirimkan link video/audio yang ingin didownload.
Saat ini Chuna mendukung download dari:
🎵 TikTok
🎬 YouTube

Kirim linknya sekarang ya! 🥰
Contoh link
https://vt.tiktok.com/ZSXWsjbFd/`);

fs.writeFileSync('server.ts', code);
console.log("Text updated!");
