const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `await ctx.reply(\`✦ ──── E4 STORE · VAULT ──── ✦
│
│  👑  USER, \${nameUpper}!
│  ───────────────
│  ▸  Status      : 𝙑𝙚𝙧𝙞𝙛𝙞𝙚𝙙 𝙋𝙧𝙞𝙢𝙚
│  ▸  Tipe Akun   : \${typeCap} 
│  ▸  Kontak      : \${wa} [✅ Aktif]
│
│  💳  SALDO DOMAIN
│  ───────────────
│  ▸  Rp \${balance} 
│     [ ░░░░░░░░░░ ] 
│
├─── ✨ CHUNA · SPECIAL CALL ✨ ───
│
│  🎁  Promo spesial untuk "\${nameOriginal}":
│  ✔️  Free admin fee (periode terbatas)
│  ✔️  Cara klaim: balas "AMBIL" di sini
│
└─── 🚀 24/7 Ready. Balas kapan saja ───\`);`;

const newStr = `await ctx.reply(\`✦ ──── E4 STORE · VAULT ──── ✦
│
│  👑  USER, \${nameUpper}!
│  ───────────────
│  ▸  Status      : 𝙑𝙚𝙧𝙞𝙛𝙞𝙚𝙙 𝙋𝙧𝙞𝙢𝙚
│  ▸  Tipe Akun   : \${typeCap} 
│  ▸  Kontak      : \${wa} [✅ Aktif]
│
│  💳  SALDO DOMAIN
│  ───────────────
│  ▸  Rp \${balance} 
│     [ ░░░░░░░░░░ ] 
│
│
│  
│  
│  
│
└─── 🚀 24/JAM Ready. Balas kapan saja ───\`);`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, newStr);
    fs.writeFileSync('server.ts', code);
    console.log("Patched successfully!");
} else {
    console.log("Target string not found.");
}
