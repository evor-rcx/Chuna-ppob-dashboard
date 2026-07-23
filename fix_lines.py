import re

with open('/app/applet/src/utils/printReceipt.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Python string replaced \n with actual newline.
# Let's fix that.
text = text.replace(" + '\n'", " + '\\n'")
text = text.replace("encode('E4 STORE\n')", "encode('E4 STORE\\n')")
text = text.replace("encode('Jl. Zamrud Dpn Zamrud 2 RT42\n')", "encode('Jl. Zamrud Dpn Zamrud 2 RT42\\n')")
text = text.replace("encode('WA: 6285169959218\n')", "encode('WA: 6285169959218\\n')")
text = text.replace("encode('--------------------------------\n')", "encode('--------------------------------\\n')")
text = text.replace("encode(`STRUK ${isPasca ? 'PASCABAYAR' : 'PRABAYAR'}\n`)", "encode(`STRUK ${isPasca ? 'PASCABAYAR' : 'PRABAYAR'}\\n`)")
text = text.replace("encode(`TANGGAL  : ${formattedDate}\n`)", "encode(`TANGGAL  : ${formattedDate}\\n`)")
text = text.replace("encode(`ORDER ID : ${transaction.id || '-'}\n`)", "encode(`ORDER ID : ${transaction.id || '-'}\\n`)")
text = text.replace("encode(`LAYANAN  : ${transaction.product}\n`)", "encode(`LAYANAN  : ${transaction.product}\\n`)")
text = text.replace("encode(padRight(`${targetLabel} `, 9) + `: ${transaction.target}\n`)", "encode(padRight(`${targetLabel} `, 9) + `: ${transaction.target}\\n`)")
text = text.replace("encode(`NAMA     : ${transaction.username || '-'}\n`)", "encode(`NAMA     : ${transaction.username || '-'}\\n`)")
text = text.replace("encode(`${productName}\n`)", "encode(`${productName}\\n`)")
text = text.replace("encode('TAGIHAN' + ' '.repeat(Math.max(1, paddingTag)) + tagihanStrAlign + '\n')", "encode('TAGIHAN' + ' '.repeat(Math.max(1, paddingTag)) + tagihanStrAlign + '\\n')")
text = text.replace("encode('SN' + ' '.repeat(Math.max(1, paddingSn)) + snStrAlign + '\n')", "encode('SN' + ' '.repeat(Math.max(1, paddingSn)) + snStrAlign + '\\n')")
text = text.replace("encode('TOTAL BAYAR' + ' '.repeat(Math.max(1, totalBayarPadding)) + totalBayarText + '\n')", "encode('TOTAL BAYAR' + ' '.repeat(Math.max(1, totalBayarPadding)) + totalBayarText + '\\n')")
text = text.replace("encode('STATUS' + ' '.repeat(Math.max(1, statusPadding)) + statusVal + '\n')", "encode('STATUS' + ' '.repeat(Math.max(1, statusPadding)) + statusVal + '\\n')")
text = text.replace("encode('STRUK INI ADALAH BUKTI\n')", "encode('STRUK INI ADALAH BUKTI\\n')")
text = text.replace("encode('PEMBAYARAN YANG SAH\n')", "encode('PEMBAYARAN YANG SAH\\n')")
text = text.replace("encode('~ E4 STORE ~\n\n\n\n')", "encode('~ E4 STORE ~\\n\\n\\n\\n')")
text = text.replace("encode('TERIMAKASIH TELAH BERBELANJA\n')", "encode('TERIMAKASIH TELAH BERBELANJA\\n')")
text = text.replace("encode('~ E4 STORE SIAP BANTU 24 JAM ~\n\n\n\n')", "encode('~ E4 STORE SIAP BANTU 24 JAM ~\\n\\n\\n\\n')")


with open('/app/applet/src/utils/printReceipt.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("Fixed newlines")
