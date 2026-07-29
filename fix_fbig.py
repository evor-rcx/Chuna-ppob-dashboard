import re

with open('server.ts', 'r') as f:
    code = f.read()

# I will find the whole else block and the inner try/catch and replace it.

pattern = re.compile(r"else \{\s+let data;\s+try \{\s*const \{ fbdown, igdl \} = await import\('btch-downloader'\);.*?catch \(e: any\) \{\s*await ctx\.telegram\.deleteMessage.*?\.catch\(\(\)=>null\);\s*await ctx\.reply\(\"❌ Gagal mendownload media: \" \+ e\.message\);\s*\}\s*\}", re.DOTALL)

def replace_block(match):
    return """else {
                await ctx.telegram.deleteMessage(ctx.chat?.id, processMsg.message_id).catch(()=>null);
                if (link.includes('facebook.com') || link.includes('fb.watch') || link.includes('fb.gg') || link.includes('instagram.com') || link.includes('ig.me')) {
                    await ctx.reply("Mohon maaf kak, layanan download untuk Facebook dan Instagram saat ini sedang tidak tersedia karena masalah pemblokiran server (gagal download terus). 🙏\\n\\nSilakan gunakan Chuna untuk link TikTok atau YouTube ya! 🥰");
                } else {
                    await ctx.reply(`✅ Permintaan untuk link: ${link}\\n\\nMohon maaf, platform ini belum didukung atau sedang dalam pengembangan. Saat ini Chuna baru mendukung TikTok dan YouTube secara optimal. 🥰`);
                }
            }"""

new_code = pattern.sub(replace_block, code)

if new_code != code:
    print("Replaced with regex!")
    with open('server.ts', 'w') as f:
        f.write(new_code)
else:
    print("Regex failed. Let's just fix the braces.")
