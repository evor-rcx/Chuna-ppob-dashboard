import re

with open('/app/applet/server.ts', 'r') as f:
    content = f.read()

pattern = r'if \(member\) \{\s*await ctx\.reply\(`💳 INFORMASI AKUN E4 STORE👤 Nama: \$\{member\.name\}📱 WhatsApp: \$\{member\.whatsapp\}🏷️ Tipe Akun: \*\$\{member\.type\}\*💰 Saldo Kakak: \*Rp \$\{member\.balance\.toLocaleString\(\'id-ID\'\)\}\*Yuk nikmati berbagai promo menarik dari Chuna! ✨`, \{ parse_mode: \'Markdown\' \}\);\s*\}'

new_code = """if (member) {
             const nameUpper = (member.name || "Kisah").toUpperCase();
             const nameOriginal = member.name || "Kisah";
             const typeCap = member.type || "Biasa";
             const wa = member.whatsapp || "-";
             const balance = member.balance.toLocaleString('id-ID');
             
             await ctx.reply(`✦ ──── E4 STORE · VAULT ──── ✦
│
│  👑  HAI, ${nameUpper}!
│  ───────────────
│  ▸  Status      : 𝙑𝙚𝙧𝙞𝙛𝙞𝙚𝙙 𝙋𝙧𝙞𝙢𝙚
│  ▸  Tipe Akun   : ${typeCap} (siap naik)
│  ▸  Kontak      : ${wa} [✅ Aktif]
│
│  💳  SALDO DOMAIN
│  ───────────────
│  ▸  Rp ${balance} 
│     [ ░░░░░░░░░░ ] 0% (waktunya isi cuan!)
│
├─── ✨ CHUNA · SPECIAL CALL ✨ ───
│
│  🎁  Promo spesial untuk "${nameOriginal}":
│  ✔️  Free admin fee (periode terbatas)
│  ✔️  Bonus deposit 5% (klaim sekarang)
│  ✔️  Cara klaim: balas "AMBIL" di sini
│
└─── 🚀 24/7 Ready. Balas kapan saja ───`);
          }"""

new_content, count = re.subn(pattern, new_code, content)
if count > 0:
    print("Success replacing code.")
else:
    print("Could not find old code.")

with open('/app/applet/server.ts', 'w') as f:
    f.write(new_content)
