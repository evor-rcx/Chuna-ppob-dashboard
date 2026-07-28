import { EdgeTTS } from 'node-edge-tts';
async function run() {
    const vnText = "Tes ogg format.";
    const tts = new EdgeTTS({ 
        voice: 'id-ID-GadisNeural', 
        lang: 'id-ID', 
        outputFormat: 'ogg-24khz-16bit-mono-opus' 
    });
    try {
        await tts.ttsPromise(vnText, 'test_tts_ogg.ogg');
        console.log("Success ogg-24khz-16bit-mono-opus");
    } catch(e) {
        console.log("Failed", e.message);
    }
}
run();
