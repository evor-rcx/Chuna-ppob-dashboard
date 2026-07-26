const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes("node-edge-tts")) {
    code = code.replace('import fs from "fs";', 'import fs from "fs";\nimport { EdgeTTS } from "node-edge-tts";');
    fs.writeFileSync('server.ts', code);
    console.log("Added EdgeTTS import");
}
