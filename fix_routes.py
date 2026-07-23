with open("server.ts", "r") as f:
    lines = f.readlines()

out_lines = []
in_else = False
api_lines = []
static_lines = []
catch_all_lines = []

state = "normal"

# 3748: } else {
for i, line in enumerate(lines):
    if state == "normal" and "} else {" in line and "distPath = " in lines[i+1]:
        state = "in_else"
        continue
    
    if state == "in_else":
        if "app.get(\"/api/tagihan-nota\"" in line:
            state = "in_api"
            api_lines.append(line)
        elif "app.use(express.static" in line or "const distPath =" in line:
            static_lines.append(line)
        elif "app.get(\"*\"" in line:
            state = "in_catch_all"
            catch_all_lines.append(line)
        elif line.strip() == "}":
            state = "after_else"
        else:
            # this shouldn't happen, but maybe some whitespace
            if not line.strip():
                pass
            else:
                static_lines.append(line) # fallback
        continue
        
    if state == "in_api":
        if "app.get(\"*\"" in line:
            state = "in_catch_all"
            catch_all_lines.append(line)
        elif line.strip() == "}" and "app.get(\"*\"" in lines[i+1]:
            # This is the end of the else block? No, wait!
            pass
        
        # let's just use string replacement for simplicity instead of parsing lines...
