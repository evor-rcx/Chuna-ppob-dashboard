function getCalendarInfo(date: Date) {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const witaStr = date.toLocaleString('en-US', { timeZone: 'Asia/Makassar' });
    const witaDate = new Date(witaStr);
    const dayName = days[witaDate.getDay()];
    
    const holidays = [
        { month: 0, date: 1, name: 'Tahun Baru Masehi' },
        { month: 4, date: 1, name: 'Hari Buruh Internasional' },
        { month: 5, date: 1, name: 'Hari Lahir Pancasila' },
        { month: 7, date: 17, name: 'Hari Kemerdekaan RI' },
        { month: 9, date: 1, name: 'Hari Kesaktian Pancasila' },
        { month: 9, date: 28, name: 'Hari Sumpah Pemuda' },
        { month: 10, date: 10, name: 'Hari Pahlawan' },
        { month: 11, date: 22, name: 'Hari Ibu' },
        { month: 11, date: 25, name: 'Hari Raya Natal' }
    ];
    
    let nextHoliday = null;
    let minDiff = Infinity;
    const currentYear = witaDate.getFullYear();
    
    for (const h of holidays) {
        let hDate = new Date(currentYear, h.month, h.date);
        if (hDate < witaDate && hDate.toDateString() !== witaDate.toDateString()) {
            hDate = new Date(currentYear + 1, h.month, h.date);
        }
        
        const todayStart = new Date(witaDate.getFullYear(), witaDate.getMonth(), witaDate.getDate());
        const hStart = new Date(hDate.getFullYear(), hDate.getMonth(), hDate.getDate());
        const diffTime = Math.abs(hStart.getTime() - todayStart.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 0 && diffDays < minDiff) {
            minDiff = diffDays;
            nextHoliday = { ...h, daysLeft: diffDays };
        }
    }
    
    let eventText = '';
    if (nextHoliday) {
        if (nextHoliday.daysLeft === 0) {
            eventText = nextHoliday.name + ' (Hari Ini)';
        } else {
            eventText = nextHoliday.name + ' (' + nextHoliday.daysLeft + ' hari lagi)';
        }
    }
    
    return `${dayName}, ${eventText}`;
}

