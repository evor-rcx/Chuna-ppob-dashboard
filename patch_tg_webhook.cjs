const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const str1 = 'await bot.telegram.sendPhoto(tx.tgChatId, { source: buffer }, { caption: msg, parse_mode: "Markdown" });';
const repl1 = 'await bot.telegram.sendPhoto(tx.tgChatId, { source: buffer }, { caption: msg });';

const str2 = 'await bot.telegram.editMessageText(tx.tgChatId, tx.tgMsgId, undefined, msg, { parse_mode: "Markdown" });';
const repl2 = 'await bot.telegram.editMessageText(tx.tgChatId, tx.tgMsgId, undefined, msg);';

const str3 = 'await bot.telegram.sendMessage(tx.tgChatId, msg, { parse_mode: "Markdown" });';
const repl3 = 'await bot.telegram.sendMessage(tx.tgChatId, msg);';

// also fix the other tgId one
const str4 = 'await bot.telegram.sendPhoto(tgId, { source: buffer }, { caption: msg, parse_mode: "Markdown" });';
const repl4 = 'await bot.telegram.sendPhoto(tgId, { source: buffer }, { caption: msg });';

const str5 = 'await bot.telegram.sendMessage(tgId, msg, { parse_mode: "Markdown" });';
const repl5 = 'await bot.telegram.sendMessage(tgId, msg);';

code = code.split(str1).join(repl1)
           .split(str2).join(repl2)
           .split(str3).join(repl3)
           .split(str4).join(repl4)
           .split(str5).join(repl5);

fs.writeFileSync('server.ts', code);
console.log("Patched successfully!");
