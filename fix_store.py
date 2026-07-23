import re

with open('/app/applet/server.ts', 'r') as f:
    content = f.read()

# Remove makeInMemoryStore import
content = content.replace(", makeInMemoryStore", "")

# Remove store init
store_init = """
const store = makeInMemoryStore({ logger: pino({ level: 'silent' }) as any });
try { store.readFromFile(path.join(process.cwd(), "wa_store.json")); } catch(e) {}
setInterval(() => {
    try { store.writeToFile(path.join(process.cwd(), "wa_store.json")); } catch(e) {}
}, 10_000);
"""
if store_init in content:
    content = content.replace(store_init, "")

# Remove store bind
content = content.replace("store.bind(waSocket.ev);", "")

# Remove contacts fetch
contacts_fetch = """
                  // Get all contacts from store for statusJidList
                  const contacts = Object.values(store.contacts || {});
                  const jidList = contacts.map((c: any) => c.id).filter((id: string) => id && id.endsWith('@s.whatsapp.net'));
"""
if contacts_fetch in content:
    content = content.replace(contacts_fetch, "\\n                  const jidList: string[] = [];\\n")

with open('/app/applet/server.ts', 'w') as f:
    f.write(content)

