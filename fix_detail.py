import re

with open("server.ts", "r") as f:
    content = f.read()

# For Jimp canvas receipt
content = content.replace(
    r"let cleanDetail = data.detail.replace(/[💎⚡📄📅💡💳]/g, '').replace(/\n/g, ', ');",
    r"let cleanDetail = data.detail.replace(/[💎⚡📄📅💡💳]/g, '').split('\\n').filter((l: string) => !l.toLowerCase().includes('admin') && !l.toLowerCase().includes('total')).join(', ');"
)

# For HTML receipt
content = content.replace(
    r"${data.detail.replace(/[💎⚡📄📅💡💳]/g, '').replace(/\n/g, '<br>')}",
    r"${data.detail.replace(/[💎⚡📄📅💡💳]/g, '').split('\\n').filter((l: string) => !l.toLowerCase().includes('admin') && !l.toLowerCase().includes('total')).join('<br>')}"
)

with open("server.ts", "w") as f:
    f.write(content)
