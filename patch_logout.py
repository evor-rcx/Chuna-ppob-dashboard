with open('/app/applet/src/App.tsx', 'r') as f:
    content = f.read()

if "window.addEventListener('logout'" not in content:
    content = content.replace("useEffect(() => {", "useEffect(() => {\n    const handleLogout = () => setIsAuthenticated(false);\n    window.addEventListener('logout', handleLogout);\n    return () => window.removeEventListener('logout', handleLogout);\n  }, []);\n\n  useEffect(() => {")
    with open('/app/applet/src/App.tsx', 'w') as f:
        f.write(content)

with open('/app/applet/src/components/Sidebar.tsx', 'r') as f:
    sidebar_content = f.read()

sidebar_content = sidebar_content.replace("window.location.reload();", "window.dispatchEvent(new Event('logout'));")

with open('/app/applet/src/components/Sidebar.tsx', 'w') as f:
    f.write(sidebar_content)
