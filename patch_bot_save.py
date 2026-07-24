import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the start of bot configure
bot_config_pattern = r'app.post\("/api/bot/configure", async \(req, res\) => \{\n\s*const \{ token \} = req.body;\n\s*\n\s*if \(!token\) \{\n\s*return res.status\(400\).json\(\{ error: "Token is required" \}\);\n\s*\}\n\s*\n\s*try \{'

replacement = """app.post("/api/bot/configure", async (req, res) => {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    try {
      db.telegramToken = token;
      writeDB(db);

"""

content = re.sub(bot_config_pattern, replacement, content)

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched bot config")
