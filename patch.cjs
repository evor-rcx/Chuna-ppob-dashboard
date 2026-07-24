const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldStr = `             await ctx.reply(\`✦ ──── E4 STORE · VAULT ──── ✦
│
│  👑  HAI, \${nameUpper}!
│  ───────────────
│  ▸  Status      : 𝙑𝙚𝙧𝙞𝙛𝙞𝙚𝙙 𝙋𝙧𝙞𝙢𝙚
│  ▸  Tipe Akun   : \${typeCap} (siap naik)
│  ▸  Kontak      : \${wa} [✅ Aktif]
│
│  💳  SALDO DOMAIN
│  ───────────────
│  ▸  Rp \${balance} 
│     [ ░░░░░░░░░░ ] 0% (waktunya isi cuan!)
│
├─── ✨ CHUNA · SPECIAL CALL ✨ ───
│\`;`

const newStr = `             await ctx.reply(\`✦ ──── E4 STORE · VAULT ──── ✦
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
│\`;`

if (code.includes('0% (waktunya isi cuan!)')) {
  // Let's replace precisely using regex if needed, or string replacement
  let updated = code.replace(/│  👑  HAI, \$\{nameUpper\}!/g, '│  👑  USER, ${nameUpper}!');
  updated = updated.replace(/│  ▸  Tipe Akun   : \$\{typeCap\} \(siap naik\)/g, '│  ▸  Tipe Akun   : ${typeCap} ');
  updated = updated.replace(/│     \[ ░░░░░░░░░░ \] 0% \(waktunya isi cuan!\)/g, '│     [ ░░░░░░░░░░ ] ');
  fs.writeFileSync('server.ts', updated);
  console.log("Replaced!");
} else {
  console.log("Not found.");
}
