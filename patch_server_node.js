const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const oldEndpoint = `  app.post("/api/members/:id/reset-pin", (req, res) => {
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
  });`;

const newEndpoint = `  app.post("/api/members/:id/reset-pin", async (req, res) => {
    const { id } = req.params;
    const memberIndex = members.findIndex(m => m.id === id);
    if (memberIndex !== -1) {
      const userId = id.replace('MBR-', '');
      let found = false;
      let matchedKey = userId;
      
      if (registeredUsers[userId]) {
        found = true;
      } else {
        const keys = Object.keys(registeredUsers);
        const matchingKey = keys.find(k => String(k) === String(userId));
        if (matchingKey) {
            matchedKey = matchingKey;
            found = true;
        }
      }
      
      if (!found) {
          return res.status(404).json({ success: false, error: 'User tidak memiliki akun bot (belum register).' });
      }
      
      const userWa = registeredUsers[matchedKey].wa;
      const userName = registeredUsers[matchedKey].username;
      
      // Set state for this user so they have to input a new PIN next time they chat
      userStates[matchedKey] = {
        step: 'AWAITING_PIN',
        data: { username: userName, wa: userWa }
      };
      
      const msgText = "⚠️ *INFO KEAMANAN*\\n\\nAdmin telah mereset PIN Anda. Silakan balas pesan ini dengan *PIN BARU* Anda (6 angka) untuk mengamankan kembali akun Anda.";
      
      // Try send to Telegram
      try {
        if (bot) await bot.telegram.sendMessage(matchedKey, msgText, { parse_mode: 'Markdown' });
      } catch(e) {}
      
      // Try send to WhatsApp
      try {
        if (waSocket && waStatus.includes('Connected') && userWa) {
           let cleanWa = userWa.replace(/\\D/g, "");
           if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
           const jid = \`\${cleanWa}@s.whatsapp.net\`;
           await waSocket.sendMessage(jid, { text: msgText });
        }
      } catch(e) {}
      
      return res.json({ success: true, message: 'Permintaan reset PIN telah dikirim ke member' });
    }
    res.status(404).json({ success: false, error: 'Member tidak ditemukan' });
  });`;

code = code.replace(oldEndpoint, newEndpoint);

fs.writeFileSync('server.ts', code);
console.log("Updated server.ts node patch");
