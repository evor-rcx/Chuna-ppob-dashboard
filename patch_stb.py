import re

for file in ['/app/applet/src/components/views/Login.tsx', '/app/applet/src/components/Sidebar.tsx']:
    with open(file, 'r') as f:
        content = f.read()

    # Add style to video
    content = re.sub(
        r'<video src="/logo.mp4" autoPlay loop muted playsInline className="w-full h-full object-contain" />',
        r'<video src="/logo.mp4" autoPlay loop muted playsInline className="w-full h-full object-contain" style={{ transform: \'translateZ(0)\', WebkitTransform: \'translateZ(0)\' }} />',
        content
    )

    with open(file, 'w') as f:
        f.write(content)

