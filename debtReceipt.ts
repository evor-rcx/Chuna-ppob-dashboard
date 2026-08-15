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
    const width = 600;
    
    // Calculate required height based on products count
    const productCount = Math.max(1, data.products?.length || 1);
    const productListHeight = productCount * 38;
    const baseHeight = 1060;
    const height = baseHeight + (productCount > 1 ? (productCount - 1) * 38 : 0);

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 1. Soft Blue Clean Gradient Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#EAF5FD');
    bgGrad.addColorStop(0.5, '#F1F8FE');
    bgGrad.addColorStop(1, '#E8F3FA');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Decorative floating elements in background
    // 1. Coins with cute faces
    const coins = [
        { x: 38, y: 38, r: 32 },
        { x: 555, y: 48, r: 30 },
        { x: 45, y: 440, r: 26 },
        { x: 555, y: 435, r: 26 },
        { x: 28, y: 760, r: 25 },
        { x: 565, y: 760, r: 25 },
        { x: 555, y: 980, r: 28 },
    ];
    coins.forEach(c => drawCuteCoin(ctx, c.x, c.y, c.r));

    // 2. Cardboard boxes
    const boxes = [
        { x: 560, y: 135, s: 36 },
        { x: 40, y: 330, s: 36 },
        { x: 560, y: 320, s: 36 }
    ];
    boxes.forEach(b => drawCardboardBox(ctx, b.x, b.y, b.s));

    // 3. Shopping bags
    const bags = [
        { x: 40, y: 215, s: 32 },
        { x: 40, y: 580, s: 32 },
        { x: 555, y: 575, s: 32 },
        { x: 30, y: 940, s: 32 },
        { x: 555, y: 940, s: 32 }
    ];
    bags.forEach(b => drawShoppingBag(ctx, b.x, b.y, b.s));

    // 4. Sparkles
    const sparkles = [
        { x: 75, y: 155, size: 9, color: 'rgba(56, 189, 248, 0.75)' },
        { x: 520, y: 220, size: 8, color: 'rgba(56, 189, 248, 0.75)' },
        { x: 75, y: 630, size: 9, color: 'rgba(56, 189, 248, 0.75)' },
        { x: 535, y: 645, size: 9, color: 'rgba(56, 189, 248, 0.75)' },
        { x: 80, y: 825, size: 8, color: 'rgba(56, 189, 248, 0.75)' },
        { x: 530, y: 850, size: 8, color: 'rgba(56, 189, 248, 0.75)' }
    ];
    sparkles.forEach(s => drawSparkle(ctx, s.x, s.y, s.size, s.color));

    let currentY = 48;

    // 2. Top Header - Logo & Store Name
    drawGiftIcon(ctx, 215, currentY + 14, 34);
    ctx.fillStyle = '#1E3A8A';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('E4 STORE', 242, currentY + 16);

    currentY += 56;

    // Main Title
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 25px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(data.isLunasTotal ? 'NOTA PEMBAYARAN LUNAS' : 'NOTA PEMBAYARAN UTANG', width / 2, currentY);

    currentY += 30;

    const cardX = 58;
    const cardW = width - 116; // 484px

    // 3. Card 1 - RINCIAN PRODUK
    const headerHeight = 40;
    const productBodyHeight = 36 + productListHeight + 36;
    const card1Height = headerHeight + productBodyHeight;

    // Card 1 container
    ctx.save();
    ctx.shadowColor = 'rgba(148, 163, 184, 0.18)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, cardX, currentY, cardW, card1Height, 16);
    ctx.fill();
    ctx.restore();

    // Card 1 Outer border
    ctx.strokeStyle = '#BAE6FD';
    ctx.lineWidth = 1.5;
    roundRect(ctx, cardX, currentY, cardW, card1Height, 16);
    ctx.stroke();

    // Card 1 Header Bar (Light Blue)
    ctx.fillStyle = '#BAE6FD';
    roundRect(ctx, cardX, currentY, cardW, headerHeight, [16, 16, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 17px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('📦 RINCIAN PRODUK', cardX + 16, currentY + headerHeight / 2);

    // Card 1 Body Content
    let pY = currentY + headerHeight + 22;

    // Columns Header
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Nama Produk', cardX + 18, pY);
    ctx.textAlign = 'right';
    ctx.fillText('Harga', cardX + cardW - 18, pY);

    pY += 28;

    // Product rows
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 16px sans-serif';
    if (data.products && data.products.length > 0) {
        data.products.forEach(prod => {
            ctx.textAlign = 'left';
            ctx.fillText(prod.name || '-', cardX + 18, pY);
            ctx.textAlign = 'right';
            ctx.fillText(`Rp ${(prod.price || 0).toLocaleString('id-ID')}`, cardX + cardW - 18, pY);
            pY += 34;
        });
    } else {
        ctx.textAlign = 'left';
        ctx.fillText('Produk Transaksi', cardX + 18, pY);
        ctx.textAlign = 'right';
        ctx.fillText(`Rp ${(data.totalDebt || 0).toLocaleString('id-ID')}`, cardX + cardW - 18, pY);
        pY += 34;
    }

    // Total Utang in Card 1
    pY += 6;
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 17px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Total Utang: Rp ${(data.totalDebt || 0).toLocaleString('id-ID')}`, cardX + cardW - 18, pY);

    currentY += card1Height + 16;

    // 4. Card 2 - TANGGAL TRANSAKSI
    const card2Height = headerHeight + 70;

    ctx.save();
    ctx.shadowColor = 'rgba(148, 163, 184, 0.18)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, cardX, currentY, cardW, card2Height, 16);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = '#BAE6FD';
    ctx.lineWidth = 1.5;
    roundRect(ctx, cardX, currentY, cardW, card2Height, 16);
    ctx.stroke();

    // Card 2 Header
    ctx.fillStyle = '#BAE6FD';
    roundRect(ctx, cardX, currentY, cardW, headerHeight, [16, 16, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 17px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('📅 TANGGAL TRANSAKSI', cardX + 16, currentY + headerHeight / 2);

    // 2 Sub-boxes inside Card 2
    const subBoxW = (cardW - 40) / 2;
    const subBoxH = 52;
    const subBoxY = currentY + headerHeight + 10;

    // Left Sub-box: TANGGAL UTANG
    ctx.fillStyle = '#F8FAFC';
    roundRect(ctx, cardX + 12, subBoxY, subBoxW, subBoxH, 10);
    ctx.fill();
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('📅 TANGGAL UTANG:', cardX + 22, subBoxY + 18);
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(data.tglUtang || '-', cardX + 22, subBoxY + 38);

    // Right Sub-box: TANGGAL BAYAR
    ctx.fillStyle = '#F8FAFC';
    roundRect(ctx, cardX + 12 + subBoxW + 16, subBoxY, subBoxW, subBoxH, 10);
    ctx.fill();
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('📅 TANGGAL BAYAR:', cardX + 12 + subBoxW + 24, subBoxY + 18);
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`✅ ${data.tglBayar || '-'}`, cardX + 12 + subBoxW + 24, subBoxY + 38);

    currentY += card2Height + 16;

    // 5. Card 3 - RINCIAN PEMBAYARAN
    const card3Height = headerHeight + 112;

    ctx.save();
    ctx.shadowColor = 'rgba(148, 163, 184, 0.18)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, cardX, currentY, cardW, card3Height, 16);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = '#BAE6FD';
    ctx.lineWidth = 1.5;
    roundRect(ctx, cardX, currentY, cardW, card3Height, 16);
    ctx.stroke();

    // Card 3 Header
    ctx.fillStyle = '#BAE6FD';
    roundRect(ctx, cardX, currentY, cardW, headerHeight, [16, 16, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 17px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('💰 RINCIAN PEMBAYARAN', cardX + 16, currentY + headerHeight / 2);

    // Card 3 Lines
    let payY = currentY + headerHeight + 22;

    // Row 1: Total Utang
    ctx.fillStyle = '#1E293B';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('• Total Utang:', cardX + 18, payY);
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Rp ${(data.totalDebt || 0).toLocaleString('id-ID')}`, cardX + cardW - 18, payY);

    payY += 30;

    // Row 2: Dibayarkan
    ctx.fillStyle = '#1E293B';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('• Dibayarkan:', cardX + 18, payY);
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Rp ${(data.dibayarkan || 0).toLocaleString('id-ID')} 💵`, cardX + cardW - 18, payY);

    payY += 30;

    // Row 3: Kembalian / Sisa Utang
    if (data.isLunasTotal) {
        ctx.fillStyle = '#1E293B';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('• Kembalian:', cardX + 18, payY);
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`🪙 Rp ${(data.kembalian || 0).toLocaleString('id-ID')} ✅`, cardX + cardW - 18, payY);
    } else {
        ctx.fillStyle = '#DC2626';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('• Sisa Utang:', cardX + 18, payY);
        ctx.textAlign = 'right';
        ctx.fillText(`Rp ${(data.sisaUtang || 0).toLocaleString('id-ID')} ⚠️`, cardX + cardW - 18, payY);
    }

    currentY += card3Height + 30;

    // 6. Section 4 - STATUS PESANAN KAKAK SEKARANG
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('STATUS PESANAN', width / 2, currentY);
    currentY += 28;
    ctx.fillText('KAKAK SEKARANG:', width / 2, currentY);

    currentY += 20;

    // Big Green or Orange Badge
    const badgeW = 340;
    const badgeH = 68;
    const badgeX = (width - badgeW) / 2;

    ctx.save();
    ctx.shadowColor = data.isLunasTotal ? 'rgba(22, 163, 74, 0.45)' : 'rgba(234, 88, 12, 0.45)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = data.isLunasTotal ? '#16A34A' : '#EA580C';
    roundRect(ctx, badgeX, currentY, badgeW, badgeH, 20);
    ctx.fill();
    ctx.restore();

    // Sparkles beside badge
    drawSparkle(ctx, badgeX - 22, currentY + badgeH / 2 - 10, 12, '#FACC15');
    drawSparkle(ctx, badgeX - 10, currentY + badgeH / 2 + 14, 7, '#FDE047');
    drawSparkle(ctx, badgeX + badgeW + 22, currentY + badgeH / 2 + 10, 12, '#FACC15');
    drawSparkle(ctx, badgeX + badgeW + 10, currentY + badgeH / 2 - 14, 7, '#FDE047');

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(data.isLunasTotal ? '✔ LUNAS' : '⚠️ BELUM LUNAS', width / 2, currentY + badgeH / 2);

    currentY += badgeH + 34;

    // 7. Section 5 - FOOTER / CHUNA AVATAR & MESSAGE
    const chunaImg = await getChunaImage();
    if (chunaImg) {
        // Draw real 3D Chuna Character standing at bottom-left corner!
        ctx.save();
        // Crop transparent padding: minX: 219, minY: 37, maxX: 850, maxY: 1023 (w: 631, h: 986)
        const sX = 200;
        const sY = 20;
        const sW = 660;
        const sH = 1004;

        const dW = 205;
        const dH = (sH / sW) * dW; // ~311px
        const dX = 15;
        const dY = height - dH + 8; // stick to bottom edge

        ctx.drawImage(chunaImg, sX, sY, sW, sH, dX, dY, dW, dH);
        ctx.restore();
    }

    // Right message box
    const msgX = 220;
    let msgY = currentY + 10;

    ctx.fillStyle = '#0F172A';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    ctx.font = '13px sans-serif';
    ctx.fillText('Terima kasih sudah percaya sama kami.', msgX, msgY);
    msgY += 20;
    
    ctx.font = '13px sans-serif';
    ctx.fillText('Jangan lupa, ', msgX, msgY);
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('Chuna - Asisten Imutmu', msgX + 75, msgY);
    msgY += 18;

    ctx.font = '13px sans-serif';
    ctx.fillText('siap bantu ', msgX, msgY);
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('24 jam!', msgX + 66, msgY);
    ctx.font = '13px sans-serif';
    ctx.fillText(' kalau ada yang mau', msgX + 114, msgY);
    msgY += 18;

    ctx.font = '13px sans-serif';
    ctx.fillText('ditanyain lagi ya, Kak 😊', msgX, msgY);
    msgY += 28;

    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('Terimakasih telah berbelanja di E4 Store! ❤️', msgX, msgY);
    msgY += 18;

    ctx.font = '13px sans-serif';
    ctx.fillText('Semoga produknya bermanfaat dan kami', msgX, msgY);
    msgY += 16;
    ctx.fillText('tunggu kunjungan berikutnya!', msgX, msgY);

    return canvas.toBuffer('image/png');
}
