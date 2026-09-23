import fs from 'fs';
import { createCanvas, loadImage } from '@napi-rs/canvas';

export interface EmeraldConfirmationData {
    customerName: string;         // Nama profile WA / Nama terdaftar
    serviceName: string;          // Layanan / Produk
    targetNo: string;             // Nomor Tujuan
    totalBayar: number | string;  // Total Bayar
    waPhotoUrl?: string | null;
    avatarBuffer?: Buffer | null;
}

/**
 * Helper to draw 4-point diamond star
 */
function drawDiamondStar(ctx: any, cx: number, cy: number, r: number, color = '#f5deb3') {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = color;
    ctx.shadowColor = 'rgba(253, 224, 140, 0.8)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const tipX = Math.cos(angle) * r;
        const tipY = Math.sin(angle) * r;
        const c1X = Math.cos(angle - Math.PI / 4) * (r * 0.22);
        const c1Y = Math.sin(angle - Math.PI / 4) * (r * 0.22);
        const c2X = Math.cos(angle + Math.PI / 4) * (r * 0.22);
        const c2Y = Math.sin(angle + Math.PI / 4) * (r * 0.22);
        if (i === 0) ctx.moveTo(c1X, c1Y);
        else ctx.lineTo(c1X, c1Y);
        ctx.lineTo(tipX, tipY);
        ctx.lineTo(c2X, c2Y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

/**
 * Capsule path for portrait frame
 */
function drawCapsulePath(ctx: any, left: number, top: number, width: number, height: number, cornerR: number) {
    const right = left + width;
    const bottom = top + height;
    ctx.beginPath();
    ctx.moveTo(left + cornerR, top);
    ctx.lineTo(right - cornerR, top);
    ctx.arcTo(right, top, right, top + cornerR, cornerR);
    ctx.lineTo(right, bottom - cornerR);
    ctx.arcTo(right, bottom, right - cornerR, bottom, cornerR);
    ctx.lineTo(left + cornerR, bottom);
    ctx.arcTo(left, bottom, left, bottom - cornerR, cornerR);
    ctx.lineTo(left, top + cornerR);
    ctx.arcTo(left, top, left + cornerR, top, cornerR);
    ctx.closePath();
}

/**
 * Draws luxury golden divider ornament
 */
function drawGoldDivider(ctx: any, cx: number, cy: number, halfW: number) {
    ctx.save();
    const goldGrad = ctx.createLinearGradient(cx - halfW, cy, cx + halfW, cy);
    goldGrad.addColorStop(0, 'rgba(218, 165, 32, 0)');
    goldGrad.addColorStop(0.2, '#d4af37');
    goldGrad.addColorStop(0.5, '#fff0a8');
    goldGrad.addColorStop(0.8, '#d4af37');
    goldGrad.addColorStop(1, 'rgba(218, 165, 32, 0)');

    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - halfW, cy);
    ctx.lineTo(cx - 24, cy);
    ctx.moveTo(cx + 24, cy);
    ctx.lineTo(cx + halfW, cy);
    ctx.stroke();

    // Center floral / star motif
    drawDiamondStar(ctx, cx, cy, 14, '#fff2b2');
    drawDiamondStar(ctx, cx - 14, cy, 6, '#d4af37');
    drawDiamondStar(ctx, cx + 14, cy, 6, '#d4af37');
    ctx.restore();
}

/**
 * Draws the elegant two-part underline (thick dash + thin line)
 */
function drawLuxuryUnderline(ctx: any, startX: number, y: number, endX: number) {
    ctx.save();
    // Thick gold accent bar at the start
    const dashLen = 65;
    ctx.fillStyle = '#e5be6c';
    ctx.shadowColor = 'rgba(229, 190, 108, 0.5)';
    ctx.shadowBlur = 6;
    ctx.fillRect(startX, y, dashLen, 4.5);

    // Continuous thin gold line
    ctx.fillStyle = 'rgba(229, 190, 108, 0.65)';
    ctx.shadowBlur = 0;
    ctx.fillRect(startX, y + 1.5, endX - startX, 2);
    ctx.restore();
}

/**
 * Generates high-resolution PNG buffer of the Emerald Luxury Confirmation image
 */
export async function generateEmeraldConfirmationImage(data: EmeraldConfirmationData): Promise<Buffer> {
    const W = 1024;
    const H = 1024;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');

    // 1. Draw Emerald Silk Satin Background
    let bgImg: any = null;
    try {
        if (fs.existsSync('./emerald_silk_bg.jpg')) {
            bgImg = await loadImage('./emerald_silk_bg.jpg').catch(() => null);
        } else if (fs.existsSync('src/assets/images/emerald_silk_bg_1790205039746.jpg')) {
            bgImg = await loadImage('src/assets/images/emerald_silk_bg_1790205039746.jpg').catch(() => null);
        }
    } catch (e) {}

    if (bgImg) {
        ctx.drawImage(bgImg, 0, 0, W, H);
    } else {
        // Fallback procedural deep emerald silk gradient
        const bgGrad = ctx.createLinearGradient(0, 0, W, H);
        bgGrad.addColorStop(0, '#06261c');
        bgGrad.addColorStop(0.3, '#0b3d2e');
        bgGrad.addColorStop(0.6, '#0f4837');
        bgGrad.addColorStop(1, '#041c14');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);
    }

    // Add deep vignette for luxury depth
    const vignette = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 720);
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(0.7, 'rgba(0, 0, 0, 0.35)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);

    // Fine golden stardust particles
    ctx.save();
    const stardustSeeds = [
        [80, 80, 2], [140, 60, 3], [200, 110, 1.5], [60, 180, 2.5], [120, 220, 1.5],
        [880, 80, 2.5], [940, 140, 2], [960, 70, 3.5], [920, 210, 1.5],
        [90, 880, 2], [60, 930, 3], [140, 940, 1.5], [40, 840, 2],
        [900, 880, 3], [940, 930, 2], [860, 950, 1.5], [960, 860, 2.5]
    ];
    stardustSeeds.forEach(([x, y, r]) => {
        ctx.fillStyle = 'rgba(255, 236, 179, 0.8)';
        ctx.shadowColor = 'rgba(253, 224, 140, 0.9)';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    });
    drawDiamondStar(ctx, 70, 215, 12, '#fff3b8');
    drawDiamondStar(ctx, 935, 925, 16, '#fff3b8');
    drawDiamondStar(ctx, 420, 810, 10, '#fde047');
    ctx.restore();

    // 2. Left Portrait Frame Dimensions
    const frameLeft = 52;
    const frameTop = 180;
    const frameW = 395;
    const frameH = 635;
    const frameR = 195; // Arched capsule radius

    // Drop shadow behind the golden frame
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 32;
    ctx.shadowOffsetY = 14;
    ctx.fillStyle = '#062017';
    drawCapsulePath(ctx, frameLeft, frameTop, frameW, frameH, frameR);
    ctx.fill();
    ctx.restore();

    // Load WhatsApp Avatar or Fallback Character
    let avatarImg: any = null;
    if (data.avatarBuffer) {
        try {
            avatarImg = await loadImage(data.avatarBuffer).catch(() => null);
        } catch (e) {}
    } else if (data.waPhotoUrl) {
        try {
            avatarImg = await loadImage(data.waPhotoUrl).catch(() => null);
        } catch (e) {}
    }

    // If no WhatsApp profile photo, fallback to anime Chuna character
    if (!avatarImg) {
        try {
            if (fs.existsSync('./Picsart_26-08-15_13-04-05-605.png')) {
                avatarImg = await loadImage('./Picsart_26-08-15_13-04-05-605.png').catch(() => null);
            }
        } catch (e) {}
    }

    // Clip & Draw Portrait inside the frame
    ctx.save();
    const innerFrameOffset = 10;
    drawCapsulePath(
        ctx,
        frameLeft + innerFrameOffset,
        frameTop + innerFrameOffset,
        frameW - innerFrameOffset * 2,
        frameH - innerFrameOffset * 2,
        frameR - innerFrameOffset
    );
    ctx.clip();

    if (avatarImg) {
        // Draw the customer's WhatsApp profile photo nicely scaled & centered
        const innerW = frameW - innerFrameOffset * 2;
        const innerH = frameH - innerFrameOffset * 2;
        const imgAspect = avatarImg.width / avatarImg.height;
        const targetAspect = innerW / innerH;

        let drawW, drawH, drawX, drawY;
        if (imgAspect > targetAspect) {
            drawH = innerH;
            drawW = innerH * imgAspect;
            drawX = frameLeft + innerFrameOffset + (innerW - drawW) / 2;
            drawY = frameTop + innerFrameOffset;
        } else {
            drawW = innerW;
            drawH = innerW / imgAspect;
            drawX = frameLeft + innerFrameOffset;
            drawY = frameTop + innerFrameOffset + (innerH - drawH) / 2;
        }

        ctx.drawImage(avatarImg, drawX, drawY, drawW, drawH);

        // Soft subtle dark vignette on the avatar photo edges
        const photoVignette = ctx.createRadialGradient(
            frameLeft + frameW / 2,
            frameTop + frameH / 2,
            frameW * 0.35,
            frameLeft + frameW / 2,
            frameTop + frameH / 2,
            frameH * 0.65
        );
        photoVignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
        photoVignette.addColorStop(1, 'rgba(4, 25, 18, 0.45)');
        ctx.fillStyle = photoVignette;
        ctx.fillRect(frameLeft, frameTop, frameW, frameH);
    } else {
        // Fallback: Elegant luxury monogram background
        const monoGrad = ctx.createLinearGradient(frameLeft, frameTop, frameLeft + frameW, frameTop + frameH);
        monoGrad.addColorStop(0, '#0a3527');
        monoGrad.addColorStop(0.5, '#124d3a');
        monoGrad.addColorStop(1, '#07241a');
        ctx.fillStyle = monoGrad;
        ctx.fillRect(frameLeft, frameTop, frameW, frameH);

        // Ornate golden initials
        ctx.save();
        ctx.fillStyle = '#fde68a';
        ctx.shadowColor = 'rgba(253, 224, 140, 0.8)';
        ctx.shadowBlur = 18;
        ctx.font = 'italic 700 86px "Times New Roman", Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const initials = data.customerName ? data.customerName.slice(0, 2).toUpperCase() : 'E4';
        ctx.fillText(initials, frameLeft + frameW / 2, frameTop + frameH / 2 - 20);

        ctx.font = '600 24px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#e2d5bd';
        ctx.shadowBlur = 0;
        ctx.fillText("E4 STORE MEMBER", frameLeft + frameW / 2, frameTop + frameH / 2 + 50);
        ctx.restore();
    }
    ctx.restore(); // Restore clip

    // Golden Arched Capsule Borders (Double Rings with star accents)
    ctx.save();
    // 1. Outer Golden Ring
    const outerGoldGrad = ctx.createLinearGradient(frameLeft, frameTop, frameLeft + frameW, frameTop + frameH);
    outerGoldGrad.addColorStop(0, '#fce59f');
    outerGoldGrad.addColorStop(0.3, '#d4af37');
    outerGoldGrad.addColorStop(0.7, '#fef1b8');
    outerGoldGrad.addColorStop(1, '#aa8222');

    ctx.strokeStyle = outerGoldGrad;
    ctx.lineWidth = 3.5;
    ctx.shadowColor = 'rgba(253, 224, 140, 0.6)';
    ctx.shadowBlur = 10;
    drawCapsulePath(ctx, frameLeft, frameTop, frameW, frameH, frameR);
    ctx.stroke();

    // 2. Inner Golden Ring
    ctx.lineWidth = 2;
    ctx.shadowBlur = 0;
    drawCapsulePath(
        ctx,
        frameLeft + innerFrameOffset,
        frameTop + innerFrameOffset,
        frameW - innerFrameOffset * 2,
        frameH - innerFrameOffset * 2,
        frameR - innerFrameOffset
    );
    ctx.stroke();

    // Diamond star accents on the outer frame
    drawDiamondStar(ctx, frameLeft + frameW / 2, frameTop, 11, '#fff5c4');
    drawDiamondStar(ctx, frameLeft + frameW / 2, frameTop + frameH, 11, '#fff5c4');
    drawDiamondStar(ctx, frameLeft, frameTop + frameH / 2, 11, '#fff5c4');
    drawDiamondStar(ctx, frameLeft + frameW, frameTop + frameH / 2, 11, '#fff5c4');
    ctx.restore();

    // 3. Right Side Content
    const rightCenterX = 708;
    const contentStartX = 505;
    const contentEndX = 955;

    // Header: "E4 STORE"
    ctx.save();
    const titleGold = ctx.createLinearGradient(rightCenterX - 180, 110, rightCenterX + 180, 180);
    titleGold.addColorStop(0, '#ffffff');
    titleGold.addColorStop(0.25, '#fee99a');
    titleGold.addColorStop(0.65, '#dfb448');
    titleGold.addColorStop(1, '#b68822');

    ctx.fillStyle = titleGold;
    ctx.shadowColor = 'rgba(253, 224, 140, 0.45)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 4;
    ctx.font = 'bold 74px "Times New Roman", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("E4 STORE", rightCenterX, 155);
    ctx.restore();

    // Elegant Ornate Divider under E4 STORE
    drawGoldDivider(ctx, rightCenterX, 228, 205);

    // Subtitle: "Konfirmasi Pembelian Customer"
    ctx.save();
    ctx.fillStyle = '#e8d5a7';
    ctx.shadowColor = 'rgba(232, 213, 167, 0.35)';
    ctx.shadowBlur = 8;
    ctx.font = 'italic 700 35px "Times New Roman", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("Konfirmasi Pembelian Customer", rightCenterX, 292);
    ctx.restore();

    // 4. Details: Nama, Layanan, Nomor
    const customerDisplayName = data.customerName || 'Pelanggan Setia';
    const cleanCustomerName = customerDisplayName.length > 22
        ? customerDisplayName.substring(0, 20) + '...'
        : customerDisplayName;

    const cleanServiceName = (data.serviceName || 'Produk').length > 24
        ? (data.serviceName || 'Produk').substring(0, 22) + '...'
        : (data.serviceName || 'Produk');

    const cleanTargetNo = data.targetNo || '-';

    // Field 1: Nama
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 36px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Nama : ${cleanCustomerName}`, contentStartX, 424);
    drawLuxuryUnderline(ctx, contentStartX, 458, contentEndX);

    // Field 2: Layanan
    ctx.fillText(`Layanan : ${cleanServiceName}`, contentStartX, 514);
    drawLuxuryUnderline(ctx, contentStartX, 548, contentEndX);

    // Field 3: Nomor
    ctx.fillText(`Nomor : ${cleanTargetNo}`, contentStartX, 604);
    drawLuxuryUnderline(ctx, contentStartX, 638, contentEndX);
    ctx.restore();

    // 5. Total Bayar Section
    let formattedTotal = data.totalBayar;
    if (typeof formattedTotal === 'number') {
        formattedTotal = `Rp ${formattedTotal.toLocaleString('id-ID')}`;
    } else if (typeof formattedTotal === 'string' && !formattedTotal.startsWith('Rp')) {
        const num = parseInt(formattedTotal.replace(/\D/g, ''), 10);
        formattedTotal = isNaN(num) ? formattedTotal : `Rp ${num.toLocaleString('id-ID')}`;
    }

    ctx.save();
    const totalGold = ctx.createLinearGradient(contentStartX, 715, contentEndX, 755);
    totalGold.addColorStop(0, '#ffffff');
    totalGold.addColorStop(0.3, '#fef0a4');
    totalGold.addColorStop(0.7, '#e4be5b');
    totalGold.addColorStop(1, '#caa033');

    ctx.fillStyle = totalGold;
    ctx.shadowColor = 'rgba(254, 240, 164, 0.7)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 2;
    ctx.font = 'italic 900 48px "Times New Roman", Georgia, serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Total Bayar : ${formattedTotal}`, contentStartX, 726);
    ctx.restore();

    // 6. Footer Note
    ctx.save();
    ctx.fillStyle = '#e5d8be';
    ctx.font = '500 24px "Times New Roman", Georgia, serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText("Mohon ditunggu ya Kak, nanti diupdate", contentStartX, 825);
    ctx.fillText("di bawah chat ini ya Kak. Terima kasih", contentStartX, 862);
    ctx.restore();

    return canvas.toBuffer('image/png');
}
