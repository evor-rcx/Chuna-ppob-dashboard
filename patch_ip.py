import re

with open('server.ts', 'r') as f:
    content = f.read()

# Polling replace
target_polling = """                    msg = `❌ Maaf Kak, pembayaran untuk pesanan Anda gagal diproses.

Kemungkinan ada kesalahan data atau saldo kurang. Silakan cek kembali, atau hubungi Chuna untuk bantuan${(data.message || '').toLowerCase().includes('ip') ? ' lebih lanjut' : ''}.

Keterangan : ${data.message || 'Transaksi Gagal'}
📦 Produk  : ${tx.product}
🎯 Tujuan   : ${tx.target} (${nama})

${refundMsg}

${(data.message || '').toLowerCase().includes('ip') ? 'Jangan khawatir, Kakak bisa mencoba ulang kapan saja.' : 'Tenang saja, Kakak bisa mencoba ulang kapan pun.'}

Butuh bantuan? ${(data.message || '').toLowerCase().includes('ip') ? `Langsung chat Chuna di Bot Telegram:
👉 https://t.me/ChunaChanbot

Chuna siap membantu dengan senyum! 😊💪` : `Chat Chuna di Bot Telegram:
👉 https://t.me/ChunaChanbot

Chuna siap bantu! 😊💪`}`;"""

repl_polling = """                    if ((data.message || '').toLowerCase().includes('ip')) {
                        msg = `❌ Maaf Kak, pembayaran untuk pesanan Anda gagal diproses.\\n\\nSistem pusat E4 Store saat ini sedang mengalami gangguan koneksi. Mohon tunggu beberapa saat dan coba lagi nanti.\\n\\nKeterangan : Server sedang gangguan\\n📦 Produk  : ${tx.product}\\n🎯 Tujuan   : ${tx.target} (${nama})\\n\\n${refundMsg}\\n\\nJangan khawatir, Kakak bisa mencoba ulang nanti.\\n\\nButuh bantuan? Chat Chuna di Bot Telegram:\\n👉 https://t.me/ChunaChanbot\\n\\nChuna siap bantu! 😊💪`;
                        const ownerMsg = `🚨 *INFO PENTING DARI CHUNA!* 🚨\\n\\nTransaksi dari Kak *${nama}* gagal karena masalah IP!\\n\\nKeterangan dari Digiflazz: _${data.message}_\\n\\nSegera cek dan daftarkan IP server terbaru di dashboard Digiflazz ya Kak! 🌐`;
                        for (const ownerId of db.owners) {
                            try {
                                await bot.telegram.sendMessage(ownerId, ownerMsg, { parse_mode: 'Markdown' });
                            } catch(e) {}
                        }
                    } else {
                        msg = `❌ Maaf Kak, pembayaran untuk pesanan Anda gagal diproses.\\n\\nKemungkinan ada kesalahan data atau saldo kurang. Silakan cek kembali, atau hubungi Chuna untuk bantuan.\\n\\nKeterangan : ${data.message || 'Transaksi Gagal'}\\n📦 Produk  : ${tx.product}\\n🎯 Tujuan   : ${tx.target} (${nama})\\n\\n${refundMsg}\\n\\nTenang saja, Kakak bisa mencoba ulang kapan pun.\\n\\nButuh bantuan? Chat Chuna di Bot Telegram:\\n👉 https://t.me/ChunaChanbot\\n\\nChuna siap bantu! 😊💪`;
                    }"""

content = content.replace(target_polling, repl_polling)

# Prepaid replace
target_prepaid = """                    msg = `❌ Maaf Kak, pembayaran untuk pesanan Anda gagal diproses.

Kemungkinan ada kesalahan data atau saldo kurang. Silakan cek kembali, atau hubungi Chuna untuk bantuan${(payJson.data.message || '').toLowerCase().includes('ip') ? ' lebih lanjut' : ''}.

Keterangan : ${payJson.data.message || 'Transaksi Gagal'}
📦 Produk  : ${product.product_name}
🎯 Tujuan   : ${targetDisplay} (${member.name || "-"})

${refundMsg}

${(payJson.data.message || '').toLowerCase().includes('ip') ? 'Jangan khawatir, Kakak bisa mencoba ulang kapan saja.' : 'Tenang saja, Kakak bisa mencoba ulang kapan pun.'}

Butuh bantuan? ${(payJson.data.message || '').toLowerCase().includes('ip') ? `Langsung chat Chuna di Bot Telegram:
👉 https://t.me/ChunaChanbot

Chuna siap membantu dengan senyum! 😊💪` : `Chat Chuna di Bot Telegram:
👉 https://t.me/ChunaChanbot

Chuna siap bantu! 😊💪`}`;"""

