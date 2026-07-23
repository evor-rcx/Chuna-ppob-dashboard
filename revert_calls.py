import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# First replace the Sukses block 1
old1 = """                    msg = `🎉 Horee! Sukses, Kak!\n\nPesanan sudah diproses otomatis oleh E4 Store. ${tx.product} sudah masuk ke akun ${nama || tx.target} dan siap digunakan! 💪🔥\n\nTerima kasih telah berbelanja di E4 Store! 🐾\n\nChuna ~ Asisten Imutmu siap bantu 24 jam!\nKalau mau tanya-tanya atau order lagi, langsung chat Chuna di Bot Telegram:\n👉 https://t.me/Chuna_Chan_bot\n\nChuna tunggu chat dari Kakak! 😊💖`;
                    
                    const appUrl = "http://localhost:3000";
                    notaBuffer = await renderUrlToImage(`${appUrl}/api/nota/${ref_id}`);"""

new1 = """                    msg = `🎉 Horee! Sukses, Kak!\n\nPesanan sudah diproses otomatis oleh E4 Store. ${tx.product} sudah masuk ke akun ${nama || tx.target} dan siap digunakan! 💪🔥\n\n📄 Nota Sukses\n================================\nE4 STORE\nJl. Zamrud Depan Zamrud 2 RT 42\nWA: 6285169959218\n================================\nOrder ID      : ${ref_id}\nTanggal       : ${dateStr}\nID Pelanggan  : ${tx.target}\nNama          : ${nama || "-"}\nToken/SN      : ${displaySnMan}${displayDayaMan}\nPembelian     : ${tx.product}\nTotal         : Rp ${tx.price.toLocaleString('id-ID')}\nStatus        : ✅ SUKSES (LUNAS)\n================================\n\nTerima kasih telah berbelanja di E4 Store! 🐾\n\nChuna ~ Asisten Imutmu siap bantu 24 jam!\nKalau mau tanya-tanya atau order lagi, langsung chat Chuna di Bot Telegram:\n👉 https://t.me/Chuna_Chan_bot\n\nChuna tunggu chat dari Kakak! 😊💖`;"""

content = content.replace(old1, new1)

# Sukses block 2
old2 = """                    msg = `🎉 Horee! Sukses, Kak!\n\nPesanan sudah diproses otomatis oleh E4 Store. ${product.product_name} sudah masuk ke akun ${member.name || targetDisplay} dan siap digunakan! 💪🔥\n\nTerima kasih telah berbelanja di E4 Store! 🐾\n\nChuna ~ Asisten Imutmu siap bantu 24 jam!\nKalau mau tanya-tanya atau order lagi, langsung chat Chuna di Bot Telegram:\n👉 https://t.me/Chuna_Chan_bot\n\nChuna tunggu chat dari Kakak! 😊💖`;
                    
                    const appUrl = "http://localhost:3000";
                    const buffer = await renderUrlToImage(`${appUrl}/api/nota/${pay_ref_id}`);
                    
                    let tgMsg;
                    if (buffer) {
                        tgMsg = await ctx.replyWithPhoto({ source: buffer }, { caption: msg, parse_mode: 'Markdown' });
                    } else {
                        tgMsg = await ctx.reply(msg, { parse_mode: 'Markdown' });
                    }
                    notaBuffer = buffer;"""

new2 = """                    msg = `🎉 Horee! Sukses, Kak!\n\nPesanan sudah diproses otomatis oleh E4 Store. ${product.product_name} sudah masuk ke akun ${member.name || targetDisplay} dan siap digunakan! 💪🔥\n\n📄 Nota Sukses\n================================\nE4 STORE\nJl. Zamrud Depan Zamrud 2 RT 42\nWA: 6285169959218\n================================\nOrder ID      : ${pay_ref_id}\nTanggal       : ${dateStr}\nID Pelanggan  : ${targetDisplay}\nNama          : ${member.name || "-"}\nToken/SN      : ${displaySn}${displayDaya}\nPembelian     : ${product.product_name}\nTotal         : Rp ${total.toLocaleString('id-ID')}\nStatus        : ✅ SUKSES (LUNAS)\n================================\n\nTerima kasih telah berbelanja di E4 Store! 🐾\n\nChuna ~ Asisten Imutmu siap bantu 24 jam!\nKalau mau tanya-tanya atau order lagi, langsung chat Chuna di Bot Telegram:\n👉 https://t.me/Chuna_Chan_bot\n\nChuna tunggu chat dari Kakak! 😊💖`;
                    const tgMsg = await ctx.reply(msg, { parse_mode: 'Markdown' });"""
content = content.replace(old2, new2)

# Sukses block 3
old3 = """                    msg = `🎉 Horee! Sukses, Kak!\n\nPesanan sudah diproses otomatis oleh E4 Store. ${stateData.product.product_name} sudah masuk ke akun ${checkResult.customer_name || customerNo} dan siap digunakan! 💪🔥\n\nTerima kasih telah berbelanja di E4 Store! 🐾\n\nChuna ~ Asisten Imutmu siap bantu 24 jam!\nKalau mau tanya-tanya atau order lagi, langsung chat Chuna di Bot Telegram:\n👉 https://t.me/Chuna_Chan_bot\n\nChuna tunggu chat dari Kakak! 😊💖`;
                    
                    const appUrl = "http://localhost:3000";
                    const buffer = await renderUrlToImage(`${appUrl}/api/nota/${pay_ref_id}`);
                    
                    let tgMsg;
                    if (buffer) {
                        tgMsg = await ctx.replyWithPhoto({ source: buffer }, { caption: msg, parse_mode: 'Markdown' });
                    } else {
                        tgMsg = await ctx.reply(msg, { parse_mode: 'Markdown' });
                    }
                    notaBuffer = buffer;"""

