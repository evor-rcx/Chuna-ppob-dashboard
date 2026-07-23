import re

with open('/app/applet/server.ts', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("bot.launch();", "await bot.launch();")

with open('/app/applet/server.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("Bot launch await added.")
