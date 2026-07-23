import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Using regex to replace the block
pattern = re.compile(r"await fetch\(`http://127\.0\.0\.1:\$\{PORT\}/webhook`, \{[\s\S]*?\}\)\.catch\(e => console\.error\(\"Error forwarding webhook:\", e\)\);")

content = pattern.sub("await processDigiflazzWebhookData(json.data);", content)

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done patching fetch")
