import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('const DB_FILE = "db.json";', 'const DB_FILE = path.join(__dirname, "..", "db.json");')
content = content.replace('"wa_auth"', 'path.join(__dirname, "..", "wa_auth")')

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
