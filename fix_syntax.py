with open('server.ts', 'r') as f:
    content = f.read()

# Replace duplicate let returnMarkup blocks
dup_block = """                let returnMarkup;
                if (stateData.memberId) {
                    returnMarkup = { keyboard: [[{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "🔙 Kembali ke Menu Owner" }]], resize_keyboard: true };
                } else {
                    returnMarkup = { keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }]], resize_keyboard: true };
                }
                
                let returnMarkup;
                if (stateData.memberId) {
                    returnMarkup = { keyboard: [[{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "🔙 Kembali ke Menu Owner" }]], resize_keyboard: true };
                } else {
                    returnMarkup = { keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }]], resize_keyboard: true };
                }"""

single_block = """                let returnMarkup;
                if (stateData.memberId) {
                    returnMarkup = { keyboard: [[{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "🔙 Kembali ke Menu Owner" }]], resize_keyboard: true };
                } else {
                    returnMarkup = { keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }]], resize_keyboard: true };
                }"""

content = content.replace(dup_block, single_block)

# Fix unexpected } at 6258
with open('server.ts', 'w') as f:
    f.write(content)
