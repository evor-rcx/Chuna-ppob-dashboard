import re

with open('/app/applet/server.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Webhook context
text = text.replace('let member = null;', 'let member = null;\n                let nama = "-";')
text = text.replace('member = members[memberIndex];', 'member = members[memberIndex];\n                    nama = member.name || "-";')

with open('/app/applet/server.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("Fixed nama variable.")
