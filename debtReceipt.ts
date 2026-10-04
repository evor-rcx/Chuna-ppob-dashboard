import { createCanvas, loadImage } from '@napi-rs/canvas';
import { resolveAvatarImage } from './royalStrukReceipt';
import { initGlobalFonts, UNICODE_FONT_STACK } from './fontHelper';
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

let cachedTemplateImg: any = null;
async function getTemplateImage() {
    if (cachedTemplateImg) return cachedTemplateImg;
    const candidates = [
        path.join(process.cwd(), 'Picsart_26-09-28_20-16-52-477.png'),
    ];
    for (const p of candidates) {
        if (fs.existsSync(p)) {
            try {
                const img = await loadImage(p);
                cachedTemplateImg = img;
                return img;
            } catch (e) {
                console.error("Failed to load template at " + p, e);
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

function getInitials(name: string): string {
    const clean = (name || '').replace(/^(kak|mas|mba|om|tante|bapak|ibu)\s+/i, '').trim();
    if (!clean) return 'E4';
    if (/selamat\s*datang\s*owner/i.test(clean)) return 'OW';
    const words = clean.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return clean.substring(0, 2).toUpperCase();
}

function drawCornerFiligree(ctx: any, cx: number, cy: number, flipX: boolean, flipY: boolean) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);

    ctx.strokeStyle = '#d4af37';
    ctx.fillStyle = '#d4af37';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';

    // Corner decorative curves
    ctx.beginPath();
    ctx.moveTo(0, 52);
    ctx.quadraticCurveTo(14, 24, 52, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(6, 44);
    ctx.quadraticCurveTo(18, 28, 44, 6);
    ctx.stroke();

    // Flourish spiral loops
    ctx.beginPath();
    ctx.arc(8, 14, 5, 0, Math.PI * 1.5, false);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(14, 8, 5, 0, Math.PI * 1.5, false);
    ctx.stroke();

    // Corner dots / beads
    ctx.beginPath();
    ctx.arc(4, 4, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(54, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 54, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

/**
 * Format teks pengumuman pelunasan / angsuran utang sesuai template yang diminta
 */
export function formatDebtSettlementMessage(data: DebtSettlementReceiptData): string {
    const totalDebt = data.totalDebt || 0;
    const dibayarkan = data.dibayarkan || 0;
    const isLunas = data.isLunasTotal !== undefined ? (data.isLunasTotal && dibayarkan >= totalDebt) : (dibayarkan >= totalDebt);
    const sisaUtang = data.sisaUtang !== undefined ? data.sisaUtang : (isLunas ? 0 : Math.max(0, totalDebt - dibayarkan));

    let rawName = (data.nama || 'Pelanggan').trim();
    let cleanName = rawName;
    const isOwner = rawName.toLowerCase().includes('owner');

    if (cleanName.toLowerCase().startsWith('kak ')) {
        cleanName = cleanName.substring(4).trim();
    } else if (cleanName.toLowerCase().startsWith('kak')) {
        cleanName = cleanName.substring(3).trim();
    }
    if (!cleanName || cleanName === '-' || cleanName === 'Kakak') {
        cleanName = 'Pelanggan';
    }

    const greetingName = isOwner ? 'Owner' : `Kak ${cleanName}`;

    if (isLunas) {
        return `🎉 Horee! Lunas, ${greetingName}!

Utang Rp ${totalDebt.toLocaleString('id-ID')} sudah dinyatakan LUNAS. Pembayaran tercatat Rp ${dibayarkan.toLocaleString('id-ID')}. Detail nota ada di gambar ya, Kak. 💪🔥

Terima kasih belanja di E4 Store! 🐾
Chuna ~ Asisten Imutmu siap bantu 24 jam! 😊💖`;
    } else {
        return `⏳ ${greetingName}, pembayaran sebagian sudah diterima!

Utang awal Rp ${totalDebt.toLocaleString('id-ID')}. Sudah dibayar Rp ${dibayarkan.toLocaleString('id-ID')}. Sisa Rp ${sisaUtang.toLocaleString('id-ID')} lagi ya, Kak. Rincian ada di gambar.

Chuna tunggu pelunasannya! 😊💖`;
    }
}

/**
 * Generate 1080x1080 Nota Pembayaran Lunas / Belum Lunas
 * Menggunakan template Picsart_26-09-28_20-16-52-477.png
 * - Foto profil WhatsApp otomatis menyatu di lingkaran transparan di bawah medali emas
 * - Tulisan rapi, tidak menimpa mentahan template
 * - Menghitung otomatis utang vs dibayarkan (lunas vs belum lunas/sisa utang)
 */
export async function generateDebtSettlementReceipt(data: DebtSettlementReceiptData): Promise<Buffer> {
    const width = 1080;
    const height = 1080;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const totalDebt = Number(data.totalDebt || 0);
    const dibayarkan = Number(data.dibayarkan || 0);
    // Otomatis hitung apakah uangnya pas, lebih (kembalian), atau kurang (sisa utang / angsuran)
    const isLunas = dibayarkan >= totalDebt;
    const kembalian = Math.max(0, dibayarkan - totalDebt);
    const sisaUtang = Math.max(0, totalDebt - dibayarkan);

    // 1. WhatsApp Avatar di bawah medali lingkaran emas (Center X: 546.5, Y: 194.5, Radius: 96)
    const avatarCenterX = 546.5;
    const avatarCenterY = 194.5;
    const avatarRadius = 96;

    // Load WhatsApp Avatar (mendukung foto member offline lokal, base64, url)
    const userAvatarImg = await resolveAvatarImage(data.waPhotoUrl, data.avatarBuffer);

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
        const monoGrad = ctx.createLinearGradient(avatarCenterX - avatarRadius, avatarCenterY - avatarRadius, avatarCenterX + avatarRadius, avatarCenterY + avatarRadius);
        monoGrad.addColorStop(0, '#2d2516');
        monoGrad.addColorStop(0.5, '#1e1a11');
        monoGrad.addColorStop(1, '#110f0a');
        ctx.fillStyle = monoGrad;
        ctx.fillRect(avatarCenterX - avatarRadius, avatarCenterY - avatarRadius, avatarRadius * 2, avatarRadius * 2);

        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 54px "DejaVu Sans", "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(212, 175, 55, 0.9)';
        ctx.shadowBlur = 12;
        ctx.fillText(getInitials(data.nama), avatarCenterX, avatarCenterY);
        ctx.shadowBlur = 0;
    }
    ctx.restore();

    // 2. Render Template Mentahan (Picsart_26-09-28_20-16-52-477.png) di atas foto profil
    // Lingkaran transparan otomatis menampilkan foto profil WA di bawah medali emas!
    const templateImg = await getTemplateImage();
    if (templateImg) {
        ctx.drawImage(templateImg, 0, 0, width, height);
    }

    // 3. Helper untuk teks super jelas, tebal, dan tajam (kontras tinggi dengan drop shadow hitam pekat)
    function drawCrispText(text: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = 'left', shadowBlur = 4) {
        ctx.save();
        ctx.textAlign = align;
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1.5;
        ctx.fillText(text, x, y);
        ctx.restore();
    }

    // Atas Nama (Header E4 STORE & NOTA PEMBAYARAN LUNAS sudah ada di mentahan)
    initGlobalFonts();
    const cleanCustomerName = (data.nama || 'Kakak').trim();
    drawCrispText(
        `Atas Nama: ${cleanCustomerName.startsWith('Kak') ? cleanCustomerName : 'Kak ' + cleanCustomerName}`,
        avatarCenterX,
        446,
        `bold 30px ${UNICODE_FONT_STACK}`,
        '#ffffff',
        'center',
        8
    );

    // 4. Data Transaksi di Kolom Kiri
    const leftX = 135;
    const rightColX = 405;

    let productText = '';
    if (data.products && data.products.length > 0) {
        if (data.products.length === 1) {
            productText = `${data.products[0].name} – Rp ${data.products[0].price.toLocaleString('id-ID')}`;
        } else {
            productText = data.products.map(p => p.name).join(', ');
            if (productText.length > 30) {
                productText = productText.slice(0, 28) + '...';
            }
            productText += ` – Rp ${totalDebt.toLocaleString('id-ID')}`;
        }
    } else {
        productText = `Tagihan Transaksi – Rp ${totalDebt.toLocaleString('id-ID')}`;
    }

    drawCrispText('RINCIAN PRODUK', leftX, 526, 'bold 20px "Liberation Sans", "DejaVu Sans", Arial, sans-serif', '#fde047');
    drawCrispText(productText, leftX, 560, 'bold 26px "Liberation Sans", "DejaVu Sans", Arial, sans-serif', '#ffffff');

    // Divider Line Horizontal
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(leftX, 582);
    ctx.lineTo(660, 582);
    ctx.stroke();

    // Vertical Divider Line antara Tanggal Transaksi & Rincian Pembayaran
    ctx.beginPath();
    ctx.moveTo(380, 604);
    ctx.lineTo(380, 786);
    ctx.stroke();

    // TANGGAL TRANSAKSI & RINCIAN PEMBAYARAN
    drawCrispText('TANGGAL TRANSAKSI', leftX, 622, 'bold 18px "Liberation Sans", "DejaVu Sans", Arial, sans-serif', '#fde047');
    drawCrispText('RINCIAN PEMBAYARAN', rightColX, 622, 'bold 18px "Liberation Sans", "DejaVu Sans", Arial, sans-serif', '#fde047');

    drawCrispText('Tanggal Utang:', leftX, 672, 'bold 19px "Liberation Sans", "DejaVu Sans", Arial, sans-serif', '#ffffff');
    drawCrispText(data.tglBayar ? 'Tanggal Bayar:' : '19 September 2026', rightColX, 672, 'bold 19px "Liberation Sans", "DejaVu Sans", Arial, sans-serif', '#ffffff');

    drawCrispText('• Dibayarkan:', leftX, 736, 'bold 20px "Liberation Sans", "DejaVu Sans", Arial, sans-serif', '#ffffff');
    drawCrispText(`Rp ${dibayarkan.toLocaleString('id-ID')}`, leftX, 768, 'bold 25px "Liberation Sans", "DejaVu Sans", Arial, sans-serif', '#ffffff');

    if (isLunas) {
        drawCrispText('• Kembalian:', rightColX, 736, 'bold 20px "Liberation Sans", "DejaVu Sans", Arial, sans-serif', '#ffffff');
        drawCrispText(`Rp ${kembalian.toLocaleString('id-ID')}`, rightColX, 768, 'bold 25px "Liberation Sans", "DejaVu Sans", Arial, sans-serif', '#ffffff');

        // STATUS LUNAS (Ekstra besar 56px, 900 Ultra-Bold)
        drawCrispText('STATUS LUNAS', leftX, 838, '900 56px "Liberation Sans", "DejaVu Sans", Arial, sans-serif', '#ffffff', 'left', 12);
    } else {
        drawCrispText('• Sisa Utang:', rightColX, 736, 'bold 20px "Liberation Sans", "DejaVu Sans", Arial, sans-serif', '#f87171');
        drawCrispText(`Rp ${sisaUtang.toLocaleString('id-ID')}`, rightColX, 768, 'bold 25px "Liberation Sans", "DejaVu Sans", Arial, sans-serif', '#f87171');

        // STATUS BELUM LUNAS (Ekstra besar 48px, 900 Ultra-Bold)
        drawCrispText('STATUS BELUM LUNAS', leftX, 838, '900 48px "Liberation Sans", "DejaVu Sans", Arial, sans-serif', '#f87171', 'left', 12);
    }

    // 5. Footer (Sangat Jelas & Terbaca)
    drawCrispText('Terima kasih sudah percaya sama kami.', leftX, 896, 'bold 17px "Liberation Sans", "DejaVu Sans", Arial, sans-serif', '#ffffff');
    drawCrispText('Jangan lupa, Chuna - Asisten Imutmu siap bantu 24 jam!', leftX, 924, 'bold 17px "Liberation Sans", "DejaVu Sans", Arial, sans-serif', '#ffffff');
    drawCrispText('Kalau ada yang mau ditanyain lagi ya, Kak.', leftX, 952, 'bold 17px "Liberation Sans", "DejaVu Sans", Arial, sans-serif', '#ffffff');

    return canvas.toBuffer('image/png');
}
