import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("const txIndex = transactions.findIndex((t) => t.id === ref_id);", "console.log('Webhook triggered for', ref_id);\n        const txIndex = transactions.findIndex((t) => t.id === ref_id);\n        console.log('txIndex:', txIndex);")

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched successfully")
