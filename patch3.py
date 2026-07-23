with open('/app/applet/server.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace \`\`\`
text = text.replace(r'\n\`\`\`\n', r'\n\n')
text = text.replace(r'\n\`\`\``;', r'`;')

with open('/app/applet/server.ts', 'w', encoding='utf-8') as f:
    f.write(text)

