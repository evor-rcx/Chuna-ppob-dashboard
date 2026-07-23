import re

with open("server.ts", "r") as f:
    content = f.read()

content = re.sub(
    r"let cleanDetail = data\.detail\.replace\(\/\[💎⚡📄📅💡💳\]\/g, ''\).*?if \(cleanDetail\.length",
    r"let cleanDetail = data.detail.replace(/[💎⚡📄📅💡💳]/g, '').replace(/\\n/g, ', ');\n                if (cleanDetail.length",
    content,
    flags=re.DOTALL
)

with open("server.ts", "w") as f:
    f.write(content)
