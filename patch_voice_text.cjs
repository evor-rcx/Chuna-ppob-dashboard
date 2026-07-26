const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr1 = "`Sama-sama, Kak ${customerName}! Terima kasih sudah berbelanja di E4 Store. Semoga pulsa/kuotanya langsung terpakai dengan lancar. Kalau ada kendala atau mau order lagi, jangan sungkan chat Chuna lagi ya! 😊`";
const newStr1 = "`Makasih kembali Kak ${customerName}! Seneng banget bisa ngobrol dan bantu transaksi hari ini. Chuna doain semoga berkah, ya. Sampai jumpa lagi di transaksi berikutnya! 🥰`";

const targetStr2 = "const tts = new EdgeTTS({ voice: 'id-ID-GadisNeural', lang: 'id-ID', outputFormat: 'audio-24khz-48kbitrate-mono-mp3', pitch: '+30%', rate: '+15%' });";
const newStr2 = "const tts = new EdgeTTS({ voice: 'id-ID-GadisNeural', lang: 'id-ID', outputFormat: 'audio-24khz-48kbitrate-mono-mp3' });";

if (code.includes(targetStr1) && code.includes(targetStr2)) {
    code = code.replace(targetStr1, newStr1);
    code = code.replace(targetStr2, newStr2);
    fs.writeFileSync('server.ts', code);
    console.log("Patched successfully!");
} else {
    console.log("Target string not found.");
    if (!code.includes(targetStr1)) console.log("Missing target 1");
    if (!code.includes(targetStr2)) console.log("Missing target 2");
}
