import re

with open('server.ts', 'r') as f:
    content = f.read()

markup_def = """                let waMsgKey: any | undefined;
                let waJid: string | undefined;
                let notaBuffer: Buffer | null = null;
                
                let returnMarkup;
                if (stateData.memberId) {
                    returnMarkup = { keyboard: [[{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "🔙 Kembali ke Menu Owner" }]], resize_keyboard: true };
                } else {
                    returnMarkup = { keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }]], resize_keyboard: true };
                }"""

# Replace all occurrences of the let block in server.ts
content = content.replace("""                let waMsgKey: any | undefined;
                let waJid: string | undefined;
                let notaBuffer: Buffer | null = null;""", markup_def)

# We need to replace all `const tgMsg = await ctx.reply(msg);` with `const tgMsg = await ctx.reply(msg, { reply_markup: returnMarkup });`
# BUT ONLY inside processPrepaidPayment and processPascaPayment.
# Let's just find the blocks for prepaid and pasca and patch them.

start1 = content.find('const processPrepaidPayment = async')
end1 = content.find('const processPascaPayment = async')
if end1 == -1: end1 = content.find('// ==== START TELEGRAM BOT SETUP ====')
start2 = content.find('const processPascaPayment = async')
if start2 == -1: start2 = content.find('const processPascaPayment') # wait, let's search for "const processPascaPayment"
end2 = content.find('bot.hears(/^[0-9]+$/', start2) if start2 != -1 else len(content)

print(f"start1: {start1}, end1: {end1}, start2: {start2}, end2: {end2}")

# Wait, instead of slicing, I can just replace the specific lines inside server.ts since they are mostly unique to these functions.
# Let's replace the ctx.reply lines safely.

target_1 = """const tgMsg = await ctx.reply(msg);"""
target_2 = """tgMsg = await ctx.replyWithPhoto({ source: notaBuffer }, { caption: msg, parse_mode: 'Markdown' });"""
target_3 = """tgMsg = await ctx.reply(msg, { parse_mode: 'Markdown' });"""

content = content.replace(target_1, """const tgMsg = await ctx.reply(msg, { reply_markup: returnMarkup });""")
content = content.replace(target_2, """tgMsg = await ctx.replyWithPhoto({ source: notaBuffer }, { caption: msg, parse_mode: 'Markdown', reply_markup: returnMarkup });""")
content = content.replace(target_3, """tgMsg = await ctx.reply(msg, { parse_mode: 'Markdown', reply_markup: returnMarkup });""")

# Also the network error one:
target_err = """await ctx.reply(`⏳ Transaksi Sedang Diproses (Network Error)
Pesananmu sedang dikonfirmasi oleh sistem pusat meski terjadi gangguan koneksi.
Mohon tunggu update otomatis dari Chuna atau hubungi Admin.
Pesan Error: ${e.message}`);"""

content = content.replace(target_err, """await ctx.reply(`⏳ Transaksi Sedang Diproses (Network Error)
Pesananmu sedang dikonfirmasi oleh sistem pusat meski terjadi gangguan koneksi.
Mohon tunggu update otomatis dari Chuna atau hubungi Admin.
Pesan Error: ${e.message}`, { reply_markup: returnMarkup });""")

with open('server.ts', 'w') as f:
    f.write(content)
