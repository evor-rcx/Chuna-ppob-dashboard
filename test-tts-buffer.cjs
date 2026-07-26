const { EdgeTTS } = require('node-edge-tts');

async function test() {
    const tts = new EdgeTTS({
        voice: 'id-ID-GadisNeural',
        lang: 'id-ID',
        outputFormat: 'audio-24khz-48kbitrate-mono-mp3'
    });
    
    // Check if ttsPromise returns buffer if no path provided or if there is a method
    console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(tts)));
}
test();
