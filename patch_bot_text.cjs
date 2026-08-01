const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target1 = "Butuh bantuan? ${(data.message || '').toLowerCase().includes('ip') ? `Langsung chat Chuna di Bot Telegram:\nChuna siap membantu dengan senyum! 😊💪` : `Chat Chuna di Bot Telegram:\nChuna siap bantu! 😊💪`}`;";
const replacement1 = "${(data.message || '').toLowerCase().includes('ip') ? `Chuna siap membantu dengan senyum! 😊💪` : `Chuna siap bantu! 😊💪`}`;";

const target2 = "Butuh bantuan? Chuna siap membantu dengan senyum! 😊💪`;";
const replacement2 = "Chuna siap bantu! 😊💪`;";

if (code.includes(target1)) {
    code = code.replace(target1, replacement1);
    console.log("Patched target1");
} else {
    console.log("Did not find target1");
}

let occurrences = 0;
while (code.includes(target2)) {
    code = code.replace(target2, replacement2);
    occurrences++;
}
if (occurrences > 0) {
    console.log("Patched target2", occurrences, "times");
} else {
    console.log("Did not find target2");
}

fs.writeFileSync('server.ts', code);
