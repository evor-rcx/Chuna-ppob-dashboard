import re

with open('server.ts', 'r') as f:
    content = f.read()

content = re.sub(r'\s*if \(transactions\.length > 50\) transactions\.pop\(\);\n', '\n', content)

with open('server.ts', 'w') as f:
    f.write(content)
