with open('/app/applet/server.ts', 'r') as f:
    content = f.read()

content = content.replace("\\\\n                  const jidList: string[] = [];\\\\n", "\\n                  const jidList: string[] = [];\\n")

with open('/app/applet/server.ts', 'w') as f:
    f.write(content)

