with open('/app/applet/server.ts', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("await new Promise(r => setTimeout(r, 2000));", "await new Promise(r => setTimeout(r, 3000));")

with open('/app/applet/server.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("Changed 2000 to 3000")
