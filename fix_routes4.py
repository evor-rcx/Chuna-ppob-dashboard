import re

with open("server.ts", "r") as f:
    content = f.read()

bad_str = """
if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {"""

if bad_str in content:
    content = content.replace(bad_str, "\n        } else {")
    print("Fixed bad str")
else:
    print("Bad str not found!")

# Now we need to insert the `if (process.env.NODE_ENV !== "production") { ...` before the `app.get("*", ...)`
# Wait, look at the end of the file:
#   } else {
#     const distPath = path.join(process.cwd(), "dist");
#     app.use(express.static(distPath));
#     app.get("*", (req, res) => {
# ...

# We just need to change `} else {` at the end to:
end_replacement = """
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
"""

# Let's find the `} else {` right before `const distPath = path.join(process.cwd(), "dist");`
pattern = re.compile(r'(\} else \{\s+const distPath = path\.join\(process\.cwd\(\), "dist"\);\s+app\.use\(express\.static\(distPath\)\);\s+app\.get\("\*", \(req, res\))')
match = pattern.search(content)

if match:
    content = content[:match.start()] + end_replacement + match.group(0)[8:]
    print("Fixed end block")

with open("server.ts", "w") as f:
    f.write(content)

