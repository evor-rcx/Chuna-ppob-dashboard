import re

with open('server.ts', 'r') as f:
    code = f.read()

# For prepaid synchronous gagal
prepaid_gagal_old = r"""msg = `❌ TRANSAKSI GAGAL

📦 Produk: \$\{product\.product_name\}
🎯 Tujuan: \$\{targetNo\}

Status: Gagal ❌
Yah, gagal nih, sayang! Tapi Chuna yakin kamu pasti 
bisa coba lagi\. Cek data pembayaranmu ya, atau 
hubungi Bos chuna  di WA 6285169959218 buat link whatsapp, nanti Chuna 
bantuin dengan senyum manis! Semangat, jangan 
nangis dulu~ Chuna di sini buat kamu! 💪😘`;"""

prepaid_gagal_new = """msg = `❌ TRANSAKSI GAGAL

📦 Produk: ${product.product_name}
🎯 Tujuan: ${targetNo}

Status: Gagal ❌
${method !== 'cash' ? '✅ Saldo sebesar Rp ' + total.toLocaleString('id-ID') + ' telah dikembalikan ke akunmu!' : ''}

Yah, gagal nih, sayang! Tapi Chuna yakin kamu pasti 
bisa coba lagi. Cek data pembayaranmu ya, atau 
hubungi Bos chuna  di WA 6285169959218 buat link whatsapp, nanti Chuna 
bantuin dengan senyum manis! Semangat, jangan 
nangis dulu~ Chuna di sini buat kamu! 💪😘`;"""

code = re.sub(prepaid_gagal_old, prepaid_gagal_new, code)

# For pasca synchronous gagal
pasca_gagal_old = r"""msg = `❌ TRANSAKSI GAGAL

📦 Produk: \$\{state\.data\.product\.product_name\}
🎯 Tujuan: \$\{customerNo\}

Status: Gagal ❌
Yah, gagal nih, sayang! Tapi Chuna yakin kamu pasti 
bisa coba lagi\. Cek data pembayaranmu ya, atau 
hubungi Bos chuna  di WA 6285169959218 buat link whatsapp, nanti Chuna 
bantuin dengan senyum manis! Semangat, jangan 
nangis dulu~ Chuna di sini buat kamu! 💪😘`;"""

pasca_gagal_new = """msg = `❌ TRANSAKSI GAGAL

📦 Produk: ${state.data.product.product_name}
🎯 Tujuan: ${customerNo}

Status: Gagal ❌
${method !== 'cash' ? '✅ Saldo sebesar Rp ' + total.toLocaleString('id-ID') + ' telah dikembalikan ke akunmu!' : ''}

Yah, gagal nih, sayang! Tapi Chuna yakin kamu pasti 
bisa coba lagi. Cek data pembayaranmu ya, atau 
hubungi Bos chuna  di WA 6285169959218 buat link whatsapp, nanti Chuna 
bantuin dengan senyum manis! Semangat, jangan 
nangis dulu~ Chuna di sini buat kamu! 💪😘`;"""

code = re.sub(pasca_gagal_old, pasca_gagal_new, code)

with open('server.ts', 'w') as f:
    f.write(code)

print("Messages patched")
