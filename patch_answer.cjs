const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `      bot.action(/^dl_(image|video|audio)$/, async (ctx) => {
        await ctx.answerCbQuery();`;

const replacement = `      bot.action(/^dl_(image|video|audio)$/, async (ctx) => {
        try { await ctx.answerCbQuery().catch(() => {}); } catch(e) {}`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server.ts', code);
    console.log("Patched successfully");
} else {
    console.log("Target not found!");
}
