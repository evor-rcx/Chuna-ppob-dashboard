import re

with open("server.ts", "r") as f:
    content = f.read()

content = content.replace("replace(/\n", "replace(/\\n").replace("g, '<br>')", "g, '<br>')")

with open("server.ts", "w") as f:
    f.write(content)
