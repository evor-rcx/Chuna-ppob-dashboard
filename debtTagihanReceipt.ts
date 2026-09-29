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

function getInitials(name: string): string {
    const clean = (name || '').replace(/^(kak|mas|mba|om|tante|bapak|ibu)\s+/i, '').trim();
    if (!clean) return 'E4';
    const words = clean.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return clean.substring(0, 2).toUpperCase();
}

function drawChamferedRect(ctx: any, x: number, y: number, w: number, h: number, chamfer: number) {
    ctx.beginPath();
    ctx.moveTo(x + chamfer, y);
    ctx.lineTo(x + w - chamfer, y);
    ctx.lineTo(x + w, y + chamfer);
    ctx.lineTo(x + w, y + h - chamfer);
    ctx.lineTo(x + w - chamfer, y + h);
    ctx.lineTo(x + chamfer, y + h);
    ctx.lineTo(x, y + h - chamfer);
    ctx.lineTo(x, y + chamfer);
    ctx.closePath();
}

function roundRect(ctx: any, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function drawDiamond(ctx: any, cx: number, cy: number, size: number) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - size);
    ctx.lineTo(cx + size, cy);
    ctx.lineTo(cx, cy + size);
    ctx.lineTo(cx - size, cy);
    ctx.closePath();
}

/**
 * Format teks pesan WhatsApp / Telegram Catatan Tagihan sesuai permintaan
 */
export function formatTagihanMessage(data: VintageTagihanData): string {
    const status = data.status || 'BELUM LUNAS';
    const totalDebt = data.totalDebt || 0;
    const cleanPhone = (data.phone || '085822094851').replace(/[^0-9]/g, '');

    let itemsStr = "";
    if (data.items && data.items.length > 0) {
        data.items.forEach(it => {
            itemsStr += `- ${it.name}: Rp ${it.price.toLocaleString('id-ID')}\n`;
        });
    } else {
        itemsStr = `- Tagihan Utang: Rp ${totalDebt.toLocaleString('id-ID')}\n`;
    }

    return `E4 Store
BUKTI CATATAN TAGIHAN
Status: ${status}

----------------------------------------
Customer: ${data.customerName || 'Padil'}
Tanggal: ${data.date || '27/08/2026'}
----------------------------------------

Item:
${itemsStr.trimEnd()}

TOTAL UTANG: Rp ${totalDebt.toLocaleString('id-ID')}
----------------------------------------

"${data.noteMessage || 'Tolong segera diselesaikan ya kak, terima kasih'}"

----------------------------------------
No. HP: ${cleanPhone}`;
}

/**
 * Generate 1024x1024 Cyber Neon E4 Store BUKTI CATATAN TAGIHAN
 * Latar belakang bernuansa Deep Cosmic Sapphire / Midnight Navy Cyber (TIDAK HITAM POLOS):
 * - Gradasi biru laut dalam / sapphire gelap di kiri atas
 * - Nuansa midnight indigo & cosmic violet di kanan bawah
 * - Pancaran sinar laser diagonal (Cyan & Neon Magenta) yang memberi kedalaman ruang futuristik
 * - Lingkaran berornamen tech gold untuk foto profil WhatsApp
 * - Bingkai chamfered multi-color neon gradient (cyan -> gold -> magenta -> blue)
 * - Badge merah bersinar "Status: BELUM LUNAS" + garis neon horizontal
 * - Daftar item dengan peluru diamond ❖
 * - Kotak emas glowing TOTAL UTANG
 */
