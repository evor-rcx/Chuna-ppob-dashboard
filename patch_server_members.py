import re

with open('server.ts', 'r') as f:
    code = f.read()

endpoints = """
  app.post("/api/members/:id/reset-pin", (req, res) => {
    const { id } = req.params;
    const memberIndex = members.findIndex(m => m.id === id);
    if (memberIndex !== -1) {
      const userId = id.replace('MBR-', '');
      let found = false;
      if (registeredUsers[userId]) {
        registeredUsers[userId].pin = '123456';
        found = true;
      } else {
        const keys = Object.keys(registeredUsers);
        const matchingKey = keys.find(k => String(k) === String(userId));
        if (matchingKey) {
            registeredUsers[matchingKey].pin = '123456';
            found = true;
        }
      }
      if (!found) {
          return res.status(404).json({ success: false, error: 'User tidak memiliki akun bot (belum register) atau PIN tidak diset.' });
      }
      db.registeredUsers = registeredUsers;
      writeDB(db);
      return res.json({ success: true, message: 'PIN berhasil direset ke 123456' });
    }
    res.status(404).json({ success: false, error: 'Member tidak ditemukan' });
  });

  app.delete("/api/members/:id", (req, res) => {
    const { id } = req.params;
    const memberIndex = members.findIndex(m => m.id === id);
    if (memberIndex !== -1) {
      members.splice(memberIndex, 1);
      db.members = members;
      
      const userId = id.replace('MBR-', '');
      if (registeredUsers[userId]) {
        delete registeredUsers[userId];
      } else {
        const keys = Object.keys(registeredUsers);
        const matchingKey = keys.find(k => String(k) === String(userId));
        if (matchingKey) {
            delete registeredUsers[matchingKey];
        }
      }
      db.registeredUsers = registeredUsers;
      writeDB(db);
      return res.json({ success: true, message: 'Member berhasil dihapus' });
    }
    res.status(404).json({ success: false, error: 'Member tidak ditemukan' });
  });
"""

code = code.replace('  app.post("/api/members/:id/type",', endpoints + '\n  app.post("/api/members/:id/type",')

with open('server.ts', 'w') as f:
    f.write(code)
print("Updated server.ts with member delete and pin reset")
