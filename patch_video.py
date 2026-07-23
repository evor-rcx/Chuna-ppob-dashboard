import re

for file in ['/app/applet/src/components/views/Login.tsx', '/app/applet/src/components/Sidebar.tsx']:
    with open(file, 'r') as f:
        content = f.read()
    
    # regex replace <video ... /> with <img src="/logo.png" className="..." />
    content = re.sub(r'<video[^>]+src="/logo\.mp4"[^>]*className="([^"]+)"[^>]*>', r'<img src="/logo.png" className="\1" alt="Logo" />', content)
    
    with open(file, 'w') as f:
        f.write(content)

