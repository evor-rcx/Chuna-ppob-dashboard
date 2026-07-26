const { EdgeTTS } = require('node-edge-tts');
const fs = require('fs');

async function test() {
    try {
        const tts = new EdgeTTS({
            voice: 'id-ID-GadisNeural',
            lang: 'id-ID',
            outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
            pitch: '+30%',
            rate: '+15%'
        });
        await tts.ttsPromise('Halo kak Reza, ini tes voice cewek dari chuna.', './tes-cewek-cute2.mp3');
        console.log("TTS CUTE2 Done, size:", fs.statSync('./tes-cewek-cute2.mp3').size);
    } catch(e) {
        console.log(e);
    }
}
test();
