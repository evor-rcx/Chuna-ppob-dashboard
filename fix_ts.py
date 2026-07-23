import re

with open('server.ts', 'r') as f:
    content = f.read()

content = content.replace("userStates[ctx.from.id] = { step: 'AWAITING_DOWNLOAD' };", "userStates[ctx.from.id] = { step: 'AWAITING_DOWNLOAD', data: {} };")
content = content.replace("userStates[ctx.from.id] = { step: 'AWAITING_LIRIK' };", "userStates[ctx.from.id] = { step: 'AWAITING_LIRIK', data: {} };")

with open('server.ts', 'w') as f:
    f.write(content)
print("TS Fixed")
