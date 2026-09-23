import { createCanvas, loadImage } from '@napi-rs/canvas';
// @ts-ignore
import webpmux from 'node-webpmux';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execSync } from 'child_process';

export interface ConfirmationStickerData {
    serviceName: string;      // e.g. "PLN 20.000"
    targetNo: string;         // e.g. "32185604272"
    totalBayar: number | string; // e.g. 25000 or "Rp 25.000"
    nickname?: string;        // e.g. "Budi" (optional)
    note?: string;            // e.g. "pembelianmu akan di proses ya kk\nmohon di tunggu"
    waPhotoUrl?: string | null;
    avatarBuffer?: Buffer | null;
    animated?: boolean;       // default true
}

/**
 * Creates EXIF metadata buffer expected by WhatsApp for stickers
 */
export function createStickerExif(packname: string = 'E4 STORE', author: string = 'Chuna E4 Store', isAnimated: boolean = true): Buffer {
    const json = {
        'sticker-pack-id': 'e4-store-confirmation-' + Date.now(),
        'sticker-pack-name': packname,
        'sticker-pack-publisher': author,
        'emojis': ['✅', '⚡', '💎'],
        'is-avatar-sticker': 0,
        'is-animated-sticker': isAnimated ? 1 : 0
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
 * Draws a scalloped / vintage postage-edge paper path
 */
function drawScallopedRect(
    ctx: any,
    x: number,
    y: number,
    w: number,
    h: number,
    scallopR: number = 7
) {
    ctx.beginPath();
    
    // Top edge (left to right)
    const countX = Math.floor(w / (scallopR * 2));
    const stepX = w / countX;
    ctx.moveTo(x, y);
    for (let i = 0; i < countX; i++) {
        const startX = x + i * stepX;
        const midX = startX + stepX / 2;
        const endX = startX + stepX;
        ctx.quadraticCurveTo(midX, y + scallopR * 0.8, endX, y);
    }

    // Right edge (top to bottom)
    const countY = Math.floor(h / (scallopR * 2));
    const stepY = h / countY;
    for (let i = 0; i < countY; i++) {
        const startY = y + i * stepY;
        const midY = startY + stepY / 2;
        const endY = startY + stepY;
        ctx.quadraticCurveTo(x + w - scallopR * 0.8, midY, x + w, endY);
    }

    // Bottom edge (right to left)
    for (let i = countX - 1; i >= 0; i--) {
        const startX = x + (i + 1) * stepX;
        const midX = startX - stepX / 2;
        const endX = x + i * stepX;
        ctx.quadraticCurveTo(midX, y + h - scallopR * 0.8, endX, y + h);
    }

    // Left edge (bottom to top)
    for (let i = countY - 1; i >= 0; i--) {
        const startY = y + (i + 1) * stepY;
        const midY = startY - stepY / 2;
        const endY = y + i * stepY;
        ctx.quadraticCurveTo(x + scallopR * 0.8, midY, x, endY);
    }

    ctx.closePath();
}

/**
 * Draws 4-point sparkle star with rotation
 */
function drawSparkle(ctx: any, cx: number, cy: number, r: number, rot: number = 0, color: string = '#c48946') {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        ctx.moveTo(0, 0);
        const tipX = Math.cos(angle) * r;
        const tipY = Math.sin(angle) * r;
        const c1X = Math.cos(angle - Math.PI / 4) * (r * 0.28);
        const c1Y = Math.sin(angle - Math.PI / 4) * (r * 0.28);
        const c2X = Math.cos(angle + Math.PI / 4) * (r * 0.28);
        const c2Y = Math.sin(angle + Math.PI / 4) * (r * 0.28);
        ctx.lineTo(c1X, c1Y);
        ctx.lineTo(tipX, tipY);
        ctx.lineTo(c2X, c2Y);
    }
    ctx.fill();
    ctx.restore();
}

/**
 * Renders a single frame of the confirmation sticker
 */
function renderFrame(data: ConfirmationStickerData, avatarImg: any, frameIndex: number, totalFrames: number): any {
    const size = 512;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);

    const phase = totalFrames > 1 ? (frameIndex / totalFrames) * Math.PI * 2 : 0;

    // Card coordinates
    const cardX = 26;
    const cardY = 22;
    const cardW = 460;
    const cardH = 468;

    // 1. Outer Kraft Layer with prominent scalloped border (creates vintage stamp shadow)
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#b78954';
    drawScallopedRect(ctx, cardX - 8, cardY - 6, cardW + 16, cardH + 12, 8);
    ctx.fill();
    ctx.restore();

    // 2. Main Ivory/Parchment Paper sheet with scalloped edge
    ctx.save();
    const paperGrad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
    paperGrad.addColorStop(0, '#fffdf9');
    paperGrad.addColorStop(0.4, '#faf4e7');
    paperGrad.addColorStop(1, '#f5ecd8');
    ctx.fillStyle = paperGrad;
    drawScallopedRect(ctx, cardX, cardY, cardW, cardH, 7);
    ctx.fill();

    ctx.strokeStyle = '#dfcbb0';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // 3. Avatar Profile Medallion at the TOP
    const avatarCenterX = size / 2;
    const avatarCenterY = cardY + 12;
    const avatarR = 40; // 80px diameter, clear & prominent

    // ANIMATED: Pulsing Golden Halo around Avatar
    if (totalFrames > 1) {
        const pulseR = avatarR + 3 + Math.sin(phase) * 5;
        const pulseAlpha = 0.35 + Math.sin(phase) * 0.25;
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarCenterX, avatarCenterY, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(218, 165, 32, ${pulseAlpha})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
    }

    // Outer backing shadow
    ctx.save();
    ctx.shadowColor = 'rgba(60, 35, 10, 0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    ctx.beginPath();
    ctx.arc(avatarCenterX, avatarCenterY, avatarR + 2, 0, Math.PI * 2);
    ctx.fillStyle = '#b78954';
    ctx.fill();
    ctx.restore();

    // Draw Avatar or Fallback Monogram inside circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarCenterX, avatarCenterY, avatarR, 0, Math.PI * 2);
    ctx.clip();

    if (avatarImg) {
        ctx.drawImage(
            avatarImg,
            avatarCenterX - avatarR,
            avatarCenterY - avatarR,
            avatarR * 2,
            avatarR * 2
        );
    } else {
        const circleGrad = ctx.createLinearGradient(
            avatarCenterX - avatarR,
            avatarCenterY - avatarR,
            avatarCenterX + avatarR,
            avatarCenterY + avatarR
        );
        circleGrad.addColorStop(0, '#0f172a');
        circleGrad.addColorStop(0.5, '#1e293b');
        circleGrad.addColorStop(1, '#020617');
        ctx.fillStyle = circleGrad;
        ctx.fillRect(avatarCenterX - avatarR, avatarCenterY - avatarR, avatarR * 2, avatarR * 2);

        // Inner golden ring
        ctx.strokeStyle = 'rgba(234, 197, 105, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(avatarCenterX, avatarCenterY, avatarR - 5, 0, Math.PI * 2);
        ctx.stroke();

        // E4 Gold Text
        ctx.font = '900 24px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fde68a';
        ctx.fillText('E4', avatarCenterX, avatarCenterY + 1);
    }
    ctx.restore();

    // Border rims for the Profile Circle
    ctx.save();
    ctx.strokeStyle = '#cda26f';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(avatarCenterX, avatarCenterY, avatarR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(avatarCenterX, avatarCenterY, avatarR - 1.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 4. ANIMATED: Sparkles with Twinkling & Gentle Rotation
    const s1R = totalFrames > 1 ? 14 + Math.sin(phase) * 4 : 15;
    const s1Rot = totalFrames > 1 ? phase * 0.5 : 0;
    drawSparkle(ctx, cardX + cardW - 42, cardY + 50, s1R, s1Rot, '#e5a350');

    const s2R = totalFrames > 1 ? 8 + Math.cos(phase) * 3 : 8;
    const s2Rot = totalFrames > 1 ? -phase * 0.5 : 0;
    drawSparkle(ctx, cardX + cardW - 20, cardY + 76, s2R, s2Rot, '#e0ab68');

    const s3R = totalFrames > 1 ? 12 + Math.sin(phase + Math.PI) * 3 : 13;
    const s3Rot = totalFrames > 1 ? phase * 0.4 : 0;
    drawSparkle(ctx, cardX + 34, cardY + cardH - 42, s3R, s3Rot, '#e5a350');

    // 5. ANIMATED: Shimmer Light Beam gliding softly across the paper
    if (totalFrames > 1) {
        ctx.save();
        ctx.beginPath();
        drawScallopedRect(ctx, cardX, cardY, cardW, cardH, 7);
        ctx.clip();
        
        const shimmerX = cardX - 120 + (frameIndex / totalFrames) * (cardW + 240);
        const shimmerGrad = ctx.createLinearGradient(shimmerX, cardY, shimmerX + 80, cardY + cardH);
        shimmerGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        shimmerGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.24)');
        shimmerGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = shimmerGrad;
        ctx.fillRect(cardX, cardY, cardW, cardH);
        ctx.restore();
    }

    // 6. Header: "✔ Konfirmasi Pembelian" (Large, Bold, Crystal Clear)
    let currentY = avatarCenterY + avatarR + 25;

    ctx.save();
    ctx.fillStyle = '#170e07';
    ctx.font = 'bold 27px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✔ Konfirmasi Pembelian', size / 2, currentY);
    ctx.restore();

    // 7. Dashed line under header
    currentY += 21;
    ctx.save();
    ctx.strokeStyle = '#bda07b';
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 6]);
    ctx.beginPath();
    ctx.moveTo(cardX + 24, currentY);
    ctx.lineTo(cardX + cardW - 24, currentY);
    ctx.stroke();
    ctx.restore();

    // 8. Details: Layanan
    currentY += 34;
    ctx.save();
    ctx.fillStyle = '#170e07';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const serviceText = `Layanan ⇂ : ${data.serviceName || 'PLN 20.000'}`;
    ctx.fillText(serviceText, size / 2, currentY);
    ctx.restore();

    // Solid separator
    currentY += 24;
    ctx.save();
    ctx.strokeStyle = '#d9c4a5';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cardX + 32, currentY);
    ctx.lineTo(cardX + cardW - 32, currentY);
    ctx.stroke();
    ctx.restore();

    // 9. Details: Nomor Tujuan
    currentY += 32;
    ctx.save();
    ctx.fillStyle = '#170e07';
    ctx.font = 'bold 25px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const targetText = `Nomor Tujuan : ${data.targetNo || '-'}`;
    ctx.fillText(targetText, size / 2, currentY);
    ctx.restore();

    // Solid separator
    currentY += 24;
    ctx.save();
    ctx.strokeStyle = '#d9c4a5';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cardX + 32, currentY);
    ctx.lineTo(cardX + cardW - 32, currentY);
    ctx.stroke();
    ctx.restore();

    // 10. Details: Total Bayar
    currentY += 36;
    let formattedTotal = data.totalBayar;
    if (typeof formattedTotal === 'number') {
        formattedTotal = `Rp ${formattedTotal.toLocaleString('id-ID')}`;
    } else if (typeof formattedTotal === 'string' && !formattedTotal.startsWith('Rp')) {
        const num = parseInt(formattedTotal.replace(/\D/g, ''), 10);
        formattedTotal = isNaN(num) ? formattedTotal : `Rp ${num.toLocaleString('id-ID')}`;
    }

    ctx.save();
    ctx.fillStyle = '#170e07';
    ctx.font = '900 28px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const totalText = `✧ Total Bayar : ${formattedTotal}`;
    ctx.fillText(totalText, size / 2, currentY);
    ctx.restore();

    // Dashed line before bottom message
    currentY += 30;
    ctx.save();
    ctx.strokeStyle = '#bda07b';
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 6]);
    ctx.beginPath();
    ctx.moveTo(cardX + 24, currentY);
    ctx.lineTo(cardX + cardW - 24, currentY);
    ctx.stroke();
    ctx.restore();

    // 11. Bottom Footer Message (Bold, clear, centered)
    currentY += 24;
    ctx.save();
    ctx.fillStyle = '#110904';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const defaultNotes = [
        'pembelianmu akan di proses ya kk',
        'mohon di tunggu'
    ];
    const notes = data.note ? data.note.split('\n') : defaultNotes;

    notes.forEach((line, index) => {
        ctx.fillText(line, size / 2, currentY + index * 22);
    });
    ctx.restore();

    return canvas;
}

