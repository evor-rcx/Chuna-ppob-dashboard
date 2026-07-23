import re

with open("server.ts", "r") as f:
    content = f.read()

content = content.replace("replace(/", "replace(/").replace("\\n/g, ', ')", "\\\\n/g, ', ')")

with open("server.ts", "w") as f:
    f.write(content)
