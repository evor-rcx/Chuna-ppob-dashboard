const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `const tts = new EdgeTTS({ voice: 'id-ID-GadisNeural', lang: 'id-ID', outputFormat: 'audio-24khz-48kbitrate-mono-mp3' });`;
const newStr = `const tts = new EdgeTTS({ voice: 'id-ID-GadisNeural', lang: 'id-ID', outputFormat: 'audio-24khz-48kbitrate-mono-mp3', pitch: '+30%', rate: '+15%' });`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, newStr);
    fs.writeFileSync('server.ts', code);
    console.log("Patched successfully!");
} else {
    console.log("Target string not found.");
}
