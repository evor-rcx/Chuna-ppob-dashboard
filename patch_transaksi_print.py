with open("src/components/views/Transaksi.tsx", "r") as f:
    content = f.read()

# I want to change "🌐 Web" to "🖼️ Print Gambar"
content = content.replace('title="Nota Web (HTML)"', 'title="Print Nota Gambar"')
content = content.replace('🌐 Web', '🖼️ Web Print')

with open("src/components/views/Transaksi.tsx", "w") as f:
    f.write(content)
print("done")
