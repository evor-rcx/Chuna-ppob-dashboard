const { Telegraf } = require("telegraf");
const bot = new Telegraf("8907328115:AAH99alE5YwJjBCxmYfu\r");
bot.telegram.getMe().then(console.log).catch(e => console.error("ERR:", e.message));
