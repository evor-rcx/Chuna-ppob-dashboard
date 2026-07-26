const { EdgeTTS } = require('node-edge-tts');
const fs = require('fs');

async function test() {
    try {
        const tts = new EdgeTTS({
            voice: 'id-ID-GadisNeural',
            lang: 'id-ID',
            outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
            pitch: '+20%',
            rate: '+10%'
        });
        await tts.ttsPromise('Halo kak Reza, ini tes voice cewek dari chuna.', './tes-cewek-cute.mp3');
        console.log("TTS CUTE Done, size:", fs.statSync('./tes-cewek-cute.mp3').size);
    } catch(e) {
        console.log(e);
    }
}
test();
