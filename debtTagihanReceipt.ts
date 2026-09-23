import { createCanvas, loadImage } from '@napi-rs/canvas';

export interface VintageTagihanItem {
    name: string;
    price: number;
}

export interface VintageTagihanData {
    customerName: string;
    phone: string;
    date: string;
    status?: string;
    items: VintageTagihanItem[];
    totalDebt: number;
    barcodeCode?: string;
    noteMessage?: string;
    waPhotoUrl?: string | null;
    avatarBuffer?: Buffer | null;
}

/**
 * Generate 1000x1000 Vintage Postcard Bukti Catatan Tagihan
 * Sesuai template E4 Store + Foto Profil WhatsApp di tempel di kotak orange / prangko pos
 */
export async function generateVintageTagihanReceipt(data: VintageTagihanData): Promise<Buffer> {
    const width = 1000;
    const height = 1000;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 1. Aged Vintage Parchment Background
    const bgGrad = ctx.createRadialGradient(500, 500, 100, 500, 500, 700);
    bgGrad.addColorStop(0, '#fcf7ed');
    bgGrad.addColorStop(0.65, '#f4ecd8');
    bgGrad.addColorStop(1, '#e7dab7');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle paper texture noise / warmth
    ctx.fillStyle = 'rgba(180, 130, 80, 0.03)';
    for (let i = 0; i < 400; i++) {
        const nx = Math.random() * width;
        const ny = Math.random() * height;
        const nr = Math.random() * 2 + 0.5;
        ctx.beginPath();
        ctx.arc(nx, ny, nr, 0, Math.PI * 2);
        ctx.fill();
    }

    // Double outer border
    const bColor = '#b27b47';
    ctx.strokeStyle = bColor;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(34, 34, 932, 932);

    ctx.lineWidth = 1;
    ctx.strokeRect(42, 42, 916, 916);

    // Four Corner Filigree Ornaments
    function drawCornerFiligree(cx: number, cy: number, flipX: boolean, flipY: boolean) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
        ctx.strokeStyle = bColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(12, 50);
        ctx.bezierCurveTo(12, 20, 20, 12, 50, 12);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(28, 28, 10, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(42, 16, 6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(16, 42, 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    drawCornerFiligree(42, 42, false, false);
    drawCornerFiligree(958, 42, true, false);
    drawCornerFiligree(42, 958, false, true);
    drawCornerFiligree(958, 958, true, true);

    // Dashed Center Divider Line
    ctx.save();
    ctx.setLineDash([7, 6]);
    ctx.strokeStyle = bColor;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(618, 38);
    ctx.lineTo(618, 962);
    ctx.stroke();
    ctx.restore();

    // ===================================================================
    // LEFT SIDE: INVOICE DETAILS
    // ===================================================================
    function drawFlourishWing(y: number) {
        ctx.save();
        ctx.strokeStyle = bColor;
        ctx.fillStyle = bColor;
        ctx.lineWidth = 1.8;
        // Diamond center
        ctx.beginPath();
        ctx.moveTo(330, y - 5);
        ctx.lineTo(335, y);
        ctx.lineTo(330, y + 5);
        ctx.lineTo(325, y);
        ctx.closePath();
        ctx.fill();

        // Left curl
        ctx.beginPath();
        ctx.moveTo(320, y);
        ctx.bezierCurveTo(280, y - 10, 240, y + 8, 200, y - 4);
        ctx.bezierCurveTo(185, y - 10, 175, y - 5, 175, y);
        ctx.stroke();

        // Right curl
        ctx.beginPath();
        ctx.moveTo(340, y);
        ctx.bezierCurveTo(380, y - 10, 420, y + 8, 460, y - 4);
        ctx.bezierCurveTo(475, y - 10, 485, y - 5, 485, y);
        ctx.stroke();
        ctx.restore();
    }

    drawFlourishWing(115);

    // E4 STORE Header (Elegant vintage calligraphy)
    ctx.fillStyle = '#1e110a';
    ctx.font = 'italic 54px Georgia, "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('E4 Store', 330, 160);

    drawFlourishWing(205);

    // Title: BUKTI CATATAN TAGIHAN
    ctx.fillStyle = '#1e110a';
    ctx.font = '900 28px "Times New Roman", Georgia, serif';
    ctx.fillText('BUKTI CATATAN TAGIHAN', 330, 275);

    // Status: BELUM LUNAS / LUNAS
    const statusText = (data.status || 'BELUM LUNAS').toUpperCase();
    const isLunas = statusText.includes('LUNAS') && !statusText.includes('BELUM');
    ctx.fillStyle = isLunas ? '#16a34a' : '#c25e1a';
    ctx.font = 'bold 22px "Times New Roman", Georgia, serif';
    ctx.fillText(`Status: ${statusText}`, 330, 325);

    // Customer Info Section
    const leftX = 90;
    const rightX = 565;
    let curY = 415;

    ctx.textAlign = 'left';
    ctx.font = 'bold 24px "Times New Roman", Georgia, serif';
    ctx.fillStyle = '#1e110a';
    ctx.fillText('Customer:', leftX, curY);
    ctx.textAlign = 'right';
    ctx.fillText(data.customerName || 'Pelanggan', rightX, curY);
    curY += 46;

    ctx.textAlign = 'left';
    ctx.fillText('Tanggal:', leftX, curY);
    ctx.textAlign = 'right';
    ctx.fillText(data.date || '27/08/2026', rightX, curY);
    curY += 28;

    // Horizontal Rule
    ctx.strokeStyle = bColor;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(leftX, curY);
    ctx.lineTo(rightX, curY);
    ctx.stroke();
    curY += 42;

    // Item Header
    ctx.textAlign = 'left';
    ctx.fillText('Item:', leftX, curY);
    curY += 44;

    // Items List
    const displayItems = data.items && data.items.length > 0
        ? data.items.slice(0, 3)
        : [{ name: 'Free Fire 70 Diamond', price: data.totalDebt }];

    displayItems.forEach((item) => {
        ctx.textAlign = 'left';
        ctx.font = 'bold 22px "Times New Roman", Georgia, serif';
        const pName = item.name.length > 28 ? item.name.substring(0, 26) + '...' : item.name;
        ctx.fillText(`${pName}:`, leftX, curY);
        ctx.textAlign = 'right';
        ctx.fillText(`Rp ${item.price.toLocaleString('id-ID')}`, rightX, curY);
        curY += 40;
    });

    if (data.items && data.items.length > 3) {
        ctx.textAlign = 'left';
        ctx.font = 'italic 18px "Times New Roman", Georgia, serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText(`+ ${data.items.length - 3} item lainnya`, leftX, curY);
        curY += 32;
        ctx.fillStyle = '#1e110a';
    }

    // TOTAL UTANG
    curY += 10;
    ctx.textAlign = 'left';
    ctx.font = '900 24px "Times New Roman", Georgia, serif';
    ctx.fillText('TOTAL UTANG:', leftX, curY);
    ctx.textAlign = 'right';
    ctx.fillText(`Rp ${data.totalDebt.toLocaleString('id-ID')}`, rightX, curY);
    curY += 34;

    // Horizontal Rule
    ctx.beginPath();
    ctx.moveTo(leftX, curY);
    ctx.lineTo(rightX, curY);
    ctx.stroke();

    // Bottom Friendly Note
    ctx.textAlign = 'center';
    ctx.font = 'italic 20px "Times New Roman", Georgia, serif';
    ctx.fillStyle = '#1e110a';
    const note = data.noteMessage || '"Tolong segera diselesaikan ya kak, terima kasih"';
    ctx.fillText(note, 330, 835);

    // ===================================================================
    // RIGHT SIDE: POSTAGE STAMP & BARCODE
    // ===================================================================
    // 1. Postage Stamp Perforations at Top Right
    const stampX = 760;
    const stampY = 90;
    const stampW = 160;
    const stampH = 180;

    function drawStampPerforations(sx: number, sy: number, sw: number, sh: number) {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sx, sy, sw, sh);

        // Perforation holes (scalloped teeth along edges)
        const holeR = 4;
        const holeStep = 11;
        ctx.fillStyle = '#f4ecd8'; // cutout matches background parchment

        for (let x = sx + 8; x <= sx + sw - 8; x += holeStep) {
            ctx.beginPath();
            ctx.arc(x, sy, holeR, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, sy + sh, holeR, 0, Math.PI * 2);
            ctx.fill();
        }

        for (let y = sy + 8; y <= sy + sh - 8; y += holeStep) {
            ctx.beginPath();
            ctx.arc(sx, y, holeR, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(sx + sw, y, holeR, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    drawStampPerforations(stampX, stampY, stampW, stampH);

    // Inside stamp: Orange Box ("kotak orange/orens")
    const obX = stampX + 15;
    const obY = stampY + 15;
    const obW = stampW - 30;
    const obH = stampH - 30;

    ctx.fillStyle = '#e56726'; // Vibrant terracotta orange
    ctx.fillRect(obX, obY, obW, obH);

    // Load Customer WhatsApp Profile Photo
    let avatarImg: any = null;
    if (data.avatarBuffer) {
        try {
            avatarImg = await loadImage(data.avatarBuffer);
        } catch (e) {}
    } else if (data.waPhotoUrl) {
        try {
            avatarImg = await loadImage(data.waPhotoUrl);
        } catch (e) {
            console.warn("Could not load waPhotoUrl in vintage receipt:", e);
        }
    }

    // Profile photo attached inside the orange stamp
    const photoSize = 92;
    const photoX = obX + (obW - photoSize) / 2;
    const photoY = obY + (obH - photoSize) / 2;

    if (avatarImg) {
        // Draw photo in circular frame with gold and white borders
        ctx.save();
        ctx.beginPath();
        ctx.arc(obX + obW / 2, obY + obH / 2, photoSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatarImg, photoX, photoY, photoSize, photoSize);
        ctx.restore();

        // White border
        ctx.beginPath();
        ctx.arc(obX + obW / 2, obY + obH / 2, photoSize / 2, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Green WhatsApp badge on bottom-right of photo
        const bX = obX + obW / 2 + 30;
        const bY = obY + obH / 2 + 30;
        ctx.beginPath();
        ctx.arc(bX, bY, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#22c55e';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✓', bX, bY);
    } else {
        // Fallback: Signature E4 script monogram (matching original template)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'italic bold 64px Georgia, "Times New Roman", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('E4', obX + obW / 2, obY + obH / 2);
    }

    // Vintage Postage Cancellation Stamp / Postmark across corner
    ctx.save();
    ctx.strokeStyle = 'rgba(40, 20, 10, 0.42)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(stampX - 10, stampY + 40, 42, -0.6, 1.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(stampX - 10, stampY + 40, 36, -0.6, 1.2);
    ctx.stroke();
    // Wavy postmark cancellation lines
    ctx.beginPath();
    ctx.moveTo(stampX - 10, stampY + 95);
    ctx.bezierCurveTo(stampX + 20, stampY + 85, stampX + 50, stampY + 105, stampX + 80, stampY + 95);
    ctx.stroke();
    ctx.restore();

    // 2. Center Right: Postcard Address Lines
    const lineStartX = 672;
    const lineEndX = 918;
    let plY = 360;
    ctx.strokeStyle = bColor;
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(lineStartX, plY);
        ctx.lineTo(lineEndX, plY);
        ctx.stroke();
        plY += 46;
    }

    // 3. Bottom Right: Phone, Barcode, Reference Code
    const brCenterX = (lineStartX + lineEndX) / 2;
    let brY = 720;

    ctx.textAlign = 'center';
    ctx.font = 'bold 19px "Segoe UI", sans-serif';
    ctx.fillStyle = '#1e110a';
    ctx.fillText(`No. HP: ${data.phone || '+6285822094851'}`, brCenterX, brY);
    brY += 28;

    // Realistic Barcode Graphic
    const bcW = 240;
    const bcH = 65;
    const bcX = brCenterX - bcW / 2;

    ctx.fillStyle = '#1e110a';
    const pattern = [3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 2, 4, 2, 1, 3, 2, 1, 4, 2, 3, 1, 2, 1, 4, 2, 3, 1, 2, 4, 1, 2, 3, 2];
    let curBcX = bcX;
    for (let i = 0; i < pattern.length; i++) {
        const barW = pattern[i];
        if (i % 2 === 0) {
            ctx.fillRect(curBcX, brY, barW * 1.8, bcH);
        }
        curBcX += barW * 1.8 + (i % 3 === 0 ? 3 : 2);
        if (curBcX > bcX + bcW) break;
    }
    brY += bcH + 20;

    // Reference Code under Barcode
    const code = data.barcodeCode || `REC-${(data.date || '20260827').replace(/\D/g, '')}-${(data.customerName || 'PADIL').replace(/[^a-zA-Z]/g, '').toUpperCase()}`;
    ctx.font = '900 18px monospace, "Segoe UI", sans-serif';
    ctx.fillStyle = '#1e110a';
    ctx.fillText(code, brCenterX, brY);

    return canvas.toBuffer('image/png');
}
