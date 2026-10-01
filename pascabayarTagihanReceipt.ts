import { createCanvas, loadImage, Image } from '@napi-rs/canvas';
import { resolveAvatarImage } from './royalStrukReceipt';
import path from 'path';
import fs from 'fs';
import { getHolidayInfo, getWitaDateComponents } from './src/utils/holidays';

export interface PascabayarTagihanData {
    nama?: string;
    customer_name?: string;
    namaPlg?: string;
    nomor?: string;
    no?: string;
    customer_no?: string;
    target?: string;
    layanan?: string;
    product?: any;
    total?: number;
    price?: number;
    tagihan?: number;
    selling_price?: number;
    lembar?: string | number;
    bulan?: string;
    periode?: string;
    meter?: string;
    tarif?: string;
    daya?: string | number;
    detail?: any;
    desc?: any;
    date?: Date | string;
    kode?: string;
    waPhotoUrl?: string | null;
    avatarBuffer?: Buffer | null;
}

let cachedTemplateImg: Image | null = null;

async function getPascabayarTemplate(): Promise<Image | null> {
    if (cachedTemplateImg) return cachedTemplateImg;
    const candidates = [
        path.join(process.cwd(), 'Picsart_26-09-28_23-03-28-209.png'),
        'Picsart_26-09-28_23-03-28-209.png'
    ];
    for (const p of candidates) {
        if (fs.existsSync(p)) {
            try {
                cachedTemplateImg = await loadImage(p);
                return cachedTemplateImg;
            } catch (e) {
                console.error("Gagal load Picsart Pascabayar template:", p, e);
            }
        }
    }
    return null;
}

function getInitials(name: string): string {
    const clean = (name || '').replace(/^(kak|mas|mba|om|tante|bapak|ibu)\s+/i, '').replace(/[\*\_\-]/g, '').trim();
    if (!clean) return 'E4';
    const words = clean.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return clean.substring(0, 2).toUpperCase();
}

/**
 * Format Text Pesan WhatsApp / Telegram untuk Cek Tagihan Pascabayar
 */
