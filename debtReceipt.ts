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
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#EAB308';
    ctx.stroke();

    // Inner ring
    ctx.beginPath();
    ctx.arc(x, y, r * 0.75, 0, Math.PI * 2);
    ctx.strokeStyle = '#CA8A04';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Smiling face on coin
    ctx.strokeStyle = '#854D0E';
    ctx.lineWidth = 2;
    // Left eye curve
    ctx.beginPath();
    ctx.arc(x - r * 0.28, y - r * 0.1, r * 0.15, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    // Right eye curve
    ctx.beginPath();
    ctx.arc(x + r * 0.28, y - r * 0.1, r * 0.15, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    // Cute smile
    ctx.beginPath();
    ctx.arc(x, y + r * 0.05, r * 0.35, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    ctx.restore();
}

function drawCardboardBox(ctx: any, x: number, y: number, size: number) {
    ctx.save();
    const w = size;
    const h = size * 0.85;
    
    // Cardboard base
    ctx.fillStyle = '#FDBA74';
    roundRect(ctx, x - w/2, y - h/2, w, h, 4);
    ctx.fill();
    ctx.strokeStyle = '#EA580C';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Tape across middle
    ctx.fillStyle = '#FED7AA';
    ctx.fillRect(x - w/2 + 2, y - 3, w - 4, 6);
    ctx.strokeStyle = '#F97316';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - w/2 + 2, y - 3, w - 4, 6);

    ctx.restore();
}

function drawShoppingBag(ctx: any, x: number, y: number, size: number) {
    ctx.save();
    const w = size * 0.85;
    const h = size;

    ctx.fillStyle = '#BFDBFE';
    roundRect(ctx, x - w/2, y - h/2, w, h, 4);
    ctx.fill();
    ctx.strokeStyle = '#60A5FA';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Handle
    ctx.beginPath();
    ctx.arc(x, y - h/2, w * 0.3, Math.PI, 0);
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
}

export async function generateDebtSettlementReceipt(data: DebtSettlementReceiptData): Promise<Buffer> {
    const width = 800;
    const height = 800;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 1. Soft Blue Clean Gradient Background (1:1 Ratio 800x800)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#EAF5FD');
    bgGrad.addColorStop(0.5, '#F1F8FE');
    bgGrad.addColorStop(1, '#E8F3FA');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Decorative floating sparkles & coins
    drawSparkle(ctx, 50, 50, 10, '#38BDF8');
    drawSparkle(ctx, 750, 60, 12, '#38BDF8');
    drawSparkle(ctx, 740, 740, 10, '#38BDF8');
    drawCuteCoin(ctx, 45, 400, 24);
    drawCuteCoin(ctx, 755, 400, 24);

    // Main Card
    const cardX = 28;
    const cardY = 28;
    const cardW = width - 56;
    const cardH = height - 56;
    const cardR = 24;

    ctx.save();
    ctx.shadowColor = 'rgba(30, 58, 138, 0.08)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, cardX, cardY, cardW, cardH, cardR);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = '#BAE6FD';
    ctx.lineWidth = 1.5;
    roundRect(ctx, cardX, cardY, cardW, cardH, cardR);
    ctx.stroke();

    // Header
    let y = 64;
    ctx.fillStyle = '#1E3A8A';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎁 E4 STORE', width / 2, y);

    y += 26;
    ctx.fillStyle = '#0284C7';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(data.isLunasTotal ? 'NOTA PELUNASAN UTANG RESMI' : 'NOTA PEMBAYARAN ANGSURAN UTANG', width / 2, y);

    y += 24;
    ctx.fillStyle = '#475569';
    ctx.font = '500 15px sans-serif';
    ctx.fillText(`Atas Nama: ${data.nama}`, width / 2, y);

    y += 18;
    // Dashed divider
    ctx.save();
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = '#E0F2FE';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cardX + 24, y);
    ctx.lineTo(cardX + cardW - 24, y);
    ctx.stroke();
    ctx.restore();

    y += 22;

    // Two side-by-side boxes: Left (Rincian Produk), Right (Rincian Pembayaran)
    const gap = 16;
    const boxW = (cardW - 48 - gap) / 2;
    const boxH = 250;
    const leftBoxX = cardX + 24;
    const rightBoxX = leftBoxX + boxW + gap;

    // Left Box - Rincian Transaksi
    ctx.fillStyle = '#F8FAFC';
    roundRect(ctx, leftBoxX, y, boxW, boxH, 16);
    ctx.fill();
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1.2;
    roundRect(ctx, leftBoxX, y, boxW, boxH, 16);
    ctx.stroke();

    ctx.fillStyle = '#0369A1';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('📦 RINCIAN TRANSAKSI', leftBoxX + 16, y + 26);

    let prodY = y + 54;
    const products = data.products || [];
    const displayProds = products.slice(0, 3);

    displayProds.forEach((p, idx) => {
        ctx.fillStyle = '#334155';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'left';
        let pName = p.name || 'Produk';
        if (pName.length > 22) pName = pName.slice(0, 20) + '..';
        ctx.fillText(`${idx + 1}. ${pName}`, leftBoxX + 16, prodY);

        ctx.fillStyle = '#0F172A';
        ctx.font = '500 13px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`Rp ${(p.price || 0).toLocaleString('id-ID')}`, leftBoxX + boxW - 16, prodY);
        prodY += 28;
    });

    if (products.length > 3) {
        ctx.fillStyle = '#94A3B8';
        ctx.font = 'italic 12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`... dan ${products.length - 3} item lainnya`, leftBoxX + 16, prodY);
    }

    // Date in left box
    ctx.fillStyle = '#94A3B8';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Tanggal Pembayaran:', leftBoxX + 16, y + boxH - 34);
    ctx.fillStyle = '#475569';
    ctx.font = '500 12px sans-serif';
    ctx.fillText(`${data.tglBayar || data.tglUtang || '-'}`, leftBoxX + 16, y + boxH - 16);

    // Right Box - Rincian Pembayaran
    ctx.fillStyle = '#F0F9FF';
    roundRect(ctx, rightBoxX, y, boxW, boxH, 16);
    ctx.fill();
    ctx.strokeStyle = '#BAE6FD';
    ctx.lineWidth = 1.2;
    roundRect(ctx, rightBoxX, y, boxW, boxH, 16);
    ctx.stroke();

    ctx.fillStyle = '#0369A1';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('💰 RINCIAN PEMBAYARAN', rightBoxX + 16, y + 26);

    let payY = y + 60;
    const payRows: [string, string, string, string, boolean][] = [
        ['Total Utang:', `Rp ${(data.totalDebt || 0).toLocaleString('id-ID')}`, '#64748B', '#0F172A', false],
        ['Dibayarkan:', `Rp ${(data.dibayarkan || 0).toLocaleString('id-ID')}`, '#64748B', '#0284C7', true]
    ];

    if (data.isLunasTotal) {
        payRows.push(['Kembalian:', `Rp ${(data.kembalian || 0).toLocaleString('id-ID')}`, '#15803D', '#16A34A', true]);
        payRows.push(['Sisa Utang:', 'Rp 0 (LUNAS)', '#64748B', '#16A34A', true]);
    } else {
        payRows.push(['Sisa Utang:', `Rp ${(data.sisaUtang || 0).toLocaleString('id-ID')}`, '#DC2626', '#DC2626', true]);
    }

    payRows.forEach(([lbl, val, lblCol, valCol, isBold]) => {
        ctx.fillStyle = lblCol;
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(lbl, rightBoxX + 16, payY);

        ctx.fillStyle = valCol;
        ctx.font = isBold ? 'bold 14px sans-serif' : '13px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(val, rightBoxX + boxW - 16, payY);
        payY += 34;
    });

    y += boxH + 28;

    // Big Green LUNAS or Orange BELUM LUNAS Badge
    const badgeW = 340;
    const badgeH = 54;
    const badgeX = (width - badgeW) / 2;

    ctx.save();
    ctx.shadowColor = data.isLunasTotal ? 'rgba(22, 163, 74, 0.35)' : 'rgba(234, 88, 12, 0.35)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = data.isLunasTotal ? '#16A34A' : '#EA580C';
    roundRect(ctx, badgeX, y, badgeW, badgeH, 18);
    ctx.fill();
    ctx.restore();

    drawSparkle(ctx, badgeX - 16, y + badgeH / 2, 10, '#FACC15');
    drawSparkle(ctx, badgeX + badgeW + 16, y + badgeH / 2, 10, '#FACC15');

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(data.isLunasTotal ? '✔ LUNAS TOTAL' : '⚠️ BELUM LUNAS', width / 2, y + badgeH / 2);

    y += badgeH + 28;

    // Bottom Footer Card with Chuna
    const footerW = cardW - 48;
    const footerH = 110;
    const footerX = cardX + 24;
    ctx.fillStyle = '#F8FAFC';
    roundRect(ctx, footerX, y, footerW, footerH, 16);
    ctx.fill();
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    roundRect(ctx, footerX, y, footerW, footerH, 16);
    ctx.stroke();

    const chunaImg = await getChunaImage();
    if (chunaImg) {
        try {
            const dW = 80;
            const dH = 100;
            ctx.drawImage(chunaImg, footerX + 16, y + 5, dW, dH);
        } catch (e) {}
    }

    const msgX = footerX + 110;
    let msgY = y + 26;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Terima kasih telah berbelanja di E4 Store! ❤️', msgX, msgY);

    msgY += 24;
    ctx.fillStyle = '#475569';
    ctx.font = '13px sans-serif';
    ctx.fillText('Chuna - Asisten Imutmu siap bantu 24 jam non-stop! ✨', msgX, msgY);

    msgY += 20;
    ctx.fillStyle = '#94A3B8';
    ctx.font = '12px sans-serif';
    ctx.fillText('Simpan nota digital ini sebagai tanda bukti pembayaran yang sah.', msgX, msgY);

    return canvas.toBuffer('image/png');
}
