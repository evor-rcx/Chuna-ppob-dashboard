import re

with open('server.ts', 'r') as f:
    content = f.read()

# Remove them from startServer
content = re.sub(r'let transactions: any\[\] = db\.transactions \|\| \[\];\n', '', content)
content = re.sub(r'let members: any\[\] = db\.members \|\| \[\];\n', '', content)
content = re.sub(r'// --- Dashboard Data ---\n', '', content)

# Find fs.watchFile
watcher_code = """let transactions: any[] = db.transactions || [];
let members: any[] = db.members || [];

fs.watchFile(DB_FILE, (curr, prev) => {
  if (curr.mtime !== prev.mtime) {
    try {
      const newDb = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      db = newDb;
      productFees = db.productFees || {};
      
      transactions.length = 0;
      transactions.push(...(db.transactions || []));
      
      members.length = 0;
      members.push(...(db.members || []));
      
      for (const key of Object.keys(registeredUsers)) { delete registeredUsers[key as any]; }
      Object.assign(registeredUsers, db.registeredUsers || {});
      console.log("db.json reloaded from disk.");
    } catch (err) {
      console.error("Error reloading db.json", err);
    }
  }
});"""

content = re.sub(r'fs\.watchFile\(DB_FILE.*?\}\n\}\);\n', watcher_code + '\n', content, flags=re.DOTALL)

with open('server.ts', 'w') as f:
    f.write(content)
