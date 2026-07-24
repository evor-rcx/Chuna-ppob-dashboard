const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex1 = /if \(notaBuffer\) \{\s*tgMsg = await ctx\.replyWithPhoto\(\{ source: notaBuffer \}, \{ caption: msg, parse_mode: 'Markdown', reply_markup: returnMarkup \}\);\s*\} else \{\s*tgMsg = await ctx\.reply\(msg, \{ parse_mode: 'Markdown', reply_markup: returnMarkup \}\);\s*\}/g;

const replace1 = `if (notaBuffer) {
                        try { await ctx.telegram.deleteMessage(ctx.chat?.id, tgMsgId); } catch(e) {}
                        tgMsg = await ctx.replyWithPhoto({ source: notaBuffer }, { caption: msg, parse_mode: 'Markdown', reply_markup: returnMarkup });
                    } else {
                        try {
                            await ctx.telegram.editMessageText(ctx.chat?.id, tgMsgId, undefined, msg, { parse_mode: 'Markdown', reply_markup: returnMarkup });
                            tgMsg = { message_id: tgMsgId };
                        } catch (e) {
                            tgMsg = await ctx.reply(msg, { parse_mode: 'Markdown', reply_markup: returnMarkup });
                        }
                    }`;

const regex2 = /const tgMsg = await ctx\.reply\(msg, \{ reply_markup: returnMarkup \}\);\s*tgMsgId = tgMsg\.message_id;/g;
const replace2 = `let tgMsg;
                    try {
                        await ctx.telegram.editMessageText(ctx.chat?.id, tgMsgId, undefined, msg, { parse_mode: 'Markdown', reply_markup: returnMarkup });
                        tgMsg = { message_id: tgMsgId };
                    } catch (e) {
                        tgMsg = await ctx.reply(msg, { reply_markup: returnMarkup });
                    }
                    tgMsgId = tgMsg.message_id;`;

if (regex1.test(code)) {
    code = code.replace(regex1, replace1);
    console.log("Replaced 1");
}
if (regex2.test(code)) {
    code = code.replace(regex2, replace2);
    console.log("Replaced 2");
}
fs.writeFileSync('server.ts', code);
