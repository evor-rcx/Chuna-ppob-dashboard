const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  'if (member) {',
  'if (member) {\n          console.log("DEBUG /start: member found, replying welcome back");'
);
code = code.replace(
  'await ctx.reply(\n          "👋 Halo kak! Chuna di sini 🚗💚Kakak belum punya akun E4 Store nih. Daftar dulu yuk biar bisa langsung belanja! 🛍️",',
  'console.log("DEBUG /start: member not found, replying with register");\n        await ctx.reply(\n          "👋 Halo kak! Chuna di sini 🚗💚Kakak belum punya akun E4 Store nih. Daftar dulu yuk biar bisa langsung belanja! 🛍️",'
);
fs.writeFileSync('server.ts', code);