export function formatPascabayarTagihanMessage(data: PascabayarTagihanData): string {
    const nama = data.nama || data.customer_name || data.namaPlg || 'A*D* *A*A*U*D*N';
    const nomor = data.nomor || data.no || data.customer_no || data.target || '234000182643';
    
    let layanan = data.layanan || data.product || 'Pln Pascabayar';
    if (typeof layanan === 'object' && layanan) layanan = layanan.product_name || 'Pln Pascabayar';
    if (typeof layanan === 'string' && layanan.includes(' - ')) {
        layanan = layanan.split(' - ')[0].trim();
    }

    const total = Number(data.total || data.price || data.tagihan || data.selling_price || 119283);

    // Lembar, Bulan, Meter, Tarif, Daya
    let lembar = data.lembar || data.desc?.lembar_tagihan || '1';
    let bulan = data.bulan || data.periode || '202607';
    let meter = data.meter || '';
    let tarif = data.tarif || data.desc?.tarif || 'R1M';
    let daya = data.daya || data.desc?.daya || '900';

    if (!meter && data.desc?.detail && Array.isArray(data.desc.detail) && data.desc.detail.length > 0) {
        const first = data.desc.detail[0];
        if (first.periode) bulan = first.periode;
        if (first.meter_awal && first.meter_akhir) {
            meter = `${first.meter_awal} - ${first.meter_akhir}`;
        }
    }
    if (!meter) meter = '00007792 - 00007870';

    if (typeof data.detail === 'string') {
        if (!tarif) {
            const m = data.detail.match(/Tarif[:\s]+([^\n\r]+)/i);
            if (m) tarif = m[1].replace(/^[⚡\s]+/, '').trim();
        }
        if (!daya) {
            const m = data.detail.match(/Daya[:\s]+([^\n\r]+)/i);
            if (m) daya = m[1].replace(/^[📊\s]+/, '').trim();
        }
        if (!lembar || lembar === '1') {
            const m = data.detail.match(/Lembar[:\s]+([^\n\r]+)/i);
            if (m) lembar = m[1].replace(/^[📄\s]+/, '').trim();
        }
        if (!bulan || bulan === '202607') {
            const m = data.detail.match(/Bulan\s*(\d*[:\s]+)?([^\n\r]+)/i);
            if (m) bulan = (m[2] || m[1] || '').replace(/^[📆\s]+/, '').trim();
        }
        if (!meter || meter === '00007792 - 00007870') {
            const m = data.detail.match(/Meter[:\s]+([^\n\r]+)/i);
            if (m) meter = m[1].replace(/^[🔢\s]+/, '').trim();
        }
    }

    // Tanggal Cetak & Hari Nasional
    const txDate = data.date ? new Date(data.date) : new Date();
    const dateStr = txDate.toLocaleDateString('id-ID', {
        timeZone: 'Asia/Makassar',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    const timeStr = txDate.toLocaleTimeString('id-ID', {
        timeZone: 'Asia/Makassar',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    const formattedDate = `${dateStr} ${timeStr} WITA`;

    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const { year, month, day } = getWitaDateComponents(txDate);
    const witaDate = new Date(year, month - 1, day);
    const dayName = days[witaDate.getDay()];

    const holiday = getHolidayInfo(txDate);
    let calText = `${dayName}, Hari Besar Nasional`;
    if (holiday) {
        if (holiday.isToday) {
            calText = `${dayName}, ${holiday.name} (Hari Ini)`;
        } else {
            calText = `${dayName}, ${holiday.name} (${holiday.diffDays} hari lagi)`;
        }
    } else {
        calText = `${dayName}, Hari Kemerdekaan RI (29 hari lagi)`;
    }

    const kode = data.kode || '#E4';

    return `E4 STORE
Cek Tagihan

Tagihan Ditemukan!

----------------------------------------
Nama                         ${nama}
Nomor                        ${nomor}
Layanan                      ${layanan}
----------------------------------------

TOTAL BAYAR    Lembar ${lembar}      Rp ${total.toLocaleString('id-ID')}
Bulan 1 : ${bulan}             Meter: ${meter}
Tarif: ${tarif}                   Daya: ${daya}

Silahkan Lanjutkan Pembayaran

----------------------------------------
Terima kasih telah berbelanja di E4 Store!
Cetak: ${formattedDate} | Kode: ${kode}
${calText}`;
}

/**
 * Gambar vector icon tangan telunjuk (Hand pointer cursor)
 */
function drawPointerCursor(ctx: any, x: number, y: number, scale = 1.0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Ripple click arcs at index fingertip
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(8, -19, 5, -0.6 * Math.PI, 0.05 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(8, -19, 9, -0.7 * Math.PI, 0.15 * Math.PI);
    ctx.stroke();

    // Hand cursor path
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    // Wrist base left
    ctx.moveTo(-10, 15);
    // Outer palm edge
    ctx.lineTo(-7, 2);
    // Thumb
    ctx.lineTo(-12, -2);
    ctx.arc(-11, -5, 3.5, 0.5 * Math.PI, -0.5 * Math.PI, true);
    ctx.lineTo(-4, -4);
    // Index finger going straight up
    ctx.lineTo(4, -18);
    // Index finger tip
    ctx.arc(7.5, -17, 3.8, -0.9 * Math.PI, 0.1 * Math.PI);
    // Index finger inner side down
    ctx.lineTo(4, -3);
    // Middle finger
    ctx.arc(7.5, 0, 3.5, -0.5 * Math.PI, 0.5 * Math.PI);
    // Ring finger
    ctx.arc(6.5, 6, 3.5, -0.5 * Math.PI, 0.5 * Math.PI);
    // Pinky finger
    ctx.arc(5, 12, 3.5, -0.5 * Math.PI, 0.5 * Math.PI);
    // Wrist base right
    ctx.lineTo(-4, 17);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
}

/**
 * Generate 1080x1080 Nota Cek Tagihan Pascabayar (Picsart_26-09-28_23-03-28-209.png)
 * - Foto profil WhatsApp ditaruh di dalam lingkaran transparan (Center X: 199.5, Y: 943.5, Radius: 104)
 * - Template mentahan Picsart digambar di atas foto profil
 * - Data Tagihan (Nama, Nomor, Layanan, TOTAL BAYAR, Lembar, Bulan, Meter, Tarif, Daya)
 * - Centered "Silahkan Lanjutkan Pembayaran" dengan ikon tangan telunjuk
 * - Footer resmi E4 Store dengan kalender & hari besar
 */
export async function generatePascabayarTagihanReceipt(data: PascabayarTagihanData): Promise<Buffer> {
    const templateImg = await getPascabayarTemplate();
    const width = templateImg ? templateImg.width : 1080;
    const height = templateImg ? templateImg.height : 1080;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Lingkaran Foto Profil WhatsApp di Mentahan
    const avatarCx = 199.5;
    const avatarCy = 943.5;
    const avatarRadius = 104;

    // Load foto profil WA jika ada (mendukung foto member offline lokal, base64, url)
    const userAvatarImg = await resolveAvatarImage(data.waPhotoUrl, data.avatarBuffer);

    // Latar belakang dasar putih di bawah lingkaran
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Render Foto Profil di Lingkaran Dasar
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarCx, avatarCy, avatarRadius, 0, Math.PI * 2);
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
            avatarCx - avatarRadius,
            avatarCy - avatarRadius,
            avatarRadius * 2,
            avatarRadius * 2
        );
    } else {
        const grad = ctx.createLinearGradient(
            avatarCx - avatarRadius,
            avatarCy - avatarRadius,
            avatarCx + avatarRadius,
            avatarCy + avatarRadius
        );
        grad.addColorStop(0, '#0284c7');
        grad.addColorStop(0.5, '#0369a1');
        grad.addColorStop(1, '#075985');
        ctx.fillStyle = grad;
        ctx.fillRect(
            avatarCx - avatarRadius,
            avatarCy - avatarRadius,
            avatarRadius * 2,
            avatarRadius * 2
        );

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 54px "Liberation Sans", "DejaVu Sans", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 8;
        ctx.fillText(getInitials(data.nama || data.customer_name || 'E4'), avatarCx, avatarCy);
        ctx.shadowBlur = 0;
    }
    ctx.restore();

    // 2. Gambar Mentahan Template DI ATAS Foto
    // Lingkaran transparan mentahan beserta badge "+" otomatis membingkai foto profil secara sempurna
    if (templateImg) {
        ctx.drawImage(templateImg, 0, 0, width, height);
    }

    // Helper untuk garis pembatas tipis abu-abu
    const leftX = 118;
    const rightX = 962;

    function drawThinDivider(y: number) {
        ctx.save();
        ctx.strokeStyle = 'rgba(203, 213, 225, 0.85)'; // Slate 300
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(leftX, y);
        ctx.lineTo(rightX, y);
        ctx.stroke();
        ctx.restore();
    }

    // Helper untuk garis pembatas dekoratif dengan ornamen pita/swirl di tengah
    function drawDecorativeDivider(y: number) {
        const midX = (leftX + rightX) / 2;
        const gap = 44;

        ctx.save();
        ctx.strokeStyle = '#64748b'; // Slate 500
        ctx.lineWidth = 3.5;

        // Garis kiri
        ctx.beginPath();
        ctx.moveTo(leftX, y);
        ctx.lineTo(midX - gap, y);
        ctx.stroke();

        // Garis kanan
        ctx.beginPath();
        ctx.moveTo(midX + gap, y);
        ctx.lineTo(rightX, y);
        ctx.stroke();

        // Ornamen pita swirl di tengah (matching mentahan atas)
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(midX - 16, y - 3.5, 11, 0, Math.PI, true);
        ctx.arc(midX - 4, y, 5.5, Math.PI, 0, false);
        ctx.arc(midX + 4, y, 5.5, Math.PI, 0, true);
        ctx.arc(midX + 16, y + 3.5, 11, Math.PI, 0, true);
        ctx.stroke();
        ctx.restore();
    }

    // 3. Render Baris Data: Nama, Nomor, Layanan
    const namaVal = data.nama || data.customer_name || data.namaPlg || 'A*D* *A*A*U*D*N';
    const nomorVal = data.nomor || data.no || data.customer_no || data.target || '234000182643';

    let layananVal = data.layanan || data.product || 'Pln Pascabayar';
    if (typeof layananVal === 'object' && layananVal) layananVal = layananVal.product_name || 'Pln Pascabayar';
    if (typeof layananVal === 'string' && layananVal.includes(' - ')) {
        layananVal = layananVal.split(' - ')[0].trim();
    }

    // Row 1: Nama
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0f172a';
    ctx.font = '500 35px "Liberation Sans", "DejaVu Sans", Arial, sans-serif';
    ctx.fillText('Nama', leftX, 380);

    ctx.textAlign = 'right';
    ctx.font = 'bold 35px "Liberation Sans", "DejaVu Sans", Arial, sans-serif';
    ctx.fillText(namaVal, rightX, 380);

    drawThinDivider(412);

    // Row 2: Nomor
    ctx.textAlign = 'left';
    ctx.font = '500 35px "Liberation Sans", "DejaVu Sans", Arial, sans-serif';
    ctx.fillText('Nomor', leftX, 442);

    ctx.textAlign = 'right';
    ctx.font = 'bold 35px "Liberation Sans", "DejaVu Sans", Arial, sans-serif';
    ctx.fillText(nomorVal, rightX, 442);

    drawThinDivider(474);

    // Row 3: Layanan
    ctx.textAlign = 'left';
    ctx.font = '500 35px "Liberation Sans", "DejaVu Sans", Arial, sans-serif';
    ctx.fillText('Layanan', leftX, 502);

    ctx.textAlign = 'right';
    ctx.font = 'bold 35px "Liberation Sans", "DejaVu Sans", Arial, sans-serif';
    ctx.fillText(layananVal, rightX, 502);

    // Pembatas Dekoratif Tengah
    drawDecorativeDivider(536);

    // 4. Baris TOTAL BAYAR
    const totalVal = Number(data.total || data.price || data.tagihan || data.selling_price || 119283);
    const totalStr = `Rp ${totalVal.toLocaleString('id-ID')}`;

    let lembarVal = data.lembar || data.desc?.lembar_tagihan || '1';
    let bulanVal = data.bulan || data.periode || '202607';
    let meterVal = data.meter || '';
    let tarifVal = data.tarif || data.desc?.tarif || 'R1M';
    let dayaVal = data.daya || data.desc?.daya || '900';

    if (!meterVal && data.desc?.detail && Array.isArray(data.desc.detail) && data.desc.detail.length > 0) {
        const first = data.desc.detail[0];
        if (first.periode) bulanVal = first.periode;
        if (first.meter_awal && first.meter_akhir) {
            meterVal = `${first.meter_awal} - ${first.meter_akhir}`;
        }
    }
    if (!meterVal) meterVal = '00007792 - 00007870';

    if (typeof data.detail === 'string') {
        if (!tarifVal) {
            const m = data.detail.match(/Tarif[:\s]+([^\n\r]+)/i);
            if (m) tarifVal = m[1].replace(/^[⚡\s]+/, '').trim();
        }
        if (!dayaVal) {
            const m = data.detail.match(/Daya[:\s]+([^\n\r]+)/i);
            if (m) dayaVal = m[1].replace(/^[📊\s]+/, '').trim();
        }
        if (!lembarVal || lembarVal === '1') {
            const m = data.detail.match(/Lembar[:\s]+([^\n\r]+)/i);
            if (m) lembarVal = m[1].replace(/^[📄\s]+/, '').trim();
        }
        if (!bulanVal || bulanVal === '202607') {
            const m = data.detail.match(/Bulan\s*(\d*[:\s]+)?([^\n\r]+)/i);
            if (m) bulanVal = (m[2] || m[1] || '').replace(/^[📆\s]+/, '').trim();
        }
        if (!meterVal || meterVal === '00007792 - 00007870') {
            const m = data.detail.match(/Meter[:\s]+([^\n\r]+)/i);
            if (m) meterVal = m[1].replace(/^[🔢\s]+/, '').trim();
        }
    }

    // "TOTAL BAYAR" (Extra Bold Black)
    ctx.textAlign = 'left';
    ctx.fillStyle = '#000000';
    ctx.font = '900 42px "Liberation Sans", "DejaVu Sans", Arial, sans-serif';
    ctx.fillText('TOTAL BAYAR', leftX, 584);

    // "Lembar 1"
    ctx.fillStyle = '#0f172a';
    ctx.font = '600 32px "Liberation Sans", "DejaVu Sans", Arial, sans-serif';
    ctx.fillText(`Lembar ${lembarVal}`, 480, 584);

    // "Rp 119.283" (Extra Bold Black)
    ctx.textAlign = 'right';
    ctx.fillStyle = '#000000';
    ctx.font = '900 48px "Liberation Sans", "DejaVu Sans", Arial, sans-serif';
    ctx.fillText(totalStr, rightX, 584);

    // Row 5: Bulan & Meter
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 31px "Liberation Sans", "DejaVu Sans", Arial, sans-serif';
    ctx.fillText(`Bulan 1 : ${bulanVal}`, leftX, 646);

    ctx.textAlign = 'right';
    ctx.fillText(`Meter: ${meterVal}`, rightX, 646);

    // Row 6: Tarif & Daya
    ctx.textAlign = 'left';
    ctx.fillText(`Tarif: ${tarifVal}`, leftX, 704);

    ctx.textAlign = 'right';
    ctx.fillText(`Daya: ${dayaVal}`, rightX, 704);

    // Row 7: "Silahkan Lanjutkan Pembayaran" + Vector Hand Cursor
    const actionText = 'Silahkan Lanjutkan Pembayaran';
    ctx.font = 'bold 35px "Liberation Sans", "DejaVu Sans", Arial, sans-serif';
    const textWidth = ctx.measureText(actionText).width;
    const handWidth = 36;
    const totalRowWidth = textWidth + 14 + handWidth;
    const startRowX = (width - totalRowWidth) / 2;

    ctx.textAlign = 'left';
    ctx.fillStyle = '#000000';
    ctx.fillText(actionText, startRowX, 756);

    // Gambar icon tangan cursor persis di samping kanan teks
    drawPointerCursor(ctx, startRowX + textWidth + 24, 756, 1.25);

    // Pembatas Dekoratif Bawah
    drawDecorativeDivider(828);

    // 5. Footer Resmi
    const txDate = data.date ? new Date(data.date) : new Date();
    const dateStr = txDate.toLocaleDateString('id-ID', {
        timeZone: 'Asia/Makassar',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    const timeStr = txDate.toLocaleTimeString('id-ID', {
        timeZone: 'Asia/Makassar',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    const formattedDate = `${dateStr} ${timeStr} WITA`;

    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const { year, month, day } = getWitaDateComponents(txDate);
    const witaDate = new Date(year, month - 1, day);
    const dayName = days[witaDate.getDay()];

    const holiday = getHolidayInfo(txDate);
    let calText = `${dayName}, Hari Besar Nasional`;
    if (holiday) {
        if (holiday.isToday) {
            calText = `${dayName}, ${holiday.name} (Hari Ini)`;
        } else {
            calText = `${dayName}, ${holiday.name} (${holiday.diffDays} hari lagi)`;
        }
    } else {
        calText = `${dayName}, Hari Kemerdekaan RI (29 hari lagi)`;
    }

    const kode = data.kode || '#E4';
    const footerLeftX = 330;

    ctx.textAlign = 'left';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 27px "Liberation Sans", "DejaVu Sans", Arial, sans-serif';
    ctx.fillText('Terima kasih telah berbelanja di E4 Store!', footerLeftX, 856);

    ctx.font = '600 24px "Liberation Sans", "DejaVu Sans", Arial, sans-serif';
    ctx.fillText(`Cetak: ${formattedDate} | Kode: ${kode}`, footerLeftX, 894);

    ctx.font = '600 24px "Liberation Sans", "DejaVu Sans", Arial, sans-serif';
    ctx.fillText(calText, footerLeftX, 930);

    return canvas.toBuffer('image/png');
}
