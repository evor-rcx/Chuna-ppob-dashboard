import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

handler = """process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
"""

if "process.on('unhandledRejection'" not in content:
    # Insert after imports
    content = re.sub(r'(import .*;\n)+', lambda m: m.group(0) + '\n' + handler, content, count=1)
    with open('server.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched error handlers")
else:
    print("Already patched")
