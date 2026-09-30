import { createCanvas, loadImage, Image } from '@napi-rs/canvas';
import path from 'path';
import fs from 'fs';
import { downloadImageBuffer } from './stickerConfirmation';

export interface KonfirmasiData {
    nama?: string;
    layanan?: string;
    nomor?: string;
    totalBayar?: number;
    whatsapp?: string;
    customerWa?: string;
    buyerWa?: string;
    waPhotoUrl?: string | null;
    avatarBuffer?: Buffer | null;
}

let cachedTemplateImg: Image | null = null;

/**
 * Safely loads image from Buffer, HTTP/HTTPS URL, or local file path
 */
async function loadAvatarImage(input?: string | Buffer | null): Promise<any> {
    if (!input) return null;
    if (Buffer.isBuffer(input)) {
        try {
            return await loadImage(input);
        } catch (e) {
            return null;
        }
    }
    if (typeof input === 'string') {
        const str = input.trim();
        if (str.startsWith('http://') || str.startsWith('https://')) {
            // Metode Utama: https.get dengan IPv4 (Anti fetch failed di Armbian STB)
            try {
                const buf = await downloadImageBuffer(str);
                if (buf && buf.length > 0) {
                    const img = await loadImage(buf);
                    if (img) return img;
                }
            } catch (e) {}

            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 10000);
                const res = await fetch(str, {
                    signal: controller.signal,
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
                });
                clearTimeout(timeout);
                if (res.ok) {
                    const buf = Buffer.from(await res.arrayBuffer());
                    return await loadImage(buf);
                }
            } catch (e: any) {
                console.error("Gagal fetch avatar URL di konfirmasiReceipt:", e?.message || e?.toString() || JSON.stringify(e));
            }
        } else {
            const resolved = path.isAbsolute(str) ? str : path.resolve(process.cwd(), str);
            if (fs.existsSync(resolved)) {
                try {
                    const fileBuf = fs.readFileSync(resolved);
                    return await loadImage(fileBuf);
                } catch (e) {}
            }
        }
    }
    return null;
}

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

    // Load foto profil user jika ada
    let userAvatarImg: any = null;
    if (data.avatarBuffer) {
        userAvatarImg = await loadAvatarImage(data.avatarBuffer);
    }
    if (!userAvatarImg && data.waPhotoUrl) {
        userAvatarImg = await loadAvatarImage(data.waPhotoUrl);
    }

    // Auto-lookup jika belum ada
    if (!userAvatarImg) {
        try {
            const dbPath = path.join(process.cwd(), 'db.json');
            if (fs.existsSync(dbPath)) {
                const dbContent = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
                const photos = dbContent.waProfilePhotos || {};

                // 1. Cek dari nomor whatsapp yang dipassing di data
                const rawCand = data.whatsapp || data.customerWa || data.buyerWa || data.nomor;
                if (rawCand) {
                    const candClean = String(rawCand).replace(/\D/g, '').replace(/^0/, '62');
                    if (photos[candClean]) {
                        userAvatarImg = await loadAvatarImage(photos[candClean]);
                    }
                    if (!userAvatarImg) {
                        const localPath = path.join(process.cwd(), 'public', 'avatars', `${candClean}.jpg`);
                        if (fs.existsSync(localPath)) {
                            userAvatarImg = await loadAvatarImage(localPath);
                        }
                    }
                }

                // 2. Cek dari nama member
                if (!userAvatarImg && data.nama) {
                    const cLower = String(data.nama).trim().toLowerCase().replace(/^kak\s+/i, '');
                    const matchedMember = (dbContent.members || []).find((m: any) => m.name && m.name.trim().toLowerCase() === cLower);
                    if (matchedMember && matchedMember.whatsapp) {
                        const mClean = String(matchedMember.whatsapp).replace(/\D/g, '').replace(/^0/, '62');
                        if (photos[mClean]) {
                            userAvatarImg = await loadAvatarImage(photos[mClean]);
                        }
                        if (!userAvatarImg) {
                            const localPath = path.join(process.cwd(), 'public', 'avatars', `${mClean}.jpg`);
                            if (fs.existsSync(localPath)) {
                                userAvatarImg = await loadAvatarImage(localPath);
                            }
                        }
                    }
                }
            }
        } catch (e) {}
    }

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
        // Latar gelap elegan serasi dengan tema neon cyberpunk
        const bgGrad = ctx.createLinearGradient(avatarCenterX - avatarRadius, avatarCenterY - avatarRadius, avatarCenterX + avatarRadius, avatarCenterY + avatarRadius);
        bgGrad.addColorStop(0, '#0c1538');
        bgGrad.addColorStop(0.5, '#060b1e');
        bgGrad.addColorStop(1, '#03050f');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(avatarCenterX - avatarRadius, avatarCenterY - avatarRadius, avatarRadius * 2, avatarRadius * 2);

        // Elegant Neon Avatar Silhouette
        ctx.save();
        ctx.fillStyle = 'rgba(74, 222, 128, 0.4)';
        ctx.beginPath();
        ctx.arc(avatarCenterX, avatarCenterY - 32, 52, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(avatarCenterX, avatarCenterY + 105, 100, Math.PI * 1.15, Math.PI * 1.85);
        ctx.lineTo(avatarCenterX + 90, avatarCenterY + 140);
        ctx.lineTo(avatarCenterX - 90, avatarCenterY + 140);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
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
