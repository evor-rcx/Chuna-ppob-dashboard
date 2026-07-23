with open('/app/applet/server.ts', 'r') as f:
    text = f.read()

text = text.replace("tx.status = status;", "tx.status = status;\n                if (data.sn) tx.sn = data.sn;\n")

with open('/app/applet/server.ts', 'w') as f:
    f.write(text)
