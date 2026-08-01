const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `  const botInfo = await bot.telegram.getMe();`;
const replacementStr = `  const botInfo = await bot.telegram.getMe();
  
  const originalTgSendMessage = bot.telegram.sendMessage.bind(bot.telegram);
  bot.telegram.sendMessage = async (chatId, text, extra) => {
      try {
          await bot.telegram.sendChatAction(chatId, 'typing');
          await new Promise(r => setTimeout(r, 1000));
      } catch(e) {}
      return originalTgSendMessage(chatId, text, extra);
  };
  
  const originalTgSendPhoto = bot.telegram.sendPhoto.bind(bot.telegram);
  bot.telegram.sendPhoto = async (chatId, photo, extra) => {
      try {
          await bot.telegram.sendChatAction(chatId, 'upload_photo');
          await new Promise(r => setTimeout(r, 1000));
      } catch(e) {}
      return originalTgSendPhoto(chatId, photo, extra);
  };`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('server.ts', code);
