import re

with open('server.ts', 'r') as f:
    code = f.read()

replacement = """if (member.balance < total) {
                return ctx.reply(`❌ TRANSAKSI DITOLAK!\n\nMaaf kak, saldo kakak tidak mencukupi untuk melakukan transaksi ini.\n\n💳 Saldo Saat Ini: Rp ${member.balance.toLocaleString('id-ID')}\n💰 Total Bayar: Rp ${total.toLocaleString('id-ID')}\n\nSilakan isi ulang saldo kakak terlebih dahulu. 🙏`);
            }"""

code = re.sub(
    r"if \(member\.balance < total\) \{\s*return ctx\.reply\(`❌ Saldo tidak cukup!\\n\\nSaldo Anda: Rp \$\{member\.balance\.toLocaleString\('id-ID'\)\}\\nTotal Bayar: Rp \$\{total\.toLocaleString\('id-ID'\)\}`\);\s*\}",
    replacement,
    code,
    flags=re.DOTALL
)

with open('server.ts', 'w') as f:
    f.write(code)

print("Patched!")
