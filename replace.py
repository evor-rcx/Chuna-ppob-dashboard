import codecs

with open('/app/applet/server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

def replace_literally(old, new):
    global content
    if old in content:
        content = content.replace(old, new)
        print("Replaced!")
    else:
        print("Not found:\n", old[:100], "...")

old1 = """                    msg = `HOREE! Sukses, sayang! 🎉🎊 Pesananmu sudah diproses otomatis! 💖🌈\\n\\n📄 Nota Sukses:\\n\\n\\`\\`\\`\\n*E4 STORE*\\nJl. Zamrud Depan Zamrud 2 RT 42\\nWA: 6285169959218\\n------------------------------------\\nOrder ID      : ${ref_id}\\nTanggal       : ${dateStr}\\nID Pelanggan  : ${tx.target}\\nNama          : ${member ? (member.name || "-") : "-"}\\n------------------------------------\\nToken / SN    : ${sn}\\n------------------------------------\\nPembelian     : ${tx.product}\\n------------------------------------\\nTotal         : Rp ${tx.price.toLocaleString('id-ID')}\\n------------------------------------\\nStatus        : ✅ SUKSES (LUNAS)\\n------------------------------------\\nTerimakasih telah berbelanja di E4 Store!\\n🐾 Chuna ~ Asisten Imutmu siap bantu 24 jam!\\n\\`\\`\\``;"""
# the backslashes in old1 are literal backslashes if I read from file? 