export async function generateVintageTagihanReceipt(data: VintageTagihanData): Promise<Buffer> {
    const width = 1024;
    const height = 1024;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // High quality antialiasing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Rich Deep Midnight Sapphire / Cosmic Blue Background (Bukan hitam polos!)
    // Base gradient: Ocean navy di kiri atas -> midnight blue di tengah -> cosmic violet di kanan bawah
    const outerBg = ctx.createLinearGradient(0, 0, width, height);
    outerBg.addColorStop(0, '#05223f');    // Deep vibrant ocean navy
    outerBg.addColorStop(0.32, '#0a1a36'); // Midnight dark sapphire
    outerBg.addColorStop(0.68, '#0d152e'); // Deep cosmic indigo
    outerBg.addColorStop(1, '#230b3d');    // Rich violet / purple nebula
    ctx.fillStyle = outerBg;
    ctx.fillRect(0, 0, width, height);

    // 2. Ambient Flares & Glows (Sinar sudut khas tema Cyberpunk)
    ctx.save();
    // Top-left glowing cyan nebula
    const tlFlare = ctx.createRadialGradient(80, 80, 20, 80, 80, 480);
    tlFlare.addColorStop(0, 'rgba(6, 182, 212, 0.45)');
    tlFlare.addColorStop(0.5, 'rgba(14, 165, 233, 0.18)');
    tlFlare.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = tlFlare;
    ctx.beginPath();
    ctx.arc(80, 80, 480, 0, Math.PI * 2);
    ctx.fill();

    // Bottom-right glowing purple/magenta nebula
    const brFlare = ctx.createRadialGradient(940, 940, 30, 940, 940, 520);
    brFlare.addColorStop(0, 'rgba(217, 70, 239, 0.40)');
    brFlare.addColorStop(0.55, 'rgba(168, 85, 247, 0.16)');
    brFlare.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = brFlare;
    ctx.beginPath();
    ctx.arc(940, 940, 520, 0, Math.PI * 2);
    ctx.fill();

    // Center warm blue ambient light
    const centerGlow = ctx.createRadialGradient(512, 450, 40, 512, 450, 420);
    centerGlow.addColorStop(0, 'rgba(30, 64, 175, 0.28)');
    centerGlow.addColorStop(0.7, 'rgba(15, 23, 42, 0.08)');
    centerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = centerGlow;
    ctx.beginPath();
    ctx.arc(512, 450, 420, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Diagonal Cyber Laser Lines (Persis seperti pada mockup)
    ctx.save();
    // Primary Cyan Laser Beam (kiri atas melintang ke kanan bawah)
    ctx.shadowColor = '#00f2fe';
    ctx.shadowBlur = 14;
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
    ctx.beginPath();
    ctx.moveTo(-80, 220);
    ctx.lineTo(880, 1180);
    ctx.stroke();

    // Secondary subtle cyan ray
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(14, 165, 233, 0.35)';
    ctx.beginPath();
    ctx.moveTo(-40, 390);
    ctx.lineTo(760, 1190);
    ctx.stroke();

    // Bottom-right Magenta Laser Beam (melintang ke atas kanan)
    ctx.shadowColor = '#d946ef';
    ctx.shadowBlur = 14;
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = 'rgba(217, 70, 239, 0.50)';
    ctx.beginPath();
    ctx.moveTo(340, 1100);
    ctx.lineTo(1120, 320);
    ctx.stroke();

    // Secondary subtle magenta ray
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(192, 38, 211, 0.30)';
    ctx.beginPath();
    ctx.moveTo(480, 1140);
    ctx.lineTo(1160, 460);
    ctx.stroke();
    ctx.restore();

    // 4. Outer Chamfered Cyber Neon Border
    const bX = 40;
    const bY = 40;
    const bW = width - 80;
    const bH = height - 80;
    const chamfer = 38;

    // Glowing Neon Gradient for outer border
    const neonGrad = ctx.createLinearGradient(0, 0, width, height);
    neonGrad.addColorStop(0, '#00f2fe');   // Top-left: Cyan
    neonGrad.addColorStop(0.35, '#ffb703'); // Top-right: Vibrant Gold
    neonGrad.addColorStop(0.68, '#3b82f6'); // Bottom-right: Electric Blue
    neonGrad.addColorStop(1, '#d946ef');   // Bottom-left: Magenta

    ctx.save();
    // Vibrant outer neon glow
    ctx.shadowColor = 'rgba(0, 242, 254, 0.75)';
    ctx.shadowBlur = 18;
    ctx.strokeStyle = neonGrad;
    ctx.lineWidth = 3.4;
    drawChamferedRect(ctx, bX, bY, bW, bH, chamfer);
    ctx.stroke();
    ctx.restore();

    // 5. Inner Card (Translucent Deep Navy / Midnight Sapphire Glass - BUKAN HITAM)
    const innerInset = 14;
    const inX = bX + innerInset;
    const inY = bY + innerInset;
    const inW = bW - innerInset * 2;
    const inH = bH - innerInset * 2;

    ctx.save();
    // Gradasi sapphire berkelas pada kartu utama
    const innerCardBg = ctx.createLinearGradient(inX, inY, inX + inW, inY + inH);
    innerCardBg.addColorStop(0, 'rgba(11, 23, 44, 0.92)');    // Deep ocean sapphire
    innerCardBg.addColorStop(0.5, 'rgba(13, 20, 39, 0.93)');  // Midnight navy
    innerCardBg.addColorStop(1, 'rgba(18, 12, 33, 0.94)');    // Deep night violet
    ctx.fillStyle = innerCardBg;
    drawChamferedRect(ctx, inX, inY, inW, inH, chamfer - 8);
    ctx.fill();

    // Inner card border with subtle electric cyan/blue line
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 1.6;
    drawChamferedRect(ctx, inX, inY, inW, inH, chamfer - 8);
    ctx.stroke();
    ctx.restore();

    // 6. Circular WhatsApp Profile Avatar Ring (Center X = 512, Center Y = 175)
    const avatarCenterX = 512;
    const avatarCenterY = 175;
    const avatarRadius = 104; // inner radius for avatar photo

    // Soft warm backlight behind avatar
    ctx.save();
    const avatarGlow = ctx.createRadialGradient(avatarCenterX, avatarCenterY, 30, avatarCenterX, avatarCenterY, 160);
    avatarGlow.addColorStop(0, 'rgba(255, 183, 3, 0.5)');
    avatarGlow.addColorStop(0.65, 'rgba(255, 183, 3, 0.15)');
    avatarGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = avatarGlow;
    ctx.beginPath();
    ctx.arc(avatarCenterX, avatarCenterY, 160, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Load WhatsApp Avatar
    let userAvatarImg: any = null;
    if (data.avatarBuffer) {
        try {
            userAvatarImg = await loadImage(data.avatarBuffer);
        } catch (e) {
            console.error("Gagal load avatarBuffer:", e);
        }
    }
    if (!userAvatarImg && data.waPhotoUrl && data.waPhotoUrl.startsWith('http')) {
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 4000);
            const res = await fetch(data.waPhotoUrl, { signal: controller.signal });
            clearTimeout(timer);
            if (res.ok) {
                const buf = Buffer.from(await res.arrayBuffer());
                userAvatarImg = await loadImage(buf);
            }
        } catch (e) {
            console.error("Gagal fetch waPhotoUrl:", e);
        }
    }

    // Draw WhatsApp Avatar or Fallback Monogram
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    if (userAvatarImg) {
        const sw = userAvatarImg.width;
        const sh = userAvatarImg.height;
        const minDim = Math.min(sw, sh);
        const sx = (sw - minDim) / 2;
        const sy = (sh - minDim) / 2;
        ctx.drawImage(userAvatarImg, sx, sy, minDim, minDim, avatarCenterX - avatarRadius, avatarCenterY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
    } else {
        // Deep cyber navy monogram base
        const monoGrad = ctx.createLinearGradient(avatarCenterX - avatarRadius, avatarCenterY - avatarRadius, avatarCenterX + avatarRadius, avatarCenterY + avatarRadius);
        monoGrad.addColorStop(0, '#13213c');
        monoGrad.addColorStop(0.5, '#0c162a');
        monoGrad.addColorStop(1, '#070e1c');
        ctx.fillStyle = monoGrad;
        ctx.fillRect(avatarCenterX - avatarRadius, avatarCenterY - avatarRadius, avatarRadius * 2, avatarRadius * 2);

        // Gold Initials
        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 54px "DejaVu Sans", "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(251, 191, 36, 0.9)';
        ctx.shadowBlur = 12;
        ctx.fillText(getInitials(data.customerName), avatarCenterX, avatarCenterY);
        ctx.shadowBlur = 0;
    }
    ctx.restore();

    // Draw Ornate High-Tech Concentric Golden Rings around Avatar
    ctx.save();
    // Inner crisp gold ring
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Middle tech groove & tick dashes
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(avatarCenterX, avatarCenterY, avatarRadius + 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]); // reset dash

    // Outer rich amber glowing ring
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.shadowColor = 'rgba(245, 158, 11, 0.85)';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(avatarCenterX, avatarCenterY, avatarRadius + 9, 0, Math.PI * 2);
    ctx.stroke();

    // Fine orbital ring with tech dots
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.65)';
    ctx.lineWidth = 1.2;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(avatarCenterX, avatarCenterY, avatarRadius + 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 7. Header Titles below Circle
    ctx.save();
    ctx.textAlign = 'center';

    // E4 Store (Italic Bold Gold Gradient)
    const e4Grad = ctx.createLinearGradient(avatarCenterX - 120, 310, avatarCenterX + 120, 360);
    e4Grad.addColorStop(0, '#fffbeb');
    e4Grad.addColorStop(0.5, '#fef08a');
    e4Grad.addColorStop(1, '#f59e0b');

    ctx.font = 'italic bold 44px "DejaVu Sans", "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = e4Grad;
    ctx.shadowColor = 'rgba(245, 158, 11, 0.75)';
    ctx.shadowBlur = 14;
    ctx.fillText('E4 Store', avatarCenterX, 344);
    ctx.shadowBlur = 0;

    // BUKTI CATATAN TAGIHAN (Bold Crisp White)
    ctx.font = 'bold 32px "DejaVu Sans", "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 242, 254, 0.6)';
    ctx.shadowBlur = 10;
    ctx.fillText('BUKTI CATATAN TAGIHAN', avatarCenterX, 410);
    ctx.shadowBlur = 0;
    ctx.restore();

    // 8. Status Badge & Neon Horizontal Light Streak (Y ≈ 480)
    const status = data.status || 'BELUM LUNAS';
    const isLunas = status.toLowerCase().includes('lunas') && !status.toLowerCase().includes('belum');

    const pillX = 122;
    const pillY = 452;
    const pillW = 320;
    const pillH = 54;
    const pillR = 27;

    ctx.save();
    if (isLunas) {
        // Green Lunas pill
        ctx.fillStyle = 'rgba(22, 101, 52, 0.45)';
        ctx.strokeStyle = '#22c55e';
        ctx.shadowColor = 'rgba(34, 197, 94, 0.85)';
    } else {
        // Red Belum Lunas pill
        ctx.fillStyle = 'rgba(185, 28, 28, 0.40)';
        ctx.strokeStyle = '#ef4444';
        ctx.shadowColor = 'rgba(239, 68, 68, 0.85)';
    }
    ctx.lineWidth = 2.4;
    ctx.shadowBlur = 14;
    roundRect(ctx, pillX, pillY, pillW, pillH, pillR);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Status Text inside pill
    ctx.textAlign = 'center';
    ctx.font = 'bold 19px "DejaVu Sans", "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Status: ${status}`, pillX + pillW / 2, pillY + 34);
    ctx.restore();

    // Horizontal Neon Line on the right side of the pill
    ctx.save();
    const streakGrad = ctx.createLinearGradient(468, 479, 896, 479);
    streakGrad.addColorStop(0, '#06b6d4');
    streakGrad.addColorStop(0.6, '#38bdf8');
    streakGrad.addColorStop(1, '#f59e0b');

    ctx.strokeStyle = streakGrad;
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(6, 182, 212, 0.85)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(468, 479);
    ctx.lineTo(896, 479);
    ctx.stroke();
    ctx.restore();

    // 9. Customer & Date Info Row (Y ≈ 558)
    const contentLeft = 124;
    const contentRight = 896;

    ctx.save();
    ctx.font = 'bold 22px "DejaVu Sans", "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#ffffff';

    // Left: Customer: [Name]
    ctx.textAlign = 'left';
    ctx.fillText(`Customer: ${data.customerName || 'Padil'}`, contentLeft, 558);

    // Right: Tanggal: [Date]
    ctx.textAlign = 'right';
    ctx.fillText(`Tanggal: ${data.date || '27/08/2026'}`, contentRight, 558);
    ctx.restore();

    // 10. Items List (Diamond Bullet Rows)
    const items = data.items && data.items.length > 0
        ? data.items
        : [
            { name: 'Free Fire 70 Diamond', price: 11000 },
            { name: 'Free Fire Level Up Pass Level 15', price: 1000 }
        ];

    let startItemY = 620;
    const itemSpacing = 44;

    ctx.save();
    items.slice(0, 4).forEach((it, idx) => {
        const itemY = startItemY + idx * itemSpacing;

        // Diamond Icon (Electric Cyan)
        ctx.save();
        ctx.fillStyle = '#38bdf8';
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1;
        ctx.shadowColor = 'rgba(56, 189, 248, 0.85)';
        ctx.shadowBlur = 8;
        drawDiamond(ctx, contentLeft + 8, itemY - 6, 7);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Product Name
        ctx.textAlign = 'left';
        ctx.font = 'bold 21px "DejaVu Sans", "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`❖ ${it.name} — Rp`, contentLeft, itemY);

        // Price (Gold / Bright Yellow)
        ctx.textAlign = 'right';
        ctx.font = 'bold 24px "DejaVu Sans", "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#fde047';
        ctx.fillText(it.price.toLocaleString('id-ID'), contentRight, itemY);
    });
    ctx.restore();

    // 11. TOTAL UTANG Glowing Gold Box (Y ≈ 745)
    const totalBoxX = 126;
    const totalBoxY = 718;
    const totalBoxW = contentRight - contentLeft + 4;
    const totalBoxH = 64;
    const totalBoxR = 14;

    ctx.save();
    ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.2;
    ctx.shadowColor = 'rgba(245, 158, 11, 0.70)';
    ctx.shadowBlur = 14;
    roundRect(ctx, totalBoxX, totalBoxY, totalBoxW, totalBoxH, totalBoxR);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Text: TOTAL UTANG: Rp [nominal]
    ctx.textAlign = 'center';
    ctx.font = 'bold 26px "DejaVu Sans", "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.fillText(`TOTAL UTANG: Rp ${data.totalDebt.toLocaleString('id-ID')}`, avatarCenterX, totalBoxY + 41);
    ctx.restore();

    // 12. Note Message (Y ≈ 824)
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'italic 20px "DejaVu Sans", "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#fef3c7';
    const note = data.noteMessage || 'Tolong segera diselesaikan ya kak, terima kasih';
    ctx.fillText(`“${note}”`, avatarCenterX, 824);
    ctx.restore();

    // 13. Footer No. HP (Y ≈ 892)
    const rawPhone = data.phone || '085822094851';
    let cleanPhone = rawPhone.replace(/\D/g, '');
    if (cleanPhone.startsWith('62')) cleanPhone = '0' + cleanPhone.substring(2);

    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'bold 21px "DejaVu Sans", "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`No. HP: ${cleanPhone}`, avatarCenterX, 892);
    ctx.restore();

    return canvas.toBuffer('image/png');
}
