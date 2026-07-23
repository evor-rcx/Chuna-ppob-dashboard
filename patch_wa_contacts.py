import re

with open('/app/applet/server.ts', 'r') as f:
    content = f.read()

# Make sure db.waContacts exists
if "db.waContacts" not in content:
    content = content.replace("waAnnouncementTarget: string;", "waAnnouncementTarget: string;\\n  waContacts: string[];")
    content = content.replace("db.waAnnouncementTarget = ", "if (!db.waContacts) db.waContacts = [];\\n  db.waAnnouncementTarget = ")

# Add event listener for contacts to save all known JIDs
listener_code = """
    waSocket.ev.on("contacts.upsert", (contacts) => {
      let changed = false;
      if (!db.waContacts) db.waContacts = [];
      for (const contact of contacts) {
          if (contact.id && contact.id.endsWith('@s.whatsapp.net')) {
              if (!db.waContacts.includes(contact.id)) {
                  db.waContacts.push(contact.id);
                  changed = true;
              }
          }
      }
      if (changed) writeDB(db);
    });
    
    waSocket.ev.on("contacts.set", (contacts) => {
      let changed = false;
      if (!db.waContacts) db.waContacts = [];
      for (const contact of contacts.contacts || []) {
          if (contact.id && contact.id.endsWith('@s.whatsapp.net')) {
              if (!db.waContacts.includes(contact.id)) {
                  db.waContacts.push(contact.id);
                  changed = true;
              }
          }
      }
      if (changed) writeDB(db);
    });

    waSocket.ev.on("messaging-history.set", (history) => {
      let changed = false;
      if (!db.waContacts) db.waContacts = [];
      for (const contact of history.contacts || []) {
          if (contact.id && contact.id.endsWith('@s.whatsapp.net')) {
              if (!db.waContacts.includes(contact.id)) {
                  db.waContacts.push(contact.id);
                  changed = true;
              }
          }
      }
      if (changed) writeDB(db);
    });
"""

# Insert the listeners in startWaSocket
content = content.replace("waSocket.ev.on(\"creds.update\", saveCreds);", "waSocket.ev.on(\"creds.update\", saveCreds);\\n" + listener_code)

# Replace the empty jidList with db.waContacts
empty_jidlist = "const jidList: string[] = [];"
populated_jidlist = """
                  let jidList: string[] = [...(db.waContacts || [])];
                  
                  // Add my own JID
                  const me = waSocket.user?.id?.split(':')[0] + '@s.whatsapp.net';
                  if (me && !jidList.includes(me)) jidList.push(me);
                  
                  // Add registered members WA
                  Object.values(db.registeredUsers || {}).forEach((u: any) => {
                      if (u.wa) {
                          let clean = u.wa.replace(/\\D/g, "");
                          if (clean.startsWith("0")) clean = "62" + clean.substring(1);
                          let memberJid = clean + "@s.whatsapp.net";
                          if (!jidList.includes(memberJid)) jidList.push(memberJid);
                      }
                  });
"""
content = content.replace(empty_jidlist, populated_jidlist)

with open('/app/applet/server.ts', 'w') as f:
    f.write(content)
