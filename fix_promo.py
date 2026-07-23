import re

with open("server.ts", "r") as f:
    content = f.read()

# Replace ctx.reply( preview )
old_reply = 'await ctx.reply(`✅ *Promo Otomatis Berhasil Dibuat & Diaktifkan!*\\nBerikut preview teks yang akan dikirim ke WhatsApp:\\n\\n${finalMsg}`, { parse_mode: \'Markdown\' });'

new_reply = """let previewMsg = finalMsg;
              if (previewMsg.length > 3500) {
                  previewMsg = previewMsg.substring(0, 3500) + "\\n\\n... (Teks dipotong karena terlalu panjang untuk Telegram. WA akan menerima full!)";
              }
              await ctx.reply(`✅ *Promo Otomatis Berhasil Dibuat & Diaktifkan!*\\nBerikut preview teks yang akan dikirim ke WhatsApp:\\n\\n${previewMsg}`, { parse_mode: 'Markdown' });"""

if old_reply in content:
    content = content.replace(old_reply, new_reply)
    with open("server.ts", "w") as f:
        f.write(content)
    print("Fixed promo preview too long.")
else:
    print("Could not find old_reply.")
