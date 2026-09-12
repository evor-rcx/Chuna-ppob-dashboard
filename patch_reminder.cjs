const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

const target = `  async function sendReminderToCustomer(tx: any, reminderType: '1_bulan' | '10_hari' = '1_bulan'): Promise<boolean> {
    const member = db.members.find((m: any) => m.id === tx.memberId);
    if (!member) return false;
    
    const nama = member.name || "Kak";
    const product = tx.product || "Produk";
    const priceStr = (tx.price || 0).toLocaleString('id-ID');

    const dUtang = new Date(tx.date || new Date());
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const tglUtangStr = \`\${dUtang.getDate()} \${months[dUtang.getMonth()]} \${dUtang.getFullYear()}\`;

    const now = new Date();
    // Gunakan tanggal saat ini, hitung selisih hari
    const diffTime = Math.abs(now.getTime() - dUtang.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const tunggakanText = \`sudah masuk masa tunggakan \${diffDays} hari\`;

    const msg = \`Halo Kak/Bapak/Ibu \${nama}! Saya Chuna, asisten bot dari E4 Store. 😊\\n\\nMau mengingatkan dengan hormat ya, Kak. Tagihan untuk pembelian \${product} sejak tanggal *\${tglUtangStr}* \${tunggakanText} dengan total Rp \${priceStr}.\\n\\nSaat ini kami sedang agak darurat soal stok produk digital. Persediaan pulsa dan top-up kami sudah menipis, jadi banyak order dari pelanggan lain yang harus kami tunda karena kami belum bisa membeli produk baru. Padahal antrian top-up dan pascabayar dari customer lain sudah menumpuk, tapi modal untuk beli produk baru masih tertahan di tagihan Kakak untuk pembelian \${product} tersebut.\\n\\nSebagai asisten bot, saya sangat mengharapkan pengertian dari Kakak \${nama} untuk segera melunasi tagihan paling lambat 3 hari ke depan. Kalau ada kendala atau keberatan, tolong chat saya langsung ya.\\n\\nKalau ada keluhan, chat aja di owner saya ya, Kak, di 085169949218. Nanti beliau yang bantu handle lebih lanjut. 😊\\n\\nAtas kerjasama dan perhatiannya, saya ucapkan terima kasih banyak! 🙏\\n\\nSalam,\\nChuna – Asisten Bot E4 Store\`;
    
    let sent = false;`;

const replacement = `  async function sendReminderToCustomer(tx: any, reminderType: '1_bulan' | '10_hari' = '1_bulan'): Promise<boolean> {
    const member = db.members.find((m: any) => m.id === tx.memberId);
    if (!member) return false;
    
    // Find ALL unpaid debts for this member
    const unpaidDebts = db.transactions.filter((t: any) => 
        t.memberId === member.id && 
        t.method === 'utang' && 
        t.status === 'Sukses' 
    );
    
    const debtsToRemind = unpaidDebts.length > 0 ? unpaidDebts : [tx];

    const nama = member.name || "Kak";
    
    let productStr = '';
    if (debtsToRemind.length === 1) {
        productStr = debtsToRemind[0].product || "Produk";
    } else {
        productStr = \`\${debtsToRemind.length} produk (\${debtsToRemind.map((t:any) => t.product).join(', ')})\`;
        if (productStr.length > 100) {
            productStr = \`\${debtsToRemind.length} produk (termasuk \${debtsToRemind[0].product})\`;
        }
    }
    
    const totalDebt = debtsToRemind.reduce((sum: number, t: any) => sum + (t.price || 0) - (t.paidAmount || 0), 0);
    const priceStr = totalDebt.toLocaleString('id-ID');

    const dUtang = new Date(Math.min(...debtsToRemind.map((t:any) => new Date(t.date || new Date()).getTime())));
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const tglUtangStr = \`\${dUtang.getDate()} \${months[dUtang.getMonth()]} \${dUtang.getFullYear()}\`;

    const now = new Date();
    // Gunakan tanggal saat ini, hitung selisih hari
    const diffTime = Math.abs(now.getTime() - dUtang.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const tunggakanText = \`sudah masuk masa tunggakan \${diffDays} hari\`;

    const msg = \`Halo Kak/Bapak/Ibu \${nama}! Saya Chuna, asisten bot dari E4 Store. 😊\\n\\nMau mengingatkan dengan hormat ya, Kak. Tagihan untuk pembelian \${productStr} sejak tanggal *\${tglUtangStr}* \${tunggakanText} dengan total Rp \${priceStr}.\\n\\nSaat ini kami sedang agak darurat soal stok produk digital. Persediaan pulsa dan top-up kami sudah menipis, jadi banyak order dari pelanggan lain yang harus kami tunda karena kami belum bisa membeli produk baru. Padahal antrian top-up dan pascabayar dari customer lain sudah menumpuk, tapi modal untuk beli produk baru masih tertahan di tagihan Kakak untuk pembelian \${productStr} tersebut.\\n\\nSebagai asisten bot, saya sangat mengharapkan pengertian dari Kakak \${nama} untuk segera melunasi tagihan paling lambat 3 hari ke depan. Kalau ada kendala atau keberatan, tolong chat saya langsung ya.\\n\\nKalau ada keluhan, chat aja di owner saya ya, Kak, di 085169949218. Nanti beliau yang bantu handle lebih lanjut. 😊\\n\\nAtas kerjasama dan perhatiannya, saya ucapkan terima kasih banyak! 🙏\\n\\nSalam,\\nChuna – Asisten Bot E4 Store\`;
    
    let sent = false;`;

content = content.replace(target, replacement);
fs.writeFileSync('server.ts', content);
console.log('Patched server.ts');
