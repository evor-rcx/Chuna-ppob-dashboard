import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

if "bot.catch((err, ctx) => {" not in content:
    content = content.replace("bot = new Telegraf(token);", "bot = new Telegraf(token);\n      bot.catch((err, ctx) => {\n        console.error('Ooops, encountered an error for ' + ctx.updateType, err);\n      });")
    with open('server.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched bot.catch")
else:
    print("Already patched")
