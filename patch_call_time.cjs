const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `              await waSocket.sendPresenceUpdate("recording", call.from);
              await new Promise(r => setTimeout(r, 4500));
              await waSocket.sendPresenceUpdate("paused", call.from);`;

const replacement = `              await waSocket.sendPresenceUpdate("recording", call.from);
              await new Promise(r => setTimeout(r, 3000));
              await waSocket.sendPresenceUpdate("paused", call.from);`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server.ts', code);
    console.log("Patched call timing successfully");
} else {
    console.log("Target not found!");
}
