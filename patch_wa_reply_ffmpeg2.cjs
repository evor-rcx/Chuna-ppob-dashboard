const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `const audioBuffer = fs.readFileSync(vnPathOgg);
                                await waSocket.sendMessage(jid, { audio: audioBuffer, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: msg });`;

const replacement = `const audioBuffer = fs.readFileSync(vnPathOgg);
                                await waSocket.sendMessage(jid, { audio: audioBuffer, mimetype: 'audio/mp4', ptt: true }, { quoted: msg });`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server.ts', code);
    console.log("Patched successfully");
} else {
    console.log("Target not found!");
}
