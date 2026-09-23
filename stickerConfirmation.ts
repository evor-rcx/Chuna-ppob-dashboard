import { createCanvas, loadImage } from '@napi-rs/canvas';
// @ts-ignore
import webpmux from 'node-webpmux';

export interface ConfirmationStickerData {
    serviceName: string;         // e.g. "PLN 20.000"
    targetNo: string;            // e.g. "32185604272"
    totalBayar: number | string; // e.g. 25000 or "Rp 25.000"
    nickname?: string;           // e.g. "Budi" (optional)
    note?: string;               // e.g. "pembelianmu akan di proses ya kk\nmohon di tunggu"
    waPhotoUrl?: string | null;
    avatarBuffer?: Buffer | null;
    format?: 'webp' | 'png';
}

/**
 * Creates EXIF metadata buffer expected by WhatsApp for static stickers
 */
export function createStickerExif(packname: string = 'E4 STORE', author: string = 'Chuna E4 Store'): Buffer {
    const json = {
        'sticker-pack-id': 'e4-store-confirmation-' + Date.now(),
        'sticker-pack-name': packname,
        'sticker-pack-publisher': author,
        'emojis': ['✅', '⚡', '💎'],
        'is-avatar-sticker': 0
    };
    const jsonBuff = Buffer.from(JSON.stringify(json), 'utf-8');
    const exif = Buffer.concat([
        Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00]),
        Buffer.from([jsonBuff.length, 0x00, 0x00, 0x00]),
        Buffer.from([0x16, 0x00, 0x00, 0x00]),
        jsonBuff
    ]);
    return exif;
}

/**
 * Draws the voucher / ticket path with top center dome and side tear notches
 */
function drawTicketPath(
    ctx: any,
    left: number,
    top: number,
    right: number,
    bottom: number,
    notchY: number,
    notchR: number,
    cornerR: number
) {
    ctx.beginPath();
    ctx.moveTo(left + cornerR, top);
    
    // Top edge with elevated dome at center (for green circle)
    const domeLeft = 320;
    const domeRight = 704;
    const domeTop = 26;

    ctx.lineTo(domeLeft, top);
    ctx.bezierCurveTo(domeLeft + 45, top, domeLeft + 65, domeTop, 440, domeTop);
    ctx.lineTo(584, domeTop);
    ctx.bezierCurveTo(domeRight - 65, domeTop, domeRight - 45, top, domeRight, top);
    
    // Continue to top-right corner
    ctx.lineTo(right - cornerR, top);
    ctx.arcTo(right, top, right, top + cornerR, cornerR);
    
    // Right edge to right notch
    ctx.lineTo(right, notchY - notchR);
    ctx.arc(right, notchY, notchR, -Math.PI / 2, Math.PI / 2, true);
    
    // Bottom-right corner
    ctx.lineTo(right, bottom - cornerR);
    ctx.arcTo(right, bottom, right - cornerR, bottom, cornerR);
    
    // Bottom edge
    ctx.lineTo(left + cornerR, bottom);
    ctx.arcTo(left, bottom, left, bottom - cornerR, cornerR);
    
    // Left edge to left notch
    ctx.lineTo(left, notchY + notchR);
    ctx.arc(left, notchY, notchR, Math.PI / 2, -Math.PI / 2, true);
    
    // Top-left corner
    ctx.lineTo(left, top + cornerR);
    ctx.arcTo(left, top, left + cornerR, top, cornerR);
    
    ctx.closePath();
}

/**
 * Draws stylized lightning bolts around the card edges
 */
function drawLightning(ctx: any, points: number[][], glowColor = 'rgba(254, 240, 138, 0.85)') {
    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 14;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'miter';
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.stroke();
    
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.restore();
}

/**
 * Helper to draw rounded rectangle
 */
function roundRect(ctx: any, x: number, y: number, w: number, h: number, r: number) {
    if (typeof ctx.roundRect === 'function') {
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
    } else {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.arcTo(x + w, y, x + w, y + r, r);
        ctx.lineTo(x + w, y + h - r);
        ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
        ctx.lineTo(x + r, y + h);
        ctx.arcTo(x, y + h, x, y + h - r, r);
        ctx.lineTo(x, y + r);
        ctx.arcTo(x, y, x + r, y, r);
        ctx.closePath();
    }
}

