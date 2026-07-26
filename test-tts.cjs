const { EdgeTTS } = require('node-edge-tts');
const fs = require('fs');

async function test() {
    const tts = new EdgeTTS({
        voice: 'id-ID-GadisNeural',
        lang: 'id-ID',
        outputFormat: 'audio-24khz-48kbitrate-mono-mp3'
    });
    
    await tts.ttsPromise('Halo kak Reza, ini tes voice cewek dari chuna.', './tes-cewek.mp3');
    console.log("TTS Done, size:", fs.statSync('./tes-cewek.mp3').size);
}
test();
