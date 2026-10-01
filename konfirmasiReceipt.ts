import { createCanvas, loadImage, Image } from '@napi-rs/canvas';
import { resolveAvatarImage } from './royalStrukReceipt';
import path from 'path';
import fs from 'fs';

export interface KonfirmasiData {
    nama?: string;
    layanan?: string;
    nomor?: string;
    totalBayar?: number;
    waPhotoUrl?: string | null;
    avatarBuffer?: Buffer | null;
}

let cachedTemplateImg: Image | null = null;

async function getKonfirmasiTemplate(): Promise<Image | null> {
    if (cachedTemplateImg) return cachedTemplateImg;
    const candidates = [
        path.join(process.cwd(), 'Picsart_26-09-28_21-18-20-870.png'),
        'Picsart_26-09-28_21-18-20-870.png'
    ];
    for (const p of candidates) {
        if (fs.existsSync(p)) {
            try {
                cachedTemplateImg = await loadImage(p);
                return cachedTemplateImg;
            } catch (e) {
                console.error("Gagal load Picsart Konfirmasi template:", p, e);
            }
        }
    }
    return null;
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
 * Format Teks Pesan WhatsApp Konfirmasi Pembelian Customer
 */
export function formatKonfirmasiMessage(data: KonfirmasiData): string {
    const nama = data.nama || 'E4STORE';
    const layanan = data.layanan || 'Go Pay 8.000';
    const nomor = data.nomor || '08134621611';
    const totalBayar = Number(data.totalBayar || 13000);

    return `E4 STORE
Konfirmasi Pembelian Customer

Nama : ${nama}
Layanan : ${layanan}
Nomor : ${nomor}

Total Bayar : Rp ${totalBayar.toLocaleString('id-ID')}

Mohon ditunggu ya Kak, nanti diupdate
di bawah chat ini ya Kak. Terima kasih`;
}

/**
 * Generate 1080x1060 Nota Konfirmasi Pembelian Customer
 * - Foto profil WhatsApp ditaruh di dalam lingkaran transparan (Center X: 263.5, Y: 537.5, Radius: 216)
 * - Template mentahan Picsart_26-09-28_21-18-20-870.png digambar di atas foto
 * - Teks mentahan asli (E4 STORE, Konfirmasi Pembelian Customer, dan Footer) TIDAK DITIMPA
 * - Kotak neon rounded cyberpunk digambar di sebelah kanan (Nama, Layanan, Nomor)
 * - Total Bayar menyala neon pink di bawah kotak
 */
export async function generateKonfirmasiReceipt(data: KonfirmasiData): Promise<Buffer> {
    const templateImg = await getKonfirmasiTemplate();
    const width = templateImg ? templateImg.width : 1080;
    const height = templateImg ? templateImg.height : 1060;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Koordinat Lubang Lingkaran Transparan untuk Foto Profil WhatsApp
    const avatarCenterX = 263.5;
    const avatarCenterY = 537.5;
    const avatarRadius = 216;

    // Load foto profil user jika ada (mendukung foto member offline lokal, base64, url)
    const userAvatarImg = await resolveAvatarImage(data.waPhotoUrl, data.avatarBuffer);

    // Base background di bawah lingkaran
    ctx.fillStyle = '#060c24';
    ctx.fillRect(0, 0, width, height);

    // Render Foto Profil di Lapisan Dasar
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
        ctx.drawImage(
            userAvatarImg,
            sx, sy, minDim, minDim,
            avatarCenterX - avatarRadius,
            avatarCenterY - avatarRadius,
            avatarRadius * 2,
            avatarRadius * 2
        );
    } else {
        const grad = ctx.createLinearGradient(
            avatarCenterX - avatarRadius,
            avatarCenterY - avatarRadius,
            avatarCenterX + avatarRadius,
            avatarCenterY + avatarRadius
        );
        grad.addColorStop(0, '#1e1b4b');
        grad.addColorStop(0.5, '#0f172a');
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.fillRect(
            avatarCenterX - avatarRadius,
            avatarCenterY - avatarRadius,
            avatarRadius * 2,
            avatarRadius * 2
        );

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 110px "Liberation Sans", "DejaVu Sans", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(56, 189, 248, 0.9)';
        ctx.shadowBlur = 18;
        ctx.fillText(getInitials(data.nama || 'E4'), avatarCenterX, avatarCenterY);
        ctx.shadowBlur = 0;
    }
    ctx.restore();

    // 2. Gambar Mentahan Template DI ATAS Foto
    // Cincin neon biru-magenta template otomatis membingkai foto profil secara sempurna
    if (templateImg) {
        ctx.drawImage(templateImg, 0, 0, width, height);
    }

    // 3. Kotak Neon Cyberpunk di Kolom Kanan
    const boxX = 515;
    const boxY = 388;
    const boxW = 452;
    const boxH = 295;
    const boxR = 24;

    function drawRoundRect(x: number, y: number, w: number, h: number, r: number) {
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

    // Kaca Transparan di dalam kotak
    ctx.save();
    drawRoundRect(boxX, boxY, boxW, boxH, boxR);
    ctx.fillStyle = 'rgba(6, 16, 51, 0.45)';
    ctx.fill();

    // Bingkai Neon Gradasi (Cyan ke Magenta)
    const borderGrad = ctx.createLinearGradient(boxX, boxY, boxX + boxW, boxY + boxH);
    borderGrad.addColorStop(0, '#00e5ff');
    borderGrad.addColorStop(0.5, '#7b2cbf');
    borderGrad.addColorStop(1, '#ff007f');

    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 3.5;
    ctx.shadowColor = 'rgba(0, 229, 255, 0.65)';
    ctx.shadowBlur = 10;
    ctx.stroke();

    // Glow dalam halus
    ctx.strokeStyle = 'rgba(255, 0, 127, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 6;
    drawRoundRect(boxX + 2, boxY + 2, boxW - 4, boxH - 4, boxR - 2);
    ctx.stroke();
    ctx.restore();

    // Toggle Switch (Pill shape neon di pojok kanan atas kotak)
    const toggleX = boxX + boxW - 86;
    const toggleY = boxY + 26;
    const toggleW = 60;
    const toggleH = 34;
    const toggleR = 17;

    ctx.save();
    drawRoundRect(toggleX, toggleY, toggleW, toggleH, toggleR);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 6;
    ctx.stroke();

    // Knob Toggle aktif (Pink menyala)
    ctx.beginPath();
    ctx.arc(toggleX + toggleW - 17, toggleY + 17, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#ff70a6';
    ctx.shadowColor = '#ff70a6';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.restore();

    // Teks di Dalam Kotak: Nama, Layanan, Nomor
    const textLeftX = boxX + 26;
    const line1Y = boxY + 54;
    const line2Y = boxY + 152;
    const line3Y = boxY + 250;

    function drawFieldText(label: string, value: string, y: number) {
        ctx.save();
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        ctx.font = 'bold 31px "Liberation Sans", "DejaVu Sans", Arial, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 1;
        ctx.fillText(`${label} : ${value}`, textLeftX, y);
        ctx.restore();
    }

    const namaVal = data.nama || 'E4STORE';
    const layananVal = data.layanan || 'Go Pay 8.000';
    const nomorVal = data.nomor || '08134621611';

    drawFieldText('Nama', namaVal, line1Y);

    // Divider Line Neon 1
    const div1Y = boxY + 98;
    const divGrad = ctx.createLinearGradient(textLeftX, div1Y, boxX + boxW - 26, div1Y);
    divGrad.addColorStop(0, '#ff70a6');
    divGrad.addColorStop(0.3, '#38bdf8');
    divGrad.addColorStop(1, '#00e5ff');
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(textLeftX, div1Y);
    ctx.lineTo(boxX + boxW - 26, div1Y);
    ctx.stroke();

    drawFieldText('Layanan', layananVal, line2Y);

    // Divider Line Neon 2
    const div2Y = boxY + 196;
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(textLeftX, div2Y);
    ctx.lineTo(boxX + boxW - 26, div2Y);
    ctx.stroke();

    drawFieldText('Nomor', nomorVal, line3Y);

    // 4. Total Bayar (Neon Pink / Magenta Glowing Italic Bold)
    const totalBayar = Number(data.totalBayar || 13000);
    const totalBayarStr = `Total Bayar : Rp ${totalBayar.toLocaleString('id-ID')}`;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'italic 900 46px "Liberation Sans", "DejaVu Sans", Arial, sans-serif';
    ctx.fillStyle = '#ff3385';
    ctx.shadowColor = 'rgba(255, 51, 133, 0.95)';
    ctx.shadowBlur = 18;
    ctx.fillText(totalBayarStr, boxX + boxW / 2, 746);

    // Lapisan core putih untuk efek lampu tabung neon
    ctx.fillStyle = '#ffffff';
    ctx.font = 'italic 900 44px "Liberation Sans", "DejaVu Sans", Arial, sans-serif';
    ctx.shadowBlur = 4;
    ctx.fillText(totalBayarStr, boxX + boxW / 2, 746);
    ctx.restore();

    return canvas.toBuffer('image/png');
}
