with open('/app/applet/server.ts', 'r') as f:
    text = f.read()

text = text.replace("\\\\n", "\\n")

with open('/app/applet/server.ts', 'w') as f:
    f.write(text)
