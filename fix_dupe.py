import re

with open('server.ts', 'r') as f:
    content = f.read()

# Find the first occurrence of `startServer();async function processPascaPayment`
idx = content.find('startServer();async function processPascaPayment')
if idx != -1:
    # Just cut it there, keeping `startServer();\n`
    # Wait, the last character of the original file was probably just `\n`, which is `content[-1]`.
    # Let's see what is exactly at `idx`
    content = content[:idx] + 'startServer();\n'
    
    with open('server.ts', 'w') as f:
        f.write(content)
    print("Duplication fixed!")
else:
    print("Not found")

