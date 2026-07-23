import re

with open('/app/applet/server.ts', 'r') as f:
    content = f.read()

pattern = r'      bot\.hears\(/Cek Saldo/i, async \(ctx\) => \{\n        try \{\n          const userId = ctx\.from\.id;'

new_code = """      bot.hears(/Cek Saldo/i, async (ctx) => {
        try {
          const userId = ctx.from.id;
          
          if (db.owners.includes(userId)) {
             await ctx.reply("⏳ Mengecek saldo Digiflazz...");
             if (!digiflazzUsername || !digiflazzApiKey) {
                await ctx.reply("❌ Digiflazz belum dikonfigurasi.");
                return;
             }
             try {
                 const sign = crypto.createHash("md5").update(digiflazzUsername + digiflazzApiKey + "depo").digest("hex");
                 const response = await fetch("https://api.digiflazz.com/v1/cek-saldo", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                       cmd: "deposit",
                       username: digiflazzUsername,
                       sign: sign
                    })
                 });
                 const data = await response.json();
                 if (data && data.data && data.data.deposit !== undefined) {
                    digiflazzBalance = data.data.deposit;
                    await ctx.reply(`💰 Saldo Digiflazz: *Rp ${digiflazzBalance.toLocaleString('id-ID')}*`, { parse_mode: 'Markdown' });
                 } else {
                    await ctx.reply("❌ Gagal mengecek saldo Digiflazz.");
                 }
             } catch(e) {
                 await ctx.reply("❌ Terjadi kesalahan saat menghubungi server Digiflazz.");
             }
             return;
          }
"""

content, count = re.subn(pattern, new_code, content)

if count > 0:
    print("Success replacing code.")
else:
    print("Could not find old code.")

with open('/app/applet/server.ts', 'w') as f:
    f.write(content)
