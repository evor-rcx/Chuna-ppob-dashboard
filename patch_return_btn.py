import re

with open('server.ts', 'r') as f:
    content = f.read()

# 1. processPrepaidPayment
prepaid_start = content.find('async function processPrepaidPayment')
prepaid_end = content.find('async function processPascaPayment')
prepaid_content = content[prepaid_start:prepaid_end]

markup_def = """                let waMsgKey: any | undefined;
                let waJid: string | undefined;
                let notaBuffer: Buffer | null = null;
                
                let returnMarkup;
                if (stateData.memberId) {
                    returnMarkup = { keyboard: [[{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "🔙 Kembali ke Menu Owner" }]], resize_keyboard: true };
                } else {
                    returnMarkup = { keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }]], resize_keyboard: true };
                }"""

prepaid_content = prepaid_content.replace("""                let waMsgKey: any | undefined;
                let waJid: string | undefined;
                let notaBuffer: Buffer | null = null;""", markup_def)

prepaid_content = prepaid_content.replace("""const tgMsg = await ctx.reply(msg);""", """const tgMsg = await ctx.reply(msg, { reply_markup: returnMarkup });""")
prepaid_content = prepaid_content.replace("""tgMsg = await ctx.replyWithPhoto({ source: notaBuffer }, { caption: msg, parse_mode: 'Markdown' });""", """tgMsg = await ctx.replyWithPhoto({ source: notaBuffer }, { caption: msg, parse_mode: 'Markdown', reply_markup: returnMarkup });""")
prepaid_content = prepaid_content.replace("""tgMsg = await ctx.reply(msg, { parse_mode: 'Markdown' });""", """tgMsg = await ctx.reply(msg, { parse_mode: 'Markdown', reply_markup: returnMarkup });""")
prepaid_content = prepaid_content.replace("""await ctx.reply(`⏳ Transaksi Sedang Diproses (Network Error)
Pesananmu sedang dikonfirmasi oleh sistem pusat meski terjadi gangguan koneksi.
Mohon tunggu update otomatis dari Chuna atau hubungi Admin.
Pesan Error: ${e.message}`);""", """await ctx.reply(`⏳ Transaksi Sedang Diproses (Network Error)
Pesananmu sedang dikonfirmasi oleh sistem pusat meski terjadi gangguan koneksi.
Mohon tunggu update otomatis dari Chuna atau hubungi Admin.
Pesan Error: ${e.message}`, { reply_markup: returnMarkup });""")

# 2. processPascaPayment
pasca_start = prepaid_end
pasca_end = content.find('// ==== START TELEGRAM BOT SETUP ====')
pasca_content = content[pasca_start:pasca_end]

pasca_content = pasca_content.replace("""                let waMsgKey: any | undefined;
                let waJid: string | undefined;
                let notaBuffer: Buffer | null = null;""", markup_def)

pasca_content = pasca_content.replace("""const tgMsg = await ctx.reply(msg);""", """const tgMsg = await ctx.reply(msg, { reply_markup: returnMarkup });""")
pasca_content = pasca_content.replace("""tgMsg = await ctx.replyWithPhoto({ source: notaBuffer }, { caption: msg, parse_mode: 'Markdown' });""", """tgMsg = await ctx.replyWithPhoto({ source: notaBuffer }, { caption: msg, parse_mode: 'Markdown', reply_markup: returnMarkup });""")
pasca_content = pasca_content.replace("""tgMsg = await ctx.reply(msg, { parse_mode: 'Markdown' });""", """tgMsg = await ctx.reply(msg, { parse_mode: 'Markdown', reply_markup: returnMarkup });""")
pasca_content = pasca_content.replace("""await ctx.reply(`⏳ Transaksi Sedang Diproses (Network Error)
Pesananmu sedang dikonfirmasi oleh sistem pusat meski terjadi gangguan koneksi.
Mohon tunggu update otomatis dari Chuna atau hubungi Admin.
Pesan Error: ${e.message}`);""", """await ctx.reply(`⏳ Transaksi Sedang Diproses (Network Error)
Pesananmu sedang dikonfirmasi oleh sistem pusat meski terjadi gangguan koneksi.
Mohon tunggu update otomatis dari Chuna atau hubungi Admin.
Pesan Error: ${e.message}`, { reply_markup: returnMarkup });""")

new_content = content[:prepaid_start] + prepaid_content + pasca_content + content[pasca_end:]

with open('server.ts', 'w') as f:
    f.write(new_content)

print("Return buttons patched")
