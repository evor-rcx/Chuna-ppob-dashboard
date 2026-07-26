const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const p1 = code.indexOf('await ctx.reply(`🧾 *Kategori ${text} (Pascabayar)*');
if (p1 !== -1) {
    const insert = `const prevMemberId = userStates[userId]?.data?.memberId;
                        userStates[userId] = { step: 'PASCA_SELECT_BRAND', data: { category: text, memberId: prevMemberId } };
                        `;
    code = code.substring(0, p1) + insert + code.substring(p1);
    console.log("Pasca categories state set!");
} else {
    console.log("Pasca target not found");
}
fs.writeFileSync('server.ts', code);
