import re

with open('server.ts', 'r') as f:
    content = f.read()

# Replace owner main keyboard
content = content.replace("""                  keyboard: [
                      [{ text: "📒 Cek Utang Member" }],
                      [{ text: "📝 Tambah Member" }, { text: "👑 List Member" }],
                      [{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }],
                      [{ text: "📢 Pengumuman WA" }]
                  ],""", """                  keyboard: [
                      [{ text: "📒 Cek Utang Member" }],
                      [{ text: "📝 Tambah Member" }, { text: "👑 List Member" }],
                      [{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }],
                      [{ text: "📢 Pengumuman WA" }],
                      [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]
                  ],""")

content = content.replace("""                 keyboard: [
                   [{ text: "📒 Cek Utang Member" }],
                   [{ text: "📝 Tambah Member" }, { text: "👑 List Member" }],
                   [{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }],
                   [{ text: "📢 Pengumuman WA" }]
                 ],""", """                 keyboard: [
                   [{ text: "📒 Cek Utang Member" }],
                   [{ text: "📝 Tambah Member" }, { text: "👑 List Member" }],
                   [{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }],
                   [{ text: "📢 Pengumuman WA" }],
                   [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]
                 ],""")

# Replace customer main keyboard
content = content.replace("""                keyboard: [
                  [{ text: "💵 Cek Saldo" }],
                  [{ text: "🧾 Cek Tagihan" }],
                  [{ text: "📋 Menu Produk" }]
                ],""", """                keyboard: [
                  [{ text: "💵 Cek Saldo" }],
                  [{ text: "🧾 Cek Tagihan" }],
                  [{ text: "📋 Menu Produk" }],
                  [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]
                ],""")

content = content.replace("""                  keyboard: [
                      [{ text: "💵 Cek Saldo" }],
                      [{ text: "🧾 Cek Tagihan" }],
                      [{ text: "📋 Menu Produk" }]
                  ],""", """                  keyboard: [
                      [{ text: "💵 Cek Saldo" }],
                      [{ text: "🧾 Cek Tagihan" }],
                      [{ text: "📋 Menu Produk" }],
                      [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]
                  ],""")

# Replace inline string arrays for markup
content = content.replace("""[[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }]]""", """[[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]]""")

content = content.replace("""[[{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "🔙 Kembali ke Menu Owner" }]]""", """[[{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }], [{ text: "🔙 Kembali ke Menu Owner" }]]""")

# Another place
content = content.replace("""                      keyboard: [
                          [{ text: "🧾 Cek Tagihan" }],
                          [{ text: "📋 Menu Produk" }],
                          [{ text: "🔙 Kembali ke Menu Owner" }]
                      ],""", """                      keyboard: [
                          [{ text: "🧾 Cek Tagihan" }],
                          [{ text: "📋 Menu Produk" }],
                          [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }],
                          [{ text: "🔙 Kembali ke Menu Owner" }]
                      ],""")
                      
content = content.replace("""            keyboard: [
              [{ text: "🧾 Cek Tagihan" }],
              [{ text: "📋 Menu Produk" }],
              [{ text: "🔙 Kembali ke Menu Owner" }]
            ],""", """            keyboard: [
              [{ text: "🧾 Cek Tagihan" }],
              [{ text: "📋 Menu Produk" }],
              [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }],
              [{ text: "🔙 Kembali ke Menu Owner" }]
            ],""")


with open('server.ts', 'w') as f:
    f.write(content)
print("Patched!")