export async function printReceiptBluetooth(transaction: any) {
  try {
    if (!(navigator as any).bluetooth) {
      alert('Browser ini tidak mendukung Web Bluetooth API. Silakan gunakan Chrome di Android/PC.');
      return;
    }
    const device = await (navigator as any).bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [
        '000018f0-0000-1000-8000-00805f9b34fb', 
        'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
        '49535343-fe7d-4ae5-8fa9-9fafd205e455',
        '0000e000-0000-1000-8000-00805f9b34fb'
      ]
    });
    if (!device.gatt) throw new Error('Perangkat tidak memiliki GATT server');
    
    const server = await device.gatt.connect();
    const services = await server.getPrimaryServices();
    let printCharacteristic = null;
    
    for (const service of services) {
      const characteristics = await service.getCharacteristics();
      for (const characteristic of characteristics) {
        if (characteristic.properties.write || characteristic.properties.writeWithoutResponse) {
          printCharacteristic = characteristic;
          break;
        }
      }
      if (printCharacteristic) break;
    }
    if (!printCharacteristic) {
      throw new Error('Tidak menemukan karakteristik printer yang bisa ditulis.');
    }

    const encoder = new TextEncoder();
    const ESC = 0x1B;
    
    const txDate = new Date(transaction.date);
    const formattedDate = `${txDate.getDate().toString().padStart(2, '0')}/${(txDate.getMonth()+1).toString().padStart(2, '0')}/${txDate.getFullYear().toString()} ${txDate.getHours().toString().padStart(2, '0')}:${txDate.getMinutes().toString().padStart(2, '0')} WITA`;
    
    const isPasca = transaction.type === "pasca";
    let rawTarget = transaction.target || '-';
    let targetId = rawTarget;
    let nicknameFromTarget = '';
    if (rawTarget.includes('(') && rawTarget.endsWith(')')) {
        const match = rawTarget.match(/(.*)\s*\((.*)\)$/);
        if (match) {
            targetId = match[1].trim();
            nicknameFromTarget = match[2].trim();
        }
    }
    
    let tokenVal = (transaction.sn || '-').replace(/[^\x00-\x7F]/g, "").trim();
    if (tokenVal === '-' && nicknameFromTarget) {
        tokenVal = nicknameFromTarget;
    }
    let productName = (transaction.product || '-').replace(/[^\x00-\x7F]/g, "").trim();
    let statusVal = transaction.status ? transaction.status.toUpperCase() : 'PENDING';
    const isSukses = statusVal.includes('SUKSES');
    
    let namaPlg = '';
    let golDaya = '';
    
    if (tokenVal.includes('/')) {
        const parts = tokenVal.split('/');
        tokenVal = parts[0].trim();
        namaPlg = (parts[1] || '').trim();
        if (parts.length > 3) {
            golDaya = `${parts[2].trim()} / ${parts[3].trim()}`;
        } else {
            golDaya = parts.slice(2).join(' / ').trim();
        }
    }

    const cmds = [
      new Uint8Array([ESC, 0x40]), // Initialize
      new Uint8Array([ESC, 0x61, 0x01]), // Align Center
      new Uint8Array([ESC, 0x45, 0x01]), // Bold On
      encoder.encode('E4 STORE\n'),
      new Uint8Array([ESC, 0x45, 0x00]), // Bold Off
      encoder.encode('Token Listrik / Struk Pembayaran\n\n'),
      encoder.encode(`Status: ${statusVal} ${isSukses ? '(LUNAS)' : ''}\n\n`),
      new Uint8Array([ESC, 0x61, 0x00]), // Align Left
      encoder.encode('--------------------------------\n'),
    ];

    const createLR = (left: string, right: string) => {
        let space = 32 - left.length - right.length;
        if (space < 1) space = 1;
        return left + ' '.repeat(space) + right;
    };

    let targetLabel = isPasca ? 'ID Pelanggan' : 'ID Pelanggan';
    
    let memberName = transaction.username || '-';
    // Actually in printReceiptBluetooth we might not have member name if it's not populated, but we use username
    cmds.push(encoder.encode(createLR('Nama', memberName) + '\n'));
    cmds.push(encoder.encode(createLR(targetLabel, targetId) + '\n'));
    cmds.push(encoder.encode(createLR('Order ID', transaction.id || '-') + '\n'));
    cmds.push(encoder.encode(createLR('Tanggal', formattedDate) + '\n'));
    
    if (productName.length > 21) {
        cmds.push(encoder.encode('Pembelian\n'));
        cmds.push(new Uint8Array([ESC, 0x61, 0x02])); // Align Right
        let p = productName;
        while(p.length > 0) {
            let chunk = p.substring(0, 32);
            p = p.substring(32);
            cmds.push(encoder.encode(chunk + '\n'));
        }
        cmds.push(new Uint8Array([ESC, 0x61, 0x00])); // Align Left
    } else {
        cmds.push(encoder.encode(createLR('Pembelian', productName) + '\n'));
    }
    
    if (namaPlg) {
        cmds.push(encoder.encode(createLR('Nama Pel.', namaPlg) + '\n'));
    }
    if (golDaya) {
        cmds.push(encoder.encode(createLR('Gol/Daya', golDaya) + '\n'));
    }

    if (tokenVal !== '-') {
    cmds.push(encoder.encode('\n'));
    cmds.push(encoder.encode('================================\n'));
    cmds.push(new Uint8Array([ESC, 0x45, 0x01])); // Bold On
    cmds.push(encoder.encode('Token / SN\n'));
    cmds.push(new Uint8Array([ESC, 0x45, 0x00])); // Bold Off
    
    cmds.push(new Uint8Array([ESC, 0x61, 0x02])); // Align Right
    let t = tokenVal;
    while(t.length > 0) {
        let chunk = t.substring(0, 32);
        t = t.substring(32);
        cmds.push(encoder.encode(chunk + '\n'));
    }
    cmds.push(new Uint8Array([ESC, 0x61, 0x00])); // Align Left
    cmds.push(encoder.encode('================================\n\n'));
} else {
    cmds.push(encoder.encode('\n'));
}
    
    cmds.push(encoder.encode('================================\n'));
    let totalBayarText = `Rp ${(transaction.price || 0).toLocaleString('id-ID')}`;
    cmds.push(new Uint8Array([ESC, 0x45, 0x01])); // Bold On
    cmds.push(encoder.encode(createLR('TOTAL BAYAR', totalBayarText) + '\n'));
    cmds.push(new Uint8Array([ESC, 0x45, 0x00])); // Bold Off
    cmds.push(encoder.encode('================================\n\n'));
    
    cmds.push(new Uint8Array([ESC, 0x61, 0x01])); // Align Center
    cmds.push(encoder.encode('Chuna - Asisten Imutmu\n'));
    cmds.push(encoder.encode('siap bantu 24 jam!\n'));
    cmds.push(encoder.encode('Terimakasih telah berbelanja\n'));
    cmds.push(encoder.encode('di E4 Store!\n'));
    cmds.push(encoder.encode('--------------------------------\n'));
    cmds.push(encoder.encode('Terima kasih telah berbelanja\n'));
    cmds.push(encoder.encode('di E4 Store!\n'));
    cmds.push(encoder.encode(`Cetak: ${formattedDate}\n`));
    cmds.push(encoder.encode(`Kode: #PRE-${(transaction.id||"").substring(0,2)}\n`));
    
    const calInfoStr = getCalendarInfo(txDate);
    cmds.push(encoder.encode(calInfoStr + '\n\n\n\n'));

    for (const cmd of cmds) {
      await printCharacteristic.writeValue(cmd);
      await new Promise(r => setTimeout(r, 50));
    }
    
    device.gatt.disconnect();
    alert('Struk berhasil dicetak!');
  } catch (error: any) {
    console.error('Bluetooth error:', error);
    if (error.message?.includes('User cancelled')) {
      return;
    }
    alert('Gagal mencetak: ' + error.message);
  }
}

