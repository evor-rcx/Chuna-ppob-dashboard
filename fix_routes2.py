import re

with open("server.ts", "r") as f:
    content = f.read()

# The structure is:
#   } else {
#     const distPath = path.join(process.cwd(), "dist");
#     app.use(express.static(distPath));
# 
#     app.get("/api/tagihan-nota", (req, res) => {
#        ...
#     });
# 
#     app.get("/api/nota/:id", (req, res) => {
#        ...
#     });
#
#     app.get("*", (req, res) => {
#       res.sendFile(path.join(distPath, "index.html"));
#     });
#   }

pattern = re.compile(r'(} else {\s+const distPath = [^\n]+;\s+app\.use\(express\.static\(distPath\)\);\s+)(app\.get\("/api/tagihan-nota".*?)(app\.get\("\*", \(req, res\) => {\s+res\.sendFile[^\n]+\s+}\);\s+})', re.DOTALL)

match = pattern.search(content)
if match:
    else_start = match.group(1)
    apis = match.group(2)
    catch_all = match.group(3)
    
    new_content = apis + "\n" + else_start + catch_all
    content = content[:match.start()] + new_content + content[match.end():]
    
    with open("server.ts", "w") as f:
        f.write(content)
    print("Fixed routes")
else:
    print("Pattern not matched")

