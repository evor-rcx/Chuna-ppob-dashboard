import re

with open("server.ts", "r") as f:
    content = f.read()

content = content.replace('const status = db.waAnnouncementEnabled ? "🟢 AKTIF" : "🔴 NONAKTIF";', '')
content = content.replace('db.waAnnouncementEnabled = true;', '')
content = content.replace('db.waAnnouncementEnabled = false;', '')

with open("server.ts", "w") as f:
    f.write(content)
print("Removed waAnnouncementEnabled.")
