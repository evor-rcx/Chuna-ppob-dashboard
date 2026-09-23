import { createCanvas, loadImage } from '@napi-rs/canvas';

export interface ConfirmationStickerData {
    serviceName: string;      // e.g. "PLN 20.000"
    targetNo: string;         // e.g. "32185604272"
    totalBayar: number | string; // e.g. 25000 or "Rp 25.000"
    nickname?: string;        // e.g. "Budi" (optional)
    note?: string;            // e.g. "pembelianmu akan di proses ya kk\nmohon di tunggu"
    waPhotoUrl?: string | null;
    avatarBuffer?: Buffer | null;
}

/**
 * Creates EXIF metadata chunk expected by WhatsApp for stickers
 */
export function createStickerExif(packname: string = 'E4 STORE', author: string = 'Chuna E4 Store'): Buffer {
    const json = {
        'sticker-pack-id': 'e4-store-confirmation-' + Date.now(),
        'sticker-pack-name': packname,
        'sticker-pack-publisher': author,
        'emojis': ['✅', '⚡', '💎']
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
 * Injects EXIF chunk into a WebP RIFF buffer
 */
export function injectExifToWebp(webpBuffer: Buffer, exifBuffer: Buffer): Buffer {
    try {
        const exifChunkHeader = Buffer.from('EXIF');
        const exifLen = exifBuffer.length;
        const exifLenBuf = Buffer.alloc(4);
        exifLenBuf.writeUInt32LE(exifLen, 0);
        const pad = (exifLen % 2 !== 0) ? Buffer.from([0x00]) : Buffer.alloc(0);
        const fullExifChunk = Buffer.concat([exifChunkHeader, exifLenBuf, exifBuffer, pad]);

        // Insert after WEBP (offset 12)
        const riffHeader = webpBuffer.slice(0, 12);
        const remaining = webpBuffer.slice(12);

        const totalLength = riffHeader.length + fullExifChunk.length + remaining.length - 8;
        const newRiff = Buffer.from(riffHeader);
        newRiff.writeUInt32LE(totalLength, 4);

        return Buffer.concat([newRiff, fullExifChunk, remaining]);
    } catch (e) {
        return webpBuffer;
    }
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
 * Draws 4-point sparkle star
 */
function drawSparkle(ctx: any, cx: number, cy: number, r: number, color: string) {
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

/**
 * Generates the WhatsApp Sticker (512x512 WebP) exactly matching the user's template
 */
export async function generateOrderConfirmationSticker(data: ConfirmationStickerData): Promise<Buffer> {
    const size = 512;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Transparent canvas background (standard for stickers)
    ctx.clearRect(0, 0, size, size);

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

    // 1. Kraft paper backing layer (visible edges like user's image)
    const cardX = 36;
    const cardY = 32;
    const cardW = 440;
    const cardH = 450;

    ctx.save();
    // Kraft dark background layer with slight organic tilt & scallop
    ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = '#b78d59';
    drawScallopedRect(ctx, cardX - 8, cardY - 6, cardW + 16, cardH + 12, 8);
    ctx.fill();
    ctx.restore();

    // 2. Main warm ivory/parchment scalloped paper sheet
    ctx.save();
    ctx.shadowColor = 'rgba(70, 45, 20, 0.15)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    const paperGrad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
    paperGrad.addColorStop(0, '#fffbf2');
    paperGrad.addColorStop(0.5, '#fbf3e2');
    paperGrad.addColorStop(1, '#f6ebd5');
    ctx.fillStyle = paperGrad;
    drawScallopedRect(ctx, cardX, cardY, cardW, cardH, 7);
    ctx.fill();

    // Paper border stroke
    ctx.strokeStyle = '#e7d8be';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();

    // 3. Decorative Sparkles around the note (matching the user's template)
    drawSparkle(ctx, cardX + cardW - 46, cardY + 48, 14, '#c99256');
    drawSparkle(ctx, cardX + cardW - 24, cardY + 70, 7, '#d8a56c');
    drawSparkle(ctx, cardX + 32, cardY + cardH - 42, 11, '#c99256');

    // 4. Circular Profile Photo Medallion at the TOP (Circle that was empty)
    // Positioned neatly at top-center of the paper like the user's circle
    const avatarCenterX = size / 2;
    const avatarCenterY = cardY + 8;
    const avatarR = 38; // 76px diameter, prominent and clear

    // Subtle drop shadow under the circular medallion
    ctx.save();
    ctx.shadowColor = 'rgba(60, 40, 15, 0.25)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;
    ctx.beginPath();
    ctx.arc(avatarCenterX, avatarCenterY, avatarR, 0, Math.PI * 2);
    ctx.fillStyle = '#d2a679';
    ctx.fill();
    ctx.restore();

    // Draw Avatar or Fallback E4 Monogram inside circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarCenterX, avatarCenterY, avatarR - 1, 0, Math.PI * 2);
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
        // Fallback: Luxurious Navy & Gold E4 Monogram when profile is private/empty
        const circleGrad = ctx.createLinearGradient(
            avatarCenterX - avatarR,
            avatarCenterY - avatarR,
            avatarCenterX + avatarR,
            avatarCenterY + avatarR
        );
        circleGrad.addColorStop(0, '#111e38');
        circleGrad.addColorStop(0.5, '#1e355b');
        circleGrad.addColorStop(1, '#0c1626');
        ctx.fillStyle = circleGrad;
        ctx.fillRect(avatarCenterX - avatarR, avatarCenterY - avatarR, avatarR * 2, avatarR * 2);

        // Inner golden ring
        ctx.strokeStyle = 'rgba(234, 201, 117, 0.5)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(avatarCenterX, avatarCenterY, avatarR - 5, 0, Math.PI * 2);
        ctx.stroke();

        // E4 Gold Text
        ctx.font = '900 24px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const goldText = ctx.createLinearGradient(avatarCenterX - 15, avatarCenterY - 10, avatarCenterX + 15, avatarCenterY + 10);
        goldText.addColorStop(0, '#fff4cc');
        goldText.addColorStop(0.5, '#eac975');
        goldText.addColorStop(1, '#b3821a');
        ctx.fillStyle = goldText;
        ctx.fillText('E4', avatarCenterX, avatarCenterY + 1.5);
    }
    ctx.restore();

    // Gold Outer Rim for the Profile Circle
    ctx.save();
    ctx.strokeStyle = '#cda26f';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(avatarCenterX, avatarCenterY, avatarR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(avatarCenterX, avatarCenterY, avatarR - 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 5. Header: "✔ Konfirmasi Pembelian"
    let currentY = avatarCenterY + avatarR + 24;

    ctx.save();
    ctx.fillStyle = '#22140c';
    ctx.font = '900 24px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✔ Konfirmasi Pembelian', size / 2, currentY);
    ctx.restore();

    // 6. Dashed line under header
    currentY += 22;
    ctx.save();
    ctx.strokeStyle = '#bda584';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(cardX + 28, currentY);
    ctx.lineTo(cardX + cardW - 28, currentY);
    ctx.stroke();
    ctx.restore();

    // 7. Details: Layanan
    currentY += 34;
    ctx.save();
    ctx.fillStyle = '#1e130d';
    ctx.font = 'bold 21px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const serviceText = `Layanan ⇂ : ${data.serviceName || 'PLN 20.000'}`;
    ctx.fillText(serviceText, size / 2, currentY);
    ctx.restore();

    // Solid separator
    currentY += 24;
    ctx.save();
    ctx.strokeStyle = '#d9c7ab';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(cardX + 36, currentY);
    ctx.lineTo(cardX + cardW - 36, currentY);
    ctx.stroke();
    ctx.restore();

    // 8. Details: Nomor Tujuan
    currentY += 30;
    ctx.save();
    ctx.fillStyle = '#1e130d';
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const targetText = `Nomor Tujuan : ${data.targetNo || '-'}`;
    ctx.fillText(targetText, size / 2, currentY);
    ctx.restore();

    // Solid separator
    currentY += 24;
    ctx.save();
    ctx.strokeStyle = '#d9c7ab';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(cardX + 36, currentY);
    ctx.lineTo(cardX + cardW - 36, currentY);
    ctx.stroke();
    ctx.restore();

    // 9. Details: Total Bayar
    currentY += 34;
    let formattedTotal = data.totalBayar;
    if (typeof formattedTotal === 'number') {
        formattedTotal = `Rp ${formattedTotal.toLocaleString('id-ID')}`;
    } else if (typeof formattedTotal === 'string' && !formattedTotal.startsWith('Rp')) {
        const num = parseInt(formattedTotal.replace(/\D/g, ''), 10);
        formattedTotal = isNaN(num) ? formattedTotal : `Rp ${num.toLocaleString('id-ID')}`;
    }

    ctx.save();
    ctx.fillStyle = '#1e130d';
    ctx.font = '900 24px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const totalText = `✧ Total Bayar : ${formattedTotal}`;
    ctx.fillText(totalText, size / 2, currentY);
    ctx.restore();

    // Dashed line before bottom message
    currentY += 30;
    ctx.save();
    ctx.strokeStyle = '#bda584';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(cardX + 28, currentY);
    ctx.lineTo(cardX + cardW - 28, currentY);
    ctx.stroke();
    ctx.restore();

    // 10. Bottom Footer Message (matching the user's text)
    // "pembelianmu akan di proses ya kk"
    // "mohon di tunggu"
    currentY += 24;
    ctx.save();
    ctx.fillStyle = '#110c08';
    ctx.font = '900 15px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const defaultNotes = [
        'pembelianmu akan di proses ya kk',
        'mohon di tunggu'
    ];
    const notes = data.note ? data.note.split('\n') : defaultNotes;

    notes.forEach((line, index) => {
        ctx.fillText(line, size / 2, currentY + index * 19);
    });
    ctx.restore();

    // Export to WebP buffer & attach WhatsApp sticker EXIF
    const rawWebp = canvas.toBuffer('image/webp');
    const exif = createStickerExif('E4 STORE', 'Chuna E4 Store');
    return injectExifToWebp(rawWebp, exif);
}
