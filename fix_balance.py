import re

with open('server.ts', 'r') as f:
    code = f.read()

pattern = r"""                    return ctx\.reply\(`❌ TRANSAKSI DITOLAK!Maaf kak, saldo kakak tidak mencukupi untuk melakukan transaksi ini\.
💳 Saldo Saat Ini: Rp \$\{member\.balance\.toLocaleString\('id-ID'\)\}
💰 Total Bayar: Rp \$\{total\.toLocaleString\('id-ID'\)\}
Silakan isi ulang saldo kakak terlebih dahulu\. 🙏`\);"""

new_code = """                    await ctx.reply(`❌ TRANSAKSI DITOLAK!Maaf kak, saldo kakak tidak mencukupi untuk melakukan transaksi ini.
💳 Saldo Saat Ini: Rp ${member.balance.toLocaleString('id-ID')}
💰 Total Bayar: Rp ${total.toLocaleString('id-ID')}
Silakan isi ulang saldo kakak terlebih dahulu. 🙏`);
                    delete userStates[ctx.from?.id || 0];
                    const isOwnerMenu = db.owners.includes(ctx.from?.id);
                    if (isOwnerMenu) {
                        return ctx.reply("Silakan pilih menu selanjutnya:", {
                            reply_markup: {
                                keyboard: [
                                    [{ text: "📒 Cek Utang Member" }],
                                    [{ text: "📝 Tambah Member" }, { text: "👑 List Member" }],
                                    [{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }],
                                    [{ text: "📢 Pengumuman WA" }, { text: "📥 Fitur Download" }]
                                ],
                                resize_keyboard: true
                            }
                        });
                    } else {
                        return ctx.reply("Silakan pilih menu selanjutnya:", {
                            reply_markup: {
                                keyboard: [
                                    [{ text: "💵 Cek Saldo" }],
                                    [{ text: "🧾 Cek Tagihan" }],
                                    [{ text: "📋 Menu Produk" }],
                                    [{ text: "📥 Fitur Download" }]
                                ],
                                resize_keyboard: true
                            }
                        });
                    }"""

code = re.sub(pattern, new_code, code)

with open('server.ts', 'w') as f:
    f.write(code)

print("Balance check updated")
