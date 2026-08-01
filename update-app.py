import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

pattern = r"""  useEffect\(\(\) => \{
    const handleLogout = \(\) => setIsAuthenticated\(false\);"""

new_code = """  useEffect(() => {
    const savedTheme = localStorage.getItem('chuna_theme');
    if (savedTheme === 'light') {
      document.documentElement.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
    }
  }, []);

  useEffect(() => {
    const handleLogout = () => setIsAuthenticated(false);"""

if pattern in code:
    code = code.replace(pattern, new_code)
    with open('src/App.tsx', 'w') as f:
        f.write(code)
    print("Replaced!")
else:
    print("Not found!")
