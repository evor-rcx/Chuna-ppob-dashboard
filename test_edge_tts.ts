import { EdgeTTS } from 'node-edge-tts';
async function run() {
    const tts = new EdgeTTS();
    const voices = await tts.getVoices();
    console.log(voices.filter(v => v.Locale.startsWith('id-')));
}
run();
