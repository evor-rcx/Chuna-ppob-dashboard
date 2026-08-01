const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const oldReg = `      bot.hears(/Daftar Bareng Chuna/i, async (ctx) => {
        if (ctx.from) {
          if (registeredUsers[ctx.from.id]) {
             ctx.reply("Mohon maaf kak, akun anda sudah terdaftar dengan tegas.");
             return;
          }
          userStates[ctx.from.id] = { step: 'AWAITING_USERNAME', data: {} };
        }
        ctx.reply(\`📝 PENDAFTARAN AKUN

Oke kak! Langkah pertama, kasih tau Chuna Username yang kakak mau dong.\`);
      });`;

const newReg = `      bot.hears(/Daftar Bareng Chuna/i, async (ctx) => {
        if (ctx.from) {
          const userId = ctx.from.id;
          console.log("Checking user registration. ctx.from.id:", userId);
          console.log("Is in registeredUsers?", !!registeredUsers[userId], registeredUsers[userId]);
          if (registeredUsers[userId]) {
             ctx.reply("Mohon maaf kak, akun anda sudah terdaftar dengan tegas.");
             return;
          }
          userStates[userId] = { step: 'AWAITING_USERNAME', data: {} };
        }
        ctx.reply(\`📝 PENDAFTARAN AKUN

Oke kak! Langkah pertama, kasih tau Chuna Username yang kakak mau dong.\`);
      });`;

if (code.includes(oldReg)) {
    code = code.replace(oldReg, newReg);
    fs.writeFileSync('server.ts', code);
    console.log("Updated Daftar Bareng Chuna in server.ts");
} else {
    console.log("Could not find old Reg logic");
}
