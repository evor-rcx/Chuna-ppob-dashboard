with open('/app/applet/src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("window.addEventListener('logout', handleLogout);", "window.addEventListener('logout', handleLogout as EventListener);")
content = content.replace("window.removeEventListener('logout', handleLogout);", "window.removeEventListener('logout', handleLogout as EventListener);")

with open('/app/applet/src/App.tsx', 'w') as f:
    f.write(content)
