const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldDaftar = `      bot.hears(/Daftar Bareng Chuna/i, async (ctx) => {
        if (ctx.from) {
          const userId = ctx.from.id;
          console.log("Checking user registration. ctx.from.id:", userId);
          console.log("Is in registeredUsers?", !!registeredUsers[userId], registeredUsers[userId]);
          if (registeredUsers[userId]) {
             ctx.reply("Mohon maaf kak, akun anda sudah terdaftar ");
             return;
          }
          userStates[userId] = { step: 'AWAITING_USERNAME', data: {} };
        }
        ctx.reply(\`📝 PENDAFTARAN AKUN

Oke kak! Langkah pertama, kasih tau Chuna Username yang kakak mau dong.\`);
      });`;

const newDaftar = `      bot.hears(/Daftar Bareng Chuna/i, async (ctx) => {
        if (ctx.from) {
          const userId = ctx.from.id;
          console.log("Checking user registration. ctx.from.id:", userId);
          console.log("Is in registeredUsers?", !!registeredUsers[userId], registeredUsers[userId]);
          if (registeredUsers[userId]) {
             // Validate if they are actually in members
             const memberId = \`MBR-\${userId}\`;
             const member = members.find(m => m.id === memberId || isTelegramMatch(m.telegram, userId, ctx.from?.username));
             if (member) {
                 ctx.reply("Mohon maaf kak, akun anda sudah terdaftar.");
                 return;
             } else {
                 console.log("Found orphaned registeredUser, cleaning up:", userId);
                 delete registeredUsers[userId];
                 db.registeredUsers = registeredUsers;
                 writeDB(db);
             }
          }
          userStates[userId] = { step: 'AWAITING_USERNAME', data: {} };
        }
        ctx.reply(\`📝 PENDAFTARAN AKUN

Oke kak! Langkah pertama, kasih tau Chuna Username yang kakak mau dong.\`);
      });`;

code = code.replace(oldDaftar, newDaftar);
fs.writeFileSync('server.ts', code);
