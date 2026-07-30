import fs from 'fs';
import { EdgeTTS } from 'node-edge-tts';
import path from 'path';
import { exec } from 'child_process';

const baseVnName = path.join(process.cwd(), `tmp_vn_${Date.now()}_${Math.floor(Math.random()*1000)}`);
const vnPathMp3 = `${baseVnName}.mp3`;
const vnPathOgg = `${baseVnName}.ogg`;

console.log("Paths:", vnPathMp3, vnPathOgg);

const tts = new EdgeTTS({ voice: 'id-ID-GadisNeural', lang: 'id-ID', outputFormat: 'audio-24khz-48kbitrate-mono-mp3', pitch: '+20Hz', rate: '+15%' });

tts.ttsPromise("Tes", vnPathMp3).then(() => {
    console.log("TTS done, running ffmpeg...");
    exec(`ffmpeg -y -i ${vnPathMp3} -c:a libopus -b:a 48k -vbr on -compression_level 10 -frame_duration 20 -application voip ${vnPathOgg}`, (error) => {
        if (error) {
            console.error("FFmpeg error:", error);
        } else {
            console.log("FFmpeg success!");
        }
    });
});