new3 = """                    msg = `🎉 Horee! Sukses, Kak!\n\nPesanan sudah diproses otomatis oleh E4 Store. ${stateData.product.product_name} sudah masuk ke akun ${checkResult.customer_name || customerNo} dan siap digunakan! 💪🔥\n\n📄 Nota Sukses\n================================\nE4 STORE\nJl. Zamrud Depan Zamrud 2 RT 42\nWA: 6285169959218\n================================\nOrder ID      : ${pay_ref_id}\nTanggal       : ${dateStr}\nID Pelanggan  : ${customerNo}\nNama          : ${checkResult.customer_name || "-"}\nToken/SN      : ${displaySnPasca}${displayDayaPasca}\nPembelian     : ${stateData.product.product_name}\nTotal         : Rp ${total.toLocaleString('id-ID')}\nStatus        : ✅ SUKSES (LUNAS)\n================================\n\nTerima kasih telah berbelanja di E4 Store! 🐾\n\nChuna ~ Asisten Imutmu siap bantu 24 jam!\nKalau mau tanya-tanya atau order lagi, langsung chat Chuna di Bot Telegram:\n👉 https://t.me/Chuna_Chan_bot\n\nChuna tunggu chat dari Kakak! 😊💖`;
                    const tgMsg = await ctx.reply(msg, { parse_mode: 'Markdown' });"""

content = content.replace(old3, new3)

# Tagihan block
old4 = """                         const base64Data = Buffer.from(JSON.stringify(billData)).toString('base64');
                         const appUrl = "http://localhost:3000";
                         const notaUrl = `${appUrl}/api/tagihan-nota?data=${encodeURIComponent(base64Data)}`;
                         const buffer = await renderUrlToImage(notaUrl);

                         const replyText = `✅ *Tagihan Ditemukan!*\n\nHaiii! Aku Chuna, asisten imut dari E4 Store 🐾✨\nTagihan kamu udah muncul nih, jangan sampai kelewat ya~\n\n👤 Nama: ${nama}\n🔢 Nomor: ${result.customer_no}\n🧾 Layanan: ${product.product_name}\n\n💎 TOTAL BAYAR: Rp ${total.toLocaleString('id-ID')}\n${detail}\n\n---\n\n💬 "Jangan lupa bayar tepat waktu ya, sayang! Biar listrik tetap menyala dan kamu tetap semangat seharian~ Chuna doain yang terbaik buat kamu! 🌸💖"`;

                         const isOwner = db.owners.includes(ctx.from?.id);
                         const keyboard = [];
                         if (isOwner) {
                             keyboard.push([{ text: "💵 Cash" }, { text: "📝 Utang" }]);
                             keyboard.push([{ text: "❌ Batal" }]);
                         } else {
                             keyboard.push([{ text: "Beli Tagihan 💳", callback_data: `buy_${product.sku_code}` }]);
                         }

                         if (buffer) {
                             await ctx.replyWithPhoto({ source: buffer }, {
                                 caption: replyText,
                                 reply_markup: {
                                     keyboard: keyboard,
                                     resize_keyboard: true,
                                     one_time_keyboard: true
                                 },
                                 parse_mode: 'Markdown'
                             });
                         } else {
                             await ctx.reply(replyText, {
                                 reply_markup: {
                                     keyboard: keyboard,
                                     resize_keyboard: true,
                                     one_time_keyboard: true
                                 },
                                 parse_mode: 'Markdown'
                             });
                         }"""
                         
new4 = """                         const base64Data = Buffer.from(JSON.stringify(billData)).toString('base64');
                         const appUrl = process.env.APP_URL || "https://ais-dev-2udzmfeveh4xyuzexmy4hz-506934900885.asia-southeast1.run.app";
                         const notaUrl = `${appUrl}/api/tagihan-nota?data=${encodeURIComponent(base64Data)}`;

                         const replyText = `✅ *Tagihan Ditemukan!*\n\nHaiii! Aku Chuna, asisten imut dari E4 Store 🐾✨\nTagihan kamu udah muncul nih, jangan sampai kelewat ya~\n\n👤 Nama: ${nama}\n🔢 Nomor: ${result.customer_no}\n🧾 Layanan: ${product.product_name}\n\n💎 TOTAL BAYAR: Rp ${total.toLocaleString('id-ID')}\n${detail}\n\n🖼️ *Lihat Gambar Tagihan:*\n${notaUrl}\n\n---\n\n💬 "Jangan lupa bayar tepat waktu ya, sayang! Biar listrik tetap menyala dan kamu tetap semangat seharian~ Chuna doain yang terbaik buat kamu! 🌸💖"`;

                         const isOwner = db.owners.includes(ctx.from?.id);
                         const keyboard = [];
                         if (isOwner) {
                             keyboard.push([{ text: "💵 Cash" }, { text: "📝 Utang" }]);
                             keyboard.push([{ text: "❌ Batal" }]);
                         } else {
                             keyboard.push([{ text: "Beli Tagihan 💳", callback_data: `buy_${product.sku_code}` }]);
                         }

                         ctx.reply(replyText, {
                             reply_markup: {
                                 keyboard: keyboard,
                                 resize_keyboard: true,
                                 one_time_keyboard: true
                             },
                             parse_mode: 'Markdown'
                         });"""
content = content.replace(old4, new4)

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Reverted calls to renderUrlToImage")