export function printReceiptHTML(transaction: any) {
  window.open('/api/nota/' + transaction.id, '_blank');
}


export async function printPhysicalReceiptBluetooth(transaction: any) {
  try {
    if (!(navigator as any).bluetooth) {
      alert('Browser ini tidak mendukung Web Bluetooth API. Silakan gunakan Chrome di Android/PC.');
      return;
    }
    const device = await (navigator as any).bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [
        '000018f0-0000-1000-8000-00805f9b34fb', 
        'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
        '49535343-fe7d-4ae5-8fa9-9fafd205e455',
        '0000e000-0000-1000-8000-00805f9b34fb'
      ]
    });
    if (!device.gatt) throw new Error('Perangkat tidak memiliki GATT server');
    
    const server = await device.gatt.connect();
    
    const services = await server.getPrimaryServices();
    let printCharacteristic = null;
    
    for (const service of services) {
      const characteristics = await service.getCharacteristics();
      for (const characteristic of characteristics) {
        if (characteristic.properties.write || characteristic.properties.writeWithoutResponse) {
          printCharacteristic = characteristic;
          break;
        }
      }
      if (printCharacteristic) break;
    }

    if (!printCharacteristic) {
      throw new Error('Tidak menemukan karakteristik printer yang bisa ditulis.');
    }

    const encoder = new TextEncoder();
    const ESC = 0x1B;
    
    const txDate = new Date(transaction.date);
    const formattedDate = `${txDate.getDate().toString().padStart(2, '0')}/${(txDate.getMonth()+1).toString().padStart(2, '0')}/${txDate.getFullYear().toString().substring(2)} ${txDate.getHours().toString().padStart(2, '0')}:${txDate.getMinutes().toString().padStart(2, '0')}`;
    
    const cmds = [
      new Uint8Array([ESC, 0x40]), // Initialize
      new Uint8Array([ESC, 0x61, 0x01]), // Align Center
      new Uint8Array([ESC, 0x45, 0x01]), // Bold On
      encoder.encode('E4 STORE\n'),
      new Uint8Array([ESC, 0x45, 0x00]), // Bold Off
      encoder.encode('Jl. Zamrud Dpn Zamrud 2 RT42\n'),
      encoder.encode('WA: 6285169959218\n'),
      encoder.encode('--------------------------------\n'),
      new Uint8Array([ESC, 0x45, 0x01]), // Bold On
      encoder.encode('STRUK PEMBELIAN\n'),
      new Uint8Array([ESC, 0x45, 0x00]), // Bold Off
      encoder.encode('--------------------------------\n'),
      new Uint8Array([ESC, 0x61, 0x00]), // Align Left
    ];

    cmds.push(encoder.encode(`TANGGAL : ${formattedDate}\n`));
    cmds.push(encoder.encode(`PELANGGAN: ${transaction.customer || 'Umum'}\n`));
    cmds.push(encoder.encode(`METODE  : ${(transaction.method || 'cash').toUpperCase()}\n`));
    cmds.push(encoder.encode('--------------------------------\n'));

    for (const item of transaction.items) {
      let name = item.name;
      if (name.length > 32) name = name.substring(0, 32);
      cmds.push(encoder.encode(`${name}\n`));
      
      const qtyStr = `${item.quantity}x ${item.price.toLocaleString('id-ID')}`;
      const subTotalStr = (item.quantity * item.price).toLocaleString('id-ID');
      let spaceLen = 32 - qtyStr.length - subTotalStr.length;
      if (spaceLen < 1) spaceLen = 1;
      
      cmds.push(encoder.encode(qtyStr + ' '.repeat(spaceLen) + subTotalStr + '\n'));
    }
    
    cmds.push(encoder.encode('--------------------------------\n'));
    
    let totalBayarText = `Rp ${transaction.total.toLocaleString('id-ID')}`;
    let totalBayarPadding = 32 - 11 - totalBayarText.length;
    cmds.push(new Uint8Array([ESC, 0x45, 0x01])); // Bold On
    cmds.push(encoder.encode('TOTAL BAYAR' + ' '.repeat(Math.max(1, totalBayarPadding)) + totalBayarText + '\n'));
    cmds.push(new Uint8Array([ESC, 0x45, 0x00])); // Bold Off
    cmds.push(encoder.encode('--------------------------------\n'));
    
    cmds.push(new Uint8Array([ESC, 0x61, 0x01])); // Align Center
    cmds.push(encoder.encode('TERIMAKASIH TELAH BERBELANJA\n'));
    cmds.push(encoder.encode('~ E4 STORE SIAP BANTU 24 JAM ~\n\n\n\n'));

    for (const cmd of cmds) {
      await printCharacteristic.writeValue(cmd);
      await new Promise(r => setTimeout(r, 50));
    }
    
    device.gatt.disconnect();
    alert('Struk berhasil dicetak!');
  } catch (error: any) {
    console.error('Bluetooth error:', error);
    if (!error.message?.includes('User cancelled')) {
      alert('Gagal mencetak: ' + error.message);
    }
  }
}
