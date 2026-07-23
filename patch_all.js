import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf-8');

// Replace roundRect
code = code.replace(/ctx\.roundRect\(([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^\)]+)\);/g, `
            ctx.moveTo($1 + $5, $2);
            ctx.lineTo($1 + $3 - $5, $2);
            ctx.quadraticCurveTo($1 + $3, $2, $1 + $3, $2 + $5);
            ctx.lineTo($1 + $3, $2 + $4 - $5);
            ctx.quadraticCurveTo($1 + $3, $2 + $4, $1 + $3 - $5, $2 + $4);
            ctx.lineTo($1 + $5, $2 + $4);
            ctx.quadraticCurveTo($1, $2 + $4, $1, $2 + $4 - $5);
            ctx.lineTo($1, $2 + $5);
            ctx.quadraticCurveTo($1, $2, $1 + $5, $2);
`);

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
}

// Remove finalCanvas and drawImage logic
const drawImageRegex = /\/\/ create smaller canvas if needed[\s\S]*?return finalCanvas\.toBuffer\('image\/png'\);/m;
if (code.match(drawImageRegex)) {
    code = code.replace(drawImageRegex, `return canvas.toBuffer('image/png');`);
}

// Fix Promo Otomatis warning msg logic
code = code.replace(
    /if \(closeText === '' && aktifText === ''\) \{[\s\S]*?return ctx\.reply\("❌ Tidak ada data produk yang bisa di-generate\. Pastikan Anda telah mengatur harga produk di Dashboard!"\);[\s\S]*?\}/g,
    `if (closeText === '' && aktifText === '') {
                  return ctx.reply("❌ Tidak ada produk yang mengalami perubahan (naik/turun). Data HANYA diambil dari SKU yang diatur di Dashboard! Jika belum ada, silakan tambahkan produk di Dashboard.");
              }`
);

fs.writeFileSync('server.ts', code);
console.log("Patched all");
