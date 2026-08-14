import { createCanvas } from '@napi-rs/canvas';

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
    const boxSize = size * 0.8;
    const lidHeight = size * 0.25;
    
    // Box body
    ctx.fillStyle = '#60A5FA';
    roundRect(ctx, x - boxSize/2, y - boxSize/2 + lidHeight, boxSize, boxSize - lidHeight, 4);
    ctx.fill();
    
    // Vertical ribbon
    ctx.fillStyle = '#F87171';
    ctx.fillRect(x - 3, y - boxSize/2 + lidHeight, 6, boxSize - lidHeight);
    
    // Lid
    ctx.fillStyle = '#3B82F6';
    roundRect(ctx, x - (boxSize + 4)/2, y - boxSize/2, boxSize + 4, lidHeight, 3);
    ctx.fill();
    
    // Ribbon on lid
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(x - 3, y - boxSize/2, 6, lidHeight);
    
    // Bow
    ctx.beginPath();
    ctx.arc(x - 4, y - boxSize/2 - 2, 4, 0, Math.PI * 2);
    ctx.arc(x + 4, y - boxSize/2 - 2, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#EF4444';
    ctx.fill();
    
    ctx.restore();
}

function drawChunaAvatar(ctx: any, x: number, y: number, size: number) {
    ctx.save();
    
    // Outer glow / shadow
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, size / 2 + 2, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(147, 197, 253, 0.5)';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.restore();

    // Outer circle border
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#F0F9FF';
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#BAE6FD';
    ctx.stroke();

    // Clip to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, size / 2 - 1.5, 0, Math.PI * 2);
    ctx.clip();

    // Background gradient inside avatar
    const bgGrad = ctx.createLinearGradient(x, y - size/2, x, y + size/2);
    bgGrad.addColorStop(0, '#E0F2FE');
    bgGrad.addColorStop(1, '#BAE6FD');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(x - size/2, y - size/2, size, size);

    // Subtle background sparkles inside circle
    drawSparkle(ctx, x - size * 0.32, y - size * 0.25, 4, 'rgba(255,255,255,0.8)');
    drawSparkle(ctx, x + size * 0.32, y - size * 0.28, 5, 'rgba(255,255,255,0.8)');

    // 1. Hoodie Body (Oversized White Techwear Zip Hoodie)
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.46, size * 0.44, size * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#CBD5E1';
    ctx.stroke();

    // Zipper line
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.18);
    ctx.lineTo(x, y + size * 0.52);
    ctx.stroke();

    // Zipper puller
    ctx.fillStyle = '#64748B';
    ctx.fillRect(x - 2, y + size * 0.22, 4, 6);

    // Hoodie strings
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - 10, y + size * 0.2);
    ctx.lineTo(x - 12, y + size * 0.36);
    ctx.moveTo(x + 10, y + size * 0.2);
    ctx.lineTo(x + 12, y + size * 0.36);
    ctx.stroke();

    // --- LOGO E4 ON RIGHT SLEEVE / CHEST (Viewer's Left) ---
    ctx.save();
    const logoX = x - size * 0.26;
    const logoY = y + size * 0.28;
    // Colorful diamond/shield badge background for E4
    ctx.fillStyle = '#0284C7';
    ctx.beginPath();
    ctx.moveTo(logoX, logoY - 7);
    ctx.lineTo(logoX + 9, logoY - 2);
    ctx.lineTo(logoX + 7, logoY + 7);
    ctx.lineTo(logoX - 8, logoY + 7);
    ctx.lineTo(logoX - 9, logoY - 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1;
    ctx.stroke();

    // E4 Text on badge
    ctx.fillStyle = '#FDE047';
    ctx.font = 'bold 7px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('E4', logoX, logoY + 1);
    ctx.restore();

    // --- REI-Chuna BADGE ON LEFT CHEST (Viewer's Right) ---
    ctx.save();
    const badgeNameX = x + size * 0.16;
    const badgeNameY = y + size * 0.30;
    // Black patch
    ctx.fillStyle = '#0F172A';
    roundRect(ctx, badgeNameX - 14, badgeNameY - 4.5, 28, 9, 2);
    ctx.fill();
    // Border
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // Text: REI-Chuna
    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 5.5px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('REI-Chuna', badgeNameX, badgeNameY + 0.5);
    ctx.restore();

    // 2. Neck & Head
    ctx.fillStyle = '#FFE4DE';
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.12, size * 0.08, size * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();

    // Choker necklace
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y + size * 0.11, 8, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    // Choker cross / pendant
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.arc(x, y + size * 0.15, 2, 0, Math.PI * 2);
    ctx.fill();

    // Face / Head
    ctx.fillStyle = '#FFF1EE';
    ctx.beginPath();
    ctx.arc(x, y - size * 0.05, size * 0.23, 0, Math.PI * 2);
    ctx.fill();

    // 3. Hair - Silver white short anime hair
    ctx.fillStyle = '#F1F5F9';
    ctx.beginPath();
    // Back/side hair
    ctx.arc(x, y - size * 0.07, size * 0.27, Math.PI * 0.8, Math.PI * 2.2);
    ctx.fill();

    // Bangs
    ctx.beginPath();
    ctx.moveTo(x - size * 0.22, y - size * 0.1);
    ctx.quadraticCurveTo(x - size * 0.1, y + size * 0.04, x - size * 0.05, y - size * 0.02);
    ctx.quadraticCurveTo(x, y + size * 0.06, x + size * 0.06, y - size * 0.03);
    ctx.quadraticCurveTo(x + size * 0.14, y + size * 0.04, x + size * 0.22, y - size * 0.1);
    ctx.quadraticCurveTo(x + size * 0.18, y - size * 0.3, x, y - size * 0.32);
    ctx.quadraticCurveTo(x - size * 0.18, y - size * 0.3, x - size * 0.22, y - size * 0.1);
    ctx.fill();
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 4. Eyes - Crimson Red Anime Eyes
    // Left eye
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.ellipse(x - 11, y - size * 0.05, 4.5, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Left eye pupil
    ctx.fillStyle = '#7F1D1D';
    ctx.beginPath();
    ctx.arc(x - 11, y - size * 0.05, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // Left eye highlights
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x - 12, y - size * 0.07, 1.8, 0, Math.PI * 2);
    ctx.arc(x - 9.5, y - size * 0.03, 1, 0, Math.PI * 2);
    ctx.fill();

    // Right eye
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.ellipse(x + 11, y - size * 0.05, 4.5, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Right eye pupil
    ctx.fillStyle = '#7F1D1D';
    ctx.beginPath();
    ctx.arc(x + 11, y - size * 0.05, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // Right eye highlights
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x + 10, y - size * 0.07, 1.8, 0, Math.PI * 2);
    ctx.arc(x + 12.5, y - size * 0.03, 1, 0, Math.PI * 2);
    ctx.fill();

    // Cute blush
    ctx.fillStyle = 'rgba(244, 114, 182, 0.5)';
    ctx.beginPath();
    ctx.ellipse(x - 14, y + size * 0.02, 5, 2.5, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 14, y + size * 0.02, 5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cute small smile
    ctx.strokeStyle = '#E11D48';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(x, y + size * 0.03, 3.5, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    // 5. Mini Finger Heart Hand Pose (Viewer's Right / Character's Left Hand)
    ctx.save();
    const handX = x + size * 0.36;
    const handY = y + size * 0.18;

    // Sleeve cuff
    ctx.fillStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.ellipse(handX - 2, handY + 12, 6, 4, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Hand skin
    ctx.fillStyle = '#FFF1EE';
    // Palm / base
    ctx.beginPath();
    ctx.ellipse(handX, handY + 6, 4.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Thumb & Index finger crossing
    ctx.beginPath();
    // Index finger
    ctx.ellipse(handX - 1.5, handY - 1, 2, 4, -0.2, 0, Math.PI * 2);
    // Thumb crossed over
    ctx.ellipse(handX + 1.5, handY, 2, 3.5, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FBCFE8';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Cute floating mini heart above finger heart
    ctx.fillStyle = '#EC4899';
    ctx.beginPath();
    const hx = handX;
    const hy = handY - 9;
    ctx.arc(hx - 2, hy - 2, 2.5, 0, Math.PI * 2);
    ctx.arc(hx + 2, hy - 2, 2.5, 0, Math.PI * 2);
    ctx.moveTo(hx - 4.5, hy - 1);
    ctx.lineTo(hx, hy + 4);
    ctx.lineTo(hx + 4.5, hy - 1);
    ctx.fill();
    ctx.restore();

    ctx.restore(); // end clip
    ctx.restore();
}

export async function generateDebtSettlementReceipt(data: DebtSettlementReceiptData): Promise<Buffer> {
    const width = 600;
    
    // Calculate required height based on products count
    const productCount = Math.max(1, data.products?.length || 1);
    const productListHeight = productCount * 36;
    const baseHeight = 1000;
    const height = baseHeight + (productCount > 1 ? (productCount - 1) * 36 : 0);

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 1. Soft Blue Gradient Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#EAF4FC');
    bgGrad.addColorStop(0.5, '#F1F7FD');
    bgGrad.addColorStop(1, '#E8F3FA');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Decorative floating elements (cute coins, shopping bags, sparkles)
    // Gold coins
    const coins = [
        { x: 45, y: 55, r: 24 },
        { x: 555, y: 70, r: 22 },
        { x: 40, y: 440, r: 20 },
        { x: 560, y: 430, r: 21 },
        { x: 55, y: 760, r: 23 },
        { x: 550, y: 770, r: 22 },
        { x: 30, y: 960, r: 24 },
        { x: 565, y: 970, r: 20 },
    ];
    coins.forEach(c => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(253, 224, 71, 0.45)';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.6)';
        ctx.stroke();

        // Inner coin ring
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r * 0.7, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Dollar or star mark
        ctx.fillStyle = 'rgba(202, 138, 4, 0.65)';
        ctx.font = `bold ${Math.round(c.r * 0.85)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', c.x, c.y + 1);
        ctx.restore();
    });

    // Sparkles
    const sparkles = [
        { x: 80, y: 150, size: 8, color: 'rgba(147, 197, 253, 0.8)' },
        { x: 520, y: 130, size: 7, color: 'rgba(147, 197, 253, 0.8)' },
        { x: 70, y: 640, size: 9, color: 'rgba(147, 197, 253, 0.7)' },
        { x: 540, y: 620, size: 8, color: 'rgba(147, 197, 253, 0.7)' },
        { x: 525, y: 850, size: 8, color: 'rgba(147, 197, 253, 0.8)' },
        { x: 85, y: 840, size: 7, color: 'rgba(147, 197, 253, 0.8)' }
    ];
    sparkles.forEach(s => drawSparkle(ctx, s.x, s.y, s.size, s.color));

    // Shopping bag outlines
    const bags = [
        { x: 35, y: 220 },
        { x: 550, y: 225 },
        { x: 35, y: 580 },
        { x: 550, y: 560 },
        { x: 545, y: 920 }
    ];
    bags.forEach(b => {
        ctx.save();
        ctx.fillStyle = 'rgba(191, 219, 254, 0.4)';
        roundRect(ctx, b.x - 12, b.y - 8, 24, 28, 4);
        ctx.fill();
        ctx.strokeStyle = 'rgba(147, 197, 253, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Handle
        ctx.beginPath();
        ctx.arc(b.x, b.y - 8, 6, Math.PI, 0);
        ctx.stroke();
        ctx.restore();
    });

    let currentY = 42;

    // 2. Top Header - Logo & Store Name
    drawGiftIcon(ctx, 210, currentY + 12, 30);
    ctx.fillStyle = '#1E3A8A';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('E4 STORE', 235, currentY + 14);

    currentY += 52;

    // Main Title
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(data.isLunasTotal ? 'NOTA PEMBAYARAN LUNAS' : 'NOTA PEMBAYARAN UTANG', width / 2, currentY);

    currentY += 28;

    const cardX = 52;
    const cardW = width - 104; // 496px

    // 3. Card 1 - RINCIAN PRODUK
    const headerHeight = 36;
    const productBodyHeight = 36 + productListHeight + 36; // col headers + items + total utang
    const card1Height = headerHeight + productBodyHeight;

    // Card 1 container
    ctx.save();
    // Shadow
    ctx.shadowColor = 'rgba(148, 163, 184, 0.15)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, cardX, currentY, cardW, card1Height, 14);
    ctx.fill();
    ctx.restore();

    // Card 1 Header Pill (Light Blue)
    ctx.fillStyle = '#BAE6FD';
    roundRect(ctx, cardX, currentY, cardW, headerHeight, [14, 14, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('📦 RINCIAN PRODUK', cardX + 16, currentY + headerHeight / 2);

    // Card 1 Body Content
    let pY = currentY + headerHeight + 20;

    // Columns Header
    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Nama Produk', cardX + 18, pY);
    ctx.textAlign = 'right';
    ctx.fillText('Harga', cardX + cardW - 18, pY);

    pY += 24;

    // Product rows
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 15px sans-serif';
    if (data.products && data.products.length > 0) {
        data.products.forEach(prod => {
            ctx.textAlign = 'left';
            ctx.fillText(prod.name || '-', cardX + 18, pY);
            ctx.textAlign = 'right';
            ctx.fillText(`Rp ${(prod.price || 0).toLocaleString('id-ID')}`, cardX + cardW - 18, pY);
            pY += 32;
        });
    } else {
        ctx.textAlign = 'left';
        ctx.fillText('Produk Transaksi', cardX + 18, pY);
        ctx.textAlign = 'right';
        ctx.fillText(`Rp ${(data.totalDebt || 0).toLocaleString('id-ID')}`, cardX + cardW - 18, pY);
        pY += 32;
    }

    // Total Utang in Card 1
    pY += 6;
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Total Utang: Rp ${(data.totalDebt || 0).toLocaleString('id-ID')}`, cardX + cardW - 18, pY);

    currentY += card1Height + 16;

    // 4. Card 2 - TANGGAL TRANSAKSI
    const card2Height = headerHeight + 66;

    ctx.save();
    ctx.shadowColor = 'rgba(148, 163, 184, 0.15)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, cardX, currentY, cardW, card2Height, 14);
    ctx.fill();
    ctx.restore();

    // Card 2 Header
    ctx.fillStyle = '#BAE6FD';
    roundRect(ctx, cardX, currentY, cardW, headerHeight, [14, 14, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('📅 TANGGAL TRANSAKSI', cardX + 16, currentY + headerHeight / 2);

    // 2 Sub-boxes inside Card 2
    const subBoxW = (cardW - 44) / 2;
    const subBoxH = 48;
    const subBoxY = currentY + headerHeight + 9;

    // Left Sub-box: TANGGAL UTANG
    ctx.fillStyle = '#F8FAFC';
    roundRect(ctx, cardX + 14, subBoxY, subBoxW, subBoxH, 8);
    ctx.fill();
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('📅 TANGGAL UTANG:', cardX + 22, subBoxY + 16);
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(data.tglUtang || '-', cardX + 22, subBoxY + 34);

    // Right Sub-box: TANGGAL BAYAR
    ctx.fillStyle = '#F8FAFC';
    roundRect(ctx, cardX + 14 + subBoxW + 16, subBoxY, subBoxW, subBoxH, 8);
    ctx.fill();
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🗓️ TANGGAL BAYAR:', cardX + 14 + subBoxW + 24, subBoxY + 16);
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(data.tglBayar || '-', cardX + 14 + subBoxW + 24, subBoxY + 34);

    currentY += card2Height + 16;

    // 5. Card 3 - RINCIAN PEMBAYARAN
    const card3Height = headerHeight + 104;

    ctx.save();
    ctx.shadowColor = 'rgba(148, 163, 184, 0.15)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, cardX, currentY, cardW, card3Height, 14);
    ctx.fill();
    ctx.restore();

    // Card 3 Header
    ctx.fillStyle = '#BAE6FD';
    roundRect(ctx, cardX, currentY, cardW, headerHeight, [14, 14, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('💰 RINCIAN PEMBAYARAN', cardX + 16, currentY + headerHeight / 2);

    // Card 3 Lines
    let payY = currentY + headerHeight + 20;

    // Row 1: Total Utang
    ctx.fillStyle = '#1E293B';
    ctx.font = '15px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('• Total Utang:', cardX + 18, payY);
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Rp ${(data.totalDebt || 0).toLocaleString('id-ID')}`, cardX + cardW - 18, payY);

    payY += 28;

    // Row 2: Dibayarkan
    ctx.fillStyle = '#1E293B';
    ctx.font = '15px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('• Dibayarkan:', cardX + 18, payY);
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Rp ${(data.dibayarkan || 0).toLocaleString('id-ID')} 💵`, cardX + cardW - 18, payY);

    payY += 28;

    // Row 3: Kembalian / Sisa Utang
    if (data.isLunasTotal) {
        ctx.fillStyle = '#1E293B';
        ctx.font = '15px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('• Kembalian:', cardX + 18, payY);
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`Rp ${(data.kembalian || 0).toLocaleString('id-ID')} 🪙`, cardX + cardW - 18, payY);
    } else {
        ctx.fillStyle = '#DC2626';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('• Sisa Utang:', cardX + 18, payY);
        ctx.textAlign = 'right';
        ctx.fillText(`Rp ${(data.sisaUtang || 0).toLocaleString('id-ID')} ⚠️`, cardX + cardW - 18, payY);
    }

    currentY += card3Height + 28;

    // 6. Section 4 - STATUS PESANAN KAKAK SEKARANG
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('STATUS PESANAN', width / 2, currentY);
    currentY += 26;
    ctx.fillText('KAKAK SEKARANG:', width / 2, currentY);

    currentY += 18;

    // Big Green or Orange Badge
    const badgeW = 320;
    const badgeH = 64;
    const badgeX = (width - badgeW) / 2;

    ctx.save();
    ctx.shadowColor = data.isLunasTotal ? 'rgba(22, 163, 74, 0.4)' : 'rgba(234, 88, 12, 0.4)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = data.isLunasTotal ? '#16A34A' : '#EA580C';
    roundRect(ctx, badgeX, currentY, badgeW, badgeH, 20);
    ctx.fill();
    ctx.restore();

    // Sparkles beside badge
    drawSparkle(ctx, badgeX - 20, currentY + badgeH / 2 - 8, 10, '#FACC15');
    drawSparkle(ctx, badgeX + badgeW + 20, currentY + badgeH / 2 + 8, 10, '#FACC15');

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(data.isLunasTotal ? '✔ LUNAS' : '⚠️ BELUM LUNAS', width / 2, currentY + badgeH / 2);

    currentY += badgeH + 34;

    // 7. Section 5 - FOOTER / CHUNA AVATAR & MESSAGE
    const avatarSize = 100;
    const avatarX = 90;
    const avatarY = currentY + 45;

    drawChunaAvatar(ctx, avatarX, avatarY, avatarSize);

    // Right message box
    const msgX = 155;
    let msgY = currentY + 12;

    ctx.fillStyle = '#1E293B';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    ctx.font = '12px sans-serif';
    ctx.fillText('Terima kasih sudah percaya sama kami.', msgX, msgY);
    msgY += 18;
    
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Chuna - Asisten Imutmu', msgX, msgY);
    ctx.font = '12px sans-serif';
    ctx.fillText(' siap bantu ', msgX + 144, msgY);
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('24 jam!', msgX + 215, msgY);
    msgY += 18;

    ctx.font = '12px sans-serif';
    ctx.fillText('kalau ada yang mau ditanyain lagi ya, Kak 😊', msgX, msgY);
    msgY += 26;

    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Terimakasih telah berbelanja di E4 Store! ❤️', msgX, msgY);
    msgY += 18;

    ctx.font = '12px sans-serif';
    ctx.fillText('Semoga produknya bermanfaat dan kami', msgX, msgY);
    msgY += 16;
    ctx.fillText('tunggu kunjungan berikutnya!', msgX, msgY);

    return canvas.toBuffer('image/png');
}
