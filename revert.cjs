const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  'if (member) {\n          console.log("DEBUG /start: member found, replying welcome back");',
  'if (member) {'
);
code = code.replace(
  'console.log("DEBUG /start: member not found, replying with register");\n        await ctx.reply(\n          "👋 Halo kak! Chuna di sini 🚗💚Kakak belum punya akun E4 Store nih. Daftar dulu yuk biar bisa langsung belanja! 🛍️",',
  'await ctx.reply(\n          "👋 Halo kak! Chuna di sini 🚗💚Kakak belum punya akun E4 Store nih. Daftar dulu yuk biar bisa langsung belanja! 🛍️",'
);
code = code.replace(
  'ctx.reply("Mohon maaf kak, akun anda sudah terdaftar " + JSON.stringify(registeredUsers[userId]));',
  'ctx.reply("Mohon maaf kak, akun anda sudah terdaftar ");'
);
fs.writeFileSync('server.ts', code);
