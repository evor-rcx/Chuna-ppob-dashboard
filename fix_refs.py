import re

with open('server.ts', 'r') as f:
    content = f.read()

# Remove the let declarations
content = re.sub(r'let transactions:\s*any\[\]\s*=\s*db\.transactions\s*\|\|\s*\[\];\n', '', content)
content = re.sub(r'let members:\s*any\[\]\s*=\s*db\.members\s*\|\|\s*\[\];\n', '', content)

# Replace standalone members with db.members
content = re.sub(r'(?<!db\.)\bmembers\b', 'db.members', content)
# Replace standalone transactions with db.transactions
content = re.sub(r'(?<!db\.)\btransactions\b', 'db.transactions', content)

# But wait, there are local function arguments called `members`? No? Let's check!
