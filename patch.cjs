const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target1 = 'await ctx.reply(`📋 *Kategori ${text} (Prabayar)*Silakan pilih brand di bawah ini:`';
const rep1 = 'const prevMemberId = userStates[userId]?.data?.memberId;\n                        userStates[userId] = { step: \'PREPAID_SELECT_BRAND\', data: { category: text, memberId: prevMemberId } };\n                        await ctx.reply(`📋 *Kategori ${text} (Prabayar)*\\nSilakan pilih brand di bawah ini:`';

code = code.replace(target1, rep1);

fs.writeFileSync('server.ts', code);
console.log("Patched category state save");
