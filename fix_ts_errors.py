with open('/app/applet/server.ts', 'r') as f:
    text = f.read()

# Fix contacts.set -> wait, baileys event is messaging-history.set which exists
# contacts.set might not exist on newer baileys. I will just remove the whole contacts.set listener
import re
text = re.sub(r'waSocket\.ev\.on\("contacts\.set",.*?writeDB\(db\);\n    \}\);\n', '', text, flags=re.DOTALL)

# Fix double me
text = text.replace("const me = waSocket.user?.id", "var me = waSocket.user?.id")

with open('/app/applet/server.ts', 'w') as f:
    f.write(text)
