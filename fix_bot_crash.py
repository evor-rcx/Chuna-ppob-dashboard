with open('/app/applet/server.ts', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('      console.error("Bot start failed:", error);\n      throw error;', '      console.error("Bot start failed:", error);\n      // Do not throw to prevent server crash')

with open('/app/applet/server.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("Fixed bot crash")
