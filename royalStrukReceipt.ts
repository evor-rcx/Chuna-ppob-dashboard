import { createCanvas, loadImage } from '@napi-rs/canvas';
import path from 'path';
import fs from 'fs';

export interface RoyalStrukData {
    nama: string;
    status?: string;
    metode?: string;
    templateVariant?: 'lunas' | 'tidaklunas';
    
    // Product / Item info
    product?: string;
    itemGame?: string;
    layanan?: string;
    pembelian?: string;
    type?: string;
    sku?: string;
    
    // Target ID info
    target?: string;
    idTujuanGame?: string;
    idPelanggan?: string;
    noMeter?: string;
    noHp?: string;
    no?: string;
    
    // PLN Token & Pascabayar specific info
    namaPlg?: string;
    nama_pelanggan?: string;
    customer_name?: string;
    tarif?: string;
    daya?: string;
    golDaya?: string;
    gol_daya?: string;
    kwh?: string;
    lembar?: string | number;
    lembar_tagihan?: string | number;
    bulan?: string;
    periode?: string;
    meter?: string;
    admin?: number;
    tagihan?: number;
    desc?: any;
    detail?: any;
    
    // Order & SN details
    orderId?: string;
    id?: string;
    tanggal?: string;
    date?: string | Date;
    sn?: string;
    token?: string;
    totalBayar?: number;
    price?: number;
    total?: number;
    
    cetakDate?: string;
    holidayNotice?: string;
    whatsapp?: string;
    customerWa?: string;
    buyerWa?: string;
    waPhotoUrl?: string | null;
    avatarBuffer?: Buffer | null;
}

let cachedLunasTemplateImg: any = null;
let cachedTidakLunasTemplateImg: any = null;

async function getLunasTemplateImage() {
    if (cachedLunasTemplateImg) return cachedLunasTemplateImg;
    // Template Royal Mahkota Emas Lunas (2048x2048)
    const candidates = [
        path.join(process.cwd(), 'Picsart_26-09-28_17-56-42-115.png'),
        path.join(process.cwd(), 'Picsart_26-09-28_16-14-54-020.jpg')
    ];
    for (const p of candidates) {
        if (fs.existsSync(p)) {
            try {
                cachedLunasTemplateImg = await loadImage(p);
                return cachedLunasTemplateImg;
            } catch (e) {
                console.error("Gagal load Picsart Lunas template dari", p, e);
            }
        }
    }
    return null;
}

