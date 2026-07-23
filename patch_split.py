import re

with open('server.ts', 'r') as f:
    content = f.read()

old_logic = """        if (token && token.includes('/')) {
            const parts = data.sn.split('/');"""

new_logic = """        if (token && token.includes('/')) {
            const parts = token.split('/');"""

content = content.replace(old_logic, new_logic)

with open('server.ts', 'w') as f:
    f.write(content)
