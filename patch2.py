import re

with open('/app/applet/server.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Instead of complex matching, let's just use re.sub on the generic parts

# Fix Order ID spacing
text = re.sub(r'\\nOrder ID      : \$\{', r'\\n*Order ID:*\\n${', text)
text = re.sub(r'\\nTanggal       : \$\{', r'\\n*Tanggal:*\\n${', text)
text = re.sub(r'\\nID Pelanggan  : \$\{', r'\\n*ID Pelanggan:*\\n${', text)
text = re.sub(r'\\nNama          : \$\{', r'\\n*Nama:*\\n${', text)
text = re.sub(r'\\nToken / SN    : \$\{', r'\\n*Token / SN:*\\n${', text)
text = re.sub(r'\\nPembelian     : \$\{', r'\\n*Pembelian:*\\n${', text)
text = re.sub(r'\\nTotal         : Rp \$\{', r'\\n*Total:* Rp ${', text)
text = re.sub(r'\\nStatus        : ✅ SUKSES', r'\\n*Status:* ✅ SUKSES', text)
text = re.sub(r'\\nPembayaran    :\\n', r'\\n*Pembayaran:*\\n', text)
text = re.sub(r'\\nPembayaran    : \$\{', r'\\n*Pembayaran:*\\n${', text)

# Remove code blocks around notes
text = text.replace(r'\n\n```\n*E4 STORE*', r'\n\n*E4 STORE*')
text = text.replace(r'jam!\n````;', r'jam!`;')
text = text.replace(r'------------------------------------\n````;', r'------------------------------------`;')

with open('/app/applet/server.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("Done")
