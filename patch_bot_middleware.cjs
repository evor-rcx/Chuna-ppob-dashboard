const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `      bot.start(async (ctx) => {`;
const replacementStr = `      // Global middleware for typing status
      bot.use(async (ctx, next) => {
        if (ctx.message || ctx.callbackQuery) {
          try {
            await ctx.sendChatAction('typing');
          } catch(e) {}
        }
        return next();
      });

      bot.start(async (ctx) => {`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('server.ts', code);
