import re

with open('server.ts', 'r') as f:
    content = f.read()

# Fix token logic
old_logic = """        let token = data.sn || '-';
        let namaPlg = '';
        let golDaya = '';
        let kwh = '';
        
        if (data.sn && data.sn.includes('/')) {"""

new_logic = """        let token = data.sn ? String(data.sn) : '-';
        let namaPlg = '';
        let golDaya = '';
        let kwh = '';
        
        if (token && token.includes('/')) {"""

content = content.replace(old_logic, new_logic)

with open('server.ts', 'w') as f:
    f.write(content)
