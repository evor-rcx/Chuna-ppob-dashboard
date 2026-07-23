const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex = /let height = 800;[\s\S]*?const canvas = createCanvas\(width, height\);/m;
const match = code.match(regex);
if (match) {
    code = code.replace(match[0], `
        let lines: any[] = [];
        let token = data.sn || data.token || '-';
        let calcY = 60 + 40 + 50 + 80 + 50; // Header + badge + divider + padding
        
        if (type === 'nota') {
            lines = [
                ['No. Transaksi', data.id || '-'],
                ['Tanggal', formattedDate],
                ['Produk', data.sku || data.product_name || '-'],
                ['Nomor Tujuan', data.target || '-'],
                ['Nickname', (data.nickname && data.nickname !== 'Tidak ditemukan') ? data.nickname : 'Tidak tersedia'],
                ['Status', data.status || '-']
            ];
            calcY += (lines.length * 45) + 20 + 140 + 20 + 110 + 150; // token box, total box, footer
        } else {
            lines = [
                ['Nama', data.nickname || data.name || 'H*N*R*I*I'],
                ['Nomor', data.target || '-'],
                ['Layanan', data.layanan || '-']
            ];
            calcY += (lines.length * 45) + 20 + 110; // total box
            if (data.detail) {
                let detailsList = data.detail.replace(/[💎⚡📄📅💡💳]/g, '').split('\\n').filter((l: string) => !l.toLowerCase().includes('admin') && !l.toLowerCase().includes('total'));
                for (let l of detailsList) {
                    if(l.toLowerCase().includes('tarif') || l.toLowerCase().includes('daya') || l.toLowerCase().includes('lembar')) {
                        calcY += 35;
                    } else if (l.toLowerCase().includes('bulan') || l.toLowerCase().includes('meter')) {
                        calcY += 55;
                    }
                }
                calcY += 20;
            }
            calcY += 130; // footer
        }
        calcY += 40 + 30 + 25 + 25 + 50; // divider, thank you, codes, calendar, padding

        const height = calcY;
        const canvas = createCanvas(width, height);
    `);
    fs.writeFileSync('server.ts', code);
    console.log("Patched height calc");
} else {
    console.log("Regex not found");
}
