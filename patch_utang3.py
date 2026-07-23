import re

with open('server.ts', 'r') as f:
    content = f.read()

# Using regex to find the block and replace it
pattern = r"                  if \(nominal === totalDebt\) \{.*?💸 Kembalian: Rp \$\{kembalian\.toLocaleString\('id-ID'\)\}\`\);\s*\}"

new_logic = """                  const member = members.find((m:any) => m.id === memberId);
                  const nama = member ? (member.name || "-") : "-";
                  const wa = member ? (member.whatsapp || "-") : "-";
                  const produkList = [...new Set(utangTx.map((t: any) => t.product))].join(', ');
                  const datesUtang = [...new Set(utangTx.map((t: any) => {
                      const d = new Date(t.date);
                      return `${d.getDate()} ${['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][d.getMonth()]} ${d.getFullYear()}`;
                  }))].join(', ');
                  
                  const today = new Date();
                  const tglLunas = `${today.getDate()} ${['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][today.getMonth()]} ${today.getFullYear()}`;

                  let lunasText = `Saya yang bertanda tangan di bawah ini:

· Nama Customer   : ${nama}
· No. WhatsApp    : ${wa}
· Produk Digital  : ${produkList}
· Total Tagihan   : Rp ${nominal.toLocaleString('id-ID')}

Dengan ini menyatakan bahwa:

· Tanggal pemesanan / utang : ${datesUtang}
· Tanggal pelunasan         : ${tglLunas}`;

                  if (nominal === totalDebt) {
                      lunasText += `\\n\\nStatus pembayaran saya telah lunas pada tanggal tersebut di atas. Terima kasih.`;
                      await ctx.reply(lunasText);
                  } else if (nominal < totalDebt) {
                      const sisa = totalDebt - nominal;
                      lunasText += `\\n\\nStatus pembayaran saya baru dibayar sebagian, sisa utang: Rp ${sisa.toLocaleString('id-ID')}.`;
                      await ctx.reply(lunasText);
                  } else {
                      const kembalian = nominal - totalDebt;
                      lunasText += `\\n\\nStatus pembayaran saya telah lunas pada tanggal tersebut di atas. Terima kasih.\\n\\n💸 Kembalian: Rp ${kembalian.toLocaleString('id-ID')}`;
                      await ctx.reply(lunasText);
                  }
                  
                  // Kirim juga ke WA
                  if (waSocket && member && member.whatsapp) {
                      let cleanWa = member.whatsapp.replace(/\\D/g, "");
                      if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
                      const jid = cleanWa + "@s.whatsapp.net";
                      try {
                          await waSocket.sendMessage(jid, { text: lunasText });
                      } catch (err) {
                          console.error("Failed to send WA utang receipt:", err);
                      }
                  }"""

match = re.search(pattern, content, re.DOTALL)
if match:
    content = content[:match.start()] + new_logic.replace('\\\\', '\\') + content[match.end():]
    with open('server.ts', 'w') as f:
        f.write(content)
