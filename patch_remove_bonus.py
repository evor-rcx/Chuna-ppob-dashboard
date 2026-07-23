import re

with open('/app/applet/server.ts', 'r') as f:
    content = f.read()

pattern = r'│  ✔️  Free admin fee \(periode terbatas\)\n│  ✔️  Bonus deposit 5% \(klaim sekarang\)\n│  ✔️  Cara klaim: balas "AMBIL" di sini'
new_code = '│  ✔️  Free admin fee (periode terbatas)\\n│  ✔️  Cara klaim: balas "AMBIL" di sini'

content, count = re.subn(pattern, new_code, content)
if count > 0:
    print("Success replacing code.")
else:
    print("Could not find old code.")

with open('/app/applet/server.ts', 'w') as f:
    f.write(content)
