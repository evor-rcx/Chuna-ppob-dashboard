import re

for file in ['/app/applet/src/components/views/Login.tsx', '/app/applet/src/components/Sidebar.tsx']:
    with open(file, 'r') as f:
        content = f.read()

    # Replace video back to img
    content = re.sub(
        r'<video src="/logo\.mp4"[^>]+/>',
        r'<img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />',
        content
    )

    with open(file, 'w') as f:
        f.write(content)

