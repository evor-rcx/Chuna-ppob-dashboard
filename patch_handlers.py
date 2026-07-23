import re

with open('server.ts', 'r') as f:
    content = f.read()

target = """      bot.hears("📥 Download", async (ctx) => {
        const info = `*Panduan Fitur Download 📥*

Halo kak! Saat ini fitur download sedang dalam tahap pengembangan (Maintenance) dan akan segera hadir di Telegram.
Nantinya, kakak bisa mendownload media dengan format:

🎵 *TikTok:* .tt <link>
📸 *Instagram:* .ig <link>
🎬 *YouTube MP4:* .ytmp4 <link>
🎧 *YouTube MP3:* .ytmp3 <link>
📘 *Facebook:* .fb <link>
🐦 *Twitter:* .tw <link>

Mohon ditunggu update selanjutnya ya! 🥰`;
        await ctx.reply(info, { parse_mode: 'Markdown' });
      });

      bot.hears("🎵 Lirik Lagu", async (ctx) => {
        const info = `*Panduan Fitur Lirik Lagu 🎵*

Halo kak! Fitur pencarian lirik lagu sedang dalam tahap pengembangan (Maintenance) dan akan segera hadir.
Nantinya, kakak bisa mencari lirik lagu dengan format:

🎤 *Format:* .lirik <judul lagu>
💬 *Contoh:* .lirik matahariku

Mohon ditunggu update selanjutnya dari Chuna ya! 🥰`;
        await ctx.reply(info, { parse_mode: 'Markdown' });
      });"""

repl = """      bot.hears("📥 Download", async (ctx) => {
        userStates[ctx.from.id] = { step: 'AWAITING_DOWNLOAD' };
        const info = `*Fitur Download 📥*

Halo kak! Silakan kirimkan link video/audio yang ingin didownload.
Chuna mendukung download dari:
🎵 TikTok
📸 Instagram
🎬 YouTube
📘 Facebook
🐦 Twitter

Kirim linknya sekarang ya! 🥰`;
        await ctx.reply(info, { parse_mode: 'Markdown' });
      });

      bot.hears("🎵 Lirik Lagu", async (ctx) => {
        userStates[ctx.from.id] = { step: 'AWAITING_LIRIK' };
        const info = `*Fitur Lirik & Pencarian Musik 🎵*

Halo kak! Silakan kirimkan judul lagu yang ingin dicari (contoh: *Matahariku Agnez Mo*).
Chuna akan mencarikan lagu beserta liriknya! 🥰`;
        await ctx.reply(info, { parse_mode: 'Markdown' });
      });"""

content = content.replace(target, repl)

with open('server.ts', 'w') as f:
    f.write(content)

print("Handlers patched")
