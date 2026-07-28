import { EdgeTTS } from 'node-edge-tts';
async function run() {
    const vnText = "Tes webm format.";
    const tts = new EdgeTTS({ 
        voice: 'id-ID-GadisNeural', 
        lang: 'id-ID', 
        outputFormat: 'webm-24khz-16bit-mono-opus' 
    });
    try {
        await tts.ttsPromise(vnText, 'test_tts_webm.webm');
        console.log("Success webm-24khz-16bit-mono-opus");
    } catch(e) {
        console.log("Failed webm", e.message);
    }
}
run();
