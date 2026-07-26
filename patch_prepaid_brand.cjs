const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

// We need to inject state saving for PREPAID_SELECT_BRAND
const targetCats = `await ctx.reply(\`📋 *Kategori \${text} (Prabayar)*\\nSilakan pilih brand di bawah ini:\`, { 
                            parse_mode: 'Markdown',
                            reply_markup: {
                                keyboard: keyboard,
                                resize_keyboard: true
                            }
                        });
                        handled = true;`;

const newCats = `const prevMemberId = userStates[userId]?.data?.memberId;
                        userStates[userId] = { step: 'PREPAID_SELECT_BRAND', data: { category: text, memberId: prevMemberId } };
                        await ctx.reply(\`📋 *Kategori \${text} (Prabayar)*\\nSilakan pilih brand di bawah ini:\`, { 
                            parse_mode: 'Markdown',
                            reply_markup: {
                                keyboard: keyboard,
                                resize_keyboard: true
                            }
                        });
                        handled = true;`;

if (code.includes(targetCats)) {
    code = code.replace(targetCats, newCats);
    console.log("Patched PREPAID_SELECT_BRAND state save.");
} else {
    console.log("Could not find PREPAID_SELECT_BRAND insertion point.");
}

fs.writeFileSync('server.ts', code);