repl_prepaid = """                    if ((payJson.data.message || '').toLowerCase().includes('ip')) {
                        msg = `❌ Maaf Kak, pembayaran untuk pesanan Anda gagal diproses.\\n\\nSistem pusat E4 Store saat ini sedang mengalami gangguan koneksi. Mohon tunggu beberapa saat dan coba lagi nanti.\\n\\nKeterangan : Server sedang gangguan\\n📦 Produk  : ${product.product_name}\\n🎯 Tujuan   : ${targetDisplay} (${member.name || "-"})\\n\\n${refundMsg}\\n\\nJangan khawatir, Kakak bisa mencoba ulang nanti.\\n\\nButuh bantuan? Chat Chuna di Bot Telegram:\\n👉 https://t.me/ChunaChanbot\\n\\nChuna siap bantu! 😊💪`;
                        const ownerMsg = `🚨 *INFO PENTING DARI CHUNA!* 🚨\\n\\nTransaksi dari Kak *${member.name || "-"}* gagal karena masalah IP!\\n\\nKeterangan dari Digiflazz: _${payJson.data.message}_\\n\\nSegera cek dan daftarkan IP server terbaru di dashboard Digiflazz ya Kak! 🌐`;
                        for (const ownerId of db.owners) {
                            try {
                                await bot.telegram.sendMessage(ownerId, ownerMsg, { parse_mode: 'Markdown' });
                            } catch(e) {}
                        }
                    } else {
                        msg = `❌ Maaf Kak, pembayaran untuk pesanan Anda gagal diproses.\\n\\nKemungkinan ada kesalahan data atau saldo kurang. Silakan cek kembali, atau hubungi Chuna untuk bantuan.\\n\\nKeterangan : ${payJson.data.message || 'Transaksi Gagal'}\\n📦 Produk  : ${product.product_name}\\n🎯 Tujuan   : ${targetDisplay} (${member.name || "-"})\\n\\n${refundMsg}\\n\\nTenang saja, Kakak bisa mencoba ulang kapan pun.\\n\\nButuh bantuan? Chat Chuna di Bot Telegram:\\n👉 https://t.me/ChunaChanbot\\n\\nChuna siap bantu! 😊💪`;
                    }"""

content = content.replace(target_prepaid, repl_prepaid)

# Pasca replace
target_pasca = """                    msg = `❌ Maaf Kak, pembayaran untuk pesanan Anda gagal diproses.

Kemungkinan ada kesalahan data atau saldo kurang. Silakan cek kembali, atau hubungi Chuna untuk bantuan${(payJson.data.message || '').toLowerCase().includes('ip') ? ' lebih lanjut' : ''}.

Keterangan : ${payJson.data.message || 'Transaksi Gagal'}
📦 Tagihan : ${stateData.product.product_name}
🎯 Tujuan   : ${customerNo} (${payJson.data?.customer_name || checkResult?.customer_name || "-"})

${refundMsg}

${(payJson.data.message || '').toLowerCase().includes('ip') ? 'Jangan khawatir, Kakak bisa mencoba ulang kapan saja.' : 'Tenang saja, Kakak bisa mencoba ulang kapan pun.'}

Butuh bantuan? ${(payJson.data.message || '').toLowerCase().includes('ip') ? `Langsung chat Chuna di Bot Telegram:
👉 https://t.me/ChunaChanbot

Chuna siap membantu dengan senyum! 😊💪` : `Chat Chuna di Bot Telegram:
👉 https://t.me/ChunaChanbot

Chuna siap bantu! 😊💪`}`;"""

repl_pasca = """                    if ((payJson.data.message || '').toLowerCase().includes('ip')) {
                        msg = `❌ Maaf Kak, pembayaran untuk pesanan Anda gagal diproses.\\n\\nSistem pusat E4 Store saat ini sedang mengalami gangguan koneksi. Mohon tunggu beberapa saat dan coba lagi nanti.\\n\\nKeterangan : Server sedang gangguan\\n📦 Tagihan : ${stateData.product.product_name}\\n🎯 Tujuan   : ${customerNo} (${payJson.data?.customer_name || checkResult?.customer_name || "-"})\\n\\n${refundMsg}\\n\\nJangan khawatir, Kakak bisa mencoba ulang nanti.\\n\\nButuh bantuan? Chat Chuna di Bot Telegram:\\n👉 https://t.me/ChunaChanbot\\n\\nChuna siap bantu! 😊💪`;
                        const ownerMsg = `🚨 *INFO PENTING DARI CHUNA!* 🚨\\n\\nTransaksi dari Kak *${member.name || "-"}* gagal karena masalah IP!\\n\\nKeterangan dari Digiflazz: _${payJson.data.message}_\\n\\nSegera cek dan daftarkan IP server terbaru di dashboard Digiflazz ya Kak! 🌐`;
                        for (const ownerId of db.owners) {
                            try {
                                await bot.telegram.sendMessage(ownerId, ownerMsg, { parse_mode: 'Markdown' });
                            } catch(e) {}
                        }
                    } else {
                        msg = `❌ Maaf Kak, pembayaran untuk pesanan Anda gagal diproses.\\n\\nKemungkinan ada kesalahan data atau saldo kurang. Silakan cek kembali, atau hubungi Chuna untuk bantuan.\\n\\nKeterangan : ${payJson.data.message || 'Transaksi Gagal'}\\n📦 Tagihan : ${stateData.product.product_name}\\n🎯 Tujuan   : ${customerNo} (${payJson.data?.customer_name || checkResult?.customer_name || "-"})\\n\\n${refundMsg}\\n\\nTenang saja, Kakak bisa mencoba ulang kapan pun.\\n\\nButuh bantuan? Chat Chuna di Bot Telegram:\\n👉 https://t.me/ChunaChanbot\\n\\nChuna siap bantu! 😊💪`;
                    }"""

content = content.replace(target_pasca, repl_pasca)

with open('server.ts', 'w') as f:
    f.write(content)
print("Done")
