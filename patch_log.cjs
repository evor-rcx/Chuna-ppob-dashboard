const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  'ctx.reply("Mohon maaf kak, akun anda sudah terdaftar ");',
  'ctx.reply("Mohon maaf kak, akun anda sudah terdaftar " + JSON.stringify(registeredUsers[userId]));'
);
fs.writeFileSync('server.ts', code);
