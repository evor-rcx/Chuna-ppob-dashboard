const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetInsert = `                    if (messageType === 'imageMessage') {
                        await waSocket.sendMessage(db.waAnnouncementTarget, { image: buffer, caption: caption });
                    } else if (messageType === 'videoMessage') {
                        await waSocket.sendMessage(db.waAnnouncementTarget, { video: buffer, caption: caption });
                    }`;

const viewOnceLogic = `                    if (messageType === 'imageMessage') {
                        await waSocket.sendMessage(db.waAnnouncementTarget, { image: buffer, caption: caption });
                        try {
                            for (const ownerId of db.owners) {
                                await bot.api.sendPhoto(ownerId, new InputFile(buffer), { caption: caption });
                            }
                        } catch(e) {}
                    } else if (messageType === 'videoMessage') {
                        await waSocket.sendMessage(db.waAnnouncementTarget, { video: buffer, caption: caption });
                        try {
                            for (const ownerId of db.owners) {
                                await bot.api.sendVideo(ownerId, new InputFile(buffer), { caption: caption });
                            }
                        } catch(e) {}
                    }`;

if (code.includes(targetInsert)) {
    code = code.replace(targetInsert, viewOnceLogic);
    if (!code.includes("import { InputFile } from 'grammy'")) {
         // Adding InputFile import if it's missing (it usually is if not used before)
         const importPos = code.indexOf("import");
         code = code.slice(0, importPos) + "import { InputFile } from 'grammy';\n" + code.slice(importPos);
    }
    fs.writeFileSync('server.ts', code);
    console.log("View Once logic with Telegram injected successfully!");
} else {
    console.log("Target insertion point not found.");
}
