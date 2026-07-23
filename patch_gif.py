import re

for file in ['/app/applet/src/components/views/Login.tsx', '/app/applet/src/components/Sidebar.tsx']:
    with open(file, 'r') as f:
        content = f.read()

    # Change logo.png to logo.gif
    content = re.sub(
        r'<img src="/logo\.png"[^>]+/>',
        r'<img src="/logo.gif" alt="Logo" className="w-full h-full object-contain" />',
        content
    )

    with open(file, 'w') as f:
        f.write(content)

