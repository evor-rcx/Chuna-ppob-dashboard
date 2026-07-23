import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('async function startTelegramBot(token: string) {\n      if (bot) {', 'async function startTelegramBot(token: string) {\n    try {\n      if (bot) {')

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched try")
