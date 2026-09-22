import { createCanvas, loadImage } from '@napi-rs/canvas';
import path from 'path';
import fs from 'fs';

export interface DebtSettlementItem {
    name: string;
    price: number;
}

export interface DebtSettlementReceiptData {
    nama: string;
    isLunasTotal: boolean;
    products: DebtSettlementItem[];
    totalDebt: number;
    dibayarkan: number;
    kembalian?: number;
    sisaUtang?: number;
    tglUtang: string;
    tglBayar: string;
}

let cachedChunaImg: any = null;
async function getChunaImage() {
    if (cachedChunaImg) return cachedChunaImg;
    const candidates = [
        path.join(process.cwd(), 'Picsart_26-08-15_13-04-05-605.png'),
        path.join(process.cwd(), 'Picsart_26-07-14_17-31-30-222.png'),
    ];
    for (const p of candidates) {
        if (fs.existsSync(p)) {
            try {
                const img = await loadImage(p);
                cachedChunaImg = img;
                return img;
            } catch (e) {
                console.error("Failed to load image at " + p, e);
            }
        }
    }
    return null;
}

function roundRect(ctx: any, x: number, y: number, w: number, h: number, r: number | number[]) {
    if (typeof r === 'number') {
        r = [r, r, r, r];
    }
    const [tl, tr, br, bl] = r;
    ctx.beginPath();
    ctx.moveTo(x + tl, y);
    ctx.lineTo(x + w - tr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
    ctx.lineTo(x + w, y + h - br);
    ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
    ctx.lineTo(x + bl, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
    ctx.lineTo(x, y + tl);
    ctx.quadraticCurveTo(x, y, x + tl, y);
    ctx.closePath();
}

function drawSparkle(ctx: any, cx: number, cy: number, size: number, color: string) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, cy - size);
    ctx.quadraticCurveTo(cx, cy, cx + size, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy + size);
    ctx.quadraticCurveTo(cx, cy, cx - size, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy - size);
    ctx.fill();
    ctx.restore();
}