async function getTidakLunasTemplateImage() {
    if (cachedTidakLunasTemplateImg) return cachedTidakLunasTemplateImg;
    // Template Gothic Steampunk Tidak Lunas (1024x1024)
    const candidates = [
        path.join(process.cwd(), 'Picsart_26-09-28_17-53-27-094.png'),
        path.join(process.cwd(), 'Picsart_26-09-28_17-48-51-441.jpg')
    ];
    for (const p of candidates) {
        if (fs.existsSync(p)) {
            try {
                cachedTidakLunasTemplateImg = await loadImage(p);
                return cachedTidakLunasTemplateImg;
            } catch (e) {
                console.error("Gagal load Picsart Tidak Lunas template dari", p, e);
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

/**
 * Deteksi Kategori Produk & Menentukan Data Lengkap untuk Token Listrik & PLN Pascabayar
 */
export function detectProductCategory(data: RoyalStrukData) {
    const prodName = String(
        data.itemGame || data.product || data.layanan || data.pembelian || 'PLN 20.000'
    ).trim();
    const prodLower = prodName.toLowerCase();
    const typeLower = String(data.type || '').toLowerCase();
    const skuLower = String(data.sku || '').toLowerCase();

    // Deteksi Pascabayar
    const isPascabayar = typeLower.includes('pasca') || 
                         prodLower.includes('pascabayar') || 
                         prodLower.includes('tagihan') || 
                         prodLower.includes('pdam') || 
                         prodLower.includes('bpjs');

    // Deteksi PLN
    const isPln = typeLower.includes('pln') || 
                  prodLower.includes('pln') || 
                  prodLower.includes('listrik') || 
                  prodLower.includes('token') || 
                  skuLower.includes('pln');

    const isPlnPascabayar = isPln && isPascabayar;
    const isTokenListrik = isPln && !isPascabayar;

    // Deteksi Game
    const isGame = typeLower.includes('game') || 
                   prodLower.includes('game') || 
                   prodLower.includes('free fire') || 
                   prodLower.includes('mobile legends') || 
                   prodLower.includes('diamond') || 
                   prodLower.includes('dm ') || 
                   prodLower.includes('magic chess') || 
                   prodLower.includes('genshin') || 
                   prodLower.includes('pubg') || 
                   prodLower.includes('valorant') || 
                   prodLower.includes('roblox') || 
                   prodLower.includes('steam') || 
                   prodLower.includes('point blank') || 
                   skuLower.includes('game');

    // Deteksi E-Wallet / E-Money
    const isEmoney = typeLower.includes('e-money') || 
                     typeLower.includes('emoney') || 
                     typeLower.includes('ewallet') || 
                     typeLower.includes('wallet') || 
                     prodLower.includes('dana') || 
                     prodLower.includes('gopay') || 
                     prodLower.includes('ovo') || 
                     prodLower.includes('shopeepay') || 
                     prodLower.includes('linkaja') || 
                     prodLower.includes('maxim') || 
                     prodLower.includes('isaku');

    // Target ID
    let targetVal = String(
        data.idPelanggan || data.noMeter || data.idTujuanGame || data.target || data.no || data.noHp || '32185604272'
    ).trim();

    // Data Lengkap PLN
    let namaPlg = data.namaPlg || data.nama_pelanggan || data.customer_name || '';
    let tarif = data.tarif || data.desc?.tarif || '';
    let daya = data.daya || data.desc?.daya || '';
    let golDaya = data.golDaya || data.gol_daya || '';
    let kwh = data.kwh || '';
    let lembar = data.lembar || data.lembar_tagihan || data.desc?.lembar_tagihan || '1';
    let bulan = data.bulan || data.periode || '';
    let meter = data.meter || '';

    // Ambil detail jika format string dari Digiflazz
    if (typeof data.detail === 'string') {
        if (!tarif) {
            const m = data.detail.match(/Tarif[:\s]+([^\n\r]+)/i);
            if (m) tarif = m[1].replace(/^[⚡\s]+/, '').trim();
        }
        if (!daya) {
            const m = data.detail.match(/Daya[:\s]+([^\n\r]+)/i);
            if (m) daya = m[1].replace(/^[📊\s]+/, '').trim();
        }
        if (!lembar) {
            const m = data.detail.match(/Lembar[:\s]+([^\n\r]+)/i);
            if (m) lembar = m[1].replace(/^[📄\s]+/, '').trim();
        }
        if (!bulan) {
            const m = data.detail.match(/Bulan\s*(\d*[:\s]+)?([^\n\r]+)/i);
            if (m) bulan = (m[2] || m[1] || '').replace(/^[📆\s]+/, '').trim();
        }
        if (!meter) {
            const m = data.detail.match(/Meter[:\s]+([^\n\r]+)/i);
            if (m) meter = m[1].replace(/^[🔢\s]+/, '').trim();
        }
    }

    if (!bulan && data.desc?.detail && Array.isArray(data.desc.detail) && data.desc.detail.length > 0) {
        const first = data.desc.detail[0];
        bulan = first.periode || '';
        if (first.meter_awal && first.meter_akhir) {
            meter = `${first.meter_awal} - ${first.meter_akhir}`;
        }
    }

    // Parsing Token PLN dari format Digiflazz: TOKEN/NAMA/TARIF-DAYA/KWH
    let rawSn = String(data.sn || data.token || '0585-9340-6917-6385-5660').trim();
    let tokenDigits = '';
    let refIdText = '';

    if (isTokenListrik && rawSn.includes('/')) {
        const parts = rawSn.split('/');
        tokenDigits = parts[0].trim();
        if (!namaPlg && parts[1]) namaPlg = parts[1].trim();
        if (!golDaya && parts.length > 3) {
            golDaya = `${parts[2]} / ${parts[3]}`.trim();
            if (!kwh && parts[4]) kwh = parts[4].trim();
        } else if (!golDaya && parts.length === 3) {
            golDaya = parts[2].trim();
        }
    } else if (isTokenListrik && rawSn.replace(/\D/g, '').length === 20) {
        tokenDigits = rawSn.replace(/\D/g, '');
    }

    // Format 20 digit token listrik dengan strip (XXXX-XXXX-XXXX-XXXX-XXXX)
    let formattedToken = '';
    if (tokenDigits && tokenDigits.replace(/\D/g, '').length === 20) {
        const d = tokenDigits.replace(/\D/g, '');
        formattedToken = `${d.slice(0, 4)}-${d.slice(4, 8)}-${d.slice(8, 12)}-${d.slice(12, 16)}-${d.slice(16, 20)}`;
    } else if (rawSn.replace(/\D/g, '').length === 20) {
        const d = rawSn.replace(/\D/g, '');
        formattedToken = `${d.slice(0, 4)}-${d.slice(4, 8)}-${d.slice(8, 12)}-${d.slice(12, 16)}-${d.slice(16, 20)}`;
    }

    // Susun Golongan & Daya
    if (!golDaya && (tarif || daya)) {
        if (tarif && daya) {
            golDaya = `${tarif} / ${daya}`;
        } else {
            golDaya = `${tarif || daya}`;
        }
    }

    // Nilai Default yang realistis jika data kosong saat demo/preview
    if (isTokenListrik) {
        if (!namaPlg) namaPlg = 'YOHANIS-AF';
        if (!golDaya) golDaya = 'R1 / 000000900';
        if (!kwh) kwh = '13.2 kWh';
        if (!formattedToken) formattedToken = '0585-9340-6917-6385-5660';
        refIdText = 'NO. REF: PLN-260924XD2H4IF01V';
    } else if (isPlnPascabayar) {
        if (!namaPlg) namaPlg = 'YOHANIS-AF';
        if (!golDaya) golDaya = 'R1 / 000000900';
        if (!bulan) bulan = 'SEP 2026';
        if (!meter) meter = '00007944 - 00008015';
        if (!lembar) lembar = '1';
        refIdText = 'NO. REF: PLN-260924XD2H4IF01V';
    }

    // Tentukan Label Target & Judul Divider
    let targetLabel = 'Nomor Tujuan: ';
    let productLabel = 'Pembelian:';
    let dividerTitle = 'SERIAL NUMBER / SN';

    if (isTokenListrik) {
        targetLabel = 'ID Pelanggan: ';
        productLabel = 'Pembelian:';
        dividerTitle = 'TOKEN LISTRIK PLN';
    } else if (isPlnPascabayar) {
        targetLabel = 'ID Pelanggan: ';
        productLabel = 'Tagihan Listrik:';
        dividerTitle = 'NOMOR REFERENSI / REF ID';
    } else if (isGame) {
        targetLabel = 'ID Tujuan Game: ';
        productLabel = 'Item Game:';
        dividerTitle = 'SERIAL NUMBER / SN';
    } else if (isEmoney) {
        targetLabel = 'Nomor Tujuan: ';
        productLabel = 'Pembelian:';
        dividerTitle = 'SERIAL NUMBER / SN';
    } else if (isPascabayar) {
        targetLabel = 'ID Pelanggan: ';
        productLabel = 'Tagihan:';
        dividerTitle = 'NOMOR REFERENSI / REF ID';
    }

    return {
        isPln,
        isTokenListrik,
        isPlnPascabayar,
        isGame,
        isEmoney,
        isPascabayar,
        prodName,
        targetVal,
        targetLabel,
        productLabel,
        dividerTitle,
        namaPlg,
        tarif,
        daya,
        golDaya,
        kwh,
        lembar,
        bulan,
        meter,
        formattedToken,
        refIdText,
        rawSn
    };
}

/**
 * Format teks pesan Struk Pembayaran Royal E4 Store
 * Otomatis menyesuaikan apakah LUNAS atau TIDAK LUNAS
 */
export function formatRoyalStrukMessage(data: RoyalStrukData): string {
    const meta = detectProductCategory(data);
    const orderId = String(data.orderId || data.id || 'PRE-1788868200773');
    const orderCode = orderId.startsWith('PRE-') ? orderId.substring(0, 8) : `#${orderId.substring(0, 8).toUpperCase()}`;
    const cetakStr = data.cetakDate || data.tanggal || '08/09/2026 19:50 WITA';
    const holidayStr = data.holidayNotice || 'Selasa, Hari Raya Natal (108 hari lagi)';
    const totalBayar = Number(data.totalBayar || data.price || data.total || 25000);
    const statusLower = (data.status || '').toLowerCase();
    const isTidakLunas = data.templateVariant === 'tidaklunas' || 
                         statusLower.includes('tidak') || 
                         statusLower.includes('belum') || 
                         statusLower.includes('utang') || 
                         statusLower.includes('kasbon');

    if (isTidakLunas) {
        if (meta.isPln) {
            return `E4 STORE
Struk Pembayaran

Status: SUKSES (TIDAK LUNAS)

----------------------------------------
Nama                         ${data.nama || 'Lio'}
ID Pelanggan                 ${meta.targetVal}
Order ID                     ${orderId}
Tanggal                      ${data.tanggal || cetakStr}
Pembelian                    ${meta.prodName}
Nama Pel.                    ${meta.namaPlg}
Gol/Daya                     ${meta.golDaya}
----------------------------------------

Serial nomber / SN                   ${meta.formattedToken || meta.rawSn}

----------------------------------------
TOTAL BAYAR                  Rp ${totalBayar.toLocaleString('id-ID')}
----------------------------------------

Terima kasih telah berbelanja di E4 Store!
Cetak: ${cetakStr} | Kode: #${orderCode.replace(/^#/, '')}
${holidayStr}

----------------------------------------
Chuna - Asisten Imutmu siap bantu 24 jam!`;
        } else {
            return `E4 STORE
Struk Pembayaran

Status: SUKSES (TIDAK LUNAS)

----------------------------------------
Nama                         ${data.nama || 'Lio'}
${(meta.targetLabel.replace(/:\s*$/, '')).padEnd(29, ' ')}${meta.targetVal}
Order ID                     ${orderId}
Tanggal                      ${data.tanggal || cetakStr}
${(meta.productLabel.replace(/:\s*$/, '')).padEnd(29, ' ')}${meta.prodName}
Status                       TIDAK LUNAS
----------------------------------------

Serial nomber / SN                   ${meta.formattedToken || meta.rawSn}

----------------------------------------
TOTAL BAYAR                  Rp ${totalBayar.toLocaleString('id-ID')}
----------------------------------------

Terima kasih telah berbelanja di E4 Store!
Cetak: ${cetakStr} | Kode: #${orderCode.replace(/^#/, '')}
${holidayStr}

----------------------------------------
Chuna - Asisten Imutmu siap bantu 24 jam!`;
        }
    }

    // Default Lunas
    return `E4 STORE
Struk Pembayaran

Status: SUKSES (LUNAS)

----------------------------------------
Nama: ${data.nama || 'Lio'}
Status: Lunas
Metode: ${data.metode || 'CASH'}
${meta.productLabel} ${meta.prodName}

${meta.targetLabel}${meta.targetVal}
Order ID: ${orderId}
Tanggal: ${data.tanggal || cetakStr}
----------------------------------------

${meta.dividerTitle}
${meta.formattedToken || meta.rawSn}

----------------------------------------
TOTAL BAYAR: Rp ${totalBayar.toLocaleString('id-ID')}
----------------------------------------

Terima kasih telah berbelanja di E4 Store!
Cetak: ${cetakStr} | Kode: #${orderCode.replace(/^#/, '')}
${holidayStr}
Chuna - Asisten Imutmu siap bantu 24 jam!`;
}

/**
 * Generate 1024x1024 Struk Pembayaran Royal E4 Store: Model Status TIDAK LUNAS
 * Menggunakan template baru Picsart_26-09-28_17-53-27-094.png
 * - Foto profil WhatsApp di lapisan dasar lingkaran transparan (X: 513, Y: 161, Radius: 108)
 * - Bingkai tembaga/sayap/pita "Status: TIDAK LUNAS" berada rapi di atas foto
 * - Rincian transaksi kolom kiri (Nama, ID Pelanggan, Order ID, Tanggal, Metode)
 * - Rincian kolom kanan (Pembelian, Nama Pel., Gol/Daya)
 * - Kotak kaca retak (Cracked Glass Box) berisi nomor SN / Token
 * - Total Bayar & Teks Merah: "Segerah di lunasi ya kak"
 * - Footer lengkap E4 Store & Chuna
 */
export async function generateRoyalTidakLunasReceipt(data: RoyalStrukData): Promise<Buffer> {
    const width = 1024;
    const height = 1024;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const meta = detectProductCategory(data);
    const templateImg = await getTidakLunasTemplateImage();

    // 1. WhatsApp Profile Avatar ditaruh di lapisan bawah lingkaran transparan
    // Lubang lingkaran transparan template: X = 513, Y = 161, Radius = 108
    const avatarCenterX = 513;
    const avatarCenterY = 161;
    const avatarRadius = 108;

    let userAvatarImg: any = null;
    if (data.avatarBuffer) {
        try {
            userAvatarImg = await loadImage(data.avatarBuffer);
        } catch (e) {
            console.error("Gagal load avatarBuffer:", e);
        }
    }

    if (!userAvatarImg && !data.waPhotoUrl) {
        try {
            const dbPath = path.join(process.cwd(), 'db.json');
            if (fs.existsSync(dbPath)) {
                const dbContent = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
                const photos = dbContent.waProfilePhotos || {};

                // Cek dari nama member di daftar member offline
                if (data.nama) {
                    const cLower = String(data.nama).trim().toLowerCase();
                    const matchedMember = (dbContent.members || []).find((m: any) => m.name && m.name.trim().toLowerCase() === cLower);
                    if (matchedMember && matchedMember.whatsapp) {
                        const mClean = String(matchedMember.whatsapp).replace(/[^0-9]/g, '');
                        if (mClean && photos[mClean]) {
                            data.waPhotoUrl = photos[mClean];
                        }
                    }
                }

                if (!data.waPhotoUrl) {
                    // HANYA cek jika ada nomor WhatsApp eksplisit pembeli (JANGAN samakan nomor tujuan GoPay/produk dengan WA agar hemat limit)
                    const candidate = data.whatsapp || data.customerWa || data.buyerWa ? String(data.whatsapp || data.customerWa || data.buyerWa).replace(/[^0-9]/g, '') : '';
                    if (candidate && photos[candidate]) {
                        data.waPhotoUrl = photos[candidate];
                    } else if (photos['default']) {
                        data.waPhotoUrl = photos['default'];
                    }
                }
            }
        } catch (e) {}
    }

    if (!userAvatarImg && data.waPhotoUrl) {
        try {
            if (data.waPhotoUrl.startsWith('http://') || data.waPhotoUrl.startsWith('https://')) {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), 4000);
                const res = await fetch(data.waPhotoUrl, { signal: controller.signal });
                clearTimeout(timer);
                if (res.ok) {
                    const buf = Buffer.from(await res.arrayBuffer());
                    userAvatarImg = await loadImage(buf);
                }
            } else if (fs.existsSync(data.waPhotoUrl)) {
                userAvatarImg = await loadImage(data.waPhotoUrl);
            }
        } catch (e) {
            console.error("Gagal fetch waPhotoUrl:", e);
        }
    }

    if (!userAvatarImg) {
        try {
            const defPath = path.join(process.cwd(), 'public', 'default_wa_photo.png');
            if (fs.existsSync(defPath)) {
                userAvatarImg = await loadImage(defPath);
            }
        } catch (e) {}
    }

    // Base background under the hole
    ctx.fillStyle = '#1c0f0f';
    ctx.fillRect(0, 0, width, height);

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
        // Fallback realistic user silhouette with WhatsApp green accents (NO LETTERS / JANGAN PAKAI HURUF)
        const bgGrad = ctx.createLinearGradient(avatarCenterX - avatarRadius, avatarCenterY - avatarRadius, avatarCenterX + avatarRadius, avatarCenterY + avatarRadius);
        bgGrad.addColorStop(0, '#0f382a');
        bgGrad.addColorStop(0.5, '#128c7e');
        bgGrad.addColorStop(1, '#075e54');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(avatarCenterX - avatarRadius, avatarCenterY - avatarRadius, avatarRadius * 2, avatarRadius * 2);

        // Realistic head & shoulders
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(avatarCenterX, avatarCenterY - avatarRadius * 0.15, avatarRadius * 0.42, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(avatarCenterX, avatarCenterY + avatarRadius * 0.95, avatarRadius * 0.8, avatarRadius * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    // 2. Draw template ON TOP of avatar
    // Bingkai lingkaran tembaga & sayap otomatis menyatu di atas foto profil
    if (templateImg) {
        ctx.drawImage(templateImg, 0, 0, width, height);
    }

    // 3. Data Transaksi: Kolom Kiri & Kolom Kanan (Header E4 STORE & Struk Pembayaran sudah ada di mentahan)
    const leftX = 148;
    const rightX = 872;
    const orderId = String(data.orderId || data.id || 'PRE-1788868200773');
    const tanggal = String(data.tanggal || data.cetakDate || '08/09/2026 19:50 WITA');
    const metode = data.metode || 'CASH';

    ctx.save();
    ctx.font = 'bold 18.5px "DejaVu Sans", "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 1.5;

    // Kolom Kiri
    ctx.textAlign = 'left';
    ctx.fillText(`Nama: ${data.nama || 'Lio'}`, leftX, 330);
    ctx.fillText(`${meta.targetLabel}${meta.targetVal}`, leftX, 374);
    ctx.fillText(`Order ID: ${orderId}`, leftX, 418);
    ctx.fillText(`Tanggal: ${tanggal}`, leftX, 462);

    // Kolom Kanan (Right Aligned)
    ctx.textAlign = 'right';
    if (meta.isPln) {
        ctx.fillText(`Pembelian: ${meta.prodName}`, rightX, 374);
        ctx.fillText(`Nama Pel.: ${meta.namaPlg}`, rightX, 418);
        ctx.fillText(`Gol/Daya: ${meta.golDaya}`, rightX, 462);
    } else {
        ctx.fillText(`${meta.productLabel} ${meta.prodName}`, rightX, 374);
        ctx.fillText(`Status: TIDAK LUNAS`, rightX, 418);
    }

    // 5. SN / Token Text inside Cracked Glass Box (Divider 'SERIAL NUMBER / SN' sudah ada di mentahan)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 36px "DejaVu Serif", Georgia, serif';
    ctx.fillStyle = '#0a0a0a';
    ctx.shadowBlur = 0; // Clear shadow inside white box
    const snDisplayText = meta.formattedToken || meta.rawSn || '0585-9340-6917-6385-5660';
    ctx.fillText(snDisplayText, avatarCenterX, 586);

    // 7. TOTAL BAYAR
    const totalBayar = Number(data.totalBayar || data.price || data.total || 25000);
    ctx.textBaseline = 'alphabetic';
    ctx.font = 'bold 32px "DejaVu Serif", Georgia, serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 6;
    ctx.fillText(`TOTAL BAYAR: Rp ${totalBayar.toLocaleString('id-ID')}`, avatarCenterX, 696);

    // 8. Footer Info (Diturunkan agar bersih dan tidak menimpa tulisan mentahan 'Segerah di lunasi ya kak')
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 4;
    ctx.font = 'bold 14px "DejaVu Sans", "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Terima kasih telah berbelanja di E4 Store!', avatarCenterX, 796);

    ctx.font = 'bold 13px "DejaVu Sans", "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#e2e8f0';
    const orderCode = orderId.startsWith('PRE-') ? orderId.substring(0, 8) : `#${orderId.substring(0, 8).toUpperCase()}`;
    const cetakStr = data.cetakDate || tanggal;
    ctx.fillText(`Cetak: ${cetakStr} | Kode: #${orderCode.replace(/^#/, '')}`, avatarCenterX, 822);

    const holidayStr = data.holidayNotice || 'Selasa, Hari Raya Natal (108 hari lagi)';
    ctx.fillText(holidayStr, avatarCenterX, 846);

    ctx.fillStyle = '#f59e0b';
    ctx.fillText('Chuna - Asisten Imutmu siap bantu 24 jam!', avatarCenterX, 888);

    ctx.restore();

    return canvas.toBuffer('image/png');
}

/**
 * Generate 2048x2048 Struk Pembayaran Royal E4 Store: Model Status LUNAS
 * Menggunakan template Picsart_26-09-28_17-56-42-115.png (Royal Gold Mahkota Emas)
 */
export async function generateRoyalLunasReceipt(data: RoyalStrukData): Promise<Buffer> {
    const width = 2048;
    const height = 2048;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const meta = detectProductCategory(data);
    const templateImg = await getLunasTemplateImage();

    // Lubang lingkaran transparan template: X = 1028, Y = 327, Radius = 215
    const avatarCenterX = 1028;
    const avatarCenterY = 327;
    const avatarRadius = 215;

    let userAvatarImg: any = null;
    if (data.avatarBuffer) {
        try {
            userAvatarImg = await loadImage(data.avatarBuffer);
        } catch (e) {
            console.error("Gagal load avatarBuffer:", e);
        }
    }

    if (!userAvatarImg && !data.waPhotoUrl) {
        try {
            const dbPath = path.join(process.cwd(), 'db.json');
            if (fs.existsSync(dbPath)) {
                const dbContent = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
                const photos = dbContent.waProfilePhotos || {};

                // Cek dari nama member di daftar member offline
                if (data.nama) {
                    const cLower = String(data.nama).trim().toLowerCase();
                    const matchedMember = (dbContent.members || []).find((m: any) => m.name && m.name.trim().toLowerCase() === cLower);
                    if (matchedMember && matchedMember.whatsapp) {
                        const mClean = String(matchedMember.whatsapp).replace(/[^0-9]/g, '');
                        if (mClean && photos[mClean]) {
                            data.waPhotoUrl = photos[mClean];
                        }
                    }
                }

                if (!data.waPhotoUrl) {
                    // HANYA cek jika ada nomor WhatsApp eksplisit pembeli (JANGAN samakan nomor tujuan GoPay/produk dengan WA agar hemat limit)
                    const candidate = data.whatsapp || data.customerWa || data.buyerWa ? String(data.whatsapp || data.customerWa || data.buyerWa).replace(/[^0-9]/g, '') : '';
                    if (candidate && photos[candidate]) {
                        data.waPhotoUrl = photos[candidate];
                    } else if (photos['default']) {
                        data.waPhotoUrl = photos['default'];
                    }
                }
            }
        } catch (e) {}
    }

    if (!userAvatarImg && data.waPhotoUrl) {
        try {
            if (data.waPhotoUrl.startsWith('http://') || data.waPhotoUrl.startsWith('https://')) {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), 4000);
                const res = await fetch(data.waPhotoUrl, { signal: controller.signal });
                clearTimeout(timer);
                if (res.ok) {
                    const buf = Buffer.from(await res.arrayBuffer());
                    userAvatarImg = await loadImage(buf);
                }
            } else if (fs.existsSync(data.waPhotoUrl)) {
                userAvatarImg = await loadImage(data.waPhotoUrl);
            }
        } catch (e) {
            console.error("Gagal fetch waPhotoUrl:", e);
        }
    }

    if (!userAvatarImg) {
        try {
            const defPath = path.join(process.cwd(), 'public', 'default_wa_photo.png');
            if (fs.existsSync(defPath)) {
                userAvatarImg = await loadImage(defPath);
            }
        } catch (e) {}
    }

    // Base background under the hole
    ctx.fillStyle = '#1e0c0c';
    ctx.fillRect(0, 0, width, height);

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
        // Fallback realistic user silhouette with WhatsApp green accents (NO LETTERS / JANGAN PAKAI HURUF)
        const bgGrad = ctx.createLinearGradient(avatarCenterX - avatarRadius, avatarCenterY - avatarRadius, avatarCenterX + avatarRadius, avatarCenterY + avatarRadius);
        bgGrad.addColorStop(0, '#0f382a');
        bgGrad.addColorStop(0.5, '#128c7e');
        bgGrad.addColorStop(1, '#075e54');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(avatarCenterX - avatarRadius, avatarCenterY - avatarRadius, avatarRadius * 2, avatarRadius * 2);

        // Realistic head & shoulders
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(avatarCenterX, avatarCenterY - avatarRadius * 0.15, avatarRadius * 0.42, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(avatarCenterX, avatarCenterY + avatarRadius * 0.95, avatarRadius * 0.8, avatarRadius * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    // 2. Draw template ON TOP of avatar
    if (templateImg) {
        ctx.drawImage(templateImg, 0, 0, width, height);
    }

    // 3. Susun Baris Grid Data
    const leftColX = 300;
    const rightColX = 1740;
    const orderId = String(data.orderId || data.id || 'PRE-1790198576914');
    const tanggal = String(data.tanggal || data.cetakDate || '24/09/2026 05:23 WITA');
    const status = data.status || 'Lunas';
    const metode = data.metode || 'CASH';

    let rows: Array<{ leftLabel: string; rightLabel: string; y: number }> = [];

    if (meta.isTokenListrik) {
        rows = [
            { leftLabel: `Nama: ${data.nama || 'Samsul'}`, rightLabel: `ID Pelanggan: ${meta.targetVal}`, y: 680 },
            { leftLabel: `Nama Pel.: ${meta.namaPlg}`, rightLabel: `Order ID: ${orderId}`, y: 745 },
            { leftLabel: `Tarif / Daya: ${meta.golDaya}`, rightLabel: `Tanggal: ${tanggal}`, y: 810 },
            { leftLabel: `Jml KWH: ${meta.kwh}`, rightLabel: `Metode: ${metode} (${status})`, y: 875 },
            { leftLabel: 'Pembelian:', rightLabel: `${meta.prodName}`, y: 940 }
        ];
    } else if (meta.isPlnPascabayar) {
        rows = [
            { leftLabel: `Nama: ${data.nama || 'Samsul'}`, rightLabel: `ID Pelanggan: ${meta.targetVal}`, y: 680 },
            { leftLabel: `Nama Pel.: ${meta.namaPlg}`, rightLabel: `Order ID: ${orderId}`, y: 745 },
            { leftLabel: `Tarif / Daya: ${meta.golDaya}`, rightLabel: `Tanggal: ${tanggal}`, y: 810 },
            { leftLabel: `Stand Meter: ${meta.meter}`, rightLabel: `Periode: ${meta.bulan} (${meta.lembar} Lembar)`, y: 875 },
            { leftLabel: 'Tagihan Listrik:', rightLabel: `${meta.prodName} (${status})`, y: 940 }
        ];
    } else {
        rows = [
            { leftLabel: `Nama: ${data.nama || 'Lio'}`, rightLabel: `${meta.targetLabel}${meta.targetVal}`, y: 700 },
            { leftLabel: `Status: ${status}`, rightLabel: `Order ID: ${orderId}`, y: 775 },
            { leftLabel: `Metode: ${metode}`, rightLabel: `Tanggal: ${tanggal}`, y: 850 },
            { leftLabel: `${meta.productLabel}`, rightLabel: `${meta.prodName}`, y: 925 }
        ];
    }

    ctx.save();
    ctx.font = 'bold 34px "DejaVu Sans", "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#ffffff';

    for (const r of rows) {
        ctx.textAlign = 'left';
        ctx.fillText(r.leftLabel, leftColX, r.y);
        ctx.textAlign = 'right';
        ctx.fillText(r.rightLabel, rightColX, r.y);
    }

    // 4. Divider Line with Dynamic Title
    const divY = 1010;
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.65)';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(leftColX, divY);
    ctx.lineTo(avatarCenterX - 220, divY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(avatarCenterX + 220, divY);
    ctx.lineTo(rightColX, divY);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = 'bold 26px "DejaVu Sans", "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.fillText(meta.dividerTitle, avatarCenterX, divY + 8);

    // 5. White Rounded Box
    const boxX = 310;
    const boxY = 1060;
    const boxW = 1428;
    const boxH = 240;
    const boxR = 40;

    ctx.fillStyle = '#ffffff';
    roundRect(ctx, boxX, boxY, boxW, boxH, boxR);
    ctx.fill();

    ctx.strokeStyle = '#c5a059';
    ctx.lineWidth = 4;
    roundRect(ctx, boxX, boxY, boxW, boxH, boxR);
    ctx.stroke();

    ctx.strokeStyle = '#1e140d';
    ctx.lineWidth = 3;
    roundRect(ctx, boxX + 10, boxY + 10, boxW - 20, boxH - 20, boxR - 8);
    ctx.stroke();

    // Content inside White Box
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (meta.isTokenListrik) {
        // PLN Token: Tampilkan nomor 20 digit token besar & jelas di tengah
        ctx.font = 'bold 54px "Liberation Sans", "DejaVu Serif", Georgia, serif';
        ctx.fillStyle = '#0a0a0a';
        ctx.fillText(meta.formattedToken || meta.rawSn, avatarCenterX, boxY + boxH / 2);
    } else if (meta.isPlnPascabayar) {
        // PLN Pascabayar: Tampilkan Nomor Referensi Resmi PLN yang bersih & jelas
        const refVal = (meta.refIdText || `NO. REF: ${orderId}`).replace(/^RefId:\s*/i, 'NO. REF: ');
        ctx.font = 'bold 46px "Liberation Sans", "DejaVu Serif", Georgia, serif';
        ctx.fillStyle = '#0a0a0a';
        ctx.fillText(refVal, avatarCenterX, boxY + boxH / 2);
    } else {
        // Pulsa / Game / E-Wallet: Serial Number (SN) transaksi
        ctx.font = 'bold 44px "Liberation Sans", "DejaVu Serif", Georgia, serif';
        ctx.fillStyle = '#0a0a0a';
        ctx.fillText(meta.rawSn, avatarCenterX, boxY + boxH / 2);
    }

    // 6. TOTAL BAYAR
    const totalBayar = Number(data.totalBayar || data.price || data.total || 3000);
    ctx.textBaseline = 'alphabetic';
    ctx.font = 'bold 64px "DejaVu Serif", Georgia, serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`TOTAL BAYAR: Rp ${totalBayar.toLocaleString('id-ID')}`, avatarCenterX, 1425);

    // 7. Footer Text
    ctx.font = 'bold 26px "DejaVu Sans", "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Terima kasih telah berbelanja di E4 Store!', avatarCenterX, 1575);

    ctx.font = 'bold 24px "DejaVu Sans", "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#f1f5f9';
    const orderCode = orderId.startsWith('PRE-') ? orderId.substring(0, 8) : `#${orderId.substring(0, 8).toUpperCase()}`;
    const cetakStr = data.cetakDate || tanggal;
    ctx.fillText(`Cetak: ${cetakStr} | Kode: #${orderCode.replace(/^#/, '')}`, avatarCenterX, 1630);

    const holidayStr = data.holidayNotice || 'Kamis, 24 September 2026 - Hari Tani Nasional (Hari Ini)';
    ctx.fillText(holidayStr, avatarCenterX, 1685);
    ctx.fillText('Chuna - Asisten Imutmu siap bantu 24 jam!', avatarCenterX, 1740);

    ctx.restore();

    return canvas.toBuffer('image/png');
}

/**
 * Router Otomatis:
 * Menentukan apakah menggunakan template LUNAS atau TIDAK LUNAS berdasarkan data.status
 */
export async function generateRoyalStrukReceipt(data: RoyalStrukData): Promise<Buffer> {
    const statusLower = (data.status || '').toLowerCase();
    const isTidakLunas = data.templateVariant === 'tidaklunas' || 
                         statusLower.includes('tidak') || 
                         statusLower.includes('belum') || 
                         statusLower.includes('utang') || 
                         statusLower.includes('kasbon');

    if (isTidakLunas) {
        return generateRoyalTidakLunasReceipt(data);
    } else {
        return generateRoyalLunasReceipt(data);
    }
}
