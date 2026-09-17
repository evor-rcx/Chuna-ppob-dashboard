const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace("import { InputFile } from 'grammy';\n", "");

code = code.replace(/await bot\.api\.sendPhoto\(ownerId, new InputFile\(buffer\), \{ caption: caption \}\);/g, 
"await bot.telegram.sendPhoto(ownerId, { source: buffer }, { caption: caption });");

code = code.replace(/await bot\.api\.sendVideo\(ownerId, new InputFile\(buffer\), \{ caption: caption \}\);/g, 
"await bot.telegram.sendVideo(ownerId, { source: buffer }, { caption: caption });");

fs.writeFileSync('server.ts', code);
console.log("Fixed Telegraf view once");
