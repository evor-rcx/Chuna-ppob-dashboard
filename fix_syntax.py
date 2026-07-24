import re

with open("server.ts", "r") as f:
    content = f.read()

bad_str = 'app.get("*", (req, res)'

if bad_str in content:
    # let's look at the end of the file
    pass

