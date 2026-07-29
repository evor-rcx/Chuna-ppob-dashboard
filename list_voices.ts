import { EdgeTTS } from 'node-edge-tts';
async function run() {
    const tts = new EdgeTTS();
    // we need to see if we can get voices. The previous attempt failed because getVoices doesn't exist on this module.
}
run();
