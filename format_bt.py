import re

with open('/app/applet/src/utils/printReceipt.ts', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = re.compile(r"const cmds = \[.*?\];", re.DOTALL)

replacement = """    const txDate = new Date(transaction.date);
    const formattedDate = `${txDate.getDate().toString().padStart(2, '0')}/${(txDate.getMonth()+1).toString().padStart(2, '0')}/${txDate.getFullYear().toString().substring(2)} ${txDate.getHours().toString().padStart(2, '0')}:${txDate.getMinutes().toString().padStart(2, '0')}`;
    const isPasca = transaction.type === "pasca";

    let snLine = '';
    let productName = transaction.product || '';
    if (productName.length > 32) productName = productName.substring(0, 32);

    const priceStr = transaction.price.toLocaleString('id-ID');
    const priceStrAlign = priceStr.padStart(10, ' ');
    
    const snVal = transaction.sn || '-';
    let snText = `SN: ${snVal}`;
    let spaceLen = 32 - snText.length - priceStrAlign.length;
    if (spaceLen < 1) spaceLen = 1;
    snLine = snText + ' '.repeat(spaceLen) + priceStrAlign + '\\n';

    const cmds = [
      new Uint8Array([ESC, 0x40]), // Initialize
      new Uint8Array([ESC, 0x61, 0x01]), // Align Center
      new Uint8Array([ESC, 0x45, 0x01]), // Bold On
      encoder.encode('E4 STORE\\n'),
      new Uint8Array([ESC, 0x45, 0x00]), // Bold Off
      encoder.encode('Jl. Zamrud Dpn Zamrud 2 RT42\\n'),
      encoder.encode('WA: 6285169959218\\n'),
      encoder.encode('--------------------------------\\n'),
      new Uint8Array([ESC, 0x45, 0x01]), // Bold On
      encoder.encode(`STRUK ${isPasca ? 'PASCABAYAR' : 'PRABAYAR'}\\n`),
      new Uint8Array([ESC, 0x45, 0x00]), // Bold Off
      encoder.encode('--------------------------------\\n'),
      new Uint8Array([ESC, 0x61, 0x00]), // Align Left
    ];

    const padRight = (str: string, len: number) => {
        if (str.length >= len) return str.substring(0, len);
        return str + ' '.repeat(len - str.length);
    };

    let targetLabel = isPasca ? 'ID PLG' : 'TUJUAN';

    cmds.push(encoder.encode(`TANGGAL  : ${formattedDate}\\n`));
    cmds.push(encoder.encode(`ORDER ID : ${transaction.id || '-'}\\n`));
    if (isPasca) {
        cmds.push(encoder.encode(`LAYANAN  : ${transaction.product}\\n`));
    }
    cmds.push(encoder.encode(padRight(`${targetLabel} `, 9) + `: ${transaction.target}\\n`));
    cmds.push(encoder.encode(`NAMA     : ${transaction.username || '-'}\\n`));
    cmds.push(encoder.encode('--------------------------------\\n'));

    if (!isPasca) {
        cmds.push(new Uint8Array([ESC, 0x45, 0x01])); // Bold On
        cmds.push(encoder.encode(`${productName}\\n`));
        cmds.push(new Uint8Array([ESC, 0x45, 0x00])); // Bold Off
        cmds.push(encoder.encode(snLine));
    } else {
        let tagihanStrAlign = priceStr.padStart(15, ' ');
        let paddingTag = 32 - 7 - tagihanStrAlign.length; 
        cmds.push(encoder.encode('TAGIHAN' + ' '.repeat(Math.max(1, paddingTag)) + tagihanStrAlign + '\\n'));
        let snStrAlign = snVal.padStart(15, ' ');
        let paddingSn = 32 - 2 - snStrAlign.length; 
        cmds.push(encoder.encode('SN' + ' '.repeat(Math.max(1, paddingSn)) + snStrAlign + '\\n'));
    }

    cmds.push(encoder.encode('--------------------------------\\n'));

    let totalBayarText = `Rp ${transaction.price.toLocaleString('id-ID')}`;
    let totalBayarPadding = 32 - 11 - totalBayarText.length;
    cmds.push(new Uint8Array([ESC, 0x45, 0x01])); // Bold On
    cmds.push(encoder.encode('TOTAL BAYAR' + ' '.repeat(Math.max(1, totalBayarPadding)) + totalBayarText + '\\n'));
    
    let statusVal = transaction.status.toUpperCase();
    if (statusVal === 'SUKSES') statusVal += ' (LUNAS)';
    let statusPadding = 32 - 6 - statusVal.length;
    cmds.push(encoder.encode('STATUS' + ' '.repeat(Math.max(1, statusPadding)) + statusVal + '\\n'));
    cmds.push(new Uint8Array([ESC, 0x45, 0x00])); // Bold Off
    cmds.push(encoder.encode('--------------------------------\\n'));
    
    cmds.push(new Uint8Array([ESC, 0x61, 0x01])); // Align Center
    if (isPasca) {
        cmds.push(encoder.encode('STRUK INI ADALAH BUKTI\\n'));
        cmds.push(encoder.encode('PEMBAYARAN YANG SAH\\n'));
        cmds.push(encoder.encode('~ E4 STORE ~\\n\\n\\n\\n'));
    } else {
        cmds.push(encoder.encode('TERIMAKASIH TELAH BERBELANJA\\n'));
        cmds.push(encoder.encode('~ E4 STORE SIAP BANTU 24 JAM ~\\n\\n\\n\\n'));
    }"""

if pattern.search(text):
    new_text = pattern.sub(replacement, text)
    with open('/app/applet/src/utils/printReceipt.ts', 'w', encoding='utf-8') as f:
        f.write(new_text)
    print("Replaced!")
else:
    print("Could not find pattern.")
