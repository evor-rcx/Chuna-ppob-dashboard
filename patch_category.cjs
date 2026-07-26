const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target1 = `                        keyboard.push([{ text: "🔙 Kembali" }]);
                        await ctx.reply(\`📋 *Kategori \${text} (Prabayar)*\\nSilakan pilih brand di bawah ini:\`, { 
                            parse_mode: 'Markdown',
                            reply_markup: {
                                keyboard: keyboard,
                                resize_keyboard: true
                            }
                        });
                        handled = true;`;

const rep1 = `                        keyboard.push([{ text: "🔙 Kembali" }]);
                        const prevMemberId = userStates[userId]?.data?.memberId;
                        userStates[userId] = { step: 'PREPAID_SELECT_BRAND', data: { category: text, memberId: prevMemberId } };
                        await ctx.reply(\`📋 *Kategori \${text} (Prabayar)*\\nSilakan pilih brand di bawah ini:\`, { 
                            parse_mode: 'Markdown',
                            reply_markup: {
                                keyboard: keyboard,
                                resize_keyboard: true
                            }
                        });
                        handled = true;`;

if(code.includes(target1)) {
    code = code.replace(target1, rep1);
    console.log("Patched 1");
} else {
    console.log("Not found 1");
}

fs.writeFileSync('server.ts', code);