/**
 * Generates Animated WhatsApp Sticker (512x512 Animated WebP) with sparkling effects,
 * halo aura animation, and shimmer light effect!
 */
export async function generateOrderConfirmationSticker(data: ConfirmationStickerData): Promise<Buffer> {
    const isAnimated = data.animated !== false; // Animated by default!

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

    if (!isAnimated) {
        // Still sticker fallback
        const canvas = renderFrame(data, avatarImg, 0, 1);
        const rawWebp = canvas.toBuffer('image/webp');
        try {
            const img = new webpmux.Image();
            await img.load(rawWebp);
            img.exif = createStickerExif('E4 STORE', 'Chuna E4 Store', false);
            return await img.save(null);
        } catch (err) {
            return rawWebp;
        }
    }

    // ANIMATED STICKER: 12 frames, 10 FPS, seamless loop (~1.2s duration)
    const totalFrames = 12;
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'e4_sticker_anim_'));

    try {
        for (let f = 0; f < totalFrames; f++) {
            const canvas = renderFrame(data, avatarImg, f, totalFrames);
            const framePath = path.join(tempDir, `frame_${String(f).padStart(2, '0')}.png`);
            fs.writeFileSync(framePath, canvas.toBuffer('image/png'));
        }

        const outWebpPath = path.join(tempDir, 'sticker.webp');
        // Encode via ffmpeg to WebP animation: 10 fps, quality 70, loop 0 (infinite)
        execSync(
            `ffmpeg -y -framerate 10 -i ${tempDir}/frame_%02d.png -vcodec libwebp -lossless 0 -q:v 70 -loop 0 -an -vsync 0 -s 512:512 ${outWebpPath}`,
            { stdio: 'pipe' }
        );

        const rawAnimatedWebp = fs.readFileSync(outWebpPath);

        // Inject WhatsApp Sticker EXIF metadata
        try {
            const img = new webpmux.Image();
            await img.load(rawAnimatedWebp);
            img.exif = createStickerExif('E4 STORE', 'Chuna E4 Store', true);
            const finalAnimatedWebp = await img.save(null);
            return finalAnimatedWebp;
        } catch (exifErr) {
            console.error("Failed to attach EXIF to animated sticker, using raw WebP:", exifErr);
            return rawAnimatedWebp;
        }
    } catch (e: any) {
        console.error("Failed to generate animated sticker with ffmpeg, falling back to static:", e);
        // Safe fallback to static sticker
        const canvas = renderFrame(data, avatarImg, 0, 1);
        return canvas.toBuffer('image/webp');
    } finally {
        try {
            fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (e) {}
    }
}
