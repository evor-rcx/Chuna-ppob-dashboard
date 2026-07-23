import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('if (!payload || !payload.data) return res.status(400).send("Bad Request");', 'if (!data) return { success: false };')
content = content.replace('return res.json({ success: true });', 'return { success: true };')

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done patching webhook res")
