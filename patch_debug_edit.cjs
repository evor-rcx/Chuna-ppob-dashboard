const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
    'try { await bot.telegram.editMessageText(tx.tgChatId, tx.tgMsgId, undefined, msg, { parse_mode: "Markdown" }); } catch (e) {',
    'try { await bot.telegram.editMessageText(tx.tgChatId, tx.tgMsgId, undefined, msg, { parse_mode: "Markdown" }); } catch (e) { console.error("Edit msg failed:", e.message);'
);

fs.writeFileSync('server.ts', code);
console.log("Patched debug!");
