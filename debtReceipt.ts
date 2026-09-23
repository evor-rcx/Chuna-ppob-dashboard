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
    waPhotoUrl?: string | null;
    avatarBuffer?: Buffer | null;
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

function drawSparkle(ctx: any, cx: number, cy: number, r: number, color = '#ffffff') {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        ctx.moveTo(cx, cy);
        const tipX = cx + Math.cos(angle) * r;
        const tipY = cy + Math.sin(angle) * r;
        const c1X = cx + Math.cos(angle - Math.PI / 4) * (r * 0.28);
        const c1Y = cy + Math.sin(angle - Math.PI / 4) * (r * 0.28);
        const c2X = cx + Math.cos(angle + Math.PI / 4) * (r * 0.28);
        const c2Y = cy + Math.sin(angle + Math.PI / 4) * (r * 0.28);
        ctx.lineTo(c1X, c1Y);
        ctx.lineTo(tipX, tipY);
        ctx.lineTo(c2X, c2Y);
    }
    ctx.fill();
    ctx.restore();
}

function draw3DGiftIcon(ctx: any, x: number, y: number, size: number) {
    ctx.save();
    const boxSize = size * 0.82;
    const lidH = size * 0.26;
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.ellipse(x, y + boxSize/2 + 2, boxSize * 0.55, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Box body (Cyan/Sky)
    ctx.fillStyle = '#38bdf8';
    roundRect(ctx, x - boxSize/2, y - boxSize/2 + lidH, boxSize, boxSize - lidH, 4);
    ctx.fill();

    // Vertical ribbon (Red)
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x - 3.5, y - boxSize/2 + lidH, 7, boxSize - lidH);

    // Lid
    ctx.fillStyle = '#0284c7';
    roundRect(ctx, x - (boxSize + 5)/2, y - boxSize/2, boxSize + 5, lidH, 3);
    ctx.fill();

    // Ribbon on lid
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x - 3.5, y - boxSize/2, 7, lidH);

    // Bow loops
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(x - 4, y - boxSize/2 - 2, 4.5, 0, Math.PI * 2);
    ctx.arc(x + 4, y - boxSize/2 - 2, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function getInitials(name: string): string {
    const clean = (name || '').replace(/^(kak|mas|mba|om|tante|bapak|ibu)\s+/i, '').trim();
    if (!clean) return 'E4';
    const words = clean.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return clean.substring(0, 2).toUpperCase();
}

/**
 * Generate 1024x1024 High-Fidelity Nota Pembayaran Lunas
 * Sesuai dengan template resmi Chuna E4 Store + Foto Profil WhatsApp di kartu yang dipegang
 */
export async function generateDebtSettlementReceipt(data: DebtSettlementReceiptData): Promise<Buffer> {
    const width = 1024;
    const height = 1024;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 1. Festive Mint Pastel Gradient Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#dcf4e7');
    bgGrad.addColorStop(0.45, '#effaf4');
    bgGrad.addColorStop(1, '#d5efe0');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Soft celestial glow behind Chuna
    const glow = ctx.createRadialGradient(512, 380, 50, 512, 380, 440);
    glow.addColorStop(0, 'rgba(255, 255, 255, 0.92)');
    glow.addColorStop(0.55, 'rgba(255, 255, 255, 0.5)');
    glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, 750);

    // Ribbons & Streamers in background
    ctx.save();
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.65)'; // soft yellow streamer
    ctx.beginPath();
    ctx.moveTo(-20, 120);
    ctx.bezierCurveTo(80, 60, 180, 160, 260, 90);
    ctx.bezierCurveTo(320, 40, 360, 80, 380, 140);
    ctx.stroke();

    ctx.lineWidth = 11;
    ctx.strokeStyle = 'rgba(167, 243, 208, 0.7)'; // soft mint streamer
    ctx.beginPath();
    ctx.moveTo(1040, 100);
    ctx.bezierCurveTo(940, 50, 840, 130, 780, 80);
    ctx.bezierCurveTo(730, 40, 690, 80, 680, 130);
    ctx.stroke();
    ctx.restore();

    // Draw festive confetti flakes
    const confettiList = [
        { x: 100, y: 160, w: 12, h: 22, rot: 0.4, c: '#f43f5e' },
        { x: 220, y: 190, w: 10, h: 18, rot: -0.6, c: '#38bdf8' },
        { x: 80, y: 280, w: 14, h: 20, rot: 0.8, c: '#fbbf24' },
        { x: 160, y: 350, w: 11, h: 19, rot: -0.3, c: '#34d399' },
        { x: 88, y: 460, w: 13, h: 21, rot: 0.5, c: '#fb7185' },
        { x: 190, y: 480, w: 14, h: 18, rot: -0.5, c: '#a78bfa' },
        { x: 820, y: 140, w: 12, h: 20, rot: -0.5, c: '#38bdf8' },
        { x: 860, y: 190, w: 14, h: 22, rot: 0.6, c: '#f43f5e' },
        { x: 960, y: 320, w: 12, h: 18, rot: -0.4, c: '#38bdf8' },
        { x: 930, y: 480, w: 10, h: 20, rot: 0.3, c: '#fbbf24' },
    ];
    confettiList.forEach(item => {
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(item.rot);
        ctx.fillStyle = item.c;
        ctx.fillRect(-item.w / 2, -item.h / 2, item.w, item.h);
        ctx.restore();
    });

    // Decorative Sparkles
    drawSparkle(ctx, 280, 120, 20);
    drawSparkle(ctx, 150, 210, 14);
    drawSparkle(ctx, 740, 150, 16);
    drawSparkle(ctx, 920, 510, 16);

    // 2. Chuna 3D Character
    const chunaImg = await getChunaImage();
    if (chunaImg) {
        ctx.drawImage(chunaImg, 0, 0);
    }

    // Load Customer WhatsApp Profile Photo
    let customerAvatarImg: any = null;
    if (data.avatarBuffer) {
        try {
            customerAvatarImg = await loadImage(data.avatarBuffer);
        } catch (e) {}
    } else if (data.waPhotoUrl) {
        try {
            customerAvatarImg = await loadImage(data.waPhotoUrl);
        } catch (e) {
            console.warn("Could not load waPhotoUrl in debtReceipt:", e);
        }
    }

    // 3. Card held by Chuna with WhatsApp Profile Photo
    const cardX = 794;
    const cardY = 318;
    const cardW = 236;
    const cardH = 152;
    const cardAngle = -7.5 * Math.PI / 180;

    // Card background & drop shadow
    ctx.save();
    ctx.translate(cardX, cardY);
    ctx.rotate(cardAngle);
    ctx.shadowColor = 'rgba(20, 60, 30, 0.24)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    roundRect(ctx, -cardW / 2, -cardH / 2, cardW, cardH, 18);
    ctx.fill();
    ctx.restore();

    // Card green border & contents
    ctx.save();
    ctx.translate(cardX, cardY);
    ctx.rotate(cardAngle);
    ctx.strokeStyle = '#347a46';
    ctx.lineWidth = 5;
    ctx.beginPath();
    roundRect(ctx, -cardW / 2, -cardH / 2, cardW, cardH, 18);
    ctx.stroke();

    // WhatsApp Profile Photo (on left of card)
    const pR = 36;
    const pX = -cardW / 2 + 54;
    const pY = 0;

    // Gold outer ring
    ctx.beginPath();
    ctx.arc(pX, pY, pR + 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#d97706';
    ctx.fill();

    // Avatar Photo or Monogram
    ctx.save();
    ctx.beginPath();
    ctx.arc(pX, pY, pR, 0, Math.PI * 2);
    ctx.clip();
    if (customerAvatarImg) {
        ctx.drawImage(customerAvatarImg, pX - pR, pY - pR, pR * 2, pR * 2);
    } else {
        const avGrad = ctx.createLinearGradient(pX - pR, pY - pR, pX + pR, pY + pR);
        avGrad.addColorStop(0, '#065f46');
        avGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = avGrad;
        ctx.fillRect(pX - pR, pY - pR, pR * 2, pR * 2);

        // Golden initials monogram
        const initials = getInitials(data.nama);
        ctx.fillStyle = '#fde68a';
        ctx.font = '900 24px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initials, pX, pY);
    }
    ctx.restore();

    // Inner white border
    ctx.beginPath();
    ctx.arc(pX, pY, pR, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Small WhatsApp Icon badge at bottom right of avatar
    const bX = pX + pR * 0.68;
    const bY = pY + pR * 0.68;
    const bR = 11;
    ctx.beginPath();
    ctx.arc(bX, bY, bR, 0, Math.PI * 2);
    ctx.fillStyle = '#22c55e';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Checkmark inside badge
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✓', bX, bY);

    // Right side of card: LUNAS / ANGSURAN + cute smile
    const tX = 42;
    ctx.fillStyle = data.isLunasTotal ? '#2d5a37' : '#ea580c';
    ctx.font = '900 28px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(data.isLunasTotal ? 'LUNAS' : 'ANGSURAN', tX, -14);

    // Smiling face
    ctx.font = '22px Arial, sans-serif';
    ctx.fillStyle = '#d97706';
    ctx.fillText('• ‿ •', tX, 22);

    // Pink blush
    ctx.fillStyle = 'rgba(251, 113, 133, 0.45)';
    ctx.beginPath();
    ctx.arc(tX - 25, 23, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(tX + 25, 23, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Fingers overlay (draw Chuna's fingers naturally gripping over the bottom edge of the card)
    if (chunaImg) {
        ctx.drawImage(chunaImg, 765, 345, 80, 80, 765, 345, 80, 80);
    }

    // -------------------------------------------------------------------
    // 4. LOWER CARD (NOTA PEMBAYARAN LUNAS - Diturunkan Sampai Mentok ke Bawah)
    // -------------------------------------------------------------------
    const noteX = 36;
    const noteY = 706;
    const noteW = 952;
    const noteH = height - noteY; // Menempel ke batas bawah canvas (mentok)
    const noteR = [26, 26, 0, 0]; // Sudut atas melengkung anggun, bawah rata mentok

    // Note card background & drop shadow
    ctx.save();
    ctx.shadowColor = 'rgba(15, 23, 42, 0.16)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = -2;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    roundRect(ctx, noteX, noteY, noteW, noteH, noteR);
    ctx.fill();
    ctx.restore();

    // Note card subtle mint border
    ctx.strokeStyle = '#bbf7d0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    roundRect(ctx, noteX, noteY, noteW, noteH, noteR);
    ctx.stroke();

    // Top-left badge: 🎁 E4 STORE
    const badgeX = noteX + 24;
    const badgeY = noteY - 34;
    const badgeW = 310;
    const badgeH = 58;

    ctx.save();
    ctx.shadowColor = 'rgba(46, 125, 50, 0.3)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#4d8e5e';
    ctx.beginPath();
    roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 20);
    ctx.fill();
    ctx.restore();

    // 3D Gift icon on badge
    draw3DGiftIcon(ctx, badgeX + 34, badgeY + badgeH / 2, 32);

    // Badge text
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 28px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('E4 STORE', badgeX + 66, badgeY + badgeH / 2);

    // Top-right Golden Ribbon Bow
    const bowX = noteX + noteW - 68;
    const bowY = noteY + 8;
    ctx.save();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(bowX - 8, bowY + 12);
    ctx.quadraticCurveTo(bowX - 32, bowY + 45, bowX - 16, bowY + 75);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(bowX + 8, bowY + 12);
    ctx.quadraticCurveTo(bowX + 42, bowY + 40, bowX + 28, bowY + 78);
    ctx.stroke();

    // Left loop
    ctx.fillStyle = '#fef08a';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(bowX - 24, bowY - 4, 28, 16, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right loop
    ctx.beginPath();
    ctx.ellipse(bowX + 24, bowY - 4, 28, 16, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Center knot
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(bowX, bowY + 2, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Inside Note: Left Column
    const leftColX = noteX + 32;
    let curY = noteY + 44;

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // NOTA PEMBAYARAN LUNAS / ANGSURAN
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 24px "Times New Roman", Georgia, serif';
    ctx.fillText(data.isLunasTotal ? 'NOTA PEMBAYARAN LUNAS' : 'NOTA PEMBAYARAN ANGSURAN', leftColX, curY);
    curY += 28;

    // Atas Nama: Kak [Name]
    ctx.font = 'bold 18px "Segoe UI", sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText(`Atas Nama: ${data.nama || 'Kak Pelanggan'}`, leftColX, curY);
    curY += 24;

    // Double dashed separator line
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(leftColX, curY);
    ctx.lineTo(leftColX + 390, curY);
    ctx.moveTo(leftColX, curY + 3);
    ctx.lineTo(leftColX + 390, curY + 3);
    ctx.stroke();
    curY += 10;

    // RINCIAN PRODUK header
    ctx.font = '900 16px "Segoe UI", sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.fillText('RINCIAN PRODUK', leftColX + 195, curY);
    curY += 20;

    ctx.beginPath();
    ctx.moveTo(leftColX, curY);
    ctx.lineTo(leftColX + 390, curY);
    ctx.moveTo(leftColX, curY + 3);
    ctx.lineTo(leftColX + 390, curY + 3);
    ctx.stroke();
    curY += 10;

    // Table header: Nama Produk & Harga
    ctx.textAlign = 'left';
    ctx.font = 'bold 15px "Segoe UI", sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('Nama Produk', leftColX, curY);
    ctx.textAlign = 'right';
    ctx.fillText('Harga', leftColX + 390, curY);
    curY += 22;

    // Product item rows (show up to 2 items cleanly)
    const productItems = data.products && data.products.length > 0
        ? data.products
        : [{ name: 'Produk Digital', price: data.totalDebt }];

    const displayProducts = productItems.slice(0, 2);
    displayProducts.forEach(item => {
        ctx.textAlign = 'left';
        ctx.font = 'bold 15px "Segoe UI", sans-serif';
        ctx.fillStyle = '#0f172a';
        const pName = item.name.length > 26 ? item.name.substring(0, 24) + '...' : item.name;
        ctx.fillText(pName, leftColX, curY);
        ctx.textAlign = 'right';
        ctx.fillText(`Rp ${item.price.toLocaleString('id-ID')}`, leftColX + 390, curY);
        curY += 24;
    });

    if (productItems.length > 2) {
        ctx.textAlign = 'left';
        ctx.font = 'italic 13px "Segoe UI", sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText(`+ ${productItems.length - 2} produk lainnya`, leftColX, curY);
        curY += 20;
    }

    // Total Utang
    ctx.textAlign = 'left';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(`Total Utang: Rp ${data.totalDebt.toLocaleString('id-ID')}`, leftColX, curY);

    // Vertical Divider in the Middle
    const midX = 490;
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(midX, noteY + 16);
    ctx.lineTo(midX, noteY + 215);
    ctx.stroke();

    // Inside Note: Right Column
    const rightColX = midX + 28;
    curY = noteY + 18;

    // TANGGAL UTANG & TANGGAL BAYAR
    ctx.textAlign = 'left';
    ctx.font = '900 15px "Segoe UI", sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('TANGGAL UTANG:', rightColX, curY);
    ctx.fillText('TANGGAL BAYAR:', rightColX + 195, curY);
    curY += 20;

    ctx.font = '500 15px "Segoe UI", sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(data.tglUtang || '-', rightColX, curY);
    ctx.fillText(data.tglBayar || '-', rightColX + 195, curY);
    curY += 26;

    // RINCIAN PEMBAYARAN
    ctx.font = '900 16px "Segoe UI", sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('RINCIAN PEMBAYARAN', rightColX, curY);
    curY += 22;

    const payItems: [string, string][] = [
        ['• Total Utang:', `Rp ${data.totalDebt.toLocaleString('id-ID')}`],
        ['• Dibayarkan:', `Rp ${data.dibayarkan.toLocaleString('id-ID')}`]
    ];
    if (data.isLunasTotal) {
        payItems.push(['• Kembalian:', `Rp ${(data.kembalian || 0).toLocaleString('id-ID')}`]);
    } else {
        payItems.push(['• Sisa Utang:', `Rp ${(data.sisaUtang || Math.max(0, data.totalDebt - data.dibayarkan)).toLocaleString('id-ID')}`]);
    }

    payItems.forEach(([lbl, val]) => {
        ctx.textAlign = 'left';
        ctx.font = '500 15px "Segoe UI", sans-serif';
        ctx.fillStyle = '#1e293b';
        ctx.fillText(lbl, rightColX, curY);

        ctx.textAlign = 'right';
        ctx.font = 'bold 15px "Segoe UI", sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.fillText(val, noteX + noteW - 32, curY);
        curY += 21;
    });

    // STATUS PESANAN KAKAK SEKARANG:
    curY += 2;
    ctx.textAlign = 'left';
    ctx.font = '900 15px "Segoe UI", sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('STATUS PESANAN KAKAK SEKARANG:', rightColX, curY);
    curY += 20;

    ctx.fillStyle = data.isLunasTotal ? '#16a34a' : '#ea580c';
    ctx.font = '900 18px "Segoe UI", sans-serif';
    ctx.fillText(data.isLunasTotal ? 'LUNAS' : 'BELUM LUNAS (ANGSURAN)', rightColX, curY);
    curY += 20;

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(rightColX, curY);
    ctx.lineTo(noteX + noteW - 32, curY);
    ctx.moveTo(rightColX, curY + 3);
    ctx.lineTo(noteX + noteW - 32, curY + 3);
    ctx.stroke();

    // Bottom text footer across both columns
    const footerY = noteY + 236;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(noteX + 24, footerY);
    ctx.lineTo(noteX + noteW - 24, footerY);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = 'normal 13px "Segoe UI", sans-serif';
    ctx.fillStyle = '#1e293b';

    const line1 = 'Terima kasih sudah percaya sama kami. Jangan lupa, Chuna - Asisten Imutmu siap bantu 24 jam! kalau ada yang mau ditanyain lagi ya, Kak.';
    const line2 = 'Terimakasih telah berbelanja di E4 Store! Semoga produknya bermanfaat dan kami tunggu kunjungan berikutnya!';
    ctx.fillText(line1, noteX + 24, footerY + 10);
    ctx.fillText(line2, noteX + 24, footerY + 32);

    return canvas.toBuffer('image/png');
}
