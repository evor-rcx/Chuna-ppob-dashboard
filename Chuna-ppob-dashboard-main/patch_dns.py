import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

dns_code = """import dns from 'dns';
try {
    dns.setDefaultResultOrder('ipv4first');
} catch (e) {}
"""

if "dns.setDefaultResultOrder" not in content:
    content = re.sub(r'(import .*;\n)+', lambda m: m.group(0) + '\n' + dns_code, content, count=1)
    with open('server.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched DNS")
else:
    print("Already patched DNS")
