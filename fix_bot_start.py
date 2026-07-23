import re

with open('/app/applet/server.ts', 'r', encoding='utf-8') as f:
    text = f.read()

old_auto_start = r'''  if (db.telegramToken) {
    console.log("Auto-starting Telegram bot...");
    startTelegramBot(db.telegramToken).catch(e => console.error("Auto-start Telegram bot failed", e));
  }'''

new_auto_start = r'''  if (db.telegramToken) {
    console.log("Auto-starting Telegram bot...");
    const autoStart = async () => {
      let retries = 5;
      while (retries > 0) {
        try {
          await startTelegramBot(db.telegramToken);
          console.log("Telegram bot auto-started successfully.");
          break;
        } catch (e: any) {
          console.error(`Auto-start Telegram bot failed (${retries} retries left):`, e.message);
          retries--;
          if (retries > 0) {
            await new Promise(res => setTimeout(res, 3000));
          }
        }
      }
    };
    autoStart();
  }'''

text = text.replace(old_auto_start, new_auto_start)

with open('/app/applet/server.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("Bot start retry added.")
