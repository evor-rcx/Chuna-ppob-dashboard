const { Telegraf } = require("telegraf");
const bot = new Telegraf("8907328115:AAH99alE5YwJjBCxmYfu \n \r DUMMY");
bot.telegram.getMe().then(console.log).catch(e => console.error(e.message));