/**
 * Generates WhatsApp Order Confirmation Sticker matching the user's template:
 * - Ticket silhouette with top dome and side perforation cutouts
 * - WhatsApp Profile Photo framed inside the 3D Green Circle (Lingkaran Hijau)
 * - Header: ☑ Konfirmasi Pembelian
 * - Layanan : PLN 20.000
 * - Nomor Tujuan : 32185604272
 * - Dashed perforation line
 * - Bottom Pill: >>> Total Bayar : Rp 25.000
 * - Output: High-contrast 512x512 WebP sticker with EXIF
 */
export async function generateOrderConfirmationSticker(data: ConfirmationStickerData): Promise<Buffer> {
    const W = 1024;
    const H = 1024;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, W, H);

    // Load WhatsApp profile avatar if available
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

    // Card coordinates on 1024x1024 grid
    const left = 48;
    const right = 976;
    const top = 86;
    const bottom = 964;
    const notchY = 672;
    const notchR = 40;
    const cornerR = 76;

    // 1. Lightning bolts behind/around card
    drawLightning(ctx, [[20, 220], [70, 260], [55, 275], [115, 320], [98, 335], [140, 370]]);
    drawLightning(ctx, [[750, 20], [775, 45], [765, 55], [805, 85], [825, 130]]);
    drawLightning(ctx, [[980, 580], [935, 615], [950, 625], [915, 655]]);

    // 2. Card Drop Shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
    ctx.shadowBlur = 36;
    ctx.shadowOffsetY = 18;
    ctx.fillStyle = '#b5d0df';
    drawTicketPath(ctx, left, top, right, bottom, notchY, notchR, cornerR);
    ctx.fill();
    ctx.restore();

    // 3. Card Fill with Clipping
    ctx.save();
    drawTicketPath(ctx, left, top, right, bottom, notchY, notchR, cornerR);
    ctx.clip();

    // Base Multi-tone Gradient (Warm golden corners, soft steel blue center)
    const baseGrad = ctx.createLinearGradient(left, top, right, bottom);
    baseGrad.addColorStop(0, '#fefbf3');
    baseGrad.addColorStop(0.25, '#edf5fa');
    baseGrad.addColorStop(0.5, '#bad5e5');
    baseGrad.addColorStop(0.75, '#91b6cc');
    baseGrad.addColorStop(1, '#fad794');
    ctx.fillStyle = baseGrad;
    ctx.fill();

    // Top-Right Golden Glow Overlay
    const trGrad = ctx.createRadialGradient(900, 120, 20, 900, 120, 460);
    trGrad.addColorStop(0, 'rgba(254, 238, 185, 0.95)');
    trGrad.addColorStop(0.55, 'rgba(253, 224, 140, 0.5)');
    trGrad.addColorStop(1, 'rgba(253, 224, 140, 0)');
    ctx.fillStyle = trGrad;
    ctx.fillRect(left, top - 60, right - left, bottom - top + 60);

    // Bottom-Right Golden Glow Overlay
    const brGrad = ctx.createRadialGradient(920, 900, 20, 920, 900, 420);
    brGrad.addColorStop(0, 'rgba(253, 216, 120, 0.9)');
    brGrad.addColorStop(0.5, 'rgba(245, 185, 59, 0.4)');
    brGrad.addColorStop(1, 'rgba(245, 185, 59, 0)');
    ctx.fillStyle = brGrad;
    ctx.fillRect(left, top - 60, right - left, bottom - top + 60);

    // Left Sky-Blue Shading
    const lbGrad = ctx.createRadialGradient(180, 520, 10, 180, 520, 440);
    lbGrad.addColorStop(0, 'rgba(152, 192, 214, 0.65)');
    lbGrad.addColorStop(1, 'rgba(152, 192, 214, 0)');
    ctx.fillStyle = lbGrad;
    ctx.fillRect(left, top - 60, right - left, bottom - top + 60);

    // Glass rim highlight / border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 3.5;
    drawTicketPath(ctx, left, top, right, bottom, notchY, notchR, cornerR);
    ctx.stroke();

    ctx.restore(); // Restore clipping

    // 4. Perforation Dashed Line (Between left & right notches)
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 4;
    ctx.setLineDash([16, 14]);
    ctx.beginPath();
    ctx.moveTo(left + notchR + 6, notchY);
    ctx.lineTo(right - notchR - 6, notchY);
    ctx.stroke();
    ctx.restore();

    // 5. Green Circle (Lingkaran Hijau) with WhatsApp Profile Photo
    const circleX = W / 2;
    const circleY = 150;
    const outerR = 94;
    const photoR = 82;

    // Green Circle 3D Sphere Shadow
    ctx.save();
    ctx.shadowColor = 'rgba(21, 128, 61, 0.45)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 10;
    ctx.beginPath();
    ctx.arc(circleX, circleY, outerR, 0, Math.PI * 2);
    ctx.fillStyle = '#16a34a';
    ctx.fill();
    ctx.restore();

    // 3D Emerald Green Bezel / Ring
    ctx.save();
    const greenGrad = ctx.createRadialGradient(circleX - 30, circleY - 35, 10, circleX, circleY, outerR);
    greenGrad.addColorStop(0, '#4ade80');
    greenGrad.addColorStop(0.35, '#22c55e');
    greenGrad.addColorStop(0.75, '#15803d');
    greenGrad.addColorStop(1, '#14532d');
    ctx.fillStyle = greenGrad;
    ctx.beginPath();
    ctx.arc(circleX, circleY, outerR, 0, Math.PI * 2);
    ctx.fill();

    // Inner subtle highlight ring
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(circleX, circleY, outerR - 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // WhatsApp Profile Photo or Fallback inside the Green Circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(circleX, circleY, photoR, 0, Math.PI * 2);
    ctx.clip();

    if (avatarImg) {
        // Draw the WhatsApp Profile Photo directly inside the green circle
        ctx.drawImage(
            avatarImg,
            circleX - photoR,
            circleY - photoR,
            photoR * 2,
            photoR * 2
        );

        // Thin inner rim
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(circleX, circleY, photoR - 1, 0, Math.PI * 2);
        ctx.stroke();
    } else {
        // Fallback: 3D glossy emerald sphere from user's template
        const innerSphereGrad = ctx.createRadialGradient(circleX - 25, circleY - 30, 8, circleX, circleY, photoR);
        innerSphereGrad.addColorStop(0, '#86efac');
        innerSphereGrad.addColorStop(0.3, '#22c55e');
        innerSphereGrad.addColorStop(0.7, '#16a34a');
        innerSphereGrad.addColorStop(1, '#15803d');
        ctx.fillStyle = innerSphereGrad;
        ctx.fillRect(circleX - photoR, circleY - photoR, photoR * 2, photoR * 2);

        // Glossy curved reflection at top of green sphere
        ctx.save();
        ctx.translate(circleX - 20, circleY - 32);
        ctx.rotate(-0.35);
        ctx.scale(1, 0.55);
        ctx.beginPath();
        ctx.arc(0, 0, 42, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fill();
        ctx.restore();

        // Customer initials or E4 monogram in crisp white
        ctx.font = '900 36px Arial, "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        const fallbackText = (data.nickname ? data.nickname.slice(0, 2).toUpperCase() : 'E4');
        ctx.fillText(fallbackText, circleX, circleY + 4);
    }
    ctx.restore(); // Restore clip

    // Green Circle border stroke
    ctx.save();
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(circleX, circleY, photoR, 0, Math.PI * 2);
    ctx.stroke();

    // If avatar image exists, add small WhatsApp badge at bottom right of the circle
    if (avatarImg) {
        const badgeX = circleX + photoR * 0.72;
        const badgeY = circleY + photoR * 0.72;
        const badgeR = 19;

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
        ctx.fillStyle = '#25d366';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // White checkmark inside badge
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(badgeX - 7, badgeY);
        ctx.lineTo(badgeX - 2, badgeY + 5);
        ctx.lineTo(badgeX + 7, badgeY - 5);
        ctx.stroke();
        ctx.restore();
    }
    ctx.restore();

    // 6. Header: "☑ Konfirmasi Pembelian"
    const headerY = 338;
    const titleText = "Konfirmasi Pembelian";

    ctx.save();
    ctx.font = '900 50px Arial, "Segoe UI", sans-serif';
    const textWidth = ctx.measureText(titleText).width;
    const boxSize = 44;
    const gap = 16;
    const totalHeaderWidth = boxSize + gap + textWidth;
    const startX = (W - totalHeaderWidth) / 2;

    // Golden Yellow Checkbox Box
    const boxX = startX;
    const boxY = headerY - 34;
    const boxR = 10;

    ctx.fillStyle = '#facc15';
    roundRect(ctx, boxX, boxY, boxSize, boxSize, boxR);
    ctx.fill();

    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Black Checkmark inside checkbox
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(boxX + 11, boxY + 22);
    ctx.lineTo(boxX + 19, boxY + 31);
    ctx.lineTo(boxX + 33, boxY + 13);
    ctx.stroke();

    // Title Text: "Konfirmasi Pembelian"
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(titleText, boxX + boxSize + gap, headerY - 10);
    ctx.restore();

    // 7. Middle Details Section
    // Line 1: Layanan
    const serviceStr = `Layanan : ${data.serviceName || 'PLN 20.000'}`;
    let serviceFontSize = 42;
    if (serviceStr.length > 28) serviceFontSize = 35;
    if (serviceStr.length > 36) serviceFontSize = 29;

    ctx.save();
    ctx.fillStyle = '#000000';
    ctx.font = `600 ${serviceFontSize}px Arial, "Segoe UI", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(serviceStr, W / 2, 485);

    // Line 2: Nomor Tujuan
    const targetStr = `Nomor Tujuan : ${data.targetNo || '-'}`;
    let targetFontSize = 42;
    if (targetStr.length > 28) targetFontSize = 35;
    if (targetStr.length > 36) targetFontSize = 29;

    ctx.font = `600 ${targetFontSize}px Arial, "Segoe UI", sans-serif`;
    ctx.fillText(targetStr, W / 2, 586);
    ctx.restore();

    // 8. Bottom Pill Button: ">>> Total Bayar : Rp 25.000"
    let formattedTotal = data.totalBayar;
    if (typeof formattedTotal === 'number') {
        formattedTotal = `Rp ${formattedTotal.toLocaleString('id-ID')}`;
    } else if (typeof formattedTotal === 'string' && !formattedTotal.startsWith('Rp')) {
        const num = parseInt(formattedTotal.replace(/\D/g, ''), 10);
        formattedTotal = isNaN(num) ? formattedTotal : `Rp ${num.toLocaleString('id-ID')}`;
    }

    const pillW = 810;
    const pillH = 130;
    const pillX = (W - pillW) / 2;
    const pillY = 762;
    const pillR = pillH / 2;

    // Pill Drop Shadow
    ctx.save();
    ctx.shadowColor = 'rgba(217, 119, 6, 0.45)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 12;
    ctx.fillStyle = '#f59e0b';
    roundRect(ctx, pillX, pillY, pillW, pillH, pillR);
    ctx.fill();
    ctx.restore();

    // Pill 3D Gradient
    ctx.save();
    const pillGrad = ctx.createLinearGradient(pillX, pillY, pillX, pillY + pillH);
    pillGrad.addColorStop(0, '#ffd34d');
    pillGrad.addColorStop(0.35, '#fbb01b');
    pillGrad.addColorStop(1, '#e58e08');
    ctx.fillStyle = pillGrad;
    roundRect(ctx, pillX, pillY, pillW, pillH, pillR);
    ctx.fill();

    // Subtle top inner highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Text inside Pill
    const totalPillText = `>>> Total Bayar : ${formattedTotal}`;
    let totalFontSize = 44;
    if (totalPillText.length > 28) totalFontSize = 38;
    if (totalPillText.length > 34) totalFontSize = 32;

    ctx.fillStyle = '#000000';
    ctx.font = `900 ${totalFontSize}px Arial, "Segoe UI", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(totalPillText, W / 2, pillY + pillH / 2 + 1);
    ctx.restore();

    // 9. Downscale to standard 512x512 WhatsApp sticker canvas with pristine antialiasing
    const stickerSize = 512;
    const finalCanvas = createCanvas(stickerSize, stickerSize);
    const finalCtx = finalCanvas.getContext('2d');
    finalCtx.drawImage(canvas, 0, 0, stickerSize, stickerSize);

    if (data.format === 'png') {
        return finalCanvas.toBuffer('image/png');
    }

    // Export to WebP buffer & attach WhatsApp sticker EXIF properly with node-webpmux
    const rawWebp = finalCanvas.toBuffer('image/webp');
    try {
        const img = new webpmux.Image();
        await img.load(rawWebp);
        const exif = createStickerExif('E4 STORE', 'Chuna E4 Store');
        img.exif = exif;
        return await img.save(null);
    } catch (err) {
        console.error("Failed to inject sticker EXIF with webpmux, returning raw webp:", err);
        return rawWebp;
    }
}
