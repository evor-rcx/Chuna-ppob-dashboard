const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

// We need to rewrite the DELETE endpoint
const oldDelete = `  app.delete("/api/members/:id", (req, res) => {
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
  });`;

const newDelete = `  app.delete("/api/members/:id", (req, res) => {
    const { id } = req.params;
    const memberIndex = members.findIndex(m => m.id === id);
    if (memberIndex !== -1) {
      const member = members[memberIndex];
      members.splice(memberIndex, 1);
      db.members = members;
      
      let userId = id.replace('MBR-', '');
      if (member.telegram && member.telegram.startsWith('ID:')) {
         userId = member.telegram.substring(3);
      }
      
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
  });`;

if (code.includes(oldDelete)) {
    code = code.replace(oldDelete, newDelete);
    fs.writeFileSync('server.ts', code);
    console.log("Updated DELETE member logic in server.ts");
} else {
    console.log("Could not find old DELETE logic");
}
