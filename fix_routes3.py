import re

with open("server.ts", "r") as f:
    content = f.read()

# I will find the block starting with app.get("/api/tagihan-nota" and ending right before } else {
# Wait, they are currently inside the `if` block, right after app.use(vite.middlewares); and right before } else {
# So it's:
# app.use(vite.middlewares);
# app.get("/api/tagihan-nota", ...
# ...
# app.get("/api/nota/:id", ...
# ...
# } else {

pattern = re.compile(r'(app\.use\(vite\.middlewares\);\s+)(app\.get\("/api/tagihan-nota".*?)(} else {)', re.DOTALL)
match = pattern.search(content)

if match:
    vite_mw = match.group(1)
    apis = match.group(2)
    else_block = match.group(3)
    
    # We want apis to be BEFORE `if (process.env.NODE_ENV !== "production") {`
    # Let's find where the `if` starts.
    if_str = 'if (process.env.NODE_ENV !== "production") {'
    if_idx = content.rfind(if_str, 0, match.start())
    
    if if_idx != -1:
        # Build the new content
        new_content = content[:if_idx] + apis + "\n" + content[if_idx:match.start()] + vite_mw + else_block + content[match.end():]
        with open("server.ts", "w") as f:
            f.write(new_content)
        print("Fixed routes 3")
    else:
        print("Could not find if block")
else:
    print("Could not find pattern in fix_routes3")
