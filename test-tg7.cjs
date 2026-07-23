const { Telegraf } = require("telegraf");
const https = require("https");
const agent = new https.Agent({ family: 4 });
const bot = new Telegraf("8907328115:AAH99alE5YwJjBCxmYfu\r", { telegram: { agent } });
bot.telegram.getMe().then(console.log).catch(e => console.error("ERR:", e.message));
