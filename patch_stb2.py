import re

for file in ['/app/applet/src/components/views/Login.tsx', '/app/applet/src/components/Sidebar.tsx']:
    with open(file, 'r') as f:
        content = f.read()

    # Fix escaping
    content = content.replace("transform: \\'translateZ(0)\\', WebkitTransform: \\'translateZ(0)\\'", "transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)'")

    with open(file, 'w') as f:
        f.write(content)
