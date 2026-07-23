import re

for file in ['/app/applet/src/components/views/Login.tsx', '/app/applet/src/components/Sidebar.tsx']:
    with open(file, 'r') as f:
        content = f.read()
    
    content = re.sub(
        r'<img src="/logo\.png" className="([^"]+)" alt="Logo" />', 
        r'<video src="/logo.mp4" autoPlay loop muted playsInline className="\1" />', 
        content
    )
    content = re.sub(
        r'<img src="/logo\.png" className="([^"]+)" />', 
        r'<video src="/logo.mp4" autoPlay loop muted playsInline className="\1" />', 
        content
    )
    
    with open(file, 'w') as f:
        f.write(content)

