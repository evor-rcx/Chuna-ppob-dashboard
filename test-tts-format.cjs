const { EdgeTTS } = require('node-edge-tts');
const fs = require('fs');

async function test() {
    try {
        const tts = new EdgeTTS({
            voice: 'id-ID-GadisNeural',
            lang: 'id-ID',
            outputFormat: 'webm-24khz-16bit-mono-opus'
        });
        await tts.ttsPromise('Halo kak Reza, ini tes voice cewek dari chuna.', './tes-cewek.webm');
        console.log("TTS WEBM Done");
    } catch(e) {
        console.log(e);
    }
}
test();
