import re

with open('/app/applet/server.ts', 'r') as f:
    content = f.read()

pattern = r"""                    msg = `❌ Maaf Kak, pembayaran untuk pesanan Kakak gagal diproses\.Mungkin ada kesalahan data atau saldo kurang\. Coba cek lagi ya, atau hubungi Chuna untuk bantuan\.Keterangan: \$\{payJson\.data\.message \|\| 'Dibatalkan'\}📦 Produk: \$\{product\.product_name\}🎯 Tujuan: \$\{targetDisplay\} \(\$\{member\.name \|\| "-"\}\)\$\{refundMsg\}Jangan khawatir, Kakak bisa coba ulang kapan saja\.Kalau butuh bantuan, chat Chuna di Bot Telegram:👉 https://t\.me/Chuna_Chan_botChuna siap bantu dengan senyum! 😊💪`;"""

new_code = """                    msg = `❌ Maaf Kak, pembayaran untuk pesanan Kakak gagal diproses.Mungkin ada kesalahan data atau saldo kurang. Coba cek lagi ya, atau hubungi Chuna untuk bantuan.Keterangan: ${payJson.data.message || 'Dibatalkan'}📦 Produk: ${product.product_name}🎯 Tujuan: ${targetDisplay} (${member.name || "-"})${refundMsg}Jangan khawatir, Kakak bisa coba ulang kapan saja.Kalau butuh bantuan, chat Chuna di Bot Telegram:👉 https://t.me/Chuna_Chan_botChuna siap bantu dengan senyum! 😊💪`;
                    
                    if (payJson.data.message && payJson.data.message.toLowerCase().includes("harga seller lebih besar dari ketentuan harga buyer")) {
                        const ownerMsg = `🚨 *INFO PENTING DARI CHUNA!* 🚨\\n\\nHarga modal produk tersebut di Digiflazz saat ini sedang naik dan lebih mahal daripada "Batas Harga (Max Price)" yang Kakak atur di akun Digiflazz Kakak.\\n\\nCoba lihat angka: *${product.product_name}* saat ini mungkin sudah naik, melebihi batas maksimalmu. Padahal chuna sudah jelas menunjukkan kenaikan. Masih mau mempertahankan batas harga yang sudah usang? Segera cek dan sesuaikan di dashboard Digiflazz ya Kak! 💸📈`;
                        for (const ownerId of db.owners) {
                            try {
                                await bot.telegram.sendMessage(ownerId, ownerMsg, { parse_mode: 'Markdown' });
                            } catch(e) {
                                console.error("Failed to notify owner", e);
                            }
                        }
                    }"""

content, count = re.subn(pattern, new_code, content)

if count > 0:
    print("Success replacing code in PREPAID.")
else:
    print("Could not find old code in PREPAID.")

with open('/app/applet/server.ts', 'w') as f:
    f.write(content)