function drawGiftIcon(ctx: any, x: number, y: number, size: number) {
    ctx.save();
    const boxSize = size * 0.85;
    const lidHeight = size * 0.28;
    
    // Box body (Cyan / Blue)
    ctx.fillStyle = '#38BDF8';
    roundRect(ctx, x - boxSize/2, y - boxSize/2 + lidHeight, boxSize, boxSize - lidHeight, 4);
    ctx.fill();
    
    // Vertical ribbon (Red)
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(x - 3.5, y - boxSize/2 + lidHeight, 7, boxSize - lidHeight);
    
    // Lid
    ctx.fillStyle = '#0284C7';
    roundRect(ctx, x - (boxSize + 6)/2, y - boxSize/2, boxSize + 6, lidHeight, 3);
    ctx.fill();
    
    // Ribbon on lid
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(x - 3.5, y - boxSize/2, 7, lidHeight);
    
    // Bow
    ctx.beginPath();
    ctx.arc(x - 4.5, y - boxSize/2 - 2, 4.5, 0, Math.PI * 2);
    ctx.arc(x + 4.5, y - boxSize/2 - 2, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#EF4444';
    ctx.fill();
    
    ctx.restore();
}

function drawCuteCoin(ctx: any, x: number, y: number, r: number) {
    ctx.save();
    // Outer coin ring
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = '#FDE047';
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#EAB308';
    ctx.stroke();

    // Inner ring
    ctx.beginPath();
    ctx.arc(x, y, r * 0.76, 0, Math.PI * 2);
    ctx.strokeStyle = '#CA8A04';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Smiling face on coin
    ctx.strokeStyle = '#854D0E';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    // Left eye curve
    ctx.beginPath();
    ctx.arc(x - r * 0.28, y - r * 0.1, r * 0.16, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    // Right eye curve
    ctx.beginPath();
    ctx.arc(x + r * 0.28, y - r * 0.1, r * 0.16, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    // Cute smile
    ctx.beginPath();
    ctx.arc(x, y + r * 0.05, r * 0.36, 0.18 * Math.PI, 0.82 * Math.PI);
    ctx.stroke();

    ctx.restore();
}

function drawCardboardBox(ctx: any, x: number, y: number, size: number) {
    ctx.save();
    const w = size;
    const h = size * 0.82;
    
    // Cardboard base
    ctx.fillStyle = '#FED7AA';
    roundRect(ctx, x - w/2, y - h/2, w, h, 6);
    ctx.fill();
    ctx.strokeStyle = '#F97316';
    ctx.lineWidth = 2.4;
    ctx.stroke();

    // Tape across middle
    ctx.fillStyle = '#FFEDD5';
    ctx.fillRect(x - w/2 + 2, y - 4, w - 4, 8);
    ctx.strokeStyle = '#FB923C';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(x - w/2 + 2, y - 4, w - 4, 8);

    ctx.restore();
}

function drawShoppingBag(ctx: any, x: number, y: number, size: number) {
    ctx.save();
    const w = size * 0.85;
    const h = size;

    ctx.fillStyle = '#BFDBFE';
    roundRect(ctx, x - w/2, y - h/2, w, h, 6);
    ctx.fill();
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Handle
    ctx.beginPath();
    ctx.arc(x, y - h/2, w * 0.3, Math.PI, 0);
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.restore();
}

/**
 * Generate 1000x1000 Luxury Nota Pembayaran Lunas (matching user design template)
 */
export async function generateDebtSettlementReceipt(data: DebtSettlementReceiptData): Promise<Buffer> {
    const width = 1000;
    const height = 1000;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 1. Soft Cloud-Blue Subtle Texture Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#eaf5fe');
    bgGrad.addColorStop(0.5, '#f4f9fe');
    bgGrad.addColorStop(1, '#e5f1fc');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Decorative floating icons on left and right borders (exactly matching user template)
    // Left column icons (x ~ 62)
    drawCuteCoin(ctx, 55, 55, 36);
    drawShoppingBag(ctx, 56, 276, 36);
    drawCardboardBox(ctx, 58, 400, 42);
    drawCuteCoin(ctx, 64, 514, 32);
    drawShoppingBag(ctx, 56, 638, 36);
    drawCuteCoin(ctx, 64, 766, 30);
    drawShoppingBag(ctx, 54, 888, 34);

    // Right column icons (x ~ 942)
    drawCuteCoin(ctx, 942, 55, 36);
    drawCardboardBox(ctx, 938, 188, 44);
    drawCardboardBox(ctx, 938, 398, 44);
    drawCuteCoin(ctx, 932, 510, 30);
    drawShoppingBag(ctx, 942, 634, 34);
    drawCuteCoin(ctx, 934, 768, 30);

    // Small sparkles around
    drawSparkle(ctx, 108, 214, 8, '#7dd3fc');
    drawSparkle(ctx, 904, 214, 8, '#7dd3fc');
    drawSparkle(ctx, 114, 698, 9, '#7dd3fc');
    drawSparkle(ctx, 892, 700, 9, '#7dd3fc');

    // 2. Header Section
    // Gift Box Icon + E4 STORE
    drawGiftIcon(ctx, 396, 50, 42);

    ctx.fillStyle = '#0f3c78';
    ctx.font = 'bold 36px "Segoe UI", system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('E4 STORE', 428, 50);

    // Main Title: NOTA PEMBAYARAN LUNAS
    ctx.textAlign = 'center';
    ctx.font = '900 50px "Times New Roman", Georgia, serif';
    ctx.fillStyle = '#0b3979';
    ctx.fillText(data.isLunasTotal ? 'NOTA PEMBAYARAN LUNAS' : 'NOTA PEMBAYARAN ANGSURAN', 500, 116);

    // Thin elegant underline
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(128, 162);
    ctx.lineTo(872, 162);
    ctx.stroke();

    // Atas Nama: Kak [Name]
    ctx.fillStyle = '#0f3c78';
    ctx.font = 'bold 25px "Segoe UI", system-ui, -apple-system, sans-serif';
    ctx.fillText(`Atas Nama: ${data.nama || 'Kak Pelanggan'}`, 500, 190);

    // Card dimensions
    const cardX = 86;
    const cardW = 828;
    const pillR = 18;

    // -------------------------------------------------------------
    // SECTION 1: RINCIAN PRODUK
    // -------------------------------------------------------------
    const sec1Y = 222;
    const sec1H = 168;

    // Outer background container (White with soft border)
    ctx.save();
    ctx.shadowColor = 'rgba(15, 60, 120, 0.06)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, cardX, sec1Y, cardW, sec1H, pillR);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 1.6;
    roundRect(ctx, cardX, sec1Y, cardW, sec1H, pillR);
    ctx.stroke();

    // Header Pill Ribbon
    ctx.save();
    roundRect(ctx, cardX, sec1Y, cardW, 44, [pillR, pillR, 0, 0]);
    ctx.fillStyle = '#bfe5fc';
    ctx.fill();
    ctx.restore();

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 20px "Segoe UI", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#0c2e5b';
    ctx.fillText('RINCIAN PRODUK', cardX + 46, sec1Y + 22);

    // Column Headers: Nama Produk | Harga
    const prodHeaderY = sec1Y + 70;
    ctx.font = 'normal 21px "Segoe UI", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText('Nama Produk', cardX + 28, prodHeaderY);

    ctx.textAlign = 'right';
    ctx.fillText('Harga', cardX + cardW - 28, prodHeaderY);

    // First Product Row
    const prodRowY = sec1Y + 104;
    const firstProd = (data.products && data.products.length > 0) ? data.products[0] : { name: 'Telkomsel 100.000', price: data.totalDebt || 103000 };
    ctx.textAlign = 'left';
    ctx.font = 'bold 21px "Segoe UI", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#0f172a';
    let prodTitle = firstProd.name || 'Telkomsel 100.000';
    if (prodTitle.length > 36) prodTitle = prodTitle.slice(0, 34) + '..';
    ctx.fillText(prodTitle, cardX + 28, prodRowY);

    ctx.textAlign = 'right';
    ctx.fillText(`Rp ${(firstProd.price || 0).toLocaleString('id-ID')}`, cardX + cardW - 28, prodRowY);

    // Thin separator line
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cardX + 28, sec1Y + 128);
    ctx.lineTo(cardX + cardW - 28, sec1Y + 128);
    ctx.stroke();

    // Total Utang: Rp ...
    const totalUtangY = sec1Y + 148;
    ctx.font = 'bold 21px "Segoe UI", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(`Total Utang: Rp ${(data.totalDebt || 103000).toLocaleString('id-ID')}`, cardX + cardW - 28, totalUtangY);

    // -------------------------------------------------------------
    // SECTION 2: TANGGAL TRANSAKSI
    // -------------------------------------------------------------
    const sec2Y = 404;
    const sec2H = 112;

    ctx.save();
    ctx.shadowColor = 'rgba(15, 60, 120, 0.06)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, cardX, sec2Y, cardW, sec2H, pillR);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 1.6;
    roundRect(ctx, cardX, sec2Y, cardW, sec2H, pillR);
    ctx.stroke();

    // Header Pill Ribbon
    ctx.save();
    roundRect(ctx, cardX, sec2Y, cardW, 44, [pillR, pillR, 0, 0]);
    ctx.fillStyle = '#bfe5fc';
    ctx.fill();
    ctx.restore();

    ctx.textAlign = 'left';
    ctx.font = 'bold 20px "Segoe UI", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#0c2e5b';
    ctx.fillText('TANGGAL TRANSAKSI', cardX + 46, sec2Y + 22);

    // Inner 2 rounded sub-boxes for TANGGAL UTANG & TANGGAL BAYAR
    const innerBoxW = (cardW - 68) / 2;
    const innerBoxH = 50;
    const box1X = cardX + 22;
    const box2X = box1X + innerBoxW + 24;
    const innerBoxY = sec2Y + 52;

    // Box 1: TANGGAL UTANG
    ctx.fillStyle = '#f8fbfe';
    roundRect(ctx, box1X, innerBoxY, innerBoxW, innerBoxH, 10);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.0;
    roundRect(ctx, box1X, innerBoxY, innerBoxW, innerBoxH, 10);
    ctx.stroke();

    ctx.font = '600 13px "Segoe UI", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('TANGGAL UTANG:', box1X + 16, innerBoxY + 18);

    ctx.font = 'bold 18px "Segoe UI", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(data.tglUtang || '17 September 2026', box1X + 16, innerBoxY + 36);

    // Box 2: TANGGAL BAYAR
    ctx.fillStyle = '#f8fbfe';
    roundRect(ctx, box2X, innerBoxY, innerBoxW, innerBoxH, 10);
    ctx.fill();
    roundRect(ctx, box2X, innerBoxY, innerBoxW, innerBoxH, 10);
    ctx.stroke();

    ctx.font = '600 13px "Segoe UI", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('TANGGAL BAYAR:', box2X + 16, innerBoxY + 18);

    ctx.font = 'bold 18px "Segoe UI", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(data.tglBayar || '19 September 2026', box2X + 16, innerBoxY + 36);

    // -------------------------------------------------------------
    // SECTION 3: RINCIAN PEMBAYARAN
    // -------------------------------------------------------------
    const sec3Y = 530;
    const sec3H = 150;

    ctx.save();
    ctx.shadowColor = 'rgba(15, 60, 120, 0.06)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, cardX, sec3Y, cardW, sec3H, pillR);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 1.6;
    roundRect(ctx, cardX, sec3Y, cardW, sec3H, pillR);
    ctx.stroke();

    // Header Pill Ribbon
    ctx.save();
    roundRect(ctx, cardX, sec3Y, cardW, 44, [pillR, pillR, 0, 0]);
    ctx.fillStyle = '#bfe5fc';
    ctx.fill();
    ctx.restore();

    ctx.textAlign = 'left';
    ctx.font = 'bold 20px "Segoe UI", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#0c2e5b';
    ctx.fillText('RINCIAN PEMBAYARAN', cardX + 46, sec3Y + 22);

    // Rows: Total Utang, Dibayarkan, Kembalian (or Sisa Utang)
    const payRows: [string, string][] = [
        ['• Total Utang:', `Rp ${(data.totalDebt || 103000).toLocaleString('id-ID')}`],
        ['• Dibayarkan:', `Rp ${(data.dibayarkan || 105000).toLocaleString('id-ID')}`],
    ];

    if (data.isLunasTotal) {
        payRows.push(['• Kembalian:', `Rp ${(data.kembalian !== undefined ? data.kembalian : 2000).toLocaleString('id-ID')}`]);
    } else {
        payRows.push(['• Sisa Utang:', `Rp ${(data.sisaUtang || 0).toLocaleString('id-ID')}`]);
    }

    let pRowY = sec3Y + 70;
    payRows.forEach(([label, value]) => {
        ctx.textAlign = 'left';
        ctx.font = '500 20px "Segoe UI", system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#1e293b';
        ctx.fillText(label, cardX + 30, pRowY);

        ctx.textAlign = 'right';
        ctx.font = 'bold 20px "Segoe UI", system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.fillText(value, cardX + cardW - 30, pRowY);

        pRowY += 32;
    });

    // -------------------------------------------------------------
    // SECTION 4: STATUS PESANAN KAKAK SEKARANG: LUNAS
    // -------------------------------------------------------------
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px "Segoe UI", system-ui, -apple-system, sans-serif';
    ctx.fillText('STATUS PESANAN', 500, 706);
    ctx.fillText('KAKAK SEKARANG:', 500, 734);

    // Green LUNAS Badge
    const badgeW = 390;
    const badgeH = 60;
    const badgeX = 500 - badgeW / 2;
    const badgeY = 748;

    ctx.save();
    ctx.shadowColor = data.isLunasTotal ? 'rgba(22, 163, 74, 0.45)' : 'rgba(234, 88, 12, 0.45)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = data.isLunasTotal ? '#15803d' : '#ea580c';
    roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 18);
    ctx.fill();
    ctx.restore();

    // Yellow sparkles beside badge
    drawSparkle(ctx, badgeX - 25, badgeY + badgeH / 2, 10, '#facc15');
    drawSparkle(ctx, badgeX + badgeW + 25, badgeY + badgeH / 2, 10, '#facc15');

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 32px "Segoe UI", system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(data.isLunasTotal ? 'LUNAS' : 'BELUM LUNAS', 500, badgeY + badgeH / 2);

    // -------------------------------------------------------------
    // SECTION 5: FOOTER (Chuna Character Setengah Badan Sepinggang & Thank You Notes)
    // -------------------------------------------------------------
    const chunaImg = await getChunaImage();
    if (chunaImg) {
        try {
            // Potong setengah badan sepinggang (waist-up):
            // Dari kepala (y ~ 38) sampai pinggang (y ~ 590), lebar (x: 210 sampai 855)
            const sx = 210;
            const sy = 35;
            const sWidth = 650;
            const sHeight = 560; // Potong pas sepinggang

            const dX = 58;
            const dY = 744;
            const dWidth = 236;
            const dHeight = Math.round((dWidth * sHeight) / sWidth); // ~203px

            ctx.save();
            // Halus di bagian bawah sepinggang agar menyatu rapi
            ctx.drawImage(chunaImg, sx, sy, sWidth, sHeight, dX, dY, dWidth, dHeight);
            ctx.restore();
        } catch (e) {}
    }

    // Thank you text lines (aligned nicely next to Chuna)
    const textStartX = 312;
    let textY = 848;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    ctx.font = 'normal 18px "Segoe UI", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText('Terima kasih sudah percaya sama kami.', textStartX, textY);

    textY += 25;
    ctx.fillText('Jangan lupa, Chuna - Asisten Imutmu siap bantu 24 jam!', textStartX, textY);

    textY += 23;
    ctx.fillText('kalau ada yang mau ditanyain lagi ya, Kak.', textStartX, textY);

    textY += 32;
    ctx.fillText('Terimakasih telah berbelanja di E4 Store!', textStartX, textY);

    textY += 23;
    ctx.fillText('Semoga produknya bermanfaat dan kami tunggu kunjungan berikutnya.', textStartX, textY);

    // Gold coin in bottom right corner
    drawCuteCoin(ctx, 936, 928, 34);

    return canvas.toBuffer('image/png');
}
