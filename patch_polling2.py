import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("const pendingTxs = transactions.filter(t => t.status === 'Pending');", "const pendingTxs = transactions.filter(t => t.status === 'Pending');\n          if (pendingTxs.length > 0) console.log(`[Polling] Found ${pendingTxs.length} pending transactions...`);")

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched successfully")
