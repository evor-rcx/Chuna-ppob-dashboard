import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# I will find the exact lines to replace.
# It starts at: app.post("/api/bot/configure", async (req, res) => {

old_start = """  app.post("/api/bot/configure", async (req, res) => {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    try {
      db.telegramToken = token;
      writeDB(db);


      if (bot) {
        bot.stop("Config updated");
      }"""

new_start = """  async function startTelegramBot(token: string) {
      if (bot) {
        bot.stop("Config updated");
      }"""

old_end = """      botStatus = "Connected as @" + botInfo.username;
      console.log("Bot started successfully:", botInfo.username);
      
      res.json({ success: true, message: "Bot connected and running" });
    } catch (error: any) {
      botStatus = "Error: " + error.message;
      bot = null;
      res.status(500).json({ success: false, error: error.message });
    }
  });"""

new_end = """      botStatus = "Connected as @" + botInfo.username;
      console.log("Bot started successfully:", botInfo.username);
    } catch (error: any) {
      botStatus = "Error: " + error.message;
      bot = null;
      console.error("Bot start failed:", error);
      throw error;
    }
  }

  app.post("/api/bot/configure", async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Token is required" });
    try {
      db.telegramToken = token;
      writeDB(db);
      await startTelegramBot(token);
      res.json({ success: true, message: "Bot connected and running" });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  if (db.telegramToken) {
    console.log("Auto-starting Telegram bot...");
    startTelegramBot(db.telegramToken).catch(e => console.error("Auto-start Telegram bot failed", e));
  }
"""

if "async function startTelegramBot(token: string)" not in content:
    content = content.replace(old_start, new_start)
    content = content.replace(old_end, new_end)
    with open('server.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched bot refactor")
else:
    print("Already patched")
