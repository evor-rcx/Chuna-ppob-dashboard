import fs from "fs";
import dotenv from "dotenv";
dotenv.config();
import { z } from "zod";
import { EdgeTTS } from "node-edge-tts";
import cron from "node-cron";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import fs_logger from 'fs';
const originalLog = console.log;
console.log = function(...args) {
    const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
    fs_logger.appendFileSync('app_debug.log', new Date().toISOString() + ' ' + msg + '\n');
    originalLog.apply(console, args);
};
const originalError = console.error;
console.error = function(...args) {
    const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
    fs_logger.appendFileSync('app_debug.log', new Date().toISOString() + ' ERROR ' + msg + '\n');
    originalError.apply(console, args);
};

import { fetchTiktok } from "./downloader";
import { generateDebtSettlementReceipt } from "./debtReceipt";
import { generateOrderConfirmationSticker } from "./stickerConfirmation";

import path from 'path';

import Jimp from 'jimp';
import { createCanvas, loadImage } from '@napi-rs/canvas';


let font64: any = null;
let font32: any = null;
let font16: any = null;

async function initJimp() {
    if (!font64) font64 = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
    if (!font32) font32 = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    if (!font16) font16 = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
}

function isTelegramMatch(telegram, userId, username) {
    if (!telegram || !userId) return false;
    let parts = [];
    if (Array.isArray(telegram)) {
        parts = telegram.map(s => String(s).trim().toLowerCase());
    } else {
        parts = String(telegram).split(',').map(s => s.trim().toLowerCase());
    }
    const idStr = userId.toString().toLowerCase();
    const idPrefixed = `id:${idStr}`;
    const un = username ? (username.startsWith('@') ? username.toLowerCase() : `@${username.toLowerCase()}`) : null;
    return parts.includes(idStr) || parts.includes(idPrefixed) || (un ? parts.includes(un) : false);
}


import { getCalendarInfo, getHolidayInfo } from './src/utils/holidays';
import { securitySuite } from './src/lib/securitySuite';
import { getLiveServerHardwareStats } from './src/lib/serverHardwareMonitor';

function roundRectPath(ctx: any, x: number, y: number, w: number, h: number, r: number) {
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

function drawGoldCornerFiligree(ctx: any, x: number, y: number, scaleX: number, scaleY: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scaleX, scaleY);

    const goldGrad = ctx.createLinearGradient(0, 0, 110, 110);
    goldGrad.addColorStop(0, '#c79d46');
    goldGrad.addColorStop(0.3, '#ebd48e');
    goldGrad.addColorStop(0.7, '#d6ae58');
    goldGrad.addColorStop(1, '#9b7027');

    ctx.strokeStyle = goldGrad;
    ctx.fillStyle = goldGrad;
    ctx.lineWidth = 2.0;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Outer framing arc
    ctx.beginPath();
    ctx.moveTo(14, 95);
    ctx.bezierCurveTo(14, 40, 40, 14, 95, 14);
    ctx.stroke();

    // Secondary parallel thin arc
    ctx.beginPath();
    ctx.lineWidth = 1.2;
    ctx.moveTo(22, 85);
    ctx.bezierCurveTo(22, 45, 45, 22, 85, 22);
    ctx.stroke();

    // Top curling spiral
    ctx.beginPath();
    ctx.lineWidth = 2.2;
    ctx.moveTo(95, 14);
    ctx.bezierCurveTo(110, 14, 122, 24, 118, 36);
    ctx.bezierCurveTo(114, 46, 102, 44, 100, 34);
    ctx.bezierCurveTo(98, 28, 104, 25, 107, 28);
    ctx.stroke();

    // Left curling spiral
    ctx.beginPath();
    ctx.lineWidth = 2.2;
    ctx.moveTo(14, 95);
    ctx.bezierCurveTo(14, 110, 24, 122, 36, 118);
    ctx.bezierCurveTo(46, 114, 44, 102, 34, 100);
    ctx.bezierCurveTo(28, 98, 25, 104, 28, 107);
    ctx.stroke();

    // Inward floral scroll
    ctx.beginPath();
    ctx.lineWidth = 1.8;
    ctx.moveTo(32, 70);
    ctx.bezierCurveTo(40, 50, 50, 40, 70, 32);
    ctx.stroke();

    // Acanthus leaves radiating towards center
    const drawPetal = (px: number, py: number, rot: number, s: number) => {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate((rot * Math.PI) / 180);
        ctx.scale(s, s);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(10, -15, 0, -30);
        ctx.quadraticCurveTo(-10, -15, 0, 0);
        ctx.fill();
        ctx.restore();
    };

    drawPetal(52, 52, 45, 0.9);
    drawPetal(72, 36, 65, 0.7);
    drawPetal(36, 72, 25, 0.7);
    drawPetal(88, 26, 80, 0.5);
    drawPetal(26, 88, 10, 0.5);

    // Decorative pearls/dots
    ctx.beginPath();
    ctx.arc(54, 54, 3.2, 0, Math.PI * 2);
    ctx.arc(76, 32, 2.5, 0, Math.PI * 2);
    ctx.arc(32, 76, 2.5, 0, Math.PI * 2);
    ctx.arc(96, 24, 2.0, 0, Math.PI * 2);
    ctx.arc(24, 96, 2.0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

export async function generateTagihanCanvas(data: any, txDate: Date, formattedDate: string, calText: string): Promise<Buffer | null> {
    try {
        const width = 1000;
        const height = 1000;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Extract Customer and Service Details
        let nama = data.nama || data.customer_name || data.namaPlg || '-';
        let no = data.no || data.customer_no || data.target || '-';
        let layanan = data.layanan || data.product || 'Pln Pascabayar';

        if (typeof layanan === 'object' && layanan) layanan = layanan.product_name || 'Pln Pascabayar';
        if (typeof layanan === 'string' && layanan.includes(' - ')) {
            layanan = layanan.split(' - ')[0].trim();
        }

        let total = Number(data.total || data.price || data.tagihan || data.selling_price || 115252);

        // Extract Tarif, Daya, Lembar, Bulan/Periode, Meter
        let tarif = data.tarif || data.desc?.tarif || '';
        let daya = data.daya || data.desc?.daya || '';
        let lembar = data.lembar || data.lembar_tagihan || data.desc?.lembar_tagihan || '';
        let bulan = data.bulan || data.periode || '';
        let meter = data.meter || '';

        if (!bulan && data.desc?.detail && Array.isArray(data.desc.detail) && data.desc.detail.length > 0) {
            const first = data.desc.detail[0];
            bulan = first.periode || '';
            if (first.meter_awal && first.meter_akhir) {
                meter = `${first.meter_awal} - ${first.meter_akhir}`;
            }
        }

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

        // Sensible defaults matching PLN check
        if (!tarif) tarif = 'R1M';
        if (!daya) daya = '900';
        if (!lembar) lembar = '1';
        if (!bulan) bulan = '202609';
        if (!meter) meter = '00007944 - 00008015';

        // Extract or fetch WhatsApp profile photo
        let waPhotoUrl: string | null = data.waPhotoUrl || null;
        let waAvatarImg: any = null;
        try {
            const currentDb = (typeof db !== 'undefined' && db) ? db : readDB();
            if (!waPhotoUrl && (data.target || data.no || data.customer_no)) {
                const cleanT = String(data.target || data.no || data.customer_no).replace(/\D/g, '');
                let clean = cleanT;
                if (clean.startsWith('0')) clean = '62' + clean.substring(1);
                if (currentDb.waProfilePhotos && currentDb.waProfilePhotos[clean]) {
                    waPhotoUrl = currentDb.waProfilePhotos[clean];
                }
            }
        } catch (e) {}

        if (data.avatarBuffer) {
            try {
                waAvatarImg = await loadImage(data.avatarBuffer).catch(() => null);
            } catch (e) {}
        } else if (waPhotoUrl) {
            try {
                waAvatarImg = await loadImage(waPhotoUrl).catch(() => null);
            } catch (e) {}
        }

        // 1. Deep Midnight Royal Navy Background
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, '#061332');
        bgGrad.addColorStop(0.5, '#0a1a44');
        bgGrad.addColorStop(1, '#05122e');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // 2. Rounded Gold Outer Frame (matching Picsart reference image)
        const frameX = 38;
        const frameY = 38;
        const frameW = 924;
        const frameH = 924;
        const frameR = 34;

        const goldFrameGrad = ctx.createLinearGradient(frameX, frameY, frameX + frameW, frameY + frameH);
        goldFrameGrad.addColorStop(0, '#eac975');
        goldFrameGrad.addColorStop(0.25, '#fae69e');
        goldFrameGrad.addColorStop(0.5, '#dfb752');
        goldFrameGrad.addColorStop(0.75, '#fae8a5');
        goldFrameGrad.addColorStop(1, '#c19232');

        ctx.save();
        ctx.strokeStyle = goldFrameGrad;
        ctx.lineWidth = 4.2;
        roundRectPath(ctx, frameX, frameY, frameW, frameH, frameR);
        ctx.stroke();

        // Subtle inner gold rim
        ctx.strokeStyle = 'rgba(235, 206, 126, 0.22)';
        ctx.lineWidth = 1.0;
        roundRectPath(ctx, frameX + 6, frameY + 6, frameW - 12, frameH - 12, frameR - 4);
        ctx.stroke();
        ctx.restore();

        // Helper for consistent divider lines
        const drawDividerLine = (y: number, dashed = false) => {
            ctx.save();
            ctx.lineWidth = 1.4;
            if (dashed) {
                ctx.setLineDash([9, 6]);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
            } else {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.38)';
            }
            ctx.beginPath();
            ctx.moveTo(92, y);
            ctx.lineTo(908, y);
            ctx.stroke();
            ctx.restore();
        };

        // 3. Header Texts
        // "E4 STORE" - Large bold warm gold
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 54px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#f6cb4a'; // Vibrant Gold
        ctx.fillText('E4 STORE', 500, 138);

        // "Cek Tagihan" - White
        ctx.font = '600 27px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Cek Tagihan', 500, 202);

        // "Tagihan Ditemukan!" - White
        ctx.font = '600 25px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Tagihan Ditemukan!', 500, 252);

        // Top-Right WhatsApp Profile Photo Medallion (Enlarged)
        const tagihanAvatarR = 54;
        const tagihanAvatarX = frameX + frameW - 88;
        const tagihanAvatarY = frameY + 98;

        if (waAvatarImg || nama || true) {
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.35)';
            ctx.shadowBlur = 14;
            ctx.shadowOffsetY = 4;
            ctx.beginPath();
            ctx.arc(tagihanAvatarX, tagihanAvatarY, tagihanAvatarR, 0, Math.PI * 2);
            ctx.fillStyle = '#0a1a44';
            ctx.fill();
            ctx.restore();

            ctx.save();
            ctx.beginPath();
            ctx.arc(tagihanAvatarX, tagihanAvatarY, tagihanAvatarR - 2, 0, Math.PI * 2);
            ctx.clip();
            if (waAvatarImg) {
                ctx.drawImage(waAvatarImg, tagihanAvatarX - tagihanAvatarR, tagihanAvatarY - tagihanAvatarR, tagihanAvatarR * 2, tagihanAvatarR * 2);
            } else {
                // WhatsApp privat / foto tidak tersedia: lingkaran huruf E4 mewah
                const fallbackGradNavy = ctx.createLinearGradient(tagihanAvatarX - tagihanAvatarR, tagihanAvatarY - tagihanAvatarR, tagihanAvatarX + tagihanAvatarR, tagihanAvatarY + tagihanAvatarR);
                fallbackGradNavy.addColorStop(0, '#0a1a44');
                fallbackGradNavy.addColorStop(0.5, '#132b6e');
                fallbackGradNavy.addColorStop(1, '#050f28');
                ctx.fillStyle = fallbackGradNavy;
                ctx.fillRect(tagihanAvatarX - tagihanAvatarR, tagihanAvatarY - tagihanAvatarR, tagihanAvatarR * 2, tagihanAvatarR * 2);

                // Inner subtle ring
                ctx.strokeStyle = 'rgba(234, 201, 117, 0.4)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(tagihanAvatarX, tagihanAvatarY, tagihanAvatarR - 8, 0, Math.PI * 2);
                ctx.stroke();

                // Huruf E4 Emas Mewah
                ctx.font = '900 34px system-ui, -apple-system, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const textGradGold = ctx.createLinearGradient(tagihanAvatarX - 22, tagihanAvatarY - 18, tagihanAvatarX + 22, tagihanAvatarY + 18);
                textGradGold.addColorStop(0, '#fff4cc');
                textGradGold.addColorStop(0.5, '#eac975');
                textGradGold.addColorStop(1, '#ab7c12');
                ctx.fillStyle = textGradGold;
                ctx.fillText('E4', tagihanAvatarX, tagihanAvatarY + 1.5);
            }
            ctx.restore();

            // Gold Outer Ring
            ctx.save();
            ctx.strokeStyle = goldFrameGrad;
            ctx.lineWidth = 3.6;
            ctx.beginPath();
            ctx.arc(tagihanAvatarX, tagihanAvatarY, tagihanAvatarR, 0, Math.PI * 2);
            ctx.stroke();

            // WhatsApp Badge
            const tagihanBadgeR = 16;
            const tagihanBadgeX = tagihanAvatarX + Math.round(tagihanAvatarR * 0.70);
            const tagihanBadgeY = tagihanAvatarY + Math.round(tagihanAvatarR * 0.70);
            ctx.beginPath();
            ctx.arc(tagihanBadgeX, tagihanBadgeY, tagihanBadgeR, 0, Math.PI * 2);
            ctx.fillStyle = '#25D366';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.8;
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 15px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✆', tagihanBadgeX, tagihanBadgeY);
            ctx.restore();
        }

        // Divider 1 (above Upper Section)
        drawDividerLine(296);

        // 4. Upper Section
        // Row 1: Nama | Nomor
        const upperRow1Y = 334;
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 25px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#ffffff';

        // Left: Nama
        ctx.textAlign = 'left';
        ctx.fillText(`Nama ${nama}`, 92, upperRow1Y);

        // Right: Nomor
        ctx.textAlign = 'right';
        ctx.fillText(`Nomor ${no}`, 908, upperRow1Y);

        // Row 2: Layanan | Layanan
        const upperRow2Y = 384;
        ctx.textAlign = 'left';
        ctx.fillText(`Layanan ${layanan}`, 92, upperRow2Y);

        ctx.textAlign = 'right';
        ctx.fillText(`Layanan ${layanan}`, 908, upperRow2Y);

        // Divider 2 (below Upper Section)
        drawDividerLine(420);

        // 5. TOTAL BAYAR
        const totalY = 466;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 42px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#f6cb4a'; // Vibrant Gold
        ctx.fillText(`TOTAL BAYAR Rp ${total.toLocaleString('id-ID')}`, 500, totalY);

        // Divider 3 (below TOTAL BAYAR)
        drawDividerLine(514);

        // 6. Middle Section (3 Columns: Tarif, Daya, Lembar)
        const midY = 550;
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 25px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#ffffff';

        // Left Column (centered at 210)
        ctx.textAlign = 'center';
        ctx.fillText(`Tarif ${tarif}`, 210, midY);

        // Center Column (centered at 500)
        ctx.textAlign = 'center';
        ctx.fillText(`Daya ${daya}`, 500, midY);

        // Right Column (centered at 790)
        ctx.textAlign = 'center';
        ctx.fillText(`Lembar ${lembar}`, 790, midY);

        // Divider 4 (below 3 Columns)
        drawDividerLine(586);

        // 7. Meter & Periode Section (2 Columns)
        const meterRowY = 624;
        ctx.textAlign = 'left';
        ctx.font = 'bold 25px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`Bulan 1: ${bulan}`, 92, meterRowY);

        ctx.textAlign = 'right';
        ctx.fillText(`Meter: ${meter}`, 908, meterRowY);

        // 8. Silahkan Lanjutkan Pembayaran
        const ctaY = 684;
        ctx.textAlign = 'center';
        ctx.font = 'bold 27px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Silahkan Lanjutkan Pembayaran', 500, ctaY);

        // Divider 5 (Dashed Line)
        drawDividerLine(724, true);

        // 9. Footer
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Chuna line
        ctx.font = '600 21px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Chuna - Asisten Imutmu siap bantu 24 jam!', 500, 818);

        // Terimakasih line
        ctx.font = '600 21px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Terimakasih telah berbelanja di E4 Store!', 500, 858);

        // Cetak & Calendar info line
        ctx.font = 'normal 15px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(`Cetak: ${formattedDate} | ${calText}`, 500, 892);

        return canvas.toBuffer('image/png');
    } catch (e: any) {
        console.error("Canvas tagihan error:", e);
        return null;
    }
}

export async function generateCanvasReceipt(type: 'nota' | 'tagihan', data: any): Promise<Buffer | null> {
    try {
        // Dates and Calendar info
        const txDate = new Date(data.date || new Date());
        const dateStr = txDate.toLocaleString('en-GB', { 
            timeZone: 'Asia/Makassar', 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false 
        }).replace(',', '');
        const formattedDate = `${dateStr} WITA`;
        const calText = getCalendarInfo(txDate);

        // If type is tagihan, use the luxury dark royal navy & gold Cek Tagihan layout
        if (type === 'tagihan') {
            return await generateTagihanCanvas(data, txDate, formattedDate, calText);
        }

        const width = 1000;
        const height = 1000;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Parse product, token, and PLN details
        let token = data.sn ? String(data.sn).trim() : '-';
        let namaPlg = data.nama_pelanggan || data.namaPlg || '';
        let golDaya = data.gol_daya || data.golDaya || '';
        let kwh = data.kwh || '';

        const isPln = (data.product || '').toLowerCase().includes('pln') || 
                      (data.product || '').toLowerCase().includes('listrik') || 
                      (data.sku || '').toLowerCase().includes('pln') ||
                      (data.layanan || '').toLowerCase().includes('pln');

        if (isPln && token && token.includes('/')) {
            const parts = token.split('/');
            token = parts[0].trim();
            if (!namaPlg) namaPlg = (parts[1] || '').trim();
            if (parts.length > 3) {
                if (!golDaya) golDaya = `${parts[2]} / ${parts[3]}`.trim();
                if (!kwh) kwh = (parts[4] || '').trim();
            } else if (parts.length === 3) {
                if (!golDaya) golDaya = parts[2].trim();
            }
        }

        // Format 20-digit token with hyphens if purely 20 digits
        if (isPln && token && token.replace(/\D/g, '').length === 20) {
            const d = token.replace(/\D/g, '');
            token = `${d.slice(0, 4)}-${d.slice(4, 8)}-${d.slice(8, 12)}-${d.slice(12, 16)}-${d.slice(16, 20)}`;
        }

        // Determine Lunas vs Belum Lunas
        const statusLower = (data.status || '').toString().toLowerCase().trim();
        let methodLower = (data.method || '').toString().toLowerCase().trim();
        if (!methodLower && data.id) {
            try {
                const currentDb = (typeof db !== 'undefined' && db) ? db : readDB();
                const foundTx = currentDb.transactions?.find((t: any) => t.id === data.id);
                if (foundTx && foundTx.method) {
                    methodLower = foundTx.method.toString().toLowerCase().trim();
                }
            } catch (e) {}
        }
        const isUtang = methodLower === 'utang' || methodLower === 'kasbon' || statusLower.includes('utang') || statusLower.includes('kasbon');
        const isExplicitlyPaid = data.isPaid === true || data.isLunas === true || statusLower.includes('lunas');
        const isPending = statusLower.includes('pending') || statusLower.includes('menunggu');

        let isLunas = true;
        if (isUtang && !isExplicitlyPaid) {
            isLunas = false;
        } else if (isPending) {
            isLunas = false;
        } else if (statusLower.includes('belum lunas') || statusLower.includes('tidak lunas')) {
            isLunas = false;
        }

        // Format short Order Code
        const orderIdStr = String(data.id || 'PRE-1789646007593');
        const shortCode = orderIdStr.startsWith('PRE-') ? orderIdStr.slice(0, 7) : `#${orderIdStr.slice(0, 8).toUpperCase()}`;

        // Member and WhatsApp details
        let memberName = data.nama || data.member_name || data.memberId || '-';
        let waPhone = '';
        let waPhotoUrl: string | null = data.waPhotoUrl || null;
        let waAvatarImg: any = null;

        try {
            const currentDb = (typeof db !== 'undefined' && db) ? db : readDB();
            const members = currentDb.members || [];
            let m = members.find((x: any) => x.id === data.memberId);
            if (!m && data.target) {
                const cleanTarget = String(data.target).replace(/\D/g, '');
                m = members.find((x: any) => x.whatsapp && x.whatsapp.replace(/\D/g, '') === cleanTarget);
            }
            if (!m && data.memberId && String(data.memberId).startsWith('MBR-')) {
                const tgId = String(data.memberId).replace('MBR-', '');
                m = members.find((x: any) => isTelegramMatch(x.telegram, tgId, undefined));
            }

            if (m) {
                if (m.name) memberName = m.name;
                if (m.whatsapp) waPhone = m.whatsapp;
            }

            if (!waPhone && data.target) {
                const cleanT = String(data.target).replace(/\D/g, '');
                if (cleanT.length >= 10 && (cleanT.startsWith('08') || cleanT.startsWith('628'))) {
                    waPhone = cleanT;
                }
            }
            if (!waPhone && data.sender) waPhone = String(data.sender);
            if (!waPhone && data.chatId) waPhone = String(data.chatId);

            if (waPhone) {
                let clean = waPhone.replace(/\D/g, '');
                if (clean.startsWith('0')) clean = '62' + clean.substring(1);

                if (!waPhotoUrl && currentDb.waProfilePhotos && currentDb.waProfilePhotos[clean]) {
                    waPhotoUrl = currentDb.waProfilePhotos[clean];
                }

                if (!waPhotoUrl && typeof waSocket !== 'undefined' && waSocket && clean.length >= 10) {
                    try {
                        const jid = `${clean}@s.whatsapp.net`;
                        const fetchedPhoto = await waSocket.profilePictureUrl(jid, 'image').catch(() => null);
                        if (fetchedPhoto) {
                            waPhotoUrl = fetchedPhoto;
                            if (!currentDb.waProfilePhotos) currentDb.waProfilePhotos = {};
                            currentDb.waProfilePhotos[clean] = fetchedPhoto;
                            if (typeof writeDB === 'function') writeDB(currentDb);
                        }
                    } catch (e) {}
                }
            }
        } catch (e) {}

        if (data.avatarBuffer) {
            try {
                waAvatarImg = await loadImage(data.avatarBuffer).catch(() => null);
            } catch (e) {}
        } else if (waPhotoUrl) {
            try {
                waAvatarImg = await loadImage(waPhotoUrl).catch(() => null);
            } catch (e) {}
        }

        // 1. Clean white canvas background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // 2. Card bounds
        const cardX = 70;
        const cardY = 65;
        const cardW = 860;
        const cardH = 870;
        const cardR = 46;

        // Outer subtle card drop shadow
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 12;
        ctx.fillStyle = '#ffffff';
        roundRectPath(ctx, cardX, cardY, cardW, cardH, cardR);
        ctx.fill();
        ctx.restore();

        // Card background: Luxurious warm cream parchment gradient
        const cardBgGrad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
        cardBgGrad.addColorStop(0, '#fefdfb');
        cardBgGrad.addColorStop(0.5, '#faf6ee');
        cardBgGrad.addColorStop(1, '#f6f0e2');
        ctx.fillStyle = cardBgGrad;
        roundRectPath(ctx, cardX, cardY, cardW, cardH, cardR);
        ctx.fill();

        // Top Gold Metallic Banner Bar
        ctx.save();
        roundRectPath(ctx, cardX, cardY, cardW, cardH, cardR);
        ctx.clip();
        const topBarGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY);
        topBarGrad.addColorStop(0, '#be9443');
        topBarGrad.addColorStop(0.3, '#ebd58d');
        topBarGrad.addColorStop(0.7, '#dfbf72');
        topBarGrad.addColorStop(1, '#ab802f');
        ctx.fillStyle = topBarGrad;
        ctx.fillRect(cardX, cardY, cardW, 20);
        ctx.restore();

        // Fine gold border stroke around the card
        const borderGoldGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
        borderGoldGrad.addColorStop(0, '#c79d46');
        borderGoldGrad.addColorStop(0.5, '#edd692');
        borderGoldGrad.addColorStop(1, '#a67b2d');
        ctx.strokeStyle = borderGoldGrad;
        ctx.lineWidth = 2.0;
        roundRectPath(ctx, cardX, cardY, cardW, cardH, cardR);
        ctx.stroke();

        // Inner fine framing line
        ctx.strokeStyle = '#e0c688';
        ctx.lineWidth = 1.0;
        roundRectPath(ctx, cardX + 16, cardY + 34, cardW - 32, cardH - 50, cardR - 14);
        ctx.stroke();

        // 3. Ornate Gold Filigree in all 4 corners
        drawGoldCornerFiligree(ctx, cardX + 18, cardY + 34, 1, 1); // Top-Left
        drawGoldCornerFiligree(ctx, cardX + cardW - 18, cardY + 34, -1, 1); // Top-Right
        drawGoldCornerFiligree(ctx, cardX + 18, cardY + cardH - 18, 1, -1); // Bottom-Left
        drawGoldCornerFiligree(ctx, cardX + cardW - 18, cardY + cardH - 18, -1, -1); // Bottom-Right

        // 4. WhatsApp Profile Photo (Top-Right Medallion - Enlarged & Clearly Visible)
        const avatarR = 54; // Enlarged from 34 to 54 (108px diameter) so photo details are clearly visible
        const avatarX = cardX + cardW - 100;
        const avatarY = cardY + 86;

        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.22)';
        ctx.shadowBlur = 14;
        ctx.shadowOffsetY = 5;
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
        ctx.fillStyle = '#f8f4eb';
        ctx.fill();
        ctx.restore();

        // Render Profile Image or Monogram
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarR - 1.5, 0, Math.PI * 2);
        ctx.clip();
        if (waAvatarImg) {
            ctx.drawImage(waAvatarImg, avatarX - avatarR, avatarY - avatarR, avatarR * 2, avatarR * 2);
        } else {
            // WhatsApp privat / foto tidak tersedia: Lingkaran huruf E4 mewah
            const fallbackGrad = ctx.createLinearGradient(avatarX - avatarR, avatarY - avatarR, avatarX + avatarR, avatarY + avatarR);
            fallbackGrad.addColorStop(0, '#0c1a3b');
            fallbackGrad.addColorStop(0.5, '#162e66');
            fallbackGrad.addColorStop(1, '#081226');
            ctx.fillStyle = fallbackGrad;
            ctx.fillRect(avatarX - avatarR, avatarY - avatarR, avatarR * 2, avatarR * 2);

            // Inner gold ring accent
            ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(avatarX, avatarY, avatarR - 8, 0, Math.PI * 2);
            ctx.stroke();

            // Huruf E4 Emas Mewah
            ctx.font = '900 34px system-ui, -apple-system, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const textGradGold = ctx.createLinearGradient(avatarX - 22, avatarY - 18, avatarX + 22, avatarY + 18);
            textGradGold.addColorStop(0, '#fff4cc');
            textGradGold.addColorStop(0.5, '#eac975');
            textGradGold.addColorStop(1, '#ab7c12');
            ctx.fillStyle = textGradGold;
            ctx.fillText('E4', avatarX, avatarY + 1.5);
        }
        ctx.restore();

        // Gold avatar outer rim
        ctx.save();
        ctx.strokeStyle = borderGoldGrad;
        ctx.lineWidth = 3.6;
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
        ctx.stroke();

        // Delicate inner gold highlight ring
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarR - 3.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // WhatsApp badge on bottom-right of avatar (Enlarged)
        const badgeR = 16;
        const badgeX = avatarX + Math.round(avatarR * 0.70);
        const badgeY = avatarY + Math.round(avatarR * 0.70);
        ctx.save();
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
        ctx.fillStyle = '#25D366';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.8;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✆', badgeX, badgeY);
        ctx.restore();

        // 5. Centered Logo: (E4) STORE
        const logoCenterY = cardY + 70;
        const circleCenterX = 432;
        const circleRadius = 28;

        // Circle ring: left gray, right orange
        ctx.lineWidth = 3.6;
        ctx.beginPath();
        ctx.arc(circleCenterX, logoCenterY, circleRadius, Math.PI * 0.5, Math.PI * 1.5);
        ctx.strokeStyle = '#64748b';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(circleCenterX, logoCenterY, circleRadius, Math.PI * 1.5, Math.PI * 0.5);
        ctx.strokeStyle = '#ea8c26';
        ctx.stroke();

        // "E4" inside circle
        ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#1e293b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('E4', circleCenterX, logoCenterY + 1);

        // "STORE" text
        ctx.textAlign = 'left';
        ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.fillText('STORE', circleCenterX + circleRadius + 14, logoCenterY);

        // Subtitle: "Struk Pembayaran"
        ctx.textAlign = 'center';
        ctx.font = '500 21px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#475569';
        ctx.fillText(type === 'nota' ? 'Struk Pembayaran' : 'Bukti Tagihan', 500, logoCenterY + 45);

        // 6. Status Pill
        const pillY = logoCenterY + 98;
        const pillH = 58;
        const pillR = pillH / 2;

        ctx.save();
        if (isLunas) {
            const pillW = 320;
            const pillX = 500 - pillW / 2;

            ctx.shadowColor = 'rgba(22, 163, 74, 0.45)';
            ctx.shadowBlur = 18;
            ctx.shadowOffsetY = 6;

            const pillGrad = ctx.createLinearGradient(pillX, pillY - pillH / 2, pillX, pillY + pillH / 2);
            pillGrad.addColorStop(0, '#2ecc71');
            pillGrad.addColorStop(0.5, '#22a058');
            pillGrad.addColorStop(1, '#18793f');

            ctx.fillStyle = pillGrad;
            roundRectPath(ctx, pillX, pillY - pillH / 2, pillW, pillH, pillR);
            ctx.fill();
            ctx.restore();

            // White Text
            ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('SUKSES (LUNAS)', 484, pillY);

            // Gold Checkmark Badge
            const checkX = 612;
            const checkY = pillY;
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.2)';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(checkX, checkY, 15, 0, Math.PI * 2);
            ctx.fillStyle = '#d4af37';
            ctx.fill();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3.2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(checkX - 6, checkY);
            ctx.lineTo(checkX - 2, checkY + 4);
            ctx.lineTo(checkX + 6, checkY - 5);
            ctx.stroke();
            ctx.restore();
        } else {
            const pillW = 426;
            const pillX = 500 - pillW / 2;

            ctx.shadowColor = 'rgba(217, 119, 6, 0.45)';
            ctx.shadowBlur = 18;
            ctx.shadowOffsetY = 6;

            const pillGrad = ctx.createLinearGradient(pillX, pillY - pillH / 2, pillX, pillY + pillH / 2);
            pillGrad.addColorStop(0, '#f59e0b');
            pillGrad.addColorStop(0.5, '#d97706');
            pillGrad.addColorStop(1, '#b45309');

            ctx.fillStyle = pillGrad;
            roundRectPath(ctx, pillX, pillY - pillH / 2, pillW, pillH, pillR);
            ctx.fill();
            ctx.restore();

            // White Text
            ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('SUKSES (BELUM LUNAS)', 476, pillY);

            // Alarm Clock Icon
            const clockX = 665;
            const clockY = pillY;
            ctx.save();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.arc(clockX, clockY, 13, 0, Math.PI * 2);
            ctx.stroke();

            // Clock bells
            ctx.beginPath();
            ctx.arc(clockX - 9, clockY - 10, 4, 0, Math.PI * 2);
            ctx.arc(clockX + 9, clockY - 10, 4, 0, Math.PI * 2);
            ctx.stroke();

            // Hands
            ctx.beginPath();
            ctx.moveTo(clockX, clockY);
            ctx.lineTo(clockX, clockY - 6);
            ctx.moveTo(clockX, clockY);
            ctx.lineTo(clockX + 5, clockY);
            ctx.stroke();
            ctx.restore();
        }

        // 7. Grid Data Text (Penempatan Tulisannya Harus Sama yg Membedakan Jenis Produknya)
        const gridStartY = 336;
        const rowGap = 39;
        const leftX = 150;
        const rightX = 850;

        const drawGridRow = (rowIdx: number, leftLabel: string, leftVal: string, rightLabel: string, rightVal: string) => {
            const y = gridStartY + rowIdx * rowGap;

            // Left side
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';

            ctx.font = 'normal 22px system-ui, -apple-system, sans-serif';
            ctx.fillStyle = '#1e293b';
            ctx.fillText(leftLabel, leftX, y);

            const leftLabelW = ctx.measureText(leftLabel).width;
            ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
            let safeLeftVal = leftVal;
            if (safeLeftVal.length > 22) safeLeftVal = safeLeftVal.slice(0, 20) + '..';
            ctx.fillText(safeLeftVal, leftX + leftLabelW, y);

            // Right side (right aligned)
            if (rightLabel) {
                ctx.textAlign = 'right';
                ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
                let safeRightVal = rightVal;
                if (safeRightVal.length > 24) safeRightVal = safeRightVal.slice(0, 22) + '..';
                ctx.fillText(safeRightVal, rightX, y);

                const rightValW = ctx.measureText(safeRightVal).width;
                ctx.font = 'normal 22px system-ui, -apple-system, sans-serif';
                ctx.fillText(rightLabel, rightX - rightValW, y);
            } else {
                ctx.textAlign = 'right';
                ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
                let safeRightVal = rightVal;
                if (safeRightVal.length > 28) safeRightVal = safeRightVal.slice(0, 26) + '..';
                ctx.fillText(safeRightVal, rightX, y);
            }
        };

        const targetId = String(data.target || data.no || '-');
        const prodName = String(data.product || (typeof data.product === 'object' ? data.product?.product_name : '') || 'PLN 20.000');
        const prodLower = prodName.toLowerCase();
        const typeLower = String(data.type || '').toLowerCase();
        const skuLower = String(data.sku || '').toLowerCase();

        // Deteksi Kategori Produk & Penamaan Label Tujuan Khusus
        const isGame = typeLower.includes('game') || 
                       prodLower.includes('free fire') || 
                       prodLower.includes('mobile legends') || 
                       prodLower.includes('diamond') || 
                       prodLower.includes('dm ') || 
                       prodLower.includes('genshin') || 
                       prodLower.includes('pubg') || 
                       prodLower.includes('valorant') || 
                       prodLower.includes('roblox') || 
                       prodLower.includes('steam') || 
                       prodLower.includes('point blank') || 
                       skuLower.includes('game');

        const isEmoney = typeLower.includes('e-money') || 
                         typeLower.includes('emoney') || 
                         typeLower.includes('ewallet') || 
                         prodLower.includes('dana') || 
                         prodLower.includes('gopay') || 
                         prodLower.includes('ovo') || 
                         prodLower.includes('shopeepay') || 
                         prodLower.includes('linkaja') || 
                         prodLower.includes('maxim') || 
                         prodLower.includes('isaku');

        const isPascabayar = typeLower.includes('pasca') || 
                             prodLower.includes('pascabayar') || 
                             prodLower.includes('tagihan') || 
                             prodLower.includes('pdam') || 
                             prodLower.includes('bpjs');

        // Tentukan Label Target yang Tepat & Rapi
        let targetLabel = 'No. Tujuan: ';
        if (isPln) {
            targetLabel = 'ID Pelanggan: ';
        } else if (isGame) {
            targetLabel = 'ID Tujuan Game: ';
        } else if (isEmoney) {
            targetLabel = 'No. Tujuan E-Money: ';
        } else if (isPascabayar) {
            targetLabel = 'ID Pelanggan: ';
        } else {
            targetLabel = 'Nomor Tujuan: ';
        }

        if (isPln) {
            // Row 1: Nama | ID Pelanggan
            drawGridRow(0, 'Nama: ', memberName, targetLabel, targetId);
            // Row 2: Nama Pel. | Order ID
            drawGridRow(1, 'Nama Pel.: ', namaPlg || 'JAHRAH', 'Order ID: ', orderIdStr);
            // Row 3: Gol/Daya | Tanggal
            drawGridRow(2, 'Gol/Daya: ', golDaya || 'R1 / 000001300', 'Tanggal: ', formattedDate);
            // Row 4: Pembelian | PLN 20.000
            drawGridRow(3, 'Pembelian: ', '', '', prodName);
        } else if (isPascabayar) {
            // Pascabayar (PLN Pasca, PDAM, BPJS, dll)
            drawGridRow(0, 'Nama: ', memberName, targetLabel, targetId);
            drawGridRow(1, 'Nama Pel.: ', namaPlg || data.nama || '-', 'Order ID: ', orderIdStr);
            drawGridRow(2, 'Tagihan: ', `Rp ${(data.tagihan || data.price || 0).toLocaleString('id-ID')}`, 'Tanggal: ', formattedDate);
            drawGridRow(3, 'Pembelian: ', '', '', prodName);
        } else if (isGame) {
            // Produk Game (Free Fire, Mobile Legends, PUBG, dll)
            drawGridRow(0, 'Nama: ', memberName, targetLabel, targetId);
            drawGridRow(1, 'Status: ', isLunas ? 'Lunas' : 'Belum Lunas', 'Order ID: ', orderIdStr);
            drawGridRow(2, 'Metode: ', isUtang ? 'Utang / Kasbon' : (data.method ? String(data.method).toUpperCase() : 'Saldo'), 'Tanggal: ', formattedDate);
            drawGridRow(3, 'Item Game: ', '', '', prodName);
        } else {
            // Pulsa, Kuota Data, E-Money (DANA, Gopay, OVO, dll)
            drawGridRow(0, 'Nama: ', memberName, targetLabel, targetId);
            drawGridRow(1, 'Status: ', isLunas ? 'Lunas' : 'Belum Lunas', 'Order ID: ', orderIdStr);
            drawGridRow(2, 'Metode: ', isUtang ? 'Utang / Kasbon' : (data.method ? String(data.method).toUpperCase() : 'Saldo'), 'Tanggal: ', formattedDate);
            drawGridRow(3, 'Pembelian: ', '', '', prodName);
        }

        // 8. Divider: ———— TOKEN / SN ————
        const dividerY = 494;
        ctx.strokeStyle = '#c5a052';
        ctx.lineWidth = 1.0;

        ctx.beginPath();
        ctx.moveTo(150, dividerY);
        ctx.lineTo(850, dividerY);
        ctx.stroke();

        const divText = isPln ? 'TOKEN / SN' : ((data.type || '').includes('pasca') ? 'RINCIAN TAGIHAN' : 'SERIAL NUMBER / SN');
        ctx.font = '500 15px system-ui, -apple-system, sans-serif';
        const divTextW = ctx.measureText(divText).width + 30;

        ctx.fillStyle = '#f9f5ed';
        ctx.fillRect(500 - divTextW / 2, dividerY - 12, divTextW, 24);

        ctx.fillStyle = '#475569';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(divText, 500, dividerY);

        // 9. Token / SN Box
        const boxX = 150;
        const boxY = 522;
        const boxW = 700;
        const boxH = 120;
        const boxR = 24;

        ctx.save();
        ctx.fillStyle = '#fffdfa';
        roundRectPath(ctx, boxX, boxY, boxW, boxH, boxR);
        ctx.fill();

        ctx.strokeStyle = '#9c732a';
        ctx.lineWidth = 3.2;
        roundRectPath(ctx, boxX, boxY, boxW, boxH, boxR);
        ctx.stroke();

        ctx.strokeStyle = '#b88d3d';
        ctx.lineWidth = 1.6;
        roundRectPath(ctx, boxX + 6, boxY + 6, boxW - 12, boxH - 12, boxR - 6);
        ctx.stroke();
        ctx.restore();

        // Token Text
        let snDisplay = token;
        if (!snDisplay || snDisplay === '-') snDisplay = data.sn || data.ref_id || 'TRANSAKSI DIPROSES';
        const fontSize = snDisplay.length > 28 ? 32 : (snDisplay.length > 22 ? 38 : 44);
        ctx.font = `bold ${fontSize}px system-ui, -apple-system, monospace`;
        ctx.fillStyle = '#1c1917';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(snDisplay, 500, boxY + boxH / 2);

        // 10. TOTAL BAYAR
        const totalY = 690;
        const amountVal = data.price || data.total || data.tagihan || 25000;
        ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`TOTAL BAYAR Rp ${Number(amountVal).toLocaleString('id-ID')}`, 500, totalY);

        if (!isLunas) {
            ctx.font = 'normal 21px system-ui, -apple-system, sans-serif';
            ctx.fillStyle = '#334155';
            ctx.fillText('Segera selesaikan pembayaran', 500, totalY + 34);
        }

        // 11. Footer notes
        const footerStartY = 772;
        const footerGap = 26;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.font = '500 18px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#1e293b';
        ctx.fillText('Terima kasih telah berbelanja di E4 Store!', 500, footerStartY);

        ctx.font = 'normal 17px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#334155';
        ctx.fillText(`Cetak: ${formattedDate} | Kode: #${shortCode}`, 500, footerStartY + footerGap);
        ctx.fillText(calText, 500, footerStartY + footerGap * 2);
        ctx.fillText('Chuna - Asisten Imutmu siap bantu 24 jam!', 500, footerStartY + footerGap * 3);

        return canvas.toBuffer('image/png');
    } catch (e: any) {
        console.error("Canvas receipt error:", e);
        return null;
    }
}

import { createServer as createViteServer } from "vite";






import { Telegraf } from "telegraf";
import { makeWASocket, useMultiFileAuthState, Browsers, fetchLatestWaWebVersion } from "@whiskeysockets/baileys";
import pino from "pino";
import nodemailer from "nodemailer";
import crypto from "crypto";
import https from "https";

import dns from 'dns';
try {
    dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});


let bot: Telegraf | null = null;
let botStatus = "Disconnected";
const userStates: Record<number, { step: string, data: any }> = {};

const DB_FILE = path.join(process.cwd(), "db.json");
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ members: [], transactions: [], registeredUsers: {}, owners: [] }));
  }
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  if (!db.owners) db.owners = [];
  
  const defaultOwnerId = 6706921844;
  if (!db.owners.includes(defaultOwnerId)) {
    db.owners.push(defaultOwnerId);
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  }
  return db;
}
function writeDB(data: any) {
  try {
    securitySuite.auditDatabaseIntegrity(data);
  } catch (e) {}
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

let db = readDB();
let productFees: Record<string, { biasa: number, vip: number, owner?: number, owner_fixed?: number }> = db.productFees || {};

function getProductFee(sku: string) {
    if (!sku) return { biasa: 0, vip: 0, owner: 0, owner_fixed: undefined };
    if (productFees[sku]) return productFees[sku];
    const upper = sku.toUpperCase();
    if (productFees[upper]) return productFees[upper];
    const lower = sku.toLowerCase();
    if (productFees[lower]) return productFees[lower];
    
    const key = Object.keys(productFees).find(k => k.toLowerCase() === lower);
    if (key) return productFees[key];
    
    return { biasa: 0, vip: 0, owner: 0 };
}

const registeredUsers: Record<number, { username: string, wa: string, pin: string, gmail?: string }> = db.registeredUsers || {};

let transactions: any[] = db.transactions || [];
let members: any[] = db.members || [];

fs.watchFile(DB_FILE, (curr, prev) => {
  if (curr.mtime !== prev.mtime) {
    try {
      const newDb = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      db = newDb;
      productFees = db.productFees || {};
      
      transactions.length = 0;
      transactions.push(...(db.transactions || []));
      
      members.length = 0;
      members.push(...(db.members || []));
      
      for (const key of Object.keys(registeredUsers)) { delete registeredUsers[key as any]; }
      Object.assign(registeredUsers, db.registeredUsers || {});
      console.log("db.json reloaded from disk.");
    } catch (err) {
      console.error("Error reloading db.json", err);
    }
  }
});

if (!db.physicalProducts || db.physicalProducts.length === 0) db.physicalProducts = [
    { id: '1', name: 'Pop Es', price: 5000, stock: 100 },
    { id: '2', name: 'Bensin Eceran', price: 12000, stock: 50 },
    { id: '3', name: 'Cemilan', price: 2000, stock: 100 }
];
if (!db.physicalTransactions) db.physicalTransactions = [];
if (!db.waProfiles) db.waProfiles = {};
if (!db.waProfilePhotos) db.waProfilePhotos = {};

async function getCustomerWaDetails(member: any, telegramUserId?: any) {
    let rawWa = member?.whatsapp || (telegramUserId ? (registeredUsers[telegramUserId]?.wa || registeredUsers[Number(telegramUserId)]?.wa) : '') || '';
    let waPhone = rawWa || '-';
    let waProfile = '-';
    let waPhotoUrl: string | null = null;

    if (rawWa) {
        let clean = rawWa.replace(/\D/g, "");
        if (clean.startsWith("0")) clean = "62" + clean.substring(1);

        if (member?.waProfileName) {
            waProfile = member.waProfileName;
        } else if (db.waProfiles && db.waProfiles[clean]) {
            waProfile = db.waProfiles[clean];
        } else if (db.waProfiles && db.waProfiles[rawWa]) {
            waProfile = db.waProfiles[rawWa];
        }

        if (db.waProfilePhotos && db.waProfilePhotos[clean]) {
            waPhotoUrl = db.waProfilePhotos[clean];
        }

        if (!waPhotoUrl && waSocket && clean) {
            try {
                const jid = `${clean}@s.whatsapp.net`;
                const freshPhoto = await waSocket.profilePictureUrl(jid, 'image').catch(() => null);
                if (freshPhoto) {
                    waPhotoUrl = freshPhoto;
                    if (!db.waProfilePhotos) db.waProfilePhotos = {};
                    db.waProfilePhotos[clean] = freshPhoto;
                    writeDB(db);
                }
            } catch (e) {}
        }
    }

    return {
        waPhone: waPhone || '-',
        waProfile: waProfile || '-',
        waPhotoUrl
    };
}




export let waSocket: ReturnType<typeof makeWASocket> | null = null;
let waStatus = "Disconnected";
let waPairingCode = "";
let isRequestingPairingCode = false;

export async function generateCanvasDebtReceipt(member: any, utangTxs: any[]): Promise<Buffer | null> {
    try {
        const width = 800;
        const height = 800;
        let memberName = member?.name || '-';
        let waProfileName = '';
        let waPhone = '';
        let waPhotoUrl: string | null = null;
        let waAvatarImg: any = null;

        try {
            const waDetails = await getCustomerWaDetails(member);
            waPhone = waDetails.waPhone !== '-' ? waDetails.waPhone : (member?.whatsapp || '-');
            waProfileName = waDetails.waProfile !== '-' ? waDetails.waProfile : '';
            waPhotoUrl = waDetails.waPhotoUrl;
        } catch (e) {}

        if (waPhotoUrl) {
            try {
                waAvatarImg = await loadImage(waPhotoUrl).catch(() => null);
            } catch (e) {}
        }

        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Soft outer background
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, width, height);

        const cardX = 24;
        const cardY = 24;
        const cardW = width - 48;
        const cardH = height - 48;
        const cardR = 24;

        // Card shadow & container
        ctx.save();
        ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
        ctx.shadowBlur = 18;
        ctx.shadowOffsetY = 6;
        ctx.fillStyle = '#ffffff';
        roundRectPath(ctx, cardX, cardY, cardW, cardH, cardR);
        ctx.fill();
        ctx.restore();

        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.5;
        roundRectPath(ctx, cardX, cardY, cardW, cardH, cardR);
        ctx.stroke();

        // Clip inside card for ribbon
        ctx.save();
        roundRectPath(ctx, cardX, cardY, cardW, cardH, cardR);
        ctx.clip();

        // Diagonal Red Ribbon in Top Right: "BELUM LUNAS"
        ctx.save();
        ctx.translate(cardX + cardW - 35, cardY + 45);
        ctx.rotate((26 * Math.PI) / 180);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-120, -20, 260, 40);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 15px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('BELUM LUNAS', 10, 0);
        ctx.restore();

        // Top avatar or receipt circle icon
        let y = 46;
        const iconSize = 68;
        if (waAvatarImg) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(width / 2, y + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(waAvatarImg, width / 2 - iconSize / 2, y, iconSize, iconSize);
            ctx.restore();

            ctx.beginPath();
            ctx.arc(width / 2, y + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2.5;
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.arc(width / 2, y + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
            const fallbackGrad = ctx.createLinearGradient(width / 2 - iconSize / 2, y, width / 2 + iconSize / 2, y + iconSize);
            fallbackGrad.addColorStop(0, '#0c1a3b');
            fallbackGrad.addColorStop(0.5, '#162e66');
            fallbackGrad.addColorStop(1, '#081226');
            ctx.fillStyle = fallbackGrad;
            ctx.fill();

            // Inner gold ring accent
            ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(width / 2, y + iconSize / 2, iconSize / 2 - 4, 0, Math.PI * 2);
            ctx.stroke();

            // Gold Outer rim
            ctx.strokeStyle = '#d4af37';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(width / 2, y + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
            ctx.stroke();

            ctx.font = '900 24px system-ui, -apple-system, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const textGradGold = ctx.createLinearGradient(width / 2 - 15, y + iconSize / 2 - 10, width / 2 + 15, y + iconSize / 2 + 10);
            textGradGold.addColorStop(0, '#fff4cc');
            textGradGold.addColorStop(0.5, '#eac975');
            textGradGold.addColorStop(1, '#ab7c12');
            ctx.fillStyle = textGradGold;
            ctx.fillText('E4', width / 2, y + iconSize / 2 + 1);
        }

        y += iconSize + 22;

        // Title
        ctx.fillStyle = '#0f172a';
        ctx.font = '900 28px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText('E4 STORE', width / 2, y);

        y += 24;
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 14px Arial, sans-serif';
        ctx.fillText('BUKTI CATATAN TAGIHAN / UTANG', width / 2, y);

        y += 20;

        // Dashed divider
        const drawDashedDivider = (currY: number) => {
            ctx.save();
            ctx.beginPath();
            ctx.setLineDash([6, 6]);
            ctx.moveTo(cardX + 30, currY);
            ctx.lineTo(cardX + cardW - 30, currY);
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.restore();
        };

        drawDashedDivider(y);
        y += 26;

        const labelX = cardX + 32;
        const valX = cardX + cardW - 32;

        const drawRow = (label: string, val: string, isBoldVal = false, valColor = '#0f172a') => {
            ctx.fillStyle = '#64748b';
            ctx.font = '500 15px Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(label, labelX, y);

            ctx.fillStyle = valColor;
            ctx.font = isBoldVal ? 'bold 15px Arial, sans-serif' : '15px Arial, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(val, valX, y);
            y += 26;
        };

        const firstTx = utangTxs[0];
        const txDate = new Date(firstTx?.date || new Date());
        const dateStr = txDate.toLocaleString('id-ID', {
            timeZone: 'Asia/Makassar',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        drawRow('Nama Customer:', memberName, true);
        if (waProfileName && waProfileName !== '-') {
            drawRow('Profil WA:', waProfileName, true, '#059669');
        }
        let clean = waPhone.replace(/\D/g, '');
        if (clean.startsWith('0')) clean = '62' + clean.substring(1);
        drawRow('No. WhatsApp:', waPhone !== '-' ? (waPhone.startsWith('+') ? waPhone : `+${clean}`) : '-', false);
        drawRow('Tanggal Catat:', dateStr, false);

        y += 4;
        drawDashedDivider(y);
        y += 24;

        // Items Table Header
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 13px Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('RINCIAN PRODUK / TRANSAKSI', labelX, y);
        ctx.textAlign = 'right';
        ctx.fillText('SISA UTANG', valX, y);
        y += 24;

        let totalUtang = 0;
        const maxItems = utangTxs.slice(0, 4);
        maxItems.forEach((t: any) => {
            const sisa = t.price - (t.paidAmount || 0);
            totalUtang += sisa;
            ctx.fillStyle = '#334155';
            ctx.font = '500 15px Arial, sans-serif';
            ctx.textAlign = 'left';
            let prodName = t.product || 'Produk';
            if (prodName.length > 40) prodName = prodName.slice(0, 38) + '...';
            ctx.fillText(prodName, labelX, y);

            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 15px Arial, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(`Rp ${sisa.toLocaleString('id-ID')}`, valX, y);
            y += 26;
        });

        if (utangTxs.length > 4) {
            ctx.fillStyle = '#94a3b8';
            ctx.font = 'italic 13px Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`... dan ${utangTxs.length - 4} transaksi lainnya`, labelX, y);
            y += 22;
        }

        y += 4;
        drawDashedDivider(y);
        y += 30;

        // TOTAL UTANG
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 18px Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('TOTAL UTANG', labelX, y);

        ctx.fillStyle = '#dc2626';
        ctx.font = '900 28px Arial, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`Rp ${totalUtang.toLocaleString('id-ID')}`, valX, y);

        y += 24;

        // Reminder note box
        const boxX = labelX;
        const boxW = valX - labelX;
        const boxH = 46;
        ctx.fillStyle = '#fffbeb';
        roundRectPath(ctx, boxX, y, boxW, boxH, 10);
        ctx.fill();
        ctx.strokeStyle = '#fef3c7';
        ctx.lineWidth = 1;
        roundRectPath(ctx, boxX, y, boxW, boxH, 10);
        ctx.stroke();

        ctx.fillStyle = '#92400e';
        ctx.font = 'italic 14px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Mohon untuk segera diselesaikan ya kak, terima kasih 🙏', width / 2, y + boxH / 2);

        y += boxH + 26;

        // Decorative Barcode
        ctx.save();
        const barcodeW = 240;
        const barcodeH = 26;
        const bcStartX = width / 2 - barcodeW / 2;
        const barWidths = [10, 4, 12, 4, 8, 4, 14, 6, 10, 4, 14, 4, 8, 6, 12, 4, 14, 4, 10, 4, 12];
        let currBcX = bcStartX;
        ctx.fillStyle = '#94a3b8';
        barWidths.forEach((w) => {
            ctx.fillRect(currBcX, y, w, barcodeH);
            currBcX += w + 4;
        });
        ctx.restore();

        y += barcodeH + 16;
        const safeName = (memberName || 'MEMBER').replace(/\s+/g, '').toUpperCase().slice(0, 10);
        const refCode = `REC-${txDate.getFullYear()}${(txDate.getMonth() + 1).toString().padStart(2, '0')}${txDate.getDate().toString().padStart(2, '0')}-${safeName}`;
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(refCode, width / 2, y);

        ctx.restore(); // Restore clipping
        return canvas.toBuffer('image/png');
    } catch (e: any) {
        console.error("generateCanvasDebtReceipt error:", e);
        return null;
    }
}

let digiflazzUsername = db.digiflazzUsername || "";
let digiflazzApiKey = db.digiflazzApiKey || "";
let gopayStatus = "Disconnected";

let digiflazzStatus = "Disconnected";
let digiflazzBalance = 0;




export function getProductButtonText(p: any) {
    if (!p.buyer_product_status || !p.seller_product_status) {
        return "🔴 " + p.product_name + " (Gangguan)";
    }
    return p.product_name;
}

export function cleanProductName(text: string) {
    return text.replace(/^🔴\s*/, '').replace(/\s*\(Gangguan\)$/, '');
}


async function checkPascaBill(sku: string, customerNo: string) {
  if (!digiflazzUsername || !digiflazzApiKey) {
    throw new Error("Digiflazz belum dikonfigurasi");
  }
  const ref_id = "INQ-" + Date.now();
  const signText = digiflazzUsername + digiflazzApiKey + ref_id;
  const sign = crypto.createHash("md5").update(signText).digest("hex");
  

function getProductButtonText(p: any) {
    if (!p.buyer_product_status || !p.seller_product_status) {
        return "🔴 " + p.product_name + " (Gangguan)";
    }
    return p.product_name;
}

function cleanProductName(text: string) {
    return text.replace(/^🔴\s*/, '').replace(/\s*\(Gangguan\)$/, '');
}

  const res = await fetch("https://api.digiflazz.com/v1/transaction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      commands: "inq-pasca",
      username: digiflazzUsername,
      buyer_sku_code: sku,
      customer_no: customerNo,
      ref_id: ref_id,
      sign: sign
    })
  });
  const json = await res.json();
  if (json.data) return json.data;
  throw new Error("Gagal melakukan pengecekan tagihan");
}

async function startServer() {

  // Polling Digiflazz pending transactions
  setInterval(async () => {
      try {
          if (!digiflazzUsername || !digiflazzApiKey) return;
          const pendingTxs = transactions.filter(t => t.status === 'Pending');
          if (pendingTxs.length > 0) console.log(`[Polling] Found ${pendingTxs.length} pending transactions...`);
          for (const tx of pendingTxs) {
              let body: any = {
                  username: digiflazzUsername,
                  buyer_sku_code: tx.sku,
                  customer_no: tx.target.split(' ')[0],
                  ref_id: tx.id,
                  sign: crypto.createHash("md5").update(digiflazzUsername + digiflazzApiKey + tx.id).digest("hex")
              };
              
              if (tx.type === 'pasca') {
                  body.commands = "status-pasca";
              }

              try {
                  const res = await fetch("https://api.digiflazz.com/v1/transaction", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(body)
                  });
                  const json = await res.json();
                  
                  if (json) {
                      if (json.data && (json.data.status === 'Sukses' || json.data.status === 'Gagal')) {
                          // Forward to local webhook
                          await processDigiflazzWebhookData(json.data);
                      } else if (!json.data) {
                          // If Digiflazz returns an error without data, it means the transaction failed completely
                          await processDigiflazzWebhookData({
                              ref_id: tx.id,
                              status: 'Gagal',
                              message: json.message || 'Transaksi Gagal (No Data)'
                          });
                      }
                  }
              } catch (err) {
                  console.error("Error polling tx " + tx.id, err);
              }
          }
          
          // Retry sending WA receipts for successful transactions that failed to send WA msg
          if (waSocket) {
              const unsentTxs = transactions.filter((t: any) => t.status === 'Sukses' && t.waReceiptSent === false);
              for (const tx of unsentTxs) {
                  const member = members.find((m: any) => m.id === tx.memberId);
                  let jid = tx.waJid;
                  if (!jid && member && member.whatsapp) {
                      let cleanWa = member.whatsapp.replace(/\D/g, "");
                      if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
                      jid = cleanWa + "@s.whatsapp.net";
                  }
                  if (jid) {
                      try {
                          const buffer = await generateCanvasReceipt("nota", tx);
                          if (buffer) {
                              await waSocket.sendPresenceUpdate("composing", jid);
                              await new Promise(r => setTimeout(r, 1200));
                              await waSocket.sendPresenceUpdate("paused", jid);
                              await waSocket.sendMessage(jid, { image: buffer, caption: "✅ *Transaksi Berhasil!* Berikut nota pembelian kamu ya, kak. Terima kasih sudah belanja di E4 Store! 🥰" });
                                        
                              
                              const tIndex = db.transactions.findIndex((t: any) => t.id === tx.id);
                              if (tIndex >= 0) {
                                  db.transactions[tIndex].waReceiptSent = true;
                                  writeDB(db);
                              }
                          }
                      } catch (e) {
                          console.log("Retry WA delivery error:", e);
                      }
                  } else {
                      // No JID means we can never send to WA, so mark as sent to avoid infinite loop
                      const tIndex = db.transactions.findIndex((t: any) => t.id === tx.id);
                      if (tIndex >= 0) {
                          db.transactions[tIndex].waReceiptSent = true;
                          writeDB(db);
                      }
                  }
              }
          }
          
      } catch (e) {
          console.error("Polling error:", e);
      }
  }, 30000); // 30 seconds



async function runAutoPromo(manualCtx?: any) {
    if (!db.waAnnouncementTarget || !waSocket || !digiflazzUsername || !digiflazzApiKey) {
        if (manualCtx) await manualCtx.reply("❌ Sistem belum siap (WA belum terhubung atau config Digiflazz belum diset).");
        return;
    }
    
    try {
        if (manualCtx) await manualCtx.reply("⏳ Sedang memindai produk dari pusat (Digiflazz) untuk cek perubahan harga & status...");
        
        const prepaid = await getDigiflazzProducts('prepaid');
        let hasChanges = false;
        
        if (!db.lastPrices) db.lastPrices = {};
        if (!db.lastStatus) db.lastStatus = {};
        
        const skus = Object.keys(productFees).filter(k => k !== '0').map(k => k.toLowerCase());
        let updatedCount = 0;
        
        const changes = {
            naik: [] as any[],
            turun: [] as any[],
            close: [] as any[],
            aktif: [] as any[]
        };
        
        for (const p of prepaid) {
            const sku = p.buyer_sku_code;
            const isNormal = p.buyer_product_status && p.seller_product_status;
            
            if (skus.includes(sku.toLowerCase())) {
                // Check price
                if (db.lastPrices[sku] !== undefined && db.lastPrices[sku] !== p.price) {
                    hasChanges = true;
                    const feeReg = getProductFee(sku).biasa;
                    const feeVip = getProductFee(sku).vip;
                    const oldReg = db.lastPrices[sku] + feeReg;
                    const newReg = p.price + feeReg;
                    const oldVip = db.lastPrices[sku] + feeVip;
                    const newVip = p.price + feeVip;
                    
                    if (p.price > db.lastPrices[sku]) {
                        changes.naik.push({
                            sku, brand: p.brand, name: p.product_name, oldReg, newReg, oldVip, newVip,
                            diff: p.price - db.lastPrices[sku], hemat: newReg - newVip
                        });
                    } else {
                        changes.turun.push({
                            sku, brand: p.brand, name: p.product_name, reg: newReg, vip: newVip,
                            hemat: newReg - newVip
                        });
                    }
                }
                if (db.lastPrices[sku] !== p.price) {
                    db.lastPrices[sku] = p.price;
                    updatedCount++;
                }
                
                // Check status
                if (db.lastStatus[sku] !== undefined && db.lastStatus[sku] !== isNormal) {
                    hasChanges = true;
                    if (isNormal) changes.aktif.push(sku);
                    else changes.close.push(sku);
                }
                if (db.lastStatus[sku] !== isNormal) {
                    db.lastStatus[sku] = isNormal;
                    updatedCount++;
                }
            }
        }
        
        if (updatedCount > 0) {
            writeDB(db);
        }
        
        if (hasChanges) {
            let headerText = `📢 PENGUMUMAN E4 STORE 📢`;
            try {
                const { getHolidayInfo } = await import('./src/utils/holidays');
                const holiday = getHolidayInfo(new Date());
                if (holiday) {
                    headerText += `\n🗓️ Info Hari: ${holiday.text}`;
                }
            } catch(e) {}

            let finalMsg = `━━━━━━━━━━━━━━━━━━━━━\n${headerText}\n━━━━━━━━━━━━━━━━━━━━━\n\n`;

            const getProdFormat = (sku, basePrice = null) => {
                const p = prepaid.find((x) => x.buyer_sku_code.toLowerCase() === sku.toLowerCase());
                if (!p) return null;
                const pPrice = basePrice !== null ? basePrice : p.price;
                const feeBiasa = getProductFee(sku).biasa;
                const feeVip = getProductFee(sku).vip;
                return {
                    name: p.product_name,
                    reg: pPrice + feeBiasa,
                    vip: pPrice + feeVip,
                    hemat: (pPrice + feeBiasa) - (pPrice + feeVip),
                    brand: p.brand
                };
            };
            
            const formatItems = (title, headerText, items, statusLabel) => {
                if (items.length === 0) return '';
                let msg = `${title}\n\n${headerText}\n\n`;
                
                let lastBrand = '';
                let currentBoxOpen = false;
                
                for (const item of items) {
                    const p = getProdFormat(item.sku || item, item.newReg ? (item.newReg - getProductFee(item.sku || item).biasa) : null);
                    if (!p) continue;
                    
                    if (lastBrand !== p.brand) {
                        if (currentBoxOpen) msg += `└──────────────────────────────────────┘\n\n`;
                        msg += `🔥🔥🔥\n💎 ${p.brand.toUpperCase()} – ${statusLabel}\n\n┌──────────────────────────────────────┐\n`;
                        lastBrand = p.brand;
                        currentBoxOpen = true;
                    } else {
                        msg += `├──────────────────────────────────────┤\n`;
                    }
                    
                    const matchName = p.name.match(/\d+(\.|,)?\d*\s*[a-zA-Z]+/);
                    const simpleName = matchName ? matchName[0] : p.name.replace(/\s*\(.*?\)/g, '').trim();
                    
                    if (statusLabel === 'CLOSE') {
                        msg += `│  🔴 ${simpleName.padEnd(28)} │\n`;
                    } else {
                        msg += `│  💎 ${simpleName.padEnd(28)} │\n`;
                        msg += `│  🟢 Reguler : Rp ${p.reg.toLocaleString('id-ID').padEnd(16)} │\n`;
                        msg += `│  🟡 VIP     : Rp ${p.vip.toLocaleString('id-ID')} (hemat ${p.hemat/1000}rb!)│\n`;
                    }
                }
                if (currentBoxOpen) msg += `└──────────────────────────────────────┘\n\n`;
                return msg;
            };

            // 1. INFO HARGA NAIK
            if (changes.naik.length > 0) {
                finalMsg += formatItems(
                    '🔴 INFO HARGA NAIK! 🔴',
                    'Mohon perhatiannya ya, kak! Ada penyesuaian harga\nuntuk beberapa produk berikut mulai hari ini:\n\n⚠️ Mohon maklum ya kak, penyesuaian ini\nmengikuti harga dari pusat. Kami tetap\nkomitmen kasih harga terbaik untuk kalian!',
                    changes.naik,
                    'NAIK'
                );
            }
            
            // 2. GANGGUAN / CLOSE
            if (changes.close.length > 0) {
                finalMsg += formatItems(
                    '⚠️ GANGGUAN / CLOSE SEMENTARA ⚠️',
                    'Produk berikut sedang CLOSE dari pusat:\n🕒 Estimasi normal: sedang kami kejar info dari pusat.',
                    changes.close,
                    'CLOSE'
                );
            }
            
            // 3. PROMO HARGA TURUN
            if (changes.turun.length > 0) {
                finalMsg += formatItems(
                    '🎉 PROMO HARGA TURUN! 🎉',
                    'Lagi murah banget nih, kak! Harga spesial\ncuma di E4STORE. Buruan order sebelum naik!',
                    changes.turun,
                    'TURUN'
                );
            }
            
            // 4. PRODUK AKTIF KEMBALI
            if (changes.aktif.length > 0) {
                finalMsg += formatItems(
                    '🎉 PRODUK AKTIF KEMBALI! 🎉',
                    'Berikut produk yang sudah normal dan bisa diorder lagi:',
                    changes.aktif,
                    'TERSEDIA'
                );
            }
            
            finalMsg += `━━━━━━━━━━━━━━━━━━━━━\n🎁 KEUNTUNGAN ORDER VIA BOT RESMI:\n✅ Harga spesial lebih murah setiap hari\n✅ Hemat lebih banyak tiap transaksi\n✅ Bebas dari kenaikan harga sementara\n✅ Notifikasi promo & perubahan harga duluan\n\n⏳ Stok terbatas!\nJangan sampe kehabisan, kak!\n\n👇 CARA ORDER (GAMPANG BANGET):\n🤖 Klik bot resmi kami aja:\n👉 [@Chuna_Chan_bot](https://t.me/Chuna_Chan_bot)\n\nProses kilat, amanah, dan terpercaya!\n\n💚 E4STORE – Top Up Cepat, Harga Sahabat Gamer!\n\n#E4STORE #Pengumuman #HargaNaik #HargaTurun #TopUpMurah\n━━━━━━━━━━━━━━━━━━━━━`;
            
            db.waAnnouncementText = finalMsg;
            db.waAnnouncementMedia = null;
            db.waAnnouncementMediaType = null;
            writeDB(db);

            await waSocket.sendMessage(db.waAnnouncementTarget, { text: finalMsg });
            console.log("Auto status/price change announcement sent to", db.waAnnouncementTarget);
            
            if (manualCtx) {
                let previewMsg = finalMsg;
                if (previewMsg.length > 3500) {
                    previewMsg = previewMsg.substring(0, 3500) + "\n\n... (Teks dipotong)";
                }
                await manualCtx.reply(`✅ *Berhasil! Ada perubahan di Digiflazz.*\nPengumuman telah dikirim ke WA:\n\n${previewMsg}`, { parse_mode: 'Markdown' });
            }
        } else {
            if (manualCtx) {
                await manualCtx.reply("✅ *Tidak ada update* di Digiflazz (harga stabil & tidak ada cutclose baru). Tidak ada pengumuman yang dikirim.\n\n_(Sistem tidak akan mengirim pesan beruntun ke channel Telegram atau WA jika tidak ada update)_", { parse_mode: 'Markdown' });
            }
        }
        
    } catch (e: any) {
        console.error("Error auto checking price drops:", e);
        if (manualCtx) await manualCtx.reply("❌ Gagal mengecek Digiflazz: " + e.message);
    }
}

  setInterval(() => { runAutoPromo(); }, 50 * 60 * 1000); // Cek setiap 50 menit


  
function getWitaDate(dateInput?: string) {
    const d = dateInput ? new Date(dateInput) : new Date();
    const witaTime = d.getTime() + (8 * 60 * 60 * 1000);
    return new Date(witaTime).toISOString().split('T')[0];
}

function getWitaMonth(dateInput?: string) {
    const d = dateInput ? new Date(dateInput) : new Date();
    const witaTime = d.getTime() + (8 * 60 * 60 * 1000);
    return new Date(witaTime).toISOString().substring(0, 7);
}

const app = express();
// Menggunakan filter IP internal untuk trust proxy agar aman dari spoofing X-Forwarded-For
app.set('trust proxy', 'loopback, linklocal, uniquelocal');

  // Cyber Security Measures (Anti-hacker, Anti-bot)
  app.use(helmet({
    contentSecurityPolicy: false, // disabled for some react apps if it breaks inline scripts, adjust if needed
    crossOriginEmbedderPolicy: false
  }));
  
  // Basic rate limiting to prevent brute force & bot attacks
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: { success: false, error: "Terlalu banyak request dari IP ini, coba lagi nanti. (Anti-Bot Protection)" },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Bebaskan webhook dari rate limit agar notifikasi dari Digiflazz tidak terblokir
      return req.path.includes('/webhook') || req.path.includes('/api/digiflazz-webhook');
    }
  });
  app.use(limiter);
  
  // Specific stricter rate limit for API endpoints
  const apiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 200, 
    message: { success: false, error: "Limit request API tercapai. (Anti-DDoS Protection)" },
    skip: (req) => {
      // Bebaskan webhook dari rate limit
      return req.path.includes('/webhook') || req.path.includes('/api/digiflazz-webhook');
    }
  });
  app.use("/api/", apiLimiter);

  app.get("/api/dump", (req, res) => {
    res.json({ registeredUsers, dbRegistered: db.registeredUsers });
  });
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // =========================================================================
  // 5-LAYER SUPERFORTRESS CYBER DEFENSE SUITE (Egis, Nyxguard, Anchor, Purge, Helios)
  // =========================================================================
  const triggerHeliosOwnerAlert = (msg: string) => {
    try {
      if (bot && db.owners && Array.isArray(db.owners)) {
        for (const oId of db.owners) {
          bot.telegram.sendMessage(oId, msg, { parse_mode: 'Markdown' }).catch(() => {});
        }
      }
    } catch (e) {}
  };

  // Layer 5: HELIOS Telemetry & Security Management Endpoints (Unrestricted for Admin Dashboard)
  app.get("/api/security/stats", (req, res) => {
    res.json(securitySuite.getTelemetry());
  });

  app.post("/api/security/unban", (req, res) => {
    const { ip } = req.body || {};
    if (!ip) return res.status(400).json({ success: false, error: 'IP is required' });
    securitySuite.unbanIP(ip);
    res.json({ success: true, message: `IP ${ip} berhasil di-unban.` });
  });

  // Layer 6: ATLAS - Race Condition Mutex & Idempotency Testing
  app.post("/api/security/atlas/test-lock", async (req, res) => {
    const { memberId, count = 5 } = req.body || {};
    const targetId = memberId || 'test-member-atlas';
    let balance = 100000;
    const debitAmount = 25000;
    const executionLogs: string[] = [];

    // Simulate concurrent requests
    const promises = Array.from({ length: Number(count) }).map((_, idx) => {
      return securitySuite.atlasLock(targetId, async () => {
        const initial = balance;
        await new Promise(r => setTimeout(r, 20)); // artificial async delay to provoke race condition if unlocked
        if (balance >= debitAmount) {
          balance -= debitAmount;
          executionLogs.push(`Req #${idx + 1}: SUKSES (Saldo: Rp ${initial} -> Rp ${balance})`);
        } else {
          executionLogs.push(`Req #${idx + 1}: DITOLAK (Saldo tidak cukup: Rp ${balance})`);
        }
      });
    });

    await Promise.all(promises);
    res.json({
      success: true,
      message: `ATLAS Mutex berhasil menserialisasi ${count} transaksi bersamaan secara atomic!`,
      finalBalance: balance,
      executionLogs
    });
  });

  // Layer 7: FORGE - File Upload & Polyglot Sanitizer
  app.post("/api/security/forge/scan-file", (req, res) => {
    try {
      const { filename, base64Content } = req.body || {};
      if (!filename || !base64Content) {
        return res.status(400).json({ success: false, error: 'filename dan base64Content wajib diisi' });
      }

      // Remove base64 data URL header if present (e.g. data:image/png;base64,...)
      const cleanBase64 = base64Content.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');

      const result = securitySuite.forgeSanitizeFile(buffer, filename);
      if (!result.isValid) {
        return res.status(400).json({
          success: false,
          error: result.error,
          details: 'FORGE menolak file karena gagal validasi magic bytes atau terdeteksi polyglot payload.'
        });
      }

      res.json({
        success: true,
        message: 'File lolos inspeksi Magic Bytes dan Polyglot Hunter!',
        sanitizedFilename: result.sanitizedFilename,
        mimeType: result.mimeType,
        sizeBytes: buffer.length
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Layer 8: WARDEN - CSRF, 2FA (TOTP) & Timing-Safe Verification
  app.get("/api/security/warden/csrf", (req, res) => {
    const token = securitySuite.generateCsrfToken();
    res.json({ success: true, csrfToken: token });
  });

  app.get("/api/security/warden/2fa-info", (req, res) => {
    res.json(securitySuite.get2FASetupInfo());
  });

  app.post("/api/security/warden/2fa-verify", (req, res) => {
    const { code } = req.body || {};
    if (!code) return res.status(400).json({ success: false, error: 'Kode 2FA wajib diisi' });
    const isValid = securitySuite.verifyTotp(String(code));
    if (isValid) {
      res.json({ success: true, message: 'Kode 2FA / Backup Code valid!' });
    } else {
      res.status(401).json({ success: false, error: 'Kode 2FA / Backup Code tidak valid atau kedaluwarsa' });
    }
  });

  app.post("/api/security/warden/2fa-toggle", (req, res) => {
    const { enabled, code } = req.body || {};
    if (enabled) {
      // Must verify code first before enabling
      if (!securitySuite.verifyTotp(String(code))) {
        return res.status(400).json({ success: false, error: 'Masukkan kode 2FA yang valid untuk mengaktifkan' });
      }
      securitySuite.set2FAEnabled(true);
      res.json({ success: true, message: '2FA Admin (TOTP) berhasil DIAKTIFKAN!' });
    } else {
      securitySuite.set2FAEnabled(false);
      res.json({ success: true, message: '2FA Admin (TOTP) dinonaktifkan' });
    }
  });

  app.post("/api/security/warden/auth-verify", (req, res) => {
    const { password, totpCode } = req.body || {};
    const adminPassword = process.env.ADMIN_PASSWORD || 'Eko190497#';
    const clientIp = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress || '127.0.0.1';

    // Layer 13: Admin IP Whitelist check
    if (!securitySuite.auditCheckAdminIPAllowed(clientIp)) {
      securitySuite.logThreat('Audit', 'critical', clientIp, 'Admin Panel Blocked', 'Akses Admin diblokir: IP tidak terdaftar dalam Whitelist IP Admin.');
      return res.status(403).json({ success: false, error: 'Akses Ditolak: IP Anda tidak terdaftar dalam Whitelist IP Admin Resmi.' });
    }

    // Account Lockout check (distributed IP attack defense)
    const lockCheck = securitySuite.recordAccountLoginAttempt('admin', false);
    if (!lockCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: `Akun Admin terkunci sementara selama ${lockCheck.lockedMinutes} menit karena 5x percobaan gagal berulang kali.`
      });
    }

    // Timing-safe constant-time comparison
    const isPasswordValid = securitySuite.wardenTimingSafeEqual(String(password || ''), adminPassword);
    if (!isPasswordValid) {
      // Uniform response prevents username enumeration
      return res.status(401).json({
        success: false,
        error: 'Kredensial tidak valid! Sisa percobaan aman: ' + (lockCheck.remainingAttempts ?? 0)
      });
    }

    // If password is valid, reset failed counter
    securitySuite.recordAccountLoginAttempt('admin', true);

    const setupInfo = securitySuite.get2FASetupInfo();
    if (setupInfo.enabled) {
      if (!totpCode || !securitySuite.verifyTotp(String(totpCode))) {
        return res.status(403).json({
          success: false,
          requires2FA: true,
          error: '2FA Admin Aktif: Masukkan 6-digit kode Authenticator / Backup Code.'
        });
      }
    }

    const csrfToken = securitySuite.generateCsrfToken();
    securitySuite.auditRecordAction('admin', 'LOGIN', 'Admin Dashboard', null, 'SESSION_GRANTED', clientIp);

    res.json({
      success: true,
      message: 'Autentikasi Berhasil!',
      csrfToken
    });
  });

  // Layer 9: CRYPT - AES-256-GCM Test Endpoints
  app.post("/api/security/crypt/test", (req, res) => {
    const { text } = req.body || {};
    const sampleText = text || 'PIN: 190497 | API_KEY: digi_secret_live_994829';
    const encrypted = securitySuite.cryptEncrypt(sampleText);
    const decrypted = securitySuite.cryptDecrypt(encrypted);

    res.json({
      success: true,
      algorithm: 'AES-256-GCM (Authenticated Encryption)',
      original: sampleText,
      encrypted,
      decrypted,
      integrityVerified: decrypted === sampleText
    });
  });

  // Layer 10: VAULT - Backup & Disaster Recovery Drill Endpoints
  app.post("/api/security/vault/backup", (req, res) => {
    const dbPath = path.join(process.cwd(), 'db.json');
    const result = securitySuite.performVaultBackup(dbPath);
    if (result.success) {
      res.json({ success: true, message: `Backup terenkripsi berhasil disimpan: ${result.backupFile}`, data: result });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  });

  app.post("/api/security/vault/drill", (req, res) => {
    const result = securitySuite.runDisasterRecoveryDrill();
    res.json(result);
  });

  app.get("/api/security/vault/backups", (req, res) => {
    try {
      const backupDir = path.join(process.cwd(), 'backups');
      if (!fs.existsSync(backupDir)) return res.json({ backups: [] });
      const files = fs.readdirSync(backupDir).filter(f => f.startsWith('vault_backup_')).sort().reverse();
      const backupList = files.map(file => {
        const stats = fs.statSync(path.join(backupDir, file));
        return {
          filename: file,
          sizeBytes: stats.size,
          created: stats.mtime.toLocaleString('id-ID', { timeZone: 'Asia/Makassar' }) + ' WITA'
        };
      });
      res.json({ backups: backupList });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Layer 11: SENTRY - OS Hardening, System Permissions & Incident Playbook
  app.get("/api/security/sentry/audit", (req, res) => {
    const auditData = securitySuite.sentryAuditSystemPermissions();
    res.json(auditData);
  });

  app.get("/api/security/sentry/script", (req, res) => {
    const script = securitySuite.sentryGenerateHardeningScript();
    res.setHeader('Content-Type', 'text/x-shellscript');
    res.setHeader('Content-Disposition', 'attachment; filename="e4-armbian-hardening.sh"');
    res.send(script);
  });

  app.get("/api/security/sentry/playbook", (req, res) => {
    const playbook = securitySuite.sentryGetIncidentPlaybook();
    res.json(playbook);
  });

  // Layer 12: HOOK - Cryptographic Webhook Verification Endpoints
  app.post("/api/security/hook/test-telegram", (req, res) => {
    const tokenHeader = req.headers['x-telegram-bot-api-secret-token'] as string | undefined;
    const isValid = securitySuite.hookVerifyTelegramSecret(tokenHeader);
    if (isValid) {
      res.json({ success: true, message: 'X-Telegram-Bot-Api-Secret-Token valid & terverifikasi!' });
    } else {
      res.status(403).json({ success: false, error: 'Telegram Secret Token tidak valid atau palsu!' });
    }
  });

  app.post("/api/security/hook/test-meta", (req, res) => {
    const sigHeader = req.headers['x-hub-signature-256'] as string | undefined;
    const bodyStr = JSON.stringify(req.body || {});
    const isValid = securitySuite.hookVerifyMetaSignature(bodyStr, sigHeader);
    if (isValid) {
      res.json({ success: true, message: 'X-Hub-Signature-256 Meta valid & terverifikasi!' });
    } else {
      res.status(403).json({ success: false, error: 'Meta HMAC-SHA256 Signature tidak valid atau palsu!' });
    }
  });

  // Layer 13: AUDIT - Chained-Hash Immutable Admin Audit Ledger & IP Whitelist
  app.get("/api/security/audit/ledger", (req, res) => {
    const ledger = securitySuite.auditGetLedger();
    const integrity = securitySuite.auditVerifyLedgerIntegrity();
    res.json({
      ledger,
      integrity
    });
  });

  app.post("/api/security/audit/verify", (req, res) => {
    const result = securitySuite.auditVerifyLedgerIntegrity();
    res.json(result);
  });

  app.get("/api/security/audit/whitelist", (req, res) => {
    res.json(securitySuite.auditGetAdminIPWhitelist());
  });

  app.post("/api/security/audit/whitelist", (req, res) => {
    const { ips, enabled } = req.body || {};
    const clientIp = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress || '127.0.0.1';
    securitySuite.auditSetAdminIPWhitelist(Array.isArray(ips) ? ips : [], Boolean(enabled));
    securitySuite.auditRecordAction('admin', 'UPDATE_ADMIN_IP_WHITELIST', 'Security Config', null, { ips, enabled }, clientIp);
    res.json({ success: true, message: 'Admin IP Whitelist berhasil diperbarui!', data: securitySuite.auditGetAdminIPWhitelist() });
  });

  app.post("/api/security/audit/record", (req, res) => {
    const { action, target, prevValue, newValue } = req.body || {};
    const clientIp = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress || '127.0.0.1';
    const record = securitySuite.auditRecordAction('admin', String(action || 'ADMIN_ACTION'), String(target || 'GENERAL'), prevValue, newValue, clientIp);
    res.json({ success: true, record });
  });

  // --- Hardware & System Stats API (Armbian ARM64, Proxmox, Home Server) ---
  app.get("/api/system/server-stats", (req, res) => {
    try {
      const stats = getLiveServerHardwareStats();
      res.json(stats);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/system/hardware", (req, res) => {
    try {
      const stats = getLiveServerHardwareStats();
      res.json(stats);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/system/thermal", (req, res) => {
    try {
      const stats = getLiveServerHardwareStats();
      res.json({
        temperature: stats.temperature,
        cpu: {
          usagePercent: stats.cpu.usagePercent,
          cores: stats.cpu.cores
        },
        deviceModel: stats.deviceModel,
        hostType: stats.hostType
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/system/network", (req, res) => {
    try {
      const stats = getLiveServerHardwareStats();
      res.json({
        network: stats.network,
        hostName: stats.hostName,
        timestamp: stats.timestamp
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Layer 1 & 2: EGIS WAF Inspector & NYXGUARD Sentry
  app.use((req, res, next) => {
    securitySuite.egisInspector(req, res, next, triggerHeliosOwnerAlert);
  });

  // Layer 4: PURGE - Sensitive Payload Redaction Middleware
  app.use((req, res, next) => {
    if (req.body && typeof req.body === 'object') {
      // Clean potential prototype pollutions
      delete (req.body as any)['__proto__'];
      delete (req.body as any)['constructor'];
    }
    next();
  });

  async function processDigiflazzWebhookData(data: any) {
    try {
        const ref_id = data.ref_id;
        const status = data.status;
        if (data.testing) return { success: true };
        
        // Use closure variables instead of readDB() to prevent ghost balance bug!
        console.log('Webhook triggered for', ref_id);
        const txIndex = db.transactions.findIndex((t) => t.id === ref_id);
        console.log('txIndex:', txIndex);
        
        if (txIndex >= 0) {
            const tx = transactions[txIndex];
            
            if (tx.status === 'Pending' && (status === 'Sukses' || status === 'Gagal')) {
                tx.status = status;
                if (data.sn) tx.sn = data.sn;

                
                const memberIndex = members.findIndex((m) => m.id === tx.memberId);
                let member = null;
                let nama = "-";
                let isOwnerSelf = false;
                if (memberIndex >= 0) {
                    member = members[memberIndex];
                    nama = member.name || "-";
                    if (Array.isArray(member.telegram)) {
                        isOwnerSelf = member.telegram.some((tid: any) => db.owners.includes(parseInt(tid)));
                    } else if (typeof member.telegram === 'string' && member.telegram.length > 0) {
                        isOwnerSelf = db.owners.includes(parseInt(member.telegram.replace(/\D/g, '')));
                    }
                    if (status === 'Gagal' && tx.method === 'saldo' && !isOwnerSelf) {
                        member.balance += tx.price;
                    }
                }
                
                // Initialize waReceiptSent to false when first moving from Pending
                tx.waReceiptSent = "processing";
                
                db.transactions = transactions;
                db.members = members;
                writeDB(db);
                
                let msg = "";
                let notaBuffer: Buffer | null = null;
                if (status === 'Sukses') {
                    
                    const sn = data.sn || "-";
                    const now = new Date();
                    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
                    const dateStr = `${now.getDate().toString().padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()} WITA`;
                    
                    let displaySnMan = sn;
                    let displayDayaMan = "";
                    if (sn.includes('/')) {
                        const parts = sn.split('/');
                        displaySnMan = parts[0];
                        if (parts.length > 1) {
                            displayDayaMan = `\nDaya         : ${parts.slice(1).join(' / ')}`;
                        }
                    }
                    msg = `🎉 Horee! Sukses, Kak!

Pesanan sudah diproses otomatis oleh E4 Store. ${tx.product} sudah masuk ke ${isOwnerSelf ? "nama" : "akun"} ${nama || tx.target} ${isOwnerSelf ? "!" : "dan siap digunakan!"} 💪🔥

Terima kasih telah berbelanja di E4 Store! 🐾

Chuna ~ Asisten Imutmu siap bantu 24 jam!
Chuna tunggu Transaksi berikutnya dari Kakak! 😊💖`;
                } else if (status === 'Gagal') {
                    let refundMsg = tx.method === 'saldo' ? '✅ Saldo sebesar Rp ' + tx.price.toLocaleString('id-ID') + ' telah dikembalikan ke akunmu!' : (tx.method === 'utang' ? '✅ Utang sebesar Rp ' + tx.price.toLocaleString('id-ID') + ' telah dibatalkan!' : '✅ Mohon kembalikan uang tunai sebesar Rp ' + tx.price.toLocaleString('id-ID') + ' kepada pelanggan.');
                    let isIpError = (data.message || '').toLowerCase().includes('ip');
                    let customerErrorMsg = isIpError ? 'Sedang ada pemeliharaan' : (data.message || 'Transaksi Gagal');
                    if (customerErrorMsg.toLowerCase().includes('saldo') || customerErrorMsg.toLowerCase().includes('balance')) {
                        customerErrorMsg = 'Produk sedang kosong';
                    }

                    msg = `❌ Maaf Kak, pembayaran untuk pesanan Anda gagal diproses.

Kemungkinan ada kesalahan data atau saldo kurang. Silakan cek kembali, atau hubungi Chuna untuk bantuan${isIpError ? ' lebih lanjut' : ''}.

Keterangan : ${customerErrorMsg}
📦 Produk  : ${tx.product}
🎯 Tujuan   : ${tx.target} (${nama})

${refundMsg}

${isIpError ? 'Jangan khawatir, Kakak bisa mencoba ulang kapan saja.' : 'Tenang saja, Kakak bisa mencoba ulang kapan pun.'}

${isIpError ? `Chuna siap membantu dengan senyum! 😊💪` : `Chuna siap bantu! 😊💪`}`;
                    
                    if (data.message && data.message.toLowerCase().includes("harga seller lebih besar dari ketentuan harga buyer")) {
                        const ownerMsg = `🚨 *INFO PENTING DARI CHUNA!* 🚨

Harga modal produk tersebut di Digiflazz saat ini sedang naik dan lebih mahal daripada "Batas Harga (Max Price)" yang Kakak atur di akun Digiflazz Kakak.

Coba lihat angka: *${tx.product}* saat ini mungkin sudah naik, melebihi batas maksimalmu. Padahal chuna sudah jelas menunjukkan kenaikan. Masih mau mempertahankan batas harga yang sudah usang? Segera cek dan sesuaikan di dashboard Digiflazz ya Kak! 💸📈`;
                        for (const ownerId of db.owners) {
                            try {
                                await bot.telegram.sendMessage(ownerId, ownerMsg, { parse_mode: 'Markdown' });
                            } catch(e) {
                                console.error("Failed to notify owner", e);
                            }
                        }
                    }
                }
                
                if (bot && tx.tgChatId && tx.tgMsgId) {
                    (async () => {
                    try {
                        await bot.telegram.sendChatAction(tx.tgChatId, "typing");
                        await new Promise(r => setTimeout(r, 1500));
                        let tgPhotoSent = false;
                        if (status === 'Sukses') {
                    
                            const appUrl = "http://localhost:3000";
                            const buffer = await generateCanvasReceipt("nota", tx);
                            if (buffer) {
                                try { await bot.telegram.deleteMessage(tx.tgChatId, tx.tgMsgId); } catch(e) {}
                                await bot.telegram.sendPhoto(tx.tgChatId, { source: buffer }, { caption: msg });
                                tgPhotoSent = true;
                            }
                        }
                        if (!tgPhotoSent) {
                            try {
                                await bot.telegram.editMessageText(tx.tgChatId, tx.tgMsgId, undefined, msg);
                            } catch (e) {
                                try { await bot.telegram.sendMessage(tx.tgChatId, msg); } catch(err) {}
                            }
                        }
                    } catch (e) {
                        try { await bot.telegram.sendMessage(tx.tgChatId, msg); } catch(err) {}
                    }
                    })();
                } else if (bot && member && member.telegram && member.telegram.length > 0) {
                    (async () => {
                    try {
                        const tgId = Array.isArray(member.telegram) ? member.telegram[0] : member.telegram.replace(/\D/g, '');
                        let tgPhotoSent = false;
                        if (status === 'Sukses') {
                    
                            const appUrl = "http://localhost:3000";
                            const buffer = await generateCanvasReceipt("nota", tx);
                            if (buffer) {
                                await bot.telegram.sendPhoto(tgId, { source: buffer }, { caption: msg });
                                tgPhotoSent = true;
                            }
                        }
                        if (!tgPhotoSent) {
                            await bot.telegram.sendMessage(tgId, msg);
                        }
                    } catch (e: any) { console.error("Error in prepaidBrands check:", e.message); }
                    })();
                }
                if (waSocket) {
                    (async () => {
                        let jid = tx.waJid;
                        if (!jid && member && member.whatsapp) {
                            let cleanWa = member.whatsapp.replace(/\D/g, "");
                            if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
                            jid = cleanWa + "@s.whatsapp.net";
                        }
                        
                        if (jid) {
                            try {
                                await waSocket.presenceSubscribe(jid);
                                await waSocket.sendPresenceUpdate("composing", jid);
                                await new Promise(r => setTimeout(r, 1200));
                                await waSocket.sendPresenceUpdate("paused", jid);
                                
                                let edited = false;
                                if (tx.waMsgKey) {
                                    try {
                                        await waSocket.sendMessage(jid, { text: msg, edit: tx.waMsgKey });
                                        edited = true;
                                    } catch (e) { console.log("Failed to edit msg", e); }
                                }
                                
                                if (status === 'Sukses') {
                                    const buffer = await generateCanvasReceipt("nota", tx);
                                    if (buffer) {
                                        await waSocket.sendMessage(jid, { image: buffer, caption: "✅ *Transaksi Berhasil!* Berikut nota pembelian kamu ya, kak. Terima kasih sudah belanja di E4 Store! 🥰" });
                                    } else if (!edited) {
                                        await waSocket.sendMessage(jid, { text: msg });
                                    }
                                } else if (!edited) {
                                    await waSocket.sendMessage(jid, { text: msg });
                                }
                                

                if (status === 'Sukses' && member && member.gmail && db.gmailEmail && db.gmailAppPassword) {
                    (async () => {
                        try {
                            const buffer = await generateCanvasReceipt("nota", tx);
                            if (buffer) {
                                const transporter = (await import('nodemailer')).default.createTransport({
                                    service: 'gmail',
                                    auth: {
                                        user: db.gmailEmail,
                                        pass: db.gmailAppPassword
                                    }
                                });
                                
                                const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background-color: #121212; color: #ffffff; padding: 20px; }
    .container { max-width: 600px; margin: auto; background-color: #1e1e1e; padding: 20px; border-radius: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <h2 style="color: #34d399;">Transaksi Berhasil!</h2>
    <p>Halo kak ${member.name || tx.target},</p>
    <p>Pesanan kamu sudah kami proses. Berikut nota pembeliannya.</p>
    <p>Terima kasih sudah berbelanja di E4 Store! 🥰</p>
  </div>
</body>
</html>`;

                                await transporter.sendMail({
                                    from: `E4 Store <${db.gmailEmail}>`,
                                    to: member.gmail,
                                    subject: `Nota Pembelian Berhasil - E4 Store`,
                                    html: htmlContent,
                                    attachments: [{
                                        filename: 'nota.jpg',
                                        content: buffer
                                    }]
                                });
                            }
                        } catch (e) {
                            console.log("Failed to send receipt to gmail:", e);
                        }
                    })();
                }
                                if (status === 'Sukses' || status === 'Gagal') {
                                    const tIndex = db.transactions.findIndex((t: any) => t.id === tx.id);
                                    if (tIndex >= 0) {
                                        db.transactions[tIndex].waReceiptSent = true;
                                        writeDB(db);
                                    }
                                }
                            } catch (e: any) {
                                console.log("WA delivery error:", e.message);
                                const tIndex = db.transactions.findIndex((t: any) => t.id === tx.id);
                                if (tIndex >= 0) {
                                    db.transactions[tIndex].waReceiptSent = false;
                                    writeDB(db);
                                }
                            }
                        }
                    })();
                }
            }
        }
        
    } catch(e) {
        console.error("Webhook error", e);
    }
  }


  // Auto-check pending transactions every 30 seconds


  app.post(["/api/digiflazz-webhook", "/webhook"], express.json(), async (req, res) => {
    try {
        const payload = req.body;
        if (!payload || !payload.data) return res.json({ success: false, msg: "No payload" });
        await processDigiflazzWebhookData(payload.data);
        res.json({ success: true });
    } catch(e) {
        console.error("Webhook route error", e);
        res.status(500).send("Error");
    }
  });


  // --- WA Bot API Routes ---
  app.get("/api/wa/status", (req, res) => {
    res.json({ status: waStatus, pairingCode: waPairingCode });
  });

  app.post("/api/wa/reset", async (req, res) => {
    try {
      if (waSocket) {
        waSocket.ev.removeAllListeners("connection.update");
        waSocket.logout().catch(() => {});
        waSocket.end(undefined);
        waSocket = null;
      }
      
      // Force delete auth info folder
      try {
        fs.rmSync(path.join(process.cwd(), "wa_auth"), { recursive: true, force: true });
      } catch (e) {
        console.error("Error clearing auth info:", e);
      }
      
      waStatus = "Disconnected";
      waPairingCode = "";
      isRequestingPairingCode = false;
      res.json({ success: true, message: "WA direset. Silakan request kode ulang." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  let globalWaPhoneNumber = "";
  let waReconnectAttempts = 0;
  
  const startWaSocket = async () => {
    if (waSocket) {
      waSocket.ev.removeAllListeners("connection.update");
      waSocket.ev.removeAllListeners("creds.update");
      waSocket.ev.removeAllListeners("messages.upsert");
    }
    
    const { state, saveCreds } = await useMultiFileAuthState(path.join(process.cwd(), "wa_auth"));
    
    if (state.creds.registered && waStatus !== "Connecting...") {
      waStatus = "Connecting...";
    }

    const logger = pino({ level: "silent" });
    const { version } = await fetchLatestWaWebVersion().catch(() => ({ version: [2, 3000, 1015901307] as [number, number, number] }));
    
    waSocket = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: logger as any,
      browser: Browsers.ubuntu('Chrome'),
      syncFullHistory: false,
      markOnlineOnConnect: false
    });

    const originalWaSendMessage = waSocket.sendMessage.bind(waSocket);
    waSocket.sendMessage = async (jid, content, options) => {
        if (jid && !jid.includes('status@broadcast')) {
            try {
                await waSocket.presenceSubscribe(jid);
                await waSocket.sendPresenceUpdate('composing', jid);
                await new Promise(r => setTimeout(r, 1500));
                await waSocket.sendPresenceUpdate('paused', jid);
            } catch(e) {}
        }
        return originalWaSendMessage(jid, content, options);
    };

    waSocket.ev.on("creds.update", saveCreds);

    waSocket.ev.on("contacts.upsert", (contacts) => {
      let changed = false;
      if (!db.waContacts) db.waContacts = [];
      if (!db.waProfiles) db.waProfiles = {};
      for (const contact of contacts) {
          if (contact.id && contact.id.endsWith('@s.whatsapp.net')) {
              if (!db.waContacts.includes(contact.id)) {
                  db.waContacts.push(contact.id);
                  changed = true;
              }
              const pName = (contact as any).notify || (contact as any).name || (contact as any).verifiedName;
              const phone = contact.id.split('@')[0];
              if (pName && db.waProfiles[phone] !== pName) {
                  db.waProfiles[phone] = pName;
                  changed = true;
              }
          }
      }
      if (changed) writeDB(db);
    });

    waSocket.ev.on("contacts.update", (contacts) => {
      let changed = false;
      if (!db.waProfiles) db.waProfiles = {};
      for (const contact of contacts) {
          if (contact.id && contact.id.endsWith('@s.whatsapp.net')) {
              const pName = (contact as any).notify || (contact as any).name || (contact as any).verifiedName;
              const phone = contact.id.split('@')[0];
              if (pName && db.waProfiles[phone] !== pName) {
                  db.waProfiles[phone] = pName;
                  changed = true;
              }
          }
      }
      if (changed) writeDB(db);
    });
    
    waSocket.ev.on("messaging-history.set", (history) => {
      let changed = false;
      if (!db.waContacts) db.waContacts = [];
      if (!db.waProfiles) db.waProfiles = {};
      for (const contact of history.contacts || []) {
          if (contact.id && contact.id.endsWith('@s.whatsapp.net')) {
              if (!db.waContacts.includes(contact.id)) {
                  db.waContacts.push(contact.id);
                  changed = true;
              }
              const pName = (contact as any).notify || (contact as any).name || (contact as any).verifiedName;
              const phone = contact.id.split('@')[0];
              if (pName && db.waProfiles[phone] !== pName) {
                  db.waProfiles[phone] = pName;
                  changed = true;
              }
          }
      }
      if (changed) writeDB(db);
    });

    

    waSocket.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === "close") {
        const errMsg = (lastDisconnect?.error as any)?.message;
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
        waStatus = "Disconnected: " + (errMsg || "Closed");
        console.log("WA connection closed", errMsg, "statusCode:", statusCode);
        
        // Always try to reconnect unless it's explicitly logged out (401)
        if (statusCode === 401) {
           // fs.rmSync disabled to prevent auto-logout
           waSocket = null;
           console.log("WA Logged out by device. Auth deleted.");
        } else {
           if (statusCode === 405) {
               console.log("WA bad session, deleting auth and reconnecting...");
               // fs.rmSync disabled to prevent auto-logout
           }
           // Reconnect
           waReconnectAttempts++;
           let backoff = Math.min(waReconnectAttempts * 2000, 10000);
           console.log(`Reconnecting WA in ${backoff/1000} seconds...`);
           setTimeout(startWaSocket, backoff);
        }
      } else if (connection === "open") {
        waReconnectAttempts = 0;
        const userJid = waSocket?.user?.id || "";
        const phoneNum = userJid.split(':')[0] || "Connected";
        const pushName = waSocket?.user?.name || "";
        waStatus = pushName ? `Connected as ${pushName} (${phoneNum})` : `Connected as ${phoneNum}`;
        waPairingCode = "";
        console.log("WA connection opened");
      }
    });

    const repliedThanks = new Set<string>();
    const repliedGeneral = new Set<string>();
    waSocket.ev.on("messages.upsert", async (m) => {
      const msg = m.messages[0];
      if (msg && msg.pushName) {
        const senderJid = msg.key?.participant || msg.key?.remoteJid || '';
        if (senderJid.endsWith('@s.whatsapp.net')) {
          const phone = senderJid.split('@')[0];
          if (!db.waProfiles) db.waProfiles = {};
          if (db.waProfiles[phone] !== msg.pushName) {
            db.waProfiles[phone] = msg.pushName;
            writeDB(db);
          }
        }
      }
      if (!msg.key.fromMe && m.type === "notify" && msg.message) {
        // Anti View Once Logic
        const isViewOnce = msg.message?.viewOnceMessage || msg.message?.viewOnceMessageV2 || msg.message?.viewOnceMessageV2Extension;
        if (isViewOnce) {
            try {
                const messageType = Object.keys(isViewOnce.message)[0];
                const mediaMessage = isViewOnce.message[messageType];
                
                const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
                const stream = await downloadContentFromMessage(mediaMessage, messageType.replace('Message', ''));
                let buffer = Buffer.from([]);
                for await(const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                
                if (db.waAnnouncementTarget && waSocket) {
                    const senderJid = msg.key.remoteJid;
                    const senderNum = senderJid ? senderJid.split('@')[0] : 'Tidak diketahui';
                    const senderName = msg.pushName || 'Pelanggan';
                    
                    const caption = `🤫 *ANTI VIEW ONCE DETECTED*\n👤 Dari: ${senderName} (${senderNum})\n\nPelanggan mengirim pesan sekali lihat, ini adalah salinannya.`;
                    
                    if (messageType === 'imageMessage') {
                        await waSocket.sendMessage(db.waAnnouncementTarget, { image: buffer, caption: caption });
                        try {
                            for (const ownerId of db.owners) {
                                await bot.telegram.sendPhoto(ownerId, { source: buffer }, { caption: caption });
                            }
                        } catch(e) {}
                    } else if (messageType === 'videoMessage') {
                        await waSocket.sendMessage(db.waAnnouncementTarget, { video: buffer, caption: caption });
                        try {
                            for (const ownerId of db.owners) {
                                await bot.telegram.sendVideo(ownerId, { source: buffer }, { caption: caption });
                            }
                        } catch(e) {}
                    }
                }
            } catch (error) {
                console.error("Gagal memproses view once message:", error);
            }
        }

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const lowerText = text.toLowerCase();
        
        if (!text.trim()) return;
        
        const thankYouWords = [
            "makasih", "mksih", "makasi", "terima kasih", "terimakasih", "suwun", "hatur nuhun", "trmks", "mksi", "mks", "trimakasih", "thx", "tq", "terimakasi", "trmksi", "terima kasi", "maksi", "teq", "terima kask",
            "thanks", "thank you", "ty", "thankyou",
            "arigatou", "arigato", "ありがとう", "az",
            "gomawo", "kamsahamnida", "고마워", "감사합니다",
            "xiexie", "xie xie", "谢谢",
            "syukron", "shukran", "شكرا"
        ];

        if (thankYouWords.some(word => lowerText.includes(word))) {
            const jid = msg.key.remoteJid;
            console.log('Received thank you word from:', jid, 'Message:', lowerText);
            
            if (jid) {
                const cleanJid = jid.split('@')[0];
                const member = db.members.find((m: any) => m.whatsapp && m.whatsapp.replace(/\D/g, '').includes(cleanJid));
                
                const tx = db.transactions.slice().reverse().find((t: any) => t.waJid === jid || (member && t.memberId === member.id));
                
                const isGroup = jid.endsWith('@g.us') || jid.endsWith('@newsletter');
                const replyKey = tx ? tx.id : jid + '_' + new Date().toDateString();
                console.log('Found tx:', tx?.id, 'status:', tx?.status, 'Already replied:', repliedThanks.has(replyKey));
                
                if (!isGroup && !repliedThanks.has(replyKey)) {
                    repliedThanks.add(replyKey);
                    
                    let customerName = msg.pushName || "Kakak";
                    if (member && member.name) {
                        customerName = member.name;
                    } else if (tx && tx.target && !tx.target.match(/^\d+$/)) {
                        customerName = tx.target;
                    }
                    
                    try {
                        const vnText = `Sama-sama Kak ${customerName}! Makasih banyak ya udah belanja di E4 Store. Semoga rezekinya makin lancar. Chuna tunggu pesanan selanjutnya ya kak!`;
                        const baseVnName = path.join(process.cwd(), `tmp_vn_${Date.now()}_${Math.floor(Math.random()*1000)}`);
                        const vnPathMp3 = `${baseVnName}.mp3`;
                        const vnPathOgg = `${baseVnName}.ogg`;
                        const tts = new EdgeTTS({ voice: 'id-ID-GadisNeural', lang: 'id-ID', outputFormat: 'audio-24khz-48kbitrate-mono-mp3', pitch: '+20Hz', rate: '+15%' });
                        await tts.ttsPromise(vnText, vnPathMp3);
                        await waSocket.sendPresenceUpdate("recording", jid);
                        await new Promise(r => setTimeout(r, 4500));
                        await waSocket.sendPresenceUpdate("paused", jid);
                        
                        const { exec } = await import('child_process');
                        await new Promise((resolve, reject) => {
                            exec(`ffmpeg -y -i ${vnPathMp3} -c:a libopus -b:a 48k -vbr on -compression_level 10 -frame_duration 20 -application voip ${vnPathOgg}`, (error) => {
                                if (error) {
                                    console.error("FFmpeg error:", error);
                                    reject(error);
                                } else {
                                    resolve(true);
                                }
                            });
                        });

                        let sent = false;
                        for(let i=0; i<3; i++) {
                            try {
                                const audioBuffer = fs.readFileSync(vnPathOgg);
                                await waSocket.sendMessage(jid, { audio: audioBuffer, mimetype: 'audio/mp4', ptt: true }, { quoted: msg });
                                sent = true;
                                break;
                            } catch (err: any) {
                                console.log("Upload failed, retrying...", err.message);
                                await new Promise(r => setTimeout(r, 2000));
                            }
                        }
                        if(!sent) throw new Error("Gagal kirim VN setelah 3 kali percobaan");

                        setTimeout(() => { 
                            try { fs.unlinkSync(vnPathMp3); } catch(e){} 
                            try { fs.unlinkSync(vnPathOgg); } catch(e){} 
                        }, 5000);
                    } catch (e) {
                        console.error("Gagal kirim balasan makasih VN:", e);
                    }
                }
            }
        } else {
            const jid = msg.key.remoteJid;
            if (jid && !jid.endsWith('@g.us') && !jid.endsWith('@newsletter') && !jid.includes('status@broadcast')) {
                const replyKey = jid + '_' + new Date().toDateString();
                if (!repliedGeneral.has(replyKey)) {
                    repliedGeneral.add(replyKey);
                    
                    const cleanJid = jid.split('@')[0];
                    const member = db.members.find((m: any) => m.whatsapp && m.whatsapp.replace(/\D/g, '').includes(cleanJid));
                    let customerName = msg.pushName || "";
                    if (member && member.name) {
                        customerName = " " + member.name;
                    } else if (customerName) {
                        customerName = " " + customerName;
                    }

                    try {
                        const vnText = `Halo Kak${customerName}, mohon maaf mengganggu waktunya. Saya Chuna, asisten otomatis E4 Store. Nomor ini dioperasikan oleh sistem bot, jadi tidak bisa membalas pesan atau menerima telepon. Apabila Kakak mau memesan produk atau ada yang ingin ditanyakan, silakan kontak langsung ke Owner kami lewat link berikut. Sekian dari Chuna, mohon maaf sebesar-besarnya dan terima kasih!`;
                        
                        const baseVnName = path.join(process.cwd(), `tmp_gen_vn_${Date.now()}_${Math.floor(Math.random()*1000)}`);
                        const vnPathMp3 = `${baseVnName}.mp3`;
                        const vnPathOgg = `${baseVnName}.ogg`;
                        const tts = new EdgeTTS({ voice: 'id-ID-GadisNeural', lang: 'id-ID', outputFormat: 'audio-24khz-48kbitrate-mono-mp3', pitch: '+20Hz', rate: '+15%' });
                        await tts.ttsPromise(vnText, vnPathMp3);
                        await waSocket.sendPresenceUpdate("recording", jid);
                        await new Promise(r => setTimeout(r, 4500));
                        await waSocket.sendPresenceUpdate("paused", jid);
                        
                        const { exec } = await import('child_process');
                        await new Promise((resolve, reject) => {
                            exec(`ffmpeg -y -i ${vnPathMp3} -c:a libopus -b:a 48k -vbr on -compression_level 10 -frame_duration 20 -application voip ${vnPathOgg}`, (error) => {
                                if (error) {
                                    console.error("FFmpeg error:", error);
                                    reject(error);
                                } else {
                                    resolve(true);
                                }
                            });
                        });
                        let sent = false;
                        for(let i=0; i<3; i++) {
                            try {
                                const audioBuffer = fs.readFileSync(vnPathOgg);
                                await waSocket.sendMessage(jid, { audio: audioBuffer, mimetype: 'audio/mp4', ptt: true }, { quoted: msg });
                                sent = true;
                                break;
                            } catch (err: any) {
                                console.log("Upload failed, retrying...", err.message);
                                await new Promise(r => setTimeout(r, 2000));
                            }
                        }
                        if(sent) {
                            await waSocket.sendMessage(jid, { text: "📞 Link WA Owner: https://wa.me/6285169949218" });
                        }
                        
                        setTimeout(() => { 
                             try { fs.unlinkSync(vnPathMp3); } catch(e){} 
                             try { fs.unlinkSync(vnPathOgg); } catch(e){} 
                         }, 5000);
                    } catch (e) {
                        console.error("Gagal kirim VN general:", e);
                    }
                }
            }
        }
      }
    });

    waSocket.ev.on("call", async (calls) => {
      for (const call of calls) {
        if (call.status === "offer") {
          try {
            if (waSocket) {
              await waSocket.rejectCall(call.id, call.from);
              
              let customerName = "";
              const cleanJid = call.from.split('@')[0];
              const member = db.members.find((m: any) => m.whatsapp && m.whatsapp.replace(/\D/g, '').includes(cleanJid));
              if (member && member.name) {
                  customerName = " " + member.name;
              }
              
              const replyMsg = `Maaf banget, Kak${customerName}! Chuna nggak bisa angkat telepon sekarang (lagi sibuk ngurus pelanggan lain, hihi). Tapi jangan khawatir, mending langsung chat Bot Telegram resmi E4Store aja! Di sana Chuna 24 jam siap bantu jawab semua pertanyaan kamu dengan cepat dan ramah~Chuna asisten E4Store, transaksi langsung otomatis kok, tetap aman dan terpercaya! Yuk, mampir~ Chuna tunggu, ya! 😘🐾`;
              
              const baseVnName = path.join(process.cwd(), `tmp_call_vn_${Date.now()}_${Math.floor(Math.random()*1000)}`);
              const vnPathMp3 = `${baseVnName}.mp3`;
              const vnPathOgg = `${baseVnName}.ogg`;
              const tts = new EdgeTTS({ voice: 'id-ID-GadisNeural', lang: 'id-ID', outputFormat: 'audio-24khz-48kbitrate-mono-mp3', pitch: '+20Hz', rate: '+15%' });
              
              await tts.ttsPromise(replyMsg, vnPathMp3);
              
              await waSocket.presenceSubscribe(call.from);
              await waSocket.sendPresenceUpdate("recording", call.from);
              await new Promise(r => setTimeout(r, 3000));
              await waSocket.sendPresenceUpdate("paused", call.from);
              
              const { exec } = await import('child_process');
              await new Promise((resolve, reject) => {
                  exec(`ffmpeg -y -i ${vnPathMp3} -c:a libopus -b:a 48k -vbr on -compression_level 10 -frame_duration 20 -application voip ${vnPathOgg}`, (error) => {
                      if (error) {
                          console.error("FFmpeg error:", error);
                          reject(error);
                      } else {
                          resolve(true);
                      }
                  });
              });
              
              const audioBuffer = fs.readFileSync(vnPathOgg);
              await waSocket.sendMessage(call.from, { audio: audioBuffer, mimetype: 'audio/mp4', ptt: true });
              
              setTimeout(() => { 
                   try { fs.unlinkSync(vnPathMp3); } catch(e){} 
                   try { fs.unlinkSync(vnPathOgg); } catch(e){} 
              }, 5000);
            }
          } catch (e) {
            console.error("Failed to reject call or send VN", e);
          }
        }
      }
    });

    if (!state.creds.registered && !isRequestingPairingCode && globalWaPhoneNumber) {
      isRequestingPairingCode = true;
      setTimeout(async () => {
        try {
          let cleanNumber = globalWaPhoneNumber.replace(/\D/g, "");
          if (cleanNumber.startsWith("0")) {
            cleanNumber = "62" + cleanNumber.substring(1);
          }
          if (waSocket) {
            let code = await waSocket.requestPairingCode(cleanNumber);
            code = code?.match(/.{1,4}/g)?.join('-') || code;
            waPairingCode = code;
            waStatus = "Waiting for Pairing";
          }
        } catch (err: any) {
          console.error("Error requesting pairing code:", err);
          waStatus = "Error: " + (err.message || String(err));
        } finally {
          isRequestingPairingCode = false;
        }
      }, 3000);
    }
  };

  
  if (fs.existsSync(path.join(process.cwd(), "wa_auth"))) {
      startWaSocket();
  }

  app.post("/api/wa/start", async (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    try {
      waStatus = "Connecting...";
      waPairingCode = "";
      globalWaPhoneNumber = phoneNumber;
      
      if (waSocket) {
        waSocket.ev.removeAllListeners("connection.update");
        waSocket.end(undefined);
        waSocket = null;
      }
      
      waReconnectAttempts = 0;
      await startWaSocket();
      
      res.json({ success: true, message: "Requesting pairing code in background...", status: "Connecting..." });

    } catch (err: any) {
      waStatus = "Error: " + err.message;
      res.status(500).json({ success: false, error: err.message });
    }
  });

      
  function cleanupTransactions() {
    let changed = false;
    const now = new Date();
    const makassarDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Makassar' }).format(now);
    
    const newTransactions = transactions.filter((t: any) => {
        if (t.method === 'utang' && t.status === 'Sukses') return true;
        if (t.date) {
            const txDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Makassar' }).format(new Date(t.date));
            if (txDate < makassarDate) {
                changed = true;
                return false;
            }
        } else {
             changed = true;
             return false;
        }
        return true;
    });

    if (changed) {
        transactions.length = 0;
        transactions.push(...newTransactions);
        db.transactions = transactions;
        writeDB(db);
        console.log("Auto-reset old transactions finished.");
    }
  }
  
  cleanupTransactions();
  cron.schedule('0 0 * * *', cleanupTransactions, { timezone: "Asia/Makassar" });


  app.get("/api/debug-cache", (req, res) => {
    res.json({ prepaid: productsCache['prepaid'].data ? productsCache['prepaid'].data.length : 0, ml: productsCache['prepaid'].data ? productsCache['prepaid'].data.filter(p => p.brand === 'MOBILE LEGENDS').length : 0 });
});
app.get("/api/summary", (req, res) => {
    // Calculate total cuan from successful transactions
    const totalCuan = transactions
      .filter(t => t.status === 'Sukses' && t.cuan)
      .reduce((acc, t) => acc + (t.cuan || 0), 0);
      
    res.json({
      success: true,
      summary: {
        pendapatan: digiflazzBalance,
        totalCuan: totalCuan,
        produkTerlaris: transactions.length,
        statusServer: digiflazzStatus
      }
    });
  });

  

  // --- Expenses API ---
  app.get("/api/expenses", (req, res) => {
    const currentMonth = getWitaMonth();
    const filtered = (db.expenses || []).filter((e: any) => getWitaMonth(e.date) === currentMonth);
    res.json(filtered);
  });

  app.post("/api/expenses", (req, res) => {
    const { name, amount } = req.body;
    const newExpense = {
      id: Date.now().toString(),
      name,
      amount: Number(amount),
      date: new Date().toISOString()
    };
    if (!db.expenses) db.expenses = [];
    db.expenses.push(newExpense);
    writeDB(db);
    res.json(newExpense);
  });

  app.delete("/api/expenses/:id", (req, res) => {
    if (!db.expenses) db.expenses = [];
    db.expenses = db.expenses.filter((e: any) => e.id !== req.params.id);
    writeDB(db);
    res.json({ success: true });
  });
  // --- End Expenses API ---

  // --- Losses API ---
  app.get("/api/losses", (req, res) => {
    const currentMonth = getWitaMonth();
    const filtered = (db.losses || []).filter((e: any) => getWitaMonth(e.date) === currentMonth);
    res.json(filtered);
  });

  app.post("/api/losses", (req, res) => {
    const { productId, productName, quantity, reason, amount } = req.body;
    
    // Deduct stock
    const prod = db.physicalProducts.find((p: any) => p.id === productId);
    if (prod) {
        prod.stock = Math.max(0, prod.stock - Number(quantity));
    }
    
    const newLoss = {
      id: Date.now().toString(),
      productId,
      productName,
      quantity: Number(quantity),
      reason,
      amount: Number(amount),
      date: new Date().toISOString()
    };
    if (!db.losses) db.losses = [];
    db.losses.push(newLoss);
    writeDB(db);
    res.json(newLoss);
  });

  app.delete("/api/losses/:id", (req, res) => {
    if (!db.losses) db.losses = [];
    const loss = db.losses.find((l: any) => l.id === req.params.id);
    if (loss) {
        const prod = db.physicalProducts.find((p: any) => p.id === loss.productId);
        if (prod) {
            prod.stock += loss.quantity;
        }
    }
    db.losses = db.losses.filter((e: any) => e.id !== req.params.id);
    writeDB(db);
    res.json({ success: true });
  });
  // --- End Losses API ---

  // --- Physical Sales API ---
  app.get("/api/physical-products", (req, res) => {
    res.json(db.physicalProducts);
  });
  
  app.post("/api/physical-products", (req, res) => {
    const { name, price, stock, buyPrice, unit, category, promo, cupPrice, buyPriceTotal, buyQty, buyUnit, itemsPerUnit } = req.body;
    const newProduct = {
      id: Date.now().toString(),
      name,
      price: Number(price),
      stock: Number(stock),
      buyPrice: Number(buyPrice || 0),
      unit: unit || 'pcs',
      category: category || 'Lainnya',
      promo: promo || 'none',
      cupPrice: cupPrice ? Number(cupPrice) : undefined,
      buyPriceTotal: buyPriceTotal || '',
      buyQty: buyQty || '1',
      buyUnit: buyUnit || 'PAK',
      itemsPerUnit: itemsPerUnit || '1'
    };
    db.physicalProducts.push(newProduct);
    writeDB(db);
    res.json(newProduct);
  });
  
  app.put("/api/physical-products/:id", (req, res) => {
    const { id } = req.params;
    const { name, price, stock, buyPrice, unit, category, promo, cupPrice, buyPriceTotal, buyQty, buyUnit, itemsPerUnit } = req.body;
    const index = db.physicalProducts.findIndex((p: any) => p.id === id);
    if (index !== -1) {
      db.physicalProducts[index] = { ...db.physicalProducts[index], name, price: Number(price), stock: Number(stock), buyPrice: Number(buyPrice || 0), unit: unit || 'pcs', category: category || 'Lainnya', promo: promo || 'none', cupPrice: cupPrice ? Number(cupPrice) : undefined,
      buyPriceTotal: buyPriceTotal || '',
      buyQty: buyQty || '1',
      buyUnit: buyUnit || 'PAK',
      itemsPerUnit: itemsPerUnit || '1' };
      writeDB(db);
      res.json(db.physicalProducts[index]);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  });

  app.delete("/api/physical-products/:id", (req, res) => {
    const { id } = req.params;
    db.physicalProducts = db.physicalProducts.filter((p: any) => p.id !== id);
    writeDB(db);
    res.json({ success: true });
  });


  app.get("/api/physical-transactions", (req, res) => {
    const todayWita = getWitaDate();
    const filtered = (db.physicalTransactions || []).filter((tx: any) => {
        if (tx.method === 'utang') return true;
        if (getWitaDate(tx.date) === todayWita) return true;
        if (tx.paidAt && getWitaDate(tx.paidAt) === todayWita) return true;
        return false;
    });
    res.json(filtered);
  });

  app.post("/api/physical-transactions", async (req, res) => {
    const { items, total, method, customer } = req.body;
    const idempotencyKey = req.headers['x-idempotency-key'] as string;
    
    // Check Idempotency
    if (idempotencyKey) {
      const check = securitySuite.checkIdempotency(idempotencyKey);
      if (check.isDuplicate) {
        return res.json(check.cachedResult);
      }
    }
    
    try {
      const newTx = await securitySuite.atlasLock('physical-stock', async () => {
        // Update stock
        for (const item of (items || [])) {
           const product = db.physicalProducts.find((p: any) => p.id === item.id);
           if (product) {
               product.stock = Math.max(0, product.stock - item.quantity);
           }
        }
        
        const tx = {
           id: "PHY-" + Date.now(),
           date: new Date().toISOString(),
           items,
           total,
           method,
           customer,
           type: 'physical'
        };
        
        db.physicalTransactions.push(tx);
        writeDB(db);
        return tx;
      });

      if (idempotencyKey) {
        securitySuite.recordIdempotency(idempotencyKey, newTx);
      }
      res.json(newTx);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
  


  app.put("/api/physical-transactions/pay-customer", (req, res) => {
    const { customer, amount } = req.body || {};
    
    if (!customer || amount === undefined) {
      return res.status(400).json({ error: "Customer and amount are required" });
    }

    let remainingAmount = Number(amount);
    if (remainingAmount <= 0) {
      return res.status(400).json({ error: "Amount must be positive" });
    }

    // Find all unpaid transactions for this customer, sort by date (oldest first)
    const unpaidTxs = db.physicalTransactions
      .filter((t: any) => t.method === 'utang' && t.customer === customer)
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (const tx of unpaidTxs) {
      if (remainingAmount <= 0) break;
      
      const sisa = tx.total - (tx.paidAmount || 0);
      if (sisa <= 0) continue;

      const payForTx = Math.min(sisa, remainingAmount);
      tx.paidAmount = (tx.paidAmount || 0) + payForTx;
      remainingAmount -= payForTx;

      if (tx.paidAmount >= tx.total) {
        tx.method = 'cash'; // Mark as fully paid
        tx.paidAt = new Date().toISOString();
      }
    }

    writeDB(db);
    res.json({ success: true });
  });

  app.put("/api/physical-transactions/:id/pay", (req, res) => {
    const { id } = req.params;
    const { amount } = req.body || {};
    const tx = db.physicalTransactions.find((t: any) => t.id === id);
    if (!tx) return res.status(404).json({ error: "Transaction not found" });
    
    if (tx.method === 'utang') {
       if (amount !== undefined) {
           tx.paidAmount = (tx.paidAmount || 0) + Number(amount);
           if (tx.paidAmount >= tx.total) {
               tx.method = 'cash'; // Mark as fully paid
               tx.paidAt = new Date().toISOString();
           }
       } else {
           // Legacy full payment
           tx.paidAmount = tx.total;
           tx.method = 'cash';
           tx.paidAt = new Date().toISOString();
       }
       writeDB(db);
    }
    res.json({ success: true, tx });
  });

  app.get("/api/physical-stats", (req, res) => {
    let totalNilaiStok = 0;
    let totalPotensiLaba = 0;
    for (const p of db.physicalProducts) {
      totalNilaiStok += (p.buyPrice || 0) * (p.stock || 0);
      totalPotensiLaba += ((p.price || 0) - (p.buyPrice || 0)) * (p.stock || 0);
    }
    
    const currentMonth = getWitaMonth();

    let totalPendapatan = 0;
    let modalTerjual = 0;
    let totalFeeTerjual = 0;
    
    let totalPiutang = 0;
    for (const tx of db.physicalTransactions || []) {
      if (getWitaMonth(tx.date) !== currentMonth) continue;
      
      if (tx.method === 'cash') {
          totalPendapatan += tx.total;
      } else {
          totalPiutang += (tx.total - (tx.paidAmount || 0));
          totalPendapatan += (tx.paidAmount || 0);
      }
      for (const item of tx.items) {
        modalTerjual += (item.buyPrice || 0) * item.quantity;
        totalFeeTerjual += ((item.price || 0) - (item.buyPrice || 0)) * item.quantity;
      }
    }
    
    let totalPengeluaran = 0;
    for (const exp of db.expenses || []) {
      if (getWitaMonth(exp.date) !== currentMonth) continue;
      totalPengeluaran += exp.amount;
    }
    
    let totalKerugian = 0;
    for (const loss of db.losses || []) {
      if (getWitaMonth(loss.date) !== currentMonth) continue;
      totalKerugian += loss.amount;
    }
    
    res.json({
      totalModalKeseluruhan: totalNilaiStok + totalPengeluaran + totalKerugian,
      totalNilaiStok,
      totalPotensiLaba,
      totalFeeTerjual,
      totalPendapatan,
      totalPengeluaran,
      totalKerugian,
      totalKeuntungan: totalPendapatan - modalTerjual - totalPengeluaran - totalKerugian,
      modalTerjual
    });
  });

  app.get("/api/test-wa", async (req, res) => { if (waSocket) { try { await waSocket.sendMessage("6285169949218@s.whatsapp.net", { text: "Testing WA!" }); res.send("Sent"); } catch(e: any) { res.status(500).send(e.toString()); } } else { res.send("No wa"); } });

  // --- End Physical Sales API ---

  app.get("/api/transactions", (req, res) => {
    const enriched = transactions.map(t => {
      const member = members.find(m => m.id === t.memberId);
      return {
        ...t,
        username: member ? (member.name || "-") : "-",
        whatsapp: member ? (member.whatsapp || "-") : "-",
        telegram: member ? (member.telegram || "-") : "-"
      };
    });
    res.json({ success: true, transactions: enriched });
  });

  async function sendReminderToCustomer(tx: any, reminderType: '1_bulan' | '10_hari' = '1_bulan'): Promise<boolean> {
    const member = db.members.find((m: any) => m.id === tx.memberId);
    if (!member) return false;
    
    // Total all unpaid utang for this member
    const memberUtangTxs = db.transactions.filter((t: any) => t.method === 'utang' && t.status === 'Sukses' && t.memberId === tx.memberId);
    const utangList = memberUtangTxs.length > 0 ? memberUtangTxs : [tx];

    let totalUtang = 0;
    utangList.forEach((t: any) => {
        const sisa = t.price - (t.paidAmount || 0);
        totalUtang += sisa;
    });

    const dates = utangList.map((t: any) => new Date(t.date || Date.now()).getTime());
    const earliestDate = new Date(Math.min(...dates));
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const tglUtangStr = `${earliestDate.getDate()} ${months[earliestDate.getMonth()]} ${earliestDate.getFullYear()}`;

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - earliestDate.getTime());
    const diffDays = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

    const tunggakanText = `sudah masuk masa tunggakan ${diffDays} hari`;
    const productNames = Array.from(new Set(utangList.map((t: any) => t.product))).join(', ');
    
    const waDetails = await getCustomerWaDetails(member);
    const namaWaProfile = (waDetails.waProfile && waDetails.waProfile !== '-') ? waDetails.waProfile : (member.name || "Kak");
    const namaMember = member.name || "Pelanggan";

    const msg = `Halo Kak ${namaWaProfile}! 😊
Saya Chuna dari E4 Store.

Pengingat tagihan:
• Costumer : ${namaMember}
• Produk: ${productNames}
• Total: Rp${totalUtang.toLocaleString('id-ID')}
• Tunggakan: ${diffDays} hari

Mohon pelunasan maksimal 3 hari ke depan ya, Kak. Kami sedang butuh dana untuk stok produk.

Jika ada kendala, hubungi owner: 085169949218.

Terima kasih 🙏
Chuna – E4 Store`;
    
    let sent = false;
    let debtReceiptBuffer: Buffer | null = null;
    try {
        debtReceiptBuffer = await generateCanvasDebtReceipt(member, utangList);
    } catch (e) {}

    let rawWa = member.whatsapp || (waDetails.waPhone !== '-' ? waDetails.waPhone : '');
    if (rawWa && waSocket) {
      let cleanWa = rawWa.replace(/\D/g, '');
      if (cleanWa.startsWith('0')) cleanWa = '62' + cleanWa.substring(1);
      const jid = `${cleanWa}@s.whatsapp.net`;
      try {
        await waSocket.presenceSubscribe(jid);
        await waSocket.sendPresenceUpdate("composing", jid);
        await new Promise(r => setTimeout(r, 1200));
        await waSocket.sendPresenceUpdate("paused", jid);

        if (debtReceiptBuffer) {
          await waSocket.sendMessage(jid, { image: debtReceiptBuffer, caption: msg });
        } else {
          await waSocket.sendMessage(jid, { text: msg });
        }
        sent = true;
      } catch (e) {
        console.error("Gagal mengirim WA reminder", e);
      }
    }
    
    if (!sent && member.telegram && bot) {
      try {
         if (debtReceiptBuffer) {
           await bot.telegram.sendPhoto(member.telegram, { source: debtReceiptBuffer }, { caption: msg, parse_mode: 'Markdown' });
         } else {
           await bot.telegram.sendMessage(member.telegram, msg);
         }
         sent = true;
      } catch (e) {
         console.error("Gagal mengirim TG reminder", e);
      }
    }

    return sent;
  }

  app.post("/api/transactions/:id/remind", async (req, res) => {
    const tx = db.transactions.find(t => t.id === req.params.id);
    if (!tx) return res.status(404).json({ error: "Transaksi tidak ditemukan" });
    if (tx.method !== 'utang' || tx.status !== 'Sukses') return res.status(400).json({ error: "Hanya utang yang sukses yang dapat di-remind" });
    
    const sent = await sendReminderToCustomer(tx, '1_bulan');

    if (sent) {
       tx.lastReminderSentAt = new Date().toISOString();
       writeDB(db);
       res.json({ success: true, message: "Pengingat berhasil dikirim ke pelanggan!" });
    } else {
       res.status(500).json({ error: "Gagal mengirim pengingat, pastikan kontak pelanggan terhubung ke bot WA/TG." });
    }
  });

  // Background auto reminder logic
  async function processAutoReminders() {
    let updated = false;
    const now = Date.now();
    for (const tx of db.transactions) {
        if (tx.method === 'utang' && tx.status === 'Sukses') {
            const txDate = new Date(tx.date).getTime();
            const daysSinceTx = Math.floor((now - txDate) / (1000 * 60 * 60 * 24));
            
            if (daysSinceTx >= 30) {
                const lastReminder = tx.lastReminderSentAt ? new Date(tx.lastReminderSentAt).getTime() : 0;
                const daysSinceLastReminder = lastReminder ? Math.floor((now - lastReminder) / (1000 * 60 * 60 * 24)) : Infinity;
                
                if (!tx.lastReminderSentAt) {
                    // Send 1 month reminder
                    const sent = await sendReminderToCustomer(tx, '1_bulan');
                    if (sent) {
                        tx.lastReminderSentAt = new Date().toISOString();
                        updated = true;
                    }
                } else if (daysSinceLastReminder >= 10) {
                    // Send subsequent 10 day reminder
                    const sent = await sendReminderToCustomer(tx, '10_hari');
                    if (sent) {
                        tx.lastReminderSentAt = new Date().toISOString();
                        updated = true;
                    }
                }
            }
        }
    }
    if (updated) {
        writeDB(db);
    }
  }

  // Check auto-reminders every 12 hours (43200000 ms)
  setInterval(processAutoReminders, 12 * 60 * 60 * 1000);
  // Also run once 30 seconds after boot to catch up
  setTimeout(processAutoReminders, 30000);

  app.post("/api/transactions/:id/lunas", async (req, res) => {
    const tx = db.transactions.find(t => t.id === req.params.id);
    if (!tx) return res.status(404).json({ error: "Transaksi tidak ditemukan" });
    if (tx.method !== 'utang' || tx.status !== 'Sukses') return res.status(400).json({ error: "Hanya utang yang sukses dapat dilunasi" });
    
    tx.status = 'Sukses (Lunas)';
    tx.paidAmount = tx.price;
    db.transactions = transactions;
    writeDB(db);

    const member = members.find((m: any) => m.id === tx.memberId);
    if (member) {
      const nama = member.name || "Kak";
      const dUtang = new Date(tx.date || new Date());
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      const tglUtangStr = `${dUtang.getDate()} ${months[dUtang.getMonth()]} ${dUtang.getFullYear()}`;
      const today = new Date();
      const tglBayarStr = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;

      const msg = `✅ LUNAS TOTAL! 🎉\nHalo Kak ${nama},\nDengan senang hati kami informasikan bahwa pembayaran utang kakak telah sukses dan lunas! Berikut detailnya ya:`;
      
      let imgBuffer: Buffer | null = null;
      try {
        imgBuffer = await generateDebtSettlementReceipt({
          nama: `Kak ${nama}`,
          isLunasTotal: true,
          products: [{ name: tx.product, price: tx.price }],
          totalDebt: tx.price,
          dibayarkan: tx.price,
          kembalian: 0,
          tglUtang: tglUtangStr,
          tglBayar: tglBayarStr
        });
      } catch (err) {
        console.error("Failed to generate debt settlement image:", err);
      }

      // Notify Telegram if possible
      if (bot && member.telegram && member.telegram.length > 0) {
        try {
          const tgId = Array.isArray(member.telegram) ? member.telegram[0] : member.telegram.replace(/\D/g, '');
          if (imgBuffer) {
            await bot.telegram.sendPhoto(tgId, { source: imgBuffer }, { caption: msg });
          } else {
            await bot.telegram.sendMessage(tgId, msg);
          }
        } catch(e){}
      }
      // Notify WhatsApp if possible
      if (waSocket && member.whatsapp) {
        let cleanWa = member.whatsapp.replace(/\D/g, "");
        if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
        const jid = cleanWa + "@s.whatsapp.net";
        try {
          await waSocket.presenceSubscribe(jid);
          await waSocket.sendPresenceUpdate('composing', jid);
          await new Promise(r => setTimeout(r, 1200));
          await waSocket.sendPresenceUpdate('paused', jid);
          if (imgBuffer) {
            await waSocket.sendMessage(jid, { image: imgBuffer, caption: msg });
          } else {
            await waSocket?.sendMessage(jid, { text: msg });
          }
        } catch(e) { console.error("Error:", e.message); }
      }
    }
    res.json({ success: true });
  });

  app.get("/api/members/offline", (req, res) => {
    // Return all members, or just those added manually (without telegram ID)
    const offlineMembers = members.filter(m => !m.telegram || !m.telegram.startsWith('ID:'));
    res.json({ success: true, members: offlineMembers });
  });

  app.get("/api/members", (req, res) => {
    const onlineMembers = members.filter(m => m.telegram && m.telegram.startsWith('ID:'));
    res.json({ success: true, members: onlineMembers });
  });

  app.post("/api/members/:id/topup", async (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;
    const member = members.find(m => m.id === id);
    if (member) {
      member.balance += amount;
      db.members = members;
      writeDB(db);
      
      const userId = id.replace('MBR-', '');
      const msgText = `🎉 SALDO MASUK NIH KAK!

Halo kak ${member.name}! Chuna mau kasih kabar baik nih~ 💚

💰 Saldo Ditambahkan: Rp ${Number(amount).toLocaleString('id-ID')}
💳 Saldo Sekarang: Rp ${member.balance.toLocaleString('id-ID')}

Yuk langsung belanja kak, banyak promo nunggu! 🛍️✨`;

      try {
        if (bot) {
          await bot.telegram.sendMessage(userId, msgText);
        }
      } catch(e) {
         console.log('Failed to send topup notification to telegram:', e);
      }
      
      if (waSocket && waStatus.includes('Connected') && member.whatsapp) {
         let cleanWa = member.whatsapp.replace(/\D/g, "");
         if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
         const jid = `${cleanWa}@s.whatsapp.net`;
         try {
            await waSocket.sendMessage(jid, { text: msgText });
         } catch(e) {
            console.log('Failed to send topup notification to whatsapp:', e);
         }
      }
      
      res.json({ success: true, member });
    } else {
      res.status(404).json({ success: false, error: "Member not found" });
    }
  });

  
  
  app.post("/api/members/:id/balance", async (req, res) => {
    const { id } = req.params;
    const { balance } = req.body;
    try {
      await securitySuite.atlasLock(`member:${id}`, async () => {
        const member = members.find(m => m.id === id);
        if (member) {
           member.balance = balance;
           db.members = members;
           writeDB(db);
           res.json({ success: true, member });
        } else {
           res.status(404).json({ error: "Member not found" });
        }
      });
    } catch (err: any) {
       res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/members/:id/telegram", async (req, res) => {
    const { id } = req.params;
    const { telegram } = req.body;
    try {
      const member = members.find(m => m.id === id);
      if (member) {
         member.telegram = telegram;
         db.members = members;
         writeDB(db);
         res.json({ success: true, member });
      } else {
         res.status(404).json({ error: "Member not found" });
      }
    } catch (err) {
       res.status(500).json({ error: err.message });
    }
  });


  app.post("/api/members/:id/reset-pin", async (req, res) => {
    const { id } = req.params;
    const memberIndex = members.findIndex(m => m.id === id);
    if (memberIndex !== -1) {
      const member = members[memberIndex];
      let userId = id.replace('MBR-', '');
      if (member.telegram && member.telegram.startsWith('ID:')) {
         userId = member.telegram.substring(3);
      }
      let found = false;
      let matchedKey = userId;
      
      if (registeredUsers[userId]) {
        found = true;
      } else {
        const keys = Object.keys(registeredUsers);
        const matchingKey = keys.find(k => String(k) === String(userId));
        if (matchingKey) {
            matchedKey = matchingKey;
            found = true;
        }
      }
      
      if (!found) {
          return res.status(404).json({ success: false, error: 'User tidak memiliki akun bot (belum register).' });
      }
      
      const userWa = registeredUsers[matchedKey].wa;
      const userName = registeredUsers[matchedKey].username;
      
      // Set state for this user so they have to input a new PIN next time they chat
      userStates[matchedKey] = {
        step: 'AWAITING_PIN',
        data: { username: userName, wa: userWa }
      };
      
      // Set fallback pin to 123456 just in case
      registeredUsers[matchedKey].pin = '123456';
      db.registeredUsers = registeredUsers;
      writeDB(db);
      
      const msgText = "⚠️ *INFO KEAMANAN*\n\nAdmin telah mereset PIN Anda ke *123456*. Silakan balas pesan ini dengan *PIN BARU* Anda (6 angka) untuk mengamankan kembali akun Anda.";
      
      // Try send to Telegram
      try {
        if (bot) await bot.telegram.sendMessage(matchedKey, msgText, { parse_mode: 'Markdown' });
      } catch(e) {}
      
      // Try send to WhatsApp
      try {
        if (waSocket && waStatus.includes('Connected') && userWa) {
           let cleanWa = userWa.replace(/\D/g, "");
           if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
           const jid = `${cleanWa}@s.whatsapp.net`;
           await waSocket.sendMessage(jid, { text: msgText });
        }
      } catch(e) {}
      
      return res.json({ success: true, message: 'Permintaan reset PIN telah dikirim ke member' });
    }
    res.status(404).json({ success: false, error: 'Member tidak ditemukan' });
  });

  app.delete("/api/members/:id", (req, res) => {
    const { id } = req.params;
    const memberIndex = members.findIndex(m => m.id === id);
    if (memberIndex !== -1) {
      const member = members[memberIndex];
      members.splice(memberIndex, 1);
      db.members = members;
      
      let userId = id.replace('MBR-', '');
      if (member.telegram && member.telegram.startsWith('ID:')) {
         userId = member.telegram.substring(3);
      }
      
      if (registeredUsers[userId]) {
        delete registeredUsers[userId];
      } else {
        const keys = Object.keys(registeredUsers);
        const matchingKey = keys.find(k => String(k) === String(userId));
        if (matchingKey) {
            delete registeredUsers[matchingKey];
        }
      }
      db.registeredUsers = registeredUsers;
      writeDB(db);
      return res.json({ success: true, message: 'Member berhasil dihapus' });
    }
    res.status(404).json({ success: false, error: 'Member tidak ditemukan' });
  });

  app.post("/api/members/:id/type", async (req, res) => {
    const { id } = req.params;
    const { type } = req.body;
    const member = members.find(m => m.id === id);
    if (member) {
      const oldType = member.type;
      member.type = type;
      db.members = members;
      writeDB(db);
      
      const userId = id.replace('MBR-', '');
      const msgText = `🎉 SELAMAT! STATUS AKUN KAKAK BERUBAH NIH! 🌟

Halo kak ${member.name}! Chuna mau kasih tau kalau tipe akun kakak sekarang udah jadi *${type}* loh! 🥳

Nikmati kemudahan bertransaksi dan pastinya makin untung belanja di E4 Store!
Yuk cek produk dan katalog terbaru sekarang kak~ 🛍️✨`;

      try {
        if (bot) {
          await bot.telegram.sendMessage(userId, msgText);
        }
      } catch(e) {
         console.log('Failed to send type change notification to telegram:', e);
      }
      
      if (waSocket && waStatus.includes('Connected') && member.whatsapp) {
         let cleanWa = member.whatsapp.replace(/\D/g, "");
         if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
         const jid = `${cleanWa}@s.whatsapp.net`;
         try {
            await waSocket.sendMessage(jid, { text: msgText });
         } catch(e) {
            console.log('Failed to send type change notification to whatsapp:', e);
         }
      }

      if (member.gmail && db.gmailEmail && db.gmailAppPassword) {
         try {
           const transporter = nodemailer.createTransport({
             service: 'gmail',
             auth: {
               user: db.gmailEmail,
               pass: db.gmailAppPassword
             }
           });
           const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Status Akun E4 Store</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #121212; color: #ffffff; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #1e1e1e; padding: 30px 20px; }
    .header { text-align: center; padding-bottom: 25px; }
    .logo-text { font-size: 32px; font-weight: 900; color: #3b82f6; text-decoration: none; letter-spacing: 2px; font-style: italic; }
    .logo-text span { color: #f97316; }
    .success-banner { background-color: #064e3b; color: #34d399; padding: 16px 20px; border-radius: 12px; display: flex; align-items: center; margin-bottom: 30px; font-weight: 600; font-size: 16px; border: 1px solid #059669; }
    .success-icon { margin-right: 12px; font-size: 16px; background-color: #34d399; color: #064e3b; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; }
    .hero-image { width: 100%; border-radius: 16px; margin-bottom: 30px; background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%); height: 160px; display: flex; align-items: center; justify-content: center; color: white; font-size: 48px; font-weight: bold; text-align: center; }
    .title { font-size: 26px; font-weight: 800; margin-bottom: 20px; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px; }
    .content { font-size: 16px; line-height: 1.7; color: #d1d5db; }
    .content p { margin-bottom: 16px; }
    .highlight { color: #34d399; font-weight: 700; font-size: 18px; }
    .footer { margin-top: 40px; text-align: center; font-size: 14px; color: #6b7280; border-top: 1px solid #374151; padding-top: 25px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-text">E<span>4</span> STORE</div>
    </div>
    <div class="success-banner">
      <span class="success-icon">✓</span> Status Akun Berhasil Diupdate!
    </div>
    <div class="hero-image">
      🎉 🥳 ✨
    </div>
    <div class="title">
      Hai, ${(member.name || 'Kakak').toUpperCase()}
    </div>
    <div class="content">
      <p>Terima kasih udah setia bertransaksi di E4 Store! Kami punya kabar gembira buat kamu nih.</p>
      <p>Mulai hari ini, tipe akun kamu resmi di-upgrade menjadi <span class="highlight">${type}</span>! 🌟</p>
      <p>Dengan status akun yang baru, kamu bisa menikmati kemudahan bertransaksi yang lebih baik dan pastinya makin untung belanja di E4 Store.</p>
      <p>Yuk, cek produk dan katalog terbaru sekarang juga! 🛍️✨</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} E4 Store Official. Hak cipta dilindungi.
    </div>
  </div>
</body>
</html>`;

           await transporter.sendMail({
             from: `E4 Store <${db.gmailEmail}>`,
             to: member.gmail,
             subject: 'Selamat! Tipe Akun Anda Berubah 🎉',
             html: htmlContent
           });
         } catch (e) {
           console.log('Failed to send type change notification to gmail:', e);
         }
      }

      res.json({ success: true, member });
    } else {
      res.status(404).json({ success: false, error: "Member not found" });
    }
  });

  // --- Digiflazz API Routes ---
  app.get("/api/digiflazz/status", async (req, res) => {
    if (digiflazzUsername && digiflazzApiKey) {
        try {
            const sign = crypto.createHash("md5").update(digiflazzUsername + digiflazzApiKey + "depo").digest("hex");
            const response = await fetch("https://api.digiflazz.com/v1/cek-saldo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cmd: "deposit",
                    username: digiflazzUsername,
                    sign: sign
                })
            });
            const data = await response.json();
            if (data && data.data && data.data.deposit !== undefined) {
                digiflazzBalance = data.data.deposit;
                digiflazzStatus = "Connected";
            }
        } catch(e) {
            console.error("Failed to fetch balance in status route", e);
        }
    }
    res.json({ status: digiflazzStatus, balance: digiflazzBalance, username: digiflazzUsername, apiKey: digiflazzApiKey });
  });

  app.post("/api/digiflazz/configure", async (req, res) => {
    const { username, apiKey } = req.body;
    
    if (!username || !apiKey) {
      return res.status(400).json({ error: "Username dan API Key diperlukan" });
    }

    try {
      const sign = crypto.createHash("md5").update(username + apiKey + "depo").digest("hex");
      const response = await fetch("https://api.digiflazz.com/v1/cek-saldo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cmd: "deposit",
          username: username,
          sign: sign
        })
      });
      const data = await response.json();
      
      if (data.data && data.data.deposit !== undefined) {
        digiflazzUsername = username;
        digiflazzApiKey = apiKey;
        db.digiflazzUsername = username;
        db.digiflazzApiKey = apiKey;
        writeDB(db);
        digiflazzBalance = data.data.deposit;
        digiflazzStatus = "Connected";
        res.json({ success: true, message: "Digiflazz connected successfully", balance: data.data.deposit });
      } else {
        digiflazzStatus = "Error: Invalid credentials";
        res.status(400).json({ success: false, error: "Gagal terhubung ke Digiflazz (Cek kredensial)" });
      }
    } catch (err: any) {
      digiflazzStatus = "Error: " + err.message;
      res.status(500).json({ success: false, error: err.message });
    }
  });

  
  const productsCache: any = {
    prepaid: { data: null, timestamp: 0 },
    pasca: { data: null, timestamp: 0 }
  };
  const CACHE_TTL = 15 * 60 * 1000; // 15 minutes



async function parseAnnouncementText(text: string) {
    let prefix = "";
    // Hanya tambahkan prefix jika text belum mengandung kata pengumuman
    if (!text.toLowerCase().includes("pengumuman e4 store")) {
        prefix = "📢 *PENGUMUMAN E4 STORE* 📢\n";
        try {
            const { getHolidayInfo } = await import('./src/utils/holidays');
            const holiday = getHolidayInfo(new Date());
            if (holiday) {
                prefix += `🗓️ Info Hari: ${holiday.text}\n`;
            }
        } catch(e) {
            console.error("Failed to load holiday info", e);
        }
        prefix += "━━━━━━━━━━━━━━━━━━━━━\n\n";
    }

    
    let parsed = text;
    if (text.includes('{{')) {
        try {
            const prepaid = await getDigiflazzProducts('prepaid');
            parsed = text.replace(/\{\{([^:]+)(?::([^}]+))?\}\}/g, (match, sku, type) => {
                const product = prepaid.find((p: any) => p.buyer_sku_code.toLowerCase() === sku.toLowerCase().trim() || p.product_name.toLowerCase() === sku.toLowerCase().trim());
                if (!product) return match; 
                
                const feeBiasa = getProductFee(product.buyer_sku_code).biasa;
                const feeVip = getProductFee(product.buyer_sku_code).vip;
                
                const priceReguler = product.price + feeBiasa;
                const priceVip = product.price + feeVip;
                const isNormal = product.buyer_product_status && product.seller_product_status;
                const status = isNormal ? "🟢 NORMAL" : "🔴 GANGGUAN/CLOSE";
                
                const reqType = (type || "").toUpperCase().trim();
                if (reqType === "REGULER") return "Rp " + priceReguler.toLocaleString('id-ID');
                if (reqType === "VIP") return "Rp " + priceVip.toLocaleString('id-ID');
                if (reqType === "NAMA") return product.product_name;
                if (reqType === "STATUS") return status;
                if (reqType === "HEMAT") return "Rp " + (priceReguler - priceVip).toLocaleString('id-ID');
                
                return product.product_name + " - Reg: Rp " + priceReguler.toLocaleString('id-ID') + " | VIP: Rp " + priceVip.toLocaleString('id-ID') + " (" + status + ")";
            });
        } catch (e) {
            console.error("Error parsing announcement text:", e);
        }
    }
    return prefix + parsed;
}


async function getOmniPackages(nohp: string): Promise<any[]> {
    try {
        const params = new URLSearchParams();
        params.append("nohp", nohp);
        params.append("menu_id", "");
        params.append("ci_csrf_token", "");

        const res = await fetch("https://kodebayar.web.id/home/search_page?provider=TELKOMSEL", {
            method: "POST",
            body: params
        });
        const json = await res.json();
        if (!json.isi) return [];
        const html = json.isi;
        
        let packages = [];
        const parts = html.split('<h4 class="modal-title">');
        for (let i = 1; i < parts.length; i++) {
            const part = parts[i];
            const nameMatch = part.match(/^(.*?)<\/h4>/);
            if (!nameMatch) continue;
            let baseName = nameMatch[1].trim();
            
            let dataSize = "";
            const badgeMatch = part.match(/<span class="[^"]*float-right[^"]*">([^<]*(?:GB|MB))<\/span>/i);
            if (badgeMatch) dataSize = badgeMatch[1].trim();
            
            let masaAktif = "";
            const masaMatch = part.match(/<span class="[^"]*float-right[^"]*">([^<]*(?:Hari|Days))<\/span>/i);
            if (masaMatch) masaAktif = masaMatch[1].trim();
            
            let price = "";
            const priceMatch = part.match(/Harga[\s\S]*?<span class="[^"]*float-right[^"]*">([^<]+)<\/span>/i);
            if (priceMatch) price = priceMatch[1].trim();
            
            let code = "";
            const orderMatch = part.match(/onclick="order\('([^']+)'/);
            if (orderMatch) code = orderMatch[1].trim();
            
            if (baseName && code) {
                let fullName = baseName;
                if (dataSize) fullName += " " + dataSize;
                if (masaAktif) fullName += " " + masaAktif;
                packages.push({ name: fullName, price: price, code: code });
            }
        }
        return packages;
    } catch (e) {
        console.error("Omni scrape error", e);
        return [];
    }
}
async function getKodeBayarPackages(nohp: string, provider: string): Promise<any[]> {
    try {
        const params = new URLSearchParams();
        params.append("nohp", nohp);
        params.append("menu_id", "");
        params.append("ci_csrf_token", "");

        const res = await fetch(`https://kodebayar.web.id/home/search_page?provider=${provider}`, {
            method: "POST",
            body: params
        });
        const data = await res.json();
        if (!data.is_valid_number) return [];
        const html = data.isi;
        
        let packages = [];
        const parts = html.split('<h4 class="modal-title">');
        for (let i = 1; i < parts.length; i++) {
            const part = parts[i];
            
            const nameMatch = part.match(/^(.*?)</);
            if (!nameMatch) continue;
            let baseName = nameMatch[1].trim();
            
            const descMatch = part.match(/<div class="card-body">\s*(.*?)\s*<\/div>/);
            if (descMatch && !baseName) {
                baseName = descMatch[1].trim();
            }
            
            let price = "";
            const priceMatch = part.match(/Harga[\s\S]*?<span class="[^"]*float-right[^"]*">([^<]+)<\/span>/i);
            if (priceMatch) {
                price = priceMatch[1].trim();
            }
            
            const orderMatch = part.match(/onclick="order\('([^']+)',\s*'([^']+)',\s*(\d+),\s*'([^']+)'\)"/);
            if (orderMatch && baseName) {
                let pkg: any = { name: baseName, price: price };
                pkg.arg1 = orderMatch[1];
                pkg.arg2 = orderMatch[2];
                pkg.arg3 = orderMatch[3];
                pkg.arg4 = orderMatch[4];
                
                const kodebeliField = part.match(new RegExp(`id="kodebeli_${pkg.arg2}"[^>]*value="([^"]+)"`));
                pkg.kodebeliValue = kodebeliField ? kodebeliField[1] : pkg.arg1;
                pkg.token = data.token;
                
                packages.push(pkg);
            }
        }
        
        const unique = [];
        const seen = new Set();
        for (const p of packages) {
            const key = p.name + p.price;
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(p);
            }
        }
        return unique;
    } catch (e) {
        console.error(`${provider} scrape error`, e);
        return [];
    }
}

async function generateKodeBayar(nohp: string, pkg: any, provider: string): Promise<string | null> {
    try {
        const orderParams = new URLSearchParams();
        orderParams.append("nohp", nohp);
        orderParams.append("kode", pkg.kodebeliValue);
        orderParams.append("id", pkg.arg3);
        orderParams.append("menu_id", pkg.arg4);
        orderParams.append("ci_csrf_token", pkg.token);
        
        const res2 = await fetch(`https://kodebayar.web.id/home/inquiry_page?provider=${provider}`, {
            method: "POST",
            body: orderParams
        });
        const orderData = await res2.json();
        return orderData.kode_bayar || null;
    } catch (e) {
        console.error(`${provider} generate kode bayar error`, e);
        return null;
    }
}
async function getDigiflazzProducts(type: "prepaid" | "pasca") {
  if (!digiflazzUsername || !digiflazzApiKey) {
    throw new Error("Digiflazz belum dikonfigurasi");
  }

  const cacheKey = type;
  if (productsCache[cacheKey].data && (Date.now() - productsCache[cacheKey].timestamp < CACHE_TTL)) {
    return productsCache[cacheKey].data;
  }

  let cmd = "prepaid";
  if (type === "pasca") cmd = "pasca";
  let signText = digiflazzUsername + digiflazzApiKey + "pricelist";
  const sign = crypto.createHash("md5").update(signText).digest("hex");

  const response = await fetch("https://api.digiflazz.com/v1/price-list", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cmd: cmd,
      username: digiflazzUsername,
      sign: sign
    })
  });
  
  const data = await response.json();
  if (data.data && Array.isArray(data.data)) {
    productsCache[cacheKey].data = data.data;
    productsCache[cacheKey].timestamp = Date.now();
    return data.data;
  } else {
    if (productsCache[cacheKey].data) {
        console.warn("Digiflazz pricelist error, using stale cache:", data.data?.message);
        return productsCache[cacheKey].data; // Fallback to stale cache
    }
    throw new Error(data.data?.message || data.message || "Gagal mengambil produk");
  }
}


  app.post("/api/digiflazz/products/fee", async (req, res) => {
    try {
      const { sku, biasa, vip, owner, owner_fixed } = req.body;
      if (!sku) return res.status(400).json({ success: false, error: "SKU diperlukan" });
      
      productFees[sku] = { biasa: Number(biasa) || 0, vip: Number(vip) || 0, owner: Number(owner) || 0, owner_fixed: owner_fixed !== undefined ? Number(owner_fixed) : undefined };
      db.productFees = productFees;
      writeDB(db);
      
      res.json({ success: true, message: "Fee berhasil disimpan" });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/digiflazz/products/fee/bulk", express.json(), async (req, res) => {
    try {
      const { fees } = req.body;
      if (!fees || !Array.isArray(fees)) return res.status(400).json({ success: false, error: "Fees array diperlukan" });
      
      for (const f of fees) {
        if (!f.sku) continue;
        productFees[f.sku] = { biasa: Number(f.biasa) || 0, vip: Number(f.vip) || 0, owner: Number(f.owner) || 0, owner_fixed: f.owner_fixed !== undefined ? Number(f.owner_fixed) : undefined };
      }
      
      db.productFees = productFees;
      writeDB(db);
      
      res.json({ success: true, message: "Bulk fee berhasil disimpan" });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get("/api/digiflazz/products", async (req, res) => {

    if (!digiflazzUsername || !digiflazzApiKey) {
      return res.status(400).json({ success: false, error: "Digiflazz belum dikonfigurasi" });
    }
    
    
    
    try {
      const type = req.query.type as string || "prepaid";
      const products = await getDigiflazzProducts(type as "prepaid" | "pasca");
      const mapped = products.map((p: any) => ({
        ...p,
        fee_biasa: getProductFee(p.buyer_sku_code).biasa,
        fee_vip: getProductFee(p.buyer_sku_code).vip,
        fee_owner: getProductFee(p.buyer_sku_code).owner, owner_fixed: getProductFee(p.buyer_sku_code).owner_fixed
      }));
      res.json({ success: true, data: mapped });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }

  });

  // --- Telegram Bot API Routes ---
  app.get("/api/bot/status", (req, res) => {
    res.json({ status: botStatus, running: bot !== null, token: db.telegramToken || "" });
  });

  app.get("/api/bot/owner", (req, res) => {
    res.json({ owners: db.owners || [] });
  });

  app.post("/api/bot/owner", (req, res) => {
    const { owners } = req.body;
    if (!Array.isArray(owners)) {
      return res.status(400).json({ error: "Owners must be an array" });
    }
    db.owners = owners.map(id => Number(id));
    writeDB(db);
    res.json({ success: true, message: "Owner IDs updated" });
  });


  async function startTelegramBot(token: string) {
    try {
      if (bot) {
        await bot.stop("Config updated");
      }
      
      const processPrepaidPayment = async (ctx: any, sku: string, method: string, stateData: any, memberId: string) => {
        const product = stateData.product;
        const total = stateData.totalBayar;
        const targetNo = stateData.targetNo || stateData.customerNo || "-";
        const targetDisplay = stateData.nickname ? `${targetNo} (${stateData.nickname})` : targetNo;

        const member = members.find((m: any) => m.id === memberId || isTelegramMatch(m.telegram, ctx.from?.id, ctx.from?.username));
        
        if (!member) return ctx.reply("❌ Member tidak ditemukan.");

        const isOwnerSelf = db.owners.includes(ctx.from?.id) && isTelegramMatch(member.telegram, ctx.from?.id, ctx.from?.username);
        
        if (!isOwnerSelf) {
            if (method === 'saldo') {
                if (member.balance < total) {
                    return ctx.reply(`❌ TRANSAKSI DITOLAK!Maaf kak, saldo kakak tidak mencukupi untuk melakukan transaksi ini.💳 Saldo Saat Ini: Rp ${member.balance.toLocaleString('id-ID')}💰 Total Bayar: Rp ${total.toLocaleString('id-ID')}Silakan isi ulang saldo kakak terlebih dahulu. 🙏`, { reply_markup: { keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Fitur Download" }]], resize_keyboard: true } });
                }
                member.balance -= total;
                db.members = members;
                writeDB(db);
            }
        }
        
        const methodDisplay = method === 'cash' ? '💵 Tunai (Cash)' : method === 'utang' ? '📝 Utang' : '💳 Saldo';
        await ctx.reply(`⏳ Status: Sedang memproses pembelian ${product.product_name} ke nomor ${targetNo} melalui metode ${methodDisplay}. Mohon ditunggu.`);
        
        const pay_ref_id = "PRE-" + Date.now();
        try {
            const signText = digiflazzUsername + digiflazzApiKey + pay_ref_id;
            const sign = crypto.createHash("md5").update(signText).digest("hex");
            const res = await fetch("https://api.digiflazz.com/v1/transaction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: digiflazzUsername,
                    buyer_sku_code: sku,
                    customer_no: targetNo,
                    ref_id: pay_ref_id,
                    sign: sign
                })
            });
            const payJson = await res.json();
            
            if (payJson.data) {
                const status = payJson.data.status || 'Gagal';
                const digiflazzPrice = payJson.data.price || 0;
                const cuan = total - digiflazzPrice;
                
                let paymentInfo = "";
                if (method === 'saldo') {
                    paymentInfo = `    💰 SALDO  : "Cusss! Saldo langsung kepotong,                 beres dalam sekejap! Kamu jago                 banget pake saldo, Chuna salut! 💰✨"`;
                } else if (method === 'cash') {
                    paymentInfo = `    💵 CASH   : "Duitnya Chuna terima dengan senyum                 lebar! Bayar tunai tetap berkesan!                 Makasih udah main ke E4 Store! 🫳🌸"`;
                } else {
                    paymentInfo = `    📝 JANJI   : "Chuna percaya 100% sama kamu! 😍     BAYAR      Kamu pasti bayar tepat waktu karena    TEPAT       Chuna tahu kamu pelanggan baik hati.    WAKTU       Nanti kalau sudah transfer, chat                 Chuna aja, nanti Chuna proses dengan                 senyum manis! Makasih udah jujur! 💖🤗"`;
                }
                
                let msg = "";
                let tgMsgId: number | undefined;
                let waMsgKey: any | undefined;
                let waJid: string | undefined;

                const waDetails = await getCustomerWaDetails(member, ctx.from?.id);
                const waProfileName = (waDetails && waDetails.waProfile && waDetails.waProfile !== '-') ? waDetails.waProfile : (member.name || '');
                const greetingWaName = waProfileName ? ` ${waProfileName}` : '';

                if (status === 'Pending') {
                    msg = `⏳ Hai Kak!

Pesanan Anda sedang diproses oleh sistem pusat E4 Store. Mohon tunggu beberapa saat, nanti akan kami kabari setelah selesai.

📦 Produk  : ${product.product_name}
🎯 Tujuan   : ${targetDisplay} (${member.name || "-"})

Chuna menunggu kabar baik dari Kakak! 😊`;
                    const tgMsg = await ctx.reply(msg);
                    tgMsgId = tgMsg.message_id;
                } else if (status === 'Sukses') {
                    
                    const sn = payJson.data.sn || "-";
                    const now = new Date();
                    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
                    const dateStr = `${now.getDate().toString().padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()} WITA`;
                    let displaySn = sn;
                    let displayDaya = "";
                    if (sn.includes('/')) {
                        const parts = sn.split('/');
                        displaySn = parts[0];
                        if (parts.length > 1) {
                            displayDaya = `
Daya         : ${parts.slice(1).join(' / ')}`;
                        }
                    }
                    msg = `🎉 Horee! Sukses, Kak!

Pesanan sudah diproses otomatis oleh E4 Store. ${product.product_name} sudah masuk ke ${isOwnerSelf ? "nama" : "akun"} ${member.name || targetDisplay} ${isOwnerSelf ? "!" : "dan siap digunakan!"} 💪🔥

Terima kasih telah berbelanja di E4 Store! 🐾

Chuna ~ Asisten Imutmu siap bantu 24 jam!
Chuna tunggu Transaksi berikutnya dari Kakak! 😊💖`;
                    const appUrl = "http://localhost:3000";
                    
                    if (pay_ref_id) { var notaBuffer: any = await generateCanvasReceipt("nota", { id: pay_ref_id, memberId: member.id, type: "prepaid", product: product.product_name, sku: product.buyer_sku_code, target: targetDisplay, price: total, modal: digiflazzPrice, cuan: cuan > 0 ? cuan : 0, status: status, method: method, sn: payJson.data?.sn || "-", date: new Date().toISOString() }); }
                    let tgMsg;

                    if (notaBuffer) {
                        tgMsg = await ctx.replyWithPhoto({ source: notaBuffer }, { caption: msg, parse_mode: 'Markdown' });
                    } else {
                        tgMsg = await ctx.reply(msg, { parse_mode: 'Markdown' });
                    }
                    tgMsgId = tgMsg.message_id;
                } else {
                    if (!isOwnerSelf && method === 'saldo') {
                        member.balance += total;
                        db.members = members;
                        writeDB(db);
                    }
                    let refundMsg = method === 'saldo' ? '✅ Saldo sebesar Rp ' + total.toLocaleString('id-ID') + ' telah dikembalikan ke akunmu!' : (method === 'utang' ? '✅ Utang sebesar Rp ' + total.toLocaleString('id-ID') + ' telah dibatalkan!' : '✅ Mohon kembalikan uang tunai sebesar Rp ' + total.toLocaleString('id-ID') + ' kepada pelanggan.');
                    let isIpError = (payJson.data.message || '').toLowerCase().includes('ip anda tidak kami kenali') || (payJson.data.message || '').toLowerCase().includes('ip');
                    let customerErrorMsg = isIpError ? 'Sedang ada pemeliharaan' : (payJson.data.message || 'Transaksi Gagal');
                    if (customerErrorMsg.toLowerCase().includes('saldo') || customerErrorMsg.toLowerCase().includes('balance') || customerErrorMsg.toLowerCase().includes('cukup')) {
                        customerErrorMsg = 'Produk sedang kosong';
                    }
                    msg = `❌ Maaf Kak, pembayaran untuk pesanan Anda gagal diproses.

Kemungkinan ada kesalahan data atau saldo kurang. Silakan cek kembali, atau hubungi Chuna untuk bantuan${isIpError ? ' lebih lanjut' : ''}.

Keterangan : ${customerErrorMsg}
📦 Produk  : ${product.product_name}
🎯 Tujuan   : ${targetDisplay} (${member.name || "-"})

${refundMsg}

${isIpError ? 'Jangan khawatir, Kakak bisa mencoba ulang kapan saja.' : 'Tenang saja, Kakak bisa mencoba ulang kapan pun.'}

Chuna siap bantu! 😊💪`;

                    if (isIpError) {
                        const tgName = ctx.from?.first_name || "Pelanggan";
                        const regName = member?.name || registeredUsers[ctx.from?.id]?.username || "-";
                        const waInfo = await getCustomerWaDetails(member, ctx.from?.id);
                        const photoLine = waInfo.waPhotoUrl ? `\n🖼️ *Foto Profil WA*: Terlampir` : ``;
                        const ownerIpMsg = `🚨 *INFO PENTING DARI CHUNA!* 🚨
IP Digiflazz tidak dikenali!
Pelanggan mencoba memesan namun gagal karena error IP.
👤 *Pelanggan*: ${tgName} (${targetDisplay})
🏷️ *Nama Terdaftar*: ${regName}
📱 *No. WhatsApp*: ${waInfo.waPhone}
💬 *Profil WhatsApp*: ${waInfo.waProfile}${photoLine}
📦 *Produk*: ${product.product_name}
⚠️ *Error*: ${payJson.data.message}

Segera cek dan update whitelist IP di dashboard Digiflazz Kakak!`;
                        for (const ownerId of db.owners) {
                            try {
                                if (waInfo.waPhotoUrl) {
                                    try {
                                        await bot.telegram.sendPhoto(ownerId, waInfo.waPhotoUrl, { caption: ownerIpMsg, parse_mode: 'Markdown' });
                                        continue;
                                    } catch (e) {}
                                }
                                await bot.telegram.sendMessage(ownerId, ownerIpMsg, { parse_mode: 'Markdown' });
                            } catch(e) {
                                console.error("Failed to notify owner", e);
                            }
                        }
                    }
                    
                    if (payJson.data.message && payJson.data.message.toLowerCase().includes("harga seller lebih besar dari ketentuan harga buyer")) {
                        const ownerMsg = `🚨 *INFO PENTING DARI CHUNA!* 🚨

Harga modal produk tersebut di Digiflazz saat ini sedang naik dan lebih mahal daripada "Batas Harga (Max Price)" yang Kakak atur di akun Digiflazz Kakak.

Coba lihat angka: *${product.product_name}* saat ini mungkin sudah naik, melebihi batas maksimalmu. Padahal chuna sudah jelas menunjukkan kenaikan. Masih mau mempertahankan batas harga yang sudah usang? Segera cek dan sesuaikan di dashboard Digiflazz ya Kak! 💸📈`;
                        for (const ownerId of db.owners) {
                            try {
                                await bot.telegram.sendMessage(ownerId, ownerMsg, { parse_mode: 'Markdown' });
                            } catch(e) {
                                console.error("Failed to notify owner", e);
                            }
                        }
                    }
                    const tgMsg = await ctx.reply(msg);
                    tgMsgId = tgMsg.message_id;
                }
                
                let custWa = member.whatsapp || (ctx.from?.id ? (registeredUsers[ctx.from?.id]?.wa || registeredUsers[Number(ctx.from?.id)]?.wa) : '') || '';
                if (waSocket && custWa) {
                    let cleanWa = custWa.replace(/\D/g, "");
                    if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
                    const jid = cleanWa + "@s.whatsapp.net";
                    waJid = jid;
                    try {
                        await waSocket.presenceSubscribe(jid);
                        await waSocket.sendPresenceUpdate('composing', jid);
                        await new Promise(r => setTimeout(r, 1200));
                        await waSocket.sendPresenceUpdate('paused', jid);
                        let waMsg;
                        if (status === 'Pending') {
                            const waPendingMsg = `⏳ Hai Kak${greetingWaName}!

Pesanan Anda sedang diproses oleh sistem pusat E4 Store. Mohon tunggu beberapa saat, nanti akan kami kabari setelah selesai.

📦 Produk : ${product.product_name}
🎯 Tujuan : ${targetDisplay} (${member.name || "-"})

Chuna menunggu kabar baik dari Kakak! 😊`;
                            waMsg = await waSocket.sendMessage(jid, { text: waPendingMsg });
                        } else if (typeof notaBuffer !== 'undefined' && notaBuffer) {
                            waMsg = await waSocket.sendMessage(jid, { image: notaBuffer, caption: msg });
                        } else {
                            waMsg = await waSocket.sendMessage(jid, { text: msg });
                        }
                        if (waMsg) waMsgKey = waMsg.key;
                    } catch (err) {
                        console.error("Failed to send WA message:", err);
                    }
                }
                
                // ALWAYS save to transaction history so it can be seen
                transactions.unshift({
                    id: pay_ref_id,
                    memberId: member.id,
                    type: "prepaid",
                    product: product.product_name,
                    sku: product.buyer_sku_code,
                    target: targetDisplay,
                    price: total,
                    modal: digiflazzPrice,
                    cuan: cuan > 0 ? cuan : 0,
                    status: status,
                    method: method,
                    sn: payJson.data?.sn || "-",
                    date: new Date().toISOString(),
                    tgMsgId,
                    waMsgKey,
                    tgChatId: ctx.chat?.id,
                    waJid,
                    waReceiptSent: status === "Sukses" && waMsgKey !== undefined
                });
                db.transactions = transactions;
                writeDB(db);
                
            } else {
                if (!isOwnerSelf && method === 'saldo') {
                    member.balance += total;
                    db.members = members;
                    writeDB(db);
                }
                let refundMsg = method === 'saldo' ? 'Saldo telah dikembalikan.' : (method === 'utang' ? 'Utang telah dibatalkan.' : 'Uang Cash harap dikembalikan.');
                await ctx.reply(`❌ Pembelian Gagal:${payJson.data?.message || 'Error tidak diketahui'}${refundMsg}`);
            }
        } catch (e: any) {
            transactions.unshift({
                id: pay_ref_id,
                memberId: member.id,
                type: "prepaid",
                product: product.product_name,
                sku: product.buyer_sku_code,
                target: targetDisplay,
                price: total,
                modal: 0,
                cuan: 0,
                status: "Pending",
                method: method,
                date: new Date().toISOString()
            });
            db.transactions = transactions;
            writeDB(db);
            
            await ctx.reply(`⏳ Transaksi Sedang Diproses (Network Error)Pesananmu sedang dikonfirmasi oleh sistem pusat meski terjadi gangguan koneksi.Mohon tunggu update otomatis dari Chuna atau hubungi Admin.Pesan Error: ${e.message}`);
        }
        

        delete userStates[ctx.from?.id || 0];
        const isOwner = db.owners.includes(ctx.from?.id);
        if (isOwner) {
            await ctx.reply("Silakan pilih menu selanjutnya:", {
                reply_markup: {
                    keyboard: [
                        [{ text: "📒 Cek Utang Member" }],
                        [{ text: "📝 Tambah Member" }, { text: "👑 List Member" }],
                        [{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }],
                        [{ text: "📢 Pengumuman WA" }, { text: "📥 Fitur Download" }]
                    ],
                    resize_keyboard: true
                }
            });
        } else {
            await ctx.reply("Silakan pilih menu selanjutnya:", {
                reply_markup: {
                    keyboard: [
                        [{ text: "💵 Cek Saldo" }],
                        [{ text: "🧾 Cek Tagihan" }],
                        [{ text: "📋 Menu Produk" }],
                        [{ text: "📥 Fitur Download" }]
                    ],
                    resize_keyboard: true
                }
            });
        }

}


async function processPascaPayment(ctx: any, ref_id: string, method: string, stateData: any, memberId: string) {
        const member = members.find((m: any) => m.id === memberId || isTelegramMatch(m.telegram, ctx.from?.id, ctx.from?.username));
        if (!member) return ctx.reply("❌ Member tidak ditemukan.");
        
        const isOwnerSelf = db.owners.includes(ctx.from?.id) && isTelegramMatch(member.telegram, ctx.from?.id, ctx.from?.username);
        const checkResult = stateData.checkResult;
        const total = stateData.totalBayar;
        const displayCustomerNo = stateData.customerNo || stateData.checkResult?.customer_no || stateData.targetNo || "-";
        const customerNo = stateData.targetNo || stateData.customerNo || stateData.checkResult?.customer_no || "-";
        
        if (!isOwnerSelf) {
            if (method === 'saldo') {
                if (member.balance < total) {
                    return ctx.reply(`❌ TRANSAKSI DITOLAK!Maaf kak, saldo kakak tidak mencukupi untuk melakukan transaksi ini.💳 Saldo Saat Ini: Rp ${member.balance.toLocaleString('id-ID')}💰 Total Bayar: Rp ${total.toLocaleString('id-ID')}Silakan isi ulang saldo kakak terlebih dahulu. 🙏`, { reply_markup: { keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Fitur Download" }]], resize_keyboard: true } });
                }
                member.balance -= total;
                db.members = members;
                writeDB(db);
            }
        }
        
        const methodDisplay = method === 'cash' ? '💵 Tunai (Cash)' : method === 'utang' ? '📝 Utang' : '💳 Saldo';
        await ctx.reply(`⏳ Status: Sedang memproses pembayaran tagihan untuk nomor ${displayCustomerNo} melalui metode ${methodDisplay}. Mohon ditunggu.`);
        
        const pay_ref_id = ref_id;
        try {
            const signText = digiflazzUsername + digiflazzApiKey + pay_ref_id;
            const sign = crypto.createHash("md5").update(signText).digest("hex");
            const res = await fetch("https://api.digiflazz.com/v1/transaction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    commands: "pay-pasca",
                    username: digiflazzUsername,
                    buyer_sku_code: stateData.product.buyer_sku_code,
                    customer_no: customerNo,
                    ref_id: pay_ref_id,
                    sign: sign
                })
            });
            const payJson = await res.json();
            
            if (payJson.data) {
                const status = payJson.data.status || 'Gagal';
                const digiflazzPrice = payJson.data.price || 0;
                const cuan = total - digiflazzPrice;
                
                let paymentInfo = "";
                if (method === 'saldo') {
                    paymentInfo = `    💰 SALDO  : "Cusss! Saldo langsung kepotong,                 beres dalam sekejap! Kamu jago                 banget pake saldo, Chuna salut! 💰✨"`;
                } else if (method === 'cash') {
                    paymentInfo = `    💵 CASH   : "Duitnya Chuna terima dengan senyum                 lebar! Bayar tunai tetap berkesan!                 Makasih udah main ke E4 Store! 🫳🌸"`;
                } else {
                    paymentInfo = `    📝 JANJI   : "Chuna percaya 100% sama kamu! 😍     BAYAR      Kamu pasti bayar tepat waktu karena    TEPAT       Chuna tahu kamu pelanggan baik hati.    WAKTU       Nanti kalau sudah transfer, chat                 Chuna aja, nanti Chuna proses dengan                 senyum manis! Makasih udah jujur! 💖🤗"`;
                }
                
                let msg = "";
                let tgMsgId: number | undefined;
                let waMsgKey: any | undefined;
                let waJid: string | undefined;

                const waDetails = await getCustomerWaDetails(member, ctx.from?.id);
                const waProfileName = (waDetails && waDetails.waProfile && waDetails.waProfile !== '-') ? waDetails.waProfile : (member.name || '');
                const greetingWaName = waProfileName ? ` ${waProfileName}` : '';

                if (status === 'Pending') {
                    msg = `⏳ Hai Kak!

Pesanan Anda sedang diproses oleh sistem pusat E4 Store. Mohon tunggu beberapa saat, nanti akan kami kabari setelah selesai.

📦 Tagihan : ${stateData.product.product_name}
🎯 Tujuan   : ${displayCustomerNo} (${payJson.data?.customer_name || checkResult?.customer_name || "-"})

Chuna menunggu kabar baik dari Kakak! 😊`;
                    const tgMsg = await ctx.reply(msg);
                    tgMsgId = tgMsg.message_id;
                } else if (status === 'Sukses') {
                    
                    const sn = payJson.data.sn || "-";
                    const now = new Date();
                    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
                    const dateStr = `${now.getDate().toString().padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()} WITA`;
                    let displaySnPasca = sn;
                    let displayDayaPasca = "";
                    if (sn.includes('/')) {
                        const parts = sn.split('/');
                        displaySnPasca = parts[0];
                        if (parts.length > 1) {
                            displayDayaPasca = `
Daya         : ${parts.slice(1).join(' / ')}`;
                        }
                    }
                    msg = `🎉 Horee! Sukses, Kak!

Pesanan sudah diproses otomatis oleh E4 Store. ${stateData.product.product_name} sudah masuk ke ${isOwnerSelf ? "nama" : "akun"} ${checkResult?.customer_name || customerNo} ${isOwnerSelf ? "!" : "dan siap digunakan!"} 💪🔥

Terima kasih telah berbelanja di E4 Store! 🐾

Chuna ~ Asisten Imutmu siap bantu 24 jam!
Chuna tunggu Transaksi berikutnya dari Kakak! 😊💖`;
                    const appUrl = "http://localhost:3000";
                    
                    if (pay_ref_id) { var notaBuffer: any = await generateCanvasReceipt("nota", { id: pay_ref_id, memberId: member.id, type: "pasca", product: stateData.product.product_name, sku: stateData.product.buyer_sku_code, target: displayCustomerNo, price: total, modal: digiflazzPrice, cuan: cuan > 0 ? cuan : 0, tagihan: stateData.checkResult?.selling_price || 0, admin_pel: stateData.adminFee || 0, status: status, method: method, sn: payJson.data?.sn || "-", date: new Date().toISOString() }); }
                    let tgMsg;
                    if (notaBuffer) {
                        tgMsg = await ctx.replyWithPhoto({ source: notaBuffer }, { caption: msg, parse_mode: 'Markdown' });
                    } else {
                        tgMsg = await ctx.reply(msg, { parse_mode: 'Markdown' });
                    }
                    tgMsgId = tgMsg.message_id;
                } else {
                    if (!isOwnerSelf && method === 'saldo') {
                        member.balance += total;
                        db.members = members;
                        writeDB(db);
                    }
                    let refundMsg = method === 'saldo' ? '✅ Saldo sebesar Rp ' + total.toLocaleString('id-ID') + ' telah dikembalikan ke akunmu!' : (method === 'utang' ? '✅ Utang sebesar Rp ' + total.toLocaleString('id-ID') + ' telah dibatalkan!' : '✅ Mohon kembalikan uang tunai sebesar Rp ' + total.toLocaleString('id-ID') + ' kepada pelanggan.');
                    let isIpError = (payJson.data.message || '').toLowerCase().includes('ip anda tidak kami kenali') || (payJson.data.message || '').toLowerCase().includes('ip');
                    let customerErrorMsg = isIpError ? 'Sedang ada pemeliharaan' : (payJson.data.message || 'Transaksi Gagal');
                    if (customerErrorMsg.toLowerCase().includes('saldo') || customerErrorMsg.toLowerCase().includes('balance') || customerErrorMsg.toLowerCase().includes('cukup')) {
                        customerErrorMsg = 'Produk sedang kosong';
                    }
                    msg = `❌ Maaf Kak, pembayaran untuk pesanan Anda gagal diproses.

Kemungkinan ada kesalahan data atau saldo kurang. Silakan cek kembali, atau hubungi Chuna untuk bantuan${isIpError ? ' lebih lanjut' : ''}.

Keterangan : ${customerErrorMsg}
📦 Tagihan : ${stateData.product.product_name}
🎯 Tujuan   : ${displayCustomerNo} (${payJson.data?.customer_name || checkResult?.customer_name || "-"})

${refundMsg}

${isIpError ? 'Jangan khawatir, Kakak bisa mencoba ulang kapan saja.' : 'Tenang saja, Kakak bisa mencoba ulang kapan pun.'}

Chuna siap bantu! 😊💪`;

                    if (isIpError) {
                        const tgName = ctx.from?.first_name || "Pelanggan";
                        const regName = member?.name || registeredUsers[ctx.from?.id]?.username || "-";
                        const waInfo = await getCustomerWaDetails(member, ctx.from?.id);
                        const photoLine = waInfo.waPhotoUrl ? `\n🖼️ *Foto Profil WA*: Terlampir` : ``;
                        const ownerIpMsg = `🚨 *INFO PENTING DARI CHUNA!* 🚨
IP Digiflazz tidak dikenali!
Pelanggan mencoba memesan namun gagal karena error IP.
👤 *Pelanggan*: ${tgName} (${displayCustomerNo})
🏷️ *Nama Terdaftar*: ${regName}
📱 *No. WhatsApp*: ${waInfo.waPhone}
💬 *Profil WhatsApp*: ${waInfo.waProfile}${photoLine}
📦 *Tagihan*: ${stateData.product.product_name}
⚠️ *Error*: ${payJson.data.message}

Segera cek dan update whitelist IP di dashboard Digiflazz Kakak!`;
                        for (const ownerId of db.owners) {
                            try {
                                if (waInfo.waPhotoUrl) {
                                    try {
                                        await bot.telegram.sendPhoto(ownerId, waInfo.waPhotoUrl, { caption: ownerIpMsg, parse_mode: 'Markdown' });
                                        continue;
                                    } catch (e) {}
                                }
                                await bot.telegram.sendMessage(ownerId, ownerIpMsg, { parse_mode: 'Markdown' });
                            } catch(e) {
                                console.error("Failed to notify owner", e);
                            }
                        }
                    }
                    
                    if (payJson.data.message && payJson.data.message.toLowerCase().includes("harga seller lebih besar dari ketentuan harga buyer")) {
                        const ownerMsg = `🚨 *INFO PENTING DARI CHUNA!* 🚨

Harga modal produk tersebut di Digiflazz saat ini sedang naik dan lebih mahal daripada "Batas Harga (Max Price)" yang Kakak atur di akun Digiflazz Kakak.

Coba lihat angka: *${stateData.product.product_name}* saat ini mungkin sudah naik, melebihi batas maksimalmu. Padahal chuna sudah jelas menunjukkan kenaikan. Masih mau mempertahankan batas harga yang sudah usang? Segera cek dan sesuaikan di dashboard Digiflazz ya Kak! 💸📈`;
                        for (const ownerId of db.owners) {
                            try {
                                await bot.telegram.sendMessage(ownerId, ownerMsg, { parse_mode: 'Markdown' });
                            } catch(e) {
                                console.error("Failed to notify owner", e);
                            }
                        }
                    }
                    const tgMsg = await ctx.reply(msg);
                    tgMsgId = tgMsg.message_id;
                }

                let custWa = member.whatsapp || (ctx.from?.id ? (registeredUsers[ctx.from?.id]?.wa || registeredUsers[Number(ctx.from?.id)]?.wa) : '') || '';
                if (waSocket && custWa) {
                    let cleanWa = custWa.replace(/\D/g, "");
                    if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
                    const jid = cleanWa + "@s.whatsapp.net";
                    waJid = jid;
                    try {
                        await waSocket.presenceSubscribe(jid);
                        await waSocket.sendPresenceUpdate('composing', jid);
                        await new Promise(r => setTimeout(r, 1200));
                        await waSocket.sendPresenceUpdate('paused', jid);
                        let waMsg;
                        if (status === 'Pending') {
                            const waPendingMsg = `⏳ Hai Kak${greetingWaName}!

Pesanan Anda sedang diproses oleh sistem pusat E4 Store. Mohon tunggu beberapa saat, nanti akan kami kabari setelah selesai.

📦 Tagihan : ${stateData.product.product_name}
🎯 Tujuan : ${displayCustomerNo} (${payJson.data?.customer_name || checkResult?.customer_name || "-"})

Chuna menunggu kabar baik dari Kakak! 😊`;
                            waMsg = await waSocket.sendMessage(jid, { text: waPendingMsg });
                        } else if (typeof notaBuffer !== 'undefined' && notaBuffer) {
                            waMsg = await waSocket.sendMessage(jid, { image: notaBuffer, caption: msg });
                        } else {
                            waMsg = await waSocket.sendMessage(jid, { text: msg });
                        }
                        if (waMsg) waMsgKey = waMsg.key;
                    } catch (err) {
                        console.error("Failed to send WA message:", err);
                    }
                }
                
                transactions.unshift({
                    id: pay_ref_id,
                    memberId: member.id,
                    type: "pasca",
                    product: stateData.product.product_name,
                    sku: stateData.product.buyer_sku_code,
                    target: displayCustomerNo,
                    price: total,
                    modal: digiflazzPrice,
                    cuan: cuan > 0 ? cuan : 0,
                    tagihan: stateData.checkResult?.selling_price || 0,
                    admin_pel: stateData.adminFee || 0,
                    status: status,
                    method: method,
                    sn: payJson.data?.sn || "-",
                    date: new Date().toISOString(),
                    tgMsgId,
                    waMsgKey,
                    tgChatId: ctx.chat?.id,
                    waJid,
                    waReceiptSent: status === "Sukses" && waMsgKey !== undefined
                });
                db.transactions = transactions;
                writeDB(db);
                
            } else {
                if (!isOwnerSelf && method === 'saldo') {
                    member.balance += total;
                    db.members = members;
                    writeDB(db);
                }
                let refundMsg = method === 'saldo' ? 'Saldo telah dikembalikan.' : (method === 'utang' ? 'Utang telah dibatalkan.' : 'Uang Cash harap dikembalikan.');
                await ctx.reply(`❌ Pembelian Gagal:${payJson.data?.message || 'Error tidak diketahui'}${refundMsg}`);
            }
        } catch (e: any) {
            transactions.unshift({
                id: pay_ref_id,
                memberId: member.id,
                type: "pasca",
                product: stateData.product.product_name,
                sku: stateData.product.buyer_sku_code,
                target: displayCustomerNo,
                price: total,
                modal: 0,
                cuan: 0,
                tagihan: stateData.checkResult?.selling_price || 0,
                admin_pel: stateData.adminFee || 0,
                status: "Pending",
                method: method,
                date: new Date().toISOString()
            });
            db.transactions = transactions;
            writeDB(db);
            
            await ctx.reply(`⏳ Transaksi Sedang Diproses (Network Error)Pesananmu sedang dikonfirmasi oleh sistem pusat meski terjadi gangguan koneksi.Mohon tunggu update otomatis dari Chuna atau hubungi Admin.Pesan Error: ${e.message}`);
        }
        

        delete userStates[ctx.from?.id || 0];
        const isOwner = db.owners.includes(ctx.from?.id);
        if (isOwner) {
            await ctx.reply("Silakan pilih menu selanjutnya:", {
                reply_markup: {
                    keyboard: [
                        [{ text: "📒 Cek Utang Member" }],
                        [{ text: "📝 Tambah Member" }, { text: "👑 List Member" }],
                        [{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }],
                        [{ text: "📢 Pengumuman WA" }, { text: "📥 Fitur Download" }]
                    ],
                    resize_keyboard: true
                }
            });
        } else {
            await ctx.reply("Silakan pilih menu selanjutnya:", {
                reply_markup: {
                    keyboard: [
                        [{ text: "💵 Cek Saldo" }],
                        [{ text: "🧾 Cek Tagihan" }],
                        [{ text: "📋 Menu Produk" }],
                        [{ text: "📥 Fitur Download" }]
                    ],
                    resize_keyboard: true
                }
            });
        }

}

      


            token = token.trim();
      const agent = new https.Agent({ family: 4 });
      bot = new Telegraf(token, { telegram: { agent } });
      bot.catch((err, ctx) => {
        console.error('Ooops, encountered an error for ' + ctx.updateType, err);
      });
      
      const botInfo = await bot.telegram.getMe();
  
  const originalTgSendMessage = bot.telegram.sendMessage.bind(bot.telegram);
  bot.telegram.sendMessage = async (chatId, text, extra) => {
      try {
          await bot.telegram.sendChatAction(chatId, 'typing');
          await new Promise(r => setTimeout(r, 1000));
      } catch(e) {}
      return originalTgSendMessage(chatId, text, extra);
  };
  
  const originalTgSendPhoto = bot.telegram.sendPhoto.bind(bot.telegram);
  bot.telegram.sendPhoto = async (chatId, photo, extra) => {
      try {
          await bot.telegram.sendChatAction(chatId, 'upload_photo');
          await new Promise(r => setTimeout(r, 1000));
      } catch(e) {}
      return originalTgSendPhoto(chatId, photo, extra);
  };
      
      let welcomeVoiceFileId: string | null = db.welcomeVoiceFileId || null;
      // Global middleware for typing status and Nyxguard Bot Spam/Abuse defense
      bot.use(async (ctx, next) => {
        const userId = ctx.from?.id;
        if (userId && !db.owners.includes(userId)) {
          // Check Nyxguard flood protection
          const isSpam = securitySuite.checkBotSpam(userId, 10, 4000);
          if (isSpam) {
            try {
              await ctx.reply("⚠️ *[NYXGUARD ANTI-FLOOD]*\nTerdeteksi pengiriman pesan terlalu cepat. Harap jeda beberapa detik sebelum mengirim perintah lagi.", { parse_mode: 'Markdown' });
            } catch (e) {}
            return;
          }
        }

        if (ctx.message || ctx.callbackQuery) {
          try {
            await ctx.sendChatAction('typing');
          } catch(e) {}
        }
        return next();
      });

      bot.start(async (ctx) => {
        const userId = ctx.from.id;

        try {
          const opusPath = path.join(process.cwd(), "welcome.opus");
          if (fs.existsSync(opusPath)) {
            if (welcomeVoiceFileId) {
                await ctx.replyWithVoice(welcomeVoiceFileId).catch(err => console.error("Gagal mengirim voice_id", err));
            } else {
                const msg = await ctx.replyWithVoice({ source: opusPath }).catch(err => console.error("Gagal mengirim voice", err));
                if (msg && typeof msg === 'object' && 'voice' in msg) {
                    welcomeVoiceFileId = (msg as any).voice.file_id;
                    db.welcomeVoiceFileId = welcomeVoiceFileId;
                    writeDB(db);
                }
            }
          }
        } catch (error) {
          console.error("Gagal mengirim pesan audio:", error);
        }

        if (db.owners.includes(userId)) {
           return ctx.reply(
             `━━━━━━━━━━━━━━━━━━━━━\n   👑  E4 STORE  👑\n   OFFICIAL MANAGEMENT PANEL\n━━━━━━━━━━━━━━━━━━━━━\n\nSelamat datang, Administrator.\nSemua fitur resmi telah siap dioperasikan.\n\nMau kelola apa hari ini?`,
             {
               reply_markup: {
                 keyboard: [
                   [{ text: "📒 Cek Utang Member" }],
                      [{ text: "📝 Tambah Member" }, { text: "👑 List Member" }],
                      [{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }],
                      [{ text: "📢 Pengumuman WA" }, { text: "📥 Fitur Download" }]
                 ],
                 resize_keyboard: true
               }
             }
           );
        }

        const memberId = `MBR-${userId}`;
        console.log("DEBUG /start userId:", userId, "members:", JSON.stringify(members));
        const member = members.find(m => m.id === memberId || isTelegramMatch(m.telegram, userId, ctx.from?.username));

        if (member) {
          await ctx.reply(
            `━━━━━━━━━━━━━━━━━━━━━\n   👥️ E4 STORE OFFICIAL\n━━━━━━━━━━━━━━━━━━━━━\n\n✅ Welcome back, kak ${member.name || "Kisah"}! 🥰\nSenang banget lihat kamu lagi!\n\nMau transaksi apa hari ini kak bareng Chuna?\nYuk pilih produk favoritmu! 🛍️`,
            {
              reply_markup: {
                keyboard: [
                  [{ text: "💵 Cek Saldo" }],
                  [{ text: "🧾 Cek Tagihan" }],
                  [{ text: "📋 Menu Produk" }],
                  [{ text: "📥 Fitur Download" }]
                ],
                resize_keyboard: true
              }
            }
          );
          return;
        }

        await ctx.reply(
          "👋 Halo kak! Chuna di sini 🚗💚Kakak belum punya akun E4 Store nih. Daftar dulu yuk biar bisa langsung belanja! 🛍️",
          {
            reply_markup: {
              keyboard: [
                [{ text: "📝 Daftar Bareng Chuna" }]
              ],
              resize_keyboard: true
            }
          }
        );
      });

      bot.hears(/Daftar Bareng Chuna/i, async (ctx) => {
        if (ctx.from) {
          const userId = ctx.from.id;
          console.log("Checking user registration. ctx.from.id:", userId);
          console.log("Is in registeredUsers?", !!registeredUsers[userId], registeredUsers[userId]);
          if (registeredUsers[userId]) {
             // Validate if they are actually in members
             const memberId = `MBR-${userId}`;
             const member = members.find(m => m.id === memberId || isTelegramMatch(m.telegram, userId, ctx.from?.username));
             if (member) {
                 ctx.reply("Mohon maaf kak, akun anda sudah terdaftar.");
                 return;
             } else {
                 console.log("Found orphaned registeredUser, cleaning up:", userId);
                 delete registeredUsers[userId];
                 db.registeredUsers = registeredUsers;
                 writeDB(db);
             }
          }
          userStates[userId] = { step: 'AWAITING_USERNAME', data: {} };
        }
        ctx.reply(`📝 PENDAFTARAN AKUN

Oke kak! Langkah pertama, kasih tau Chuna Username yang kakak mau dong.`);
      });

      
      bot.hears("📥 Fitur Download", async (ctx) => {
        delete userStates[ctx.from.id]; // Reset state
        userStates[ctx.from.id] = { step: 'AWAITING_DOWNLOAD_LINK', data: {} };
        await ctx.reply(`Fitur Download 📥

Halo kak! Silakan kirimkan link video/audio yang ingin didownload.
Saat ini Chuna mendukung download dari:
🎵 TikTok
🎬 YouTube


Kirim linknya sekarang ya! 🥰`);
      });

bot.hears(/Cek Saldo/i, async (ctx) => {
        try {
          const userId = ctx.from.id;
          
          if (db.owners.includes(userId)) {
             await ctx.reply("⏳ Mengecek saldo Digiflazz...");
             if (!digiflazzUsername || !digiflazzApiKey) {
                await ctx.reply("❌ Digiflazz belum dikonfigurasi.");
                return;
             }
             try {
                 const sign = crypto.createHash("md5").update(digiflazzUsername + digiflazzApiKey + "depo").digest("hex");
                 const response = await fetch("https://api.digiflazz.com/v1/cek-saldo", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                       cmd: "deposit",
                       username: digiflazzUsername,
                       sign: sign
                    })
                 });
                 const data = await response.json();
                 if (data && data.data && data.data.deposit !== undefined) {
                    digiflazzBalance = data.data.deposit;
                    await ctx.reply(`💰 Saldo Digiflazz: *Rp ${digiflazzBalance.toLocaleString('id-ID')}*`, { parse_mode: 'Markdown' });
                 } else {
                    await ctx.reply("❌ Gagal mengecek saldo Digiflazz.");
                 }
             } catch(e) {
                 await ctx.reply("❌ Terjadi kesalahan saat menghubungi server Digiflazz.");
             }
             return;
          }

          const memberId = `MBR-${userId}`;
          const username = ctx.from.username ? `@${ctx.from.username}` : null;
          const member = members.find(m => m.id === memberId || isTelegramMatch(m.telegram, userId, ctx.from?.username));
          
          if (member) {
             const nameUpper = (member.name || "Kisah").toUpperCase();
             const nameOriginal = member.name || "Kisah";
             const typeCap = member.type || "Biasa";
             const wa = member.whatsapp || "-";
             const balance = member.balance.toLocaleString('id-ID');
             
             await ctx.reply(`✦ ──── E4 STORE · VAULT ──── ✦
│
│  👑  USER, ${nameUpper}!
│  ───────────────
│  ▸  Status      : 𝙑𝙚𝙧𝙞𝙛𝙞𝙚𝙙 𝙋𝙧𝙞𝙢𝙚
│  ▸  Tipe Akun   : ${typeCap} 
│  ▸  Kontak      : ${wa} [✅ Aktif]
│
│  💳  SALDO DOMAIN
│  ───────────────
│  ▸  Rp ${balance} 
│     [ ░░░░░░░░░░ ] 
│
│
│  
│  
│  
│
└─── 🚀 24/JAM Ready. Balas kapan saja ───`);
          } else {
             await ctx.reply("❌ Kakak belum terdaftar. Yuk daftar dulu!💡 Info: ID Telegram kakak adalah *" + ctx.from.id + "* (Berikan ID ini ke Owner untuk dihubungkan dengan akun web kakak)", { parse_mode: "Markdown" });
          }
        } catch (e) {
          console.error("Failed to answer", e);
        }
      });


      bot.hears(/^Cek Trx (.+)$/i, async (ctx) => {
          const ref_id = ctx.match[1].trim();
          const tx = transactions.find(t => t.id === ref_id);
          if (!tx) return ctx.reply("❌ Transaksi dengan Ref ID " + ref_id + " tidak ditemukan di sistem Chuna.");
          
          if (!digiflazzUsername || !digiflazzApiKey) return ctx.reply("Konfigurasi Digiflazz belum diatur.");
          
          await ctx.reply("⏳ Chuna sedang mengecek ulang status transaksi " + ref_id + " ke Digiflazz pusat...");
          
          let body: any = {
              username: digiflazzUsername,
              buyer_sku_code: tx.sku,
              customer_no: tx.target.split(' ')[0],
              ref_id: tx.id,
              sign: crypto.createHash("md5").update(digiflazzUsername + digiflazzApiKey + tx.id).digest("hex")
          };
          if (tx.type === 'pasca') body.commands = "status-pasca";
          
          try {
              const res = await fetch("https://api.digiflazz.com/v1/transaction", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(body)
              });
              const json = await res.json();
              if (json && json.data) {
                  await ctx.reply("✅ Laporan Digiflazz:\nStatus: " + json.data.status + "\nPesan: " + (json.data.message || '-') + "\nSN: " + (json.data.sn || '-'));
                  if (tx.status === 'Pending' && (json.data.status === 'Sukses' || json.data.status === 'Gagal')) {
                      await processDigiflazzWebhookData(json.data);
                      await ctx.reply("Sistem telah diupdate otomatis berdasarkan status terbaru dari Digiflazz! Saldo akan disesuaikan.");
                  }
              } else {
                  await ctx.reply("❌ Transaksi belum masuk ke Digiflazz atau terjadi masalah (Pesan: " + (json?.message || 'Error') + ").");
                  if (tx.status === 'Pending') {
                      await processDigiflazzWebhookData({
                          ref_id: tx.id,
                          status: 'Gagal',
                          message: json?.message || 'Transaksi Gagal (No Data)'
                      });
                      await ctx.reply("Sistem otomatis membatalkan transaksi dan mengembalikan saldo!");
                  }
              }
          } catch (e) {
              await ctx.reply("❌ Terjadi kesalahan jaringan saat mengecek: " + e.message);
          }
      });

      bot.hears(/Cek Tagihan/i, async (ctx) => {
        try {
            await ctx.reply("🧾 Memuat tagihan (Pascabayar)...");
            const products = await getDigiflazzProducts("pasca");
            if (!products || products.length === 0) {
               return ctx.reply("❌ Tidak ada produk pascabayar.");
            }
            
            const categories = [...new Set(products.map((p: any) => p.category))].filter(Boolean).sort();
            const keyboard = [];
            for (let i = 0; i < categories.length; i += 2) {
                const row = [{ text: categories[i] }];
                if (categories[i+1]) row.push({ text: categories[i+1] });
                keyboard.push(row);
            }
            keyboard.push([{ text: "🔙 Kembali" }]);
            
            await ctx.reply("Pilih layanan tagihan:", {
                reply_markup: {
                    keyboard: keyboard,
                    resize_keyboard: true
                }
            });
        } catch (e: any) {
            await ctx.reply("❌ Gagal memuat tagihan: " + e.message);
            console.error("Failed to answer", e);
        }
      });

      bot.hears(/Menu Produk/i, async (ctx) => {
        try {
            await ctx.reply("🛒 Memuat kategori...");
            const products = await getDigiflazzProducts("prepaid");
            const categories = [...new Set(products.map((p: any) => p.category))].filter(Boolean).sort();
            
            const keyboard = [];
            for (let i = 0; i < categories.length; i += 2) {
                const row = [{ text: categories[i] }];
                if (categories[i+1]) row.push({ text: categories[i+1] });
                keyboard.push(row);
            }
            keyboard.push([{ text: "🔙 Kembali" }]);
            
            await ctx.reply("Silakan pilih kategori produk di bawah ini:", {
              reply_markup: {
                keyboard: keyboard,
                resize_keyboard: true
              }
            });
        } catch (e: any) {
            await ctx.reply("❌ Sistem belum terhubung ke Digiflazz atau terjadi error: " + e.message);
            console.error("Failed to answer", e);
        }
      });
      
      bot.hears("🔙 Kembali ke Menu Owner", async (ctx) => {
          delete userStates[ctx.from.id];
          await ctx.reply(`━━━━━━━━━━━━━━━━━━━━━\n   👑  E4 STORE  👑\n   OFFICIAL MANAGEMENT PANEL\n━━━━━━━━━━━━━━━━━━━━━\n\nSelamat datang, Administrator.\nSemua fitur resmi telah siap dioperasikan.\n\nMau kelola apa hari ini?`, {
              reply_markup: {
                  keyboard: [
                      [{ text: "📒 Cek Utang Member" }],
                      [{ text: "📝 Tambah Member" }, { text: "👑 List Member" }],
                      [{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }],
                      [{ text: "📢 Pengumuman WA" }, { text: "📥 Fitur Download" }]
                  ],
                  resize_keyboard: true
              }
          });
      });

            bot.hears("🔙 Kembali", async (ctx) => {
          const state = userStates[ctx.from.id];
          if (state && state.data && state.data.memberId) {
              userStates[ctx.from.id] = { step: 'LOCKED_MEMBER', data: { memberId: state.data.memberId } };
              return ctx.reply("Kembali ke menu transaksi member offline:", {
                  reply_markup: {
                      keyboard: [
                          [{ text: "🧾 Cek Tagihan" }],
              [{ text: "📋 Menu Produk" }],
              [{ text: "🔙 Kembali ke Menu Owner" }]
                      ],
                      resize_keyboard: true
                  }
              });
          }

          delete userStates[ctx.from.id];
          await ctx.reply("Kembali ke menu utama:", {
              reply_markup: {
                  keyboard: [
                      [{ text: "💵 Cek Saldo" }],
                  [{ text: "🧾 Cek Tagihan" }],
                  [{ text: "📋 Menu Produk" }],
                  [{ text: "📥 Fitur Download" }]
                  ],
                  resize_keyboard: true
              }
          });
      });


      bot.hears("👑 List Member", async (ctx) => {
        if (!db.owners.includes(ctx.from.id)) return;
        const offlineMembers = members.filter(m => !m.telegram || !m.telegram.startsWith('ID:'));
        
        if (offlineMembers.length === 0) {
          return ctx.reply("Belum ada member offline yang terdaftar.");
        }
        
        const buttons = offlineMembers.map(m => ([{
          text: `👤 ${m.name} (${m.whatsapp})`,
          callback_data: `sel_off_${m.id}`
        }]));

        await ctx.reply("👑 LIST MEMBER OFFLINESilakan pilih pelanggan yang akan dilayani:", {
          reply_markup: {
            inline_keyboard: buttons
          }
        });
      });

      
      bot.action(/^dl_(image|video|audio)$/, async (ctx) => {
        try { await ctx.answerCbQuery().catch(() => {}); } catch(e) {}
        const type = ctx.match[1];
        const state = userStates[ctx.from?.id || 0];
        if (!state || state.step !== 'AWAITING_DOWNLOAD_TYPE') {
            await ctx.reply("❌ Sesi download telah berakhir atau tidak valid. Silakan ulangi dengan menekan '📥 Fitur Download'.");
            return;
        }

        const link = state.data.link;
        delete userStates[ctx.from?.id || 0];

        const processMsg = await ctx.reply("⏳ Chuna sedang memproses permintaan kamu... Mohon tunggu sebentar ya kak! 🥰");

        try {
            let isTiktok = link.includes('tiktok.com');
            let isYoutube = link.includes('youtube.com') || link.includes('youtu.be');
            
            if (isTiktok) {
                // Handle TikTok using tikwm
                
                const data = await fetchTiktok(link);
                
                if (!data) {
                    await ctx.telegram.editMessageText(ctx.chat?.id, processMsg.message_id, undefined, "❌ Gagal mengambil data dari TikTok. Pastikan link valid dan video tidak diprivate.");
                    return;
                }
                
                await ctx.telegram.deleteMessage(ctx.chat?.id, processMsg.message_id).catch(()=>null);
                
                if (type === 'image') {
                    if (data.images && data.images.length > 0) {
                        await ctx.reply("📸 Mengirim " + data.images.length + " gambar...");
                        const allImages = data.images.map((url: string, i: number) => ({
                            type: 'photo',
                            media: url,
                            caption: i === 0 && data.title ? (data.title.length > 1000 ? data.title.substring(0, 1000) + '...' : data.title) : undefined
                        }));
                        
                        // Send in chunks of 10 due to telegram limits
                        for (let i = 0; i < allImages.length; i += 10) {
                            await ctx.replyWithMediaGroup(allImages.slice(i, i + 10));
                        }
                    } else {
                        await ctx.replyWithPhoto(data.cover || data.origin_cover, { caption: data.title ? (data.title.length > 1000 ? data.title.substring(0, 1000) + '...' : data.title) : undefined });
                    }
                } else if (type === 'video') {
                    const videoUrl = data.play || data.wmplay;
                    if (videoUrl) {
                        try {
                            await ctx.replyWithVideo(videoUrl, { caption: data.title ? (data.title.length > 1000 ? data.title.substring(0, 1000) + '...' : data.title) : undefined });
                        } catch (err: any) {
                            if (err.message && err.message.includes('failed to get HTTP URL content')) {
                                console.log("Direct video send failed, downloading buffer...");
                                const axios = require('axios');
                                const response = await axios.get(videoUrl, { responseType: 'arraybuffer' });
                                const buffer = Buffer.from(response.data);
                                await ctx.replyWithVideo({ source: buffer }, { caption: data.title ? (data.title.length > 1000 ? data.title.substring(0, 1000) + '...' : data.title) : undefined });
                            } else {
                                throw err;
                            }
                        }
                    } else {
                        await ctx.reply("❌ Link ini sepertinya tidak berisi video.");
                    }
                } else if (type === 'audio') {
                    const audioUrl = data.music || data.play;
                    if (audioUrl) {
                        try {
                            await ctx.replyWithAudio(audioUrl, { title: data.music_info?.title || "Tiktok Audio", performer: data.music_info?.author || "Tiktok" });
                        } catch (err: any) {
                            if (err.message && err.message.includes('failed to get HTTP URL content')) {
                                console.log("Direct audio send failed, downloading buffer...");
                                const axios = require('axios');
                                const response = await axios.get(audioUrl, { responseType: 'arraybuffer' });
                                const buffer = Buffer.from(response.data);
                                await ctx.replyWithAudio({ source: buffer }, { title: data.music_info?.title || "Tiktok Audio", performer: data.music_info?.author || "Tiktok" });
                            } else {
                                throw err;
                            }
                        }
                    } else {
                        await ctx.reply("❌ Tidak ada audio ditemukan.");
                    }
                }
            } 
            else if (isYoutube) {
                const { youtube } = await import('btch-downloader');
                let data = await youtube(link);
                for(let i=0; i<3; i++) {
                    if (data && data.status) break;
                    console.log("YT fetch failed, retrying...", data);
                    await new Promise(r => setTimeout(r, 2000));
                    data = await youtube(link);
                }
                if (!data || !data.status) {
                    await ctx.telegram.editMessageText(ctx.chat?.id, processMsg.message_id, undefined, "❌ Gagal mengambil data dari YouTube.");
                    return;
                }
                
                await ctx.telegram.deleteMessage(ctx.chat?.id, processMsg.message_id).catch(()=>null);
                
                if (type === 'image') {
                    await ctx.replyWithPhoto(data.thumbnail, { caption: data.title ? (data.title.length > 1000 ? data.title.substring(0, 1000) + '...' : data.title) : undefined });
                } else if (type === 'video') {
                    if (data.mp4) {
                        try {
                            await ctx.replyWithVideo(data.mp4, { caption: data.title ? (data.title.length > 1000 ? data.title.substring(0, 1000) + '...' : data.title) : undefined });
                        } catch (err: any) {
                            if (err.message && err.message.includes('failed to get HTTP URL content')) {
                                console.log("Direct YT video send failed, downloading buffer...");
                                const axios = require('axios');
                                const response = await axios.get(data.mp4, { responseType: 'arraybuffer' });
                                const buffer = Buffer.from(response.data);
                                await ctx.replyWithVideo({ source: buffer }, { caption: data.title ? (data.title.length > 1000 ? data.title.substring(0, 1000) + '...' : data.title) : undefined });
                            } else {
                                throw err;
                            }
                        }
                    } else {
                        await ctx.reply("❌ Tidak dapat menemukan format video.");
                    }
                } else if (type === 'audio') {
                    if (data.mp3) {
                        try {
                            await ctx.replyWithAudio(data.mp3, { title: data.title, performer: data.author });
                        } catch (err: any) {
                            if (err.message && err.message.includes('failed to get HTTP URL content')) {
                                console.log("Direct YT audio send failed, downloading buffer...");
                                const axios = require('axios');
                                const response = await axios.get(data.mp3, { responseType: 'arraybuffer' });
                                const buffer = Buffer.from(response.data);
                                await ctx.replyWithAudio({ source: buffer }, { title: data.title, performer: data.author });
                            } else {
                                throw err;
                            }
                        }
                    } else {
                        await ctx.reply("❌ Tidak dapat menemukan format audio.");
                    }
                }
            }
            else {
                await ctx.telegram.deleteMessage(ctx.chat?.id, processMsg.message_id).catch(()=>null);
                if (link.includes('facebook.com') || link.includes('fb.watch') || link.includes('fb.gg') || link.includes('instagram.com') || link.includes('ig.me')) {
                    await ctx.reply("Mohon maaf kak, layanan download untuk Facebook dan Instagram saat ini sedang tidak tersedia karena masalah pemblokiran server (gagal download terus). 🙏\n\nSilakan gunakan Chuna untuk link TikTok atau YouTube ya! 🥰");
                } else {
                    await ctx.reply(`✅ Permintaan untuk link: ${link}\n\nMohon maaf, platform ini belum didukung atau sedang dalam pengembangan. Saat ini Chuna baru mendukung TikTok dan YouTube secara optimal. 🥰`);
                }
            }
        } catch (e) {
            console.error("Download Error:", e);
            try {
                await ctx.telegram.editMessageText(ctx.chat?.id, processMsg.message_id, undefined, "❌ Terjadi kesalahan saat memproses link. Silakan coba lagi nanti.");
            } catch (editError) {
                await ctx.reply("❌ Terjadi kesalahan saat memproses link. Silakan coba lagi nanti.");
            }
        }
      });
      bot.action(/^sel_off_(.+)$/, async (ctx) => {
        if (!db.owners.includes(ctx.from?.id)) return;
        const memberId = ctx.match[1];
        const member = members.find(m => m.id === memberId);
        if (!member) {
          return ctx.answerCbQuery("Member tidak ditemukan!");
        }
        
        await ctx.answerCbQuery();
        userStates[ctx.from.id] = { step: 'LOCKED_MEMBER', data: { memberId: member.id } };
        await ctx.reply(`✅ Pelanggan Terkunci: ${member.whatsapp}Silakan pilih menu transaksi di bawah:`, {
          reply_markup: {
            keyboard: [
              [{ text: "🧾 Cek Tagihan" }],
              [{ text: "📋 Menu Produk" }],
              [{ text: "🔙 Kembali ke Menu Owner" }]
            ],
            resize_keyboard: true
          }
        });
      });

      bot.action(/^tagihan_(.+)$/, async (ctx) => {
        const memberId = ctx.match[1];
        await ctx.answerCbQuery();
        try {
            await ctx.reply("🧾 Memuat tagihan (Pascabayar)...");
            const products = await getDigiflazzProducts("pasca");
            if (!products || products.length === 0) {
               return ctx.reply("❌ Tidak ada produk pascabayar.");
            }
            
            const categories = [...new Set(products.map((p) => p.category))].filter(Boolean).sort();
            const keyboard = [];
            for (let i = 0; i < categories.length; i += 2) {
                const row = [{ text: categories[i] }];
                if (categories[i+1]) row.push({ text: categories[i+1] });
                keyboard.push(row);
            }
            keyboard.push([{ text: "🔙 Kembali" }]);
            
            await ctx.reply("Pilih layanan tagihan:", {
                reply_markup: {
                    keyboard: keyboard,
                    resize_keyboard: true
                }
            });
        } catch (error) {
            await ctx.reply("❌ Terjadi kesalahan saat memuat tagihan.");
        }
      });
      
      bot.action('cancel_prepaid', async (ctx) => {
        await ctx.answerCbQuery("Pembelian dibatalkan");
        const state = userStates[ctx.from?.id || 0];
        if (state && state.data.memberId) {
            userStates[ctx.from?.id || 0] = { step: 'LOCKED_MEMBER', data: { memberId: state.data.memberId } };
        } else {
            delete userStates[ctx.from?.id || 0];
        }
        await ctx.editMessageText("❌ Pembelian dibatalkan.");
      });

      bot.action(/^pay_prepaid_(.+?)(?:_(cash|utang|saldo))?$/, async (ctx) => {
        await ctx.answerCbQuery();
        const sku = ctx.match[1];
        const method = ctx.match[2] || 'saldo';
        const isOwner = db.owners.includes(ctx.from?.id);
        
        if (method !== 'saldo' && !isOwner) {
            return ctx.reply("❌ Metode pembayaran tidak valid.");
        }
        
        const state = userStates[ctx.from?.id || 0];
        if (!state || state.step !== 'PREPAID_INPUT_NUMBER' || state.data.product.buyer_sku_code !== sku) {
            return ctx.reply("❌ Data transaksi tidak valid atau sudah kadaluarsa. Silakan ulangi pembelian.");
        }
        
        if (!isOwner) {
             userStates[ctx.from?.id || 0] = { step: 'ASK_PIN_PREPAID', data: { ...state.data, method, sku } };
             return ctx.reply("🔐 *Masukan PIN Keamanan Transaksi*Silakan ketik PIN Anda untuk melanjutkan transaksi ini.", { parse_mode: 'Markdown' });
        }
        
        await processPrepaidPayment(ctx, sku, method, state.data, state.data.memberId || `MBR-${ctx.from?.id}`);
      });
      bot.action(/^pay_pasca_(.+?)(?:_(cash|utang|saldo))?$/, async (ctx) => {
        await ctx.answerCbQuery();
        const ref_id = ctx.match[1];
        const method = ctx.match[2] || 'saldo';
        const isOwner = db.owners.includes(ctx.from?.id);
        
        if (method !== 'saldo' && !isOwner) {
            return ctx.reply("❌ Metode pembayaran tidak valid.");
        }
        
        const state = userStates[ctx.from?.id || 0];
        if (!state || !state.data.checkResult || state.data.checkResult.ref_id !== ref_id) {
            return ctx.reply("❌ Data transaksi tidak valid atau sudah kadaluarsa. Silakan ulangi cek tagihan.");
        }
        
        if (!isOwner) {
             userStates[ctx.from?.id || 0] = { step: 'ASK_PIN_PASCA', data: { ...state.data, method, ref_id } };
             return ctx.reply("🔐 *Masukan PIN Keamanan Transaksi*Silakan ketik PIN Anda untuk melanjutkan transaksi ini.", { parse_mode: 'Markdown' });
        }
        
        await processPascaPayment(ctx, ref_id, method, state.data, state.data.memberId || `MBR-${ctx.from?.id}`);
      });
      bot.action("cancel_pasca", async (ctx) => {
        await ctx.answerCbQuery();
        const state = userStates[ctx.from?.id || 0];
        if (state?.data?.memberId) {
            userStates[ctx.from?.id || 0] = { step: 'LOCKED_MEMBER', data: { memberId: state.data.memberId } };
        } else {
            delete userStates[ctx.from?.id || 0];
        }
        await ctx.reply("❌ Pembayaran tagihan dibatalkan.");
      });

      bot.action(/^produk_(.+)$/, async (ctx) => {
        const memberId = ctx.match[1];
        await ctx.answerCbQuery();
        try {
            await ctx.reply("🛒 Memuat kategori...");
            const products = await getDigiflazzProducts("prepaid");
            const categories = [...new Set(products.map((p) => p.category))].filter(Boolean).sort();
            
            const keyboard = [];
            for (let i = 0; i < categories.length; i += 2) {
                const row = [{ text: categories[i] }];
                if (categories[i+1]) row.push({ text: categories[i+1] });
                keyboard.push(row);
            }
            keyboard.push([{ text: "🔙 Kembali" }]);
            
            await ctx.reply("Silakan pilih kategori produk di bawah ini:", {
              reply_markup: {
                keyboard: keyboard,
                resize_keyboard: true
              }
            });
        } catch (error) {
            await ctx.reply("❌ Terjadi kesalahan saat mengambil kategori.");
        }
      });

      bot.hears("📒 Cek Utang Member", async (ctx) => {
        if (!db.owners.includes(ctx.from.id)) return;
        
        const utangTx = transactions.filter((t: any) => t.method === 'utang' && t.status === 'Sukses');
        
        if (utangTx.length === 0) {
            return ctx.reply("✨ Wah, hebat! Saat ini tidak ada member yang memiliki utang. Semua lunas! 🎉");
        }
        
        const utangByMember: Record<string, any[]> = {};
        utangTx.forEach((t: any) => {
            if (!utangByMember[t.memberId]) utangByMember[t.memberId] = [];
            utangByMember[t.memberId].push(t);
        });
        
        const buttons = [];
        for (const memberId in utangByMember) {
            const member = members.find(m => m.id === memberId);
            const nama = member ? (member.name || "-") : memberId;
            const wa = member ? (member.whatsapp || "-") : "-";
            buttons.push([{
                text: `👤 ${nama} (${wa})`,
                callback_data: `cek_utang_${memberId}`
            }]);
        }
        
        await ctx.reply("📒 *DAFTAR MEMBER BERHUTANG*Silakan pilih member untuk melihat detail utang:", {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: buttons
            }
        });
      });

      bot.action(/^cek_utang_(.+)$/, async (ctx) => {
          if (!db.owners.includes(ctx.from?.id)) return;
          const memberId = ctx.match[1];
          const member = members.find(m => m.id === memberId);
          const nama = member ? (member.name || "-") : memberId;
          const wa = member ? (member.whatsapp || "-") : "-";
          
          const utangTx = transactions.filter((t: any) => t.method === 'utang' && t.status === 'Sukses' && t.memberId === memberId);
          
          if (utangTx.length === 0) {
              return ctx.editMessageText(`✨ Utang ${nama} sudah lunas semua! 🎉`);
          }
          
          let msg = `📒 *DETAIL UTANG: ${nama}* (${wa})`;
          let totalUtang = 0;
          
          utangTx.forEach((t: any) => {
              const date = t.date ? new Date(t.date).toLocaleString('id-ID', { timeZone: 'Asia/Makassar' }) : '-';
              const sisa = t.price - (t.paidAmount || 0);
              msg += ` ├ 📦 ${t.product}`;
              msg += ` ├ 💵 Rp ${sisa.toLocaleString('id-ID')} ${t.paidAmount ? `(Sisa dari Rp ${t.price.toLocaleString('id-ID')})` : ''}`;
              msg += ` └ 📅 ${date}`;
              totalUtang += sisa;
          });
          
          msg += `💰 *TOTAL UTANG: Rp ${totalUtang.toLocaleString('id-ID')}*Apakah dia mau bayar?`;
          
          await ctx.editMessageText(msg, {
              parse_mode: 'Markdown',
              reply_markup: {
                  inline_keyboard: [
                      [{ text: "🔔 Kirim Pengingat (WA)", callback_data: `ingatkan_utang_${memberId}` }],
                      [{ text: "✅ Bayar", callback_data: `bayar_utang_${memberId}` }],
                      [{ text: "❌ Tidak", callback_data: `batal_utang` }]
                  ]
              }
          });
      });

      bot.action(/^ingatkan_utang_(.+)$/, async (ctx) => {
          if (!db.owners.includes(ctx.from?.id)) return;
          const memberId = ctx.match[1];
          const member = members.find(m => m.id === memberId);
          const nama = member ? (member.name || "-") : memberId;

          const utangTx = transactions.filter((t: any) => t.method === 'utang' && t.status === 'Sukses' && t.memberId === memberId);
          if (utangTx.length === 0) {
              return ctx.reply(`✨ Utang ${nama} sudah lunas semua! 🎉`);
          }

          const waDetails = await getCustomerWaDetails(member);
          let rawWa = member?.whatsapp || (waDetails.waPhone !== '-' ? waDetails.waPhone : '');
          if (!rawWa) {
              return ctx.reply(`❌ Pelanggan ${nama} belum memiliki nomor WhatsApp terdaftar di sistem!`);
          }

          await ctx.answerCbQuery("Sedang membuat nota dan mengirim pengingat ke WhatsApp...");
          const waitMsg = await ctx.reply(`⏳ Sedang menyiapkan nota tagihan dan mengirimkan pengingat ke WhatsApp ${nama} (${rawWa})...`);

          try {
              let totalUtang = 0;
              utangTx.forEach((t: any) => {
                  const sisa = t.price - (t.paidAmount || 0);
                  totalUtang += sisa;
              });

              const dates = utangTx.map((t: any) => new Date(t.date || Date.now()).getTime());
              const earliestDate = new Date(Math.min(...dates));
              const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
              const dateStr = `${earliestDate.getDate()} ${months[earliestDate.getMonth()]} ${earliestDate.getFullYear()}`;
              const daysPast = Math.max(1, Math.floor((Date.now() - earliestDate.getTime()) / (1000 * 60 * 60 * 24)));

              const productNames = Array.from(new Set(utangTx.map((t: any) => t.product))).join(', ');
              const namaWaProfile = (waDetails.waProfile && waDetails.waProfile !== '-') ? waDetails.waProfile : nama;
              const namaMember = member ? (member.name || "-") : nama;

              const reminderMsg = `Halo Kak ${namaWaProfile}! 😊
Saya Chuna dari E4 Store.

Pengingat tagihan:
• Costumer : ${namaMember}
• Produk: ${productNames}
• Total: Rp${totalUtang.toLocaleString('id-ID')}
• Tunggakan: ${daysPast} hari

Mohon pelunasan maksimal 3 hari ke depan ya, Kak. Kami sedang butuh dana untuk stok produk.

Jika ada kendala, hubungi owner: 085169949218.

Terima kasih 🙏
Chuna – E4 Store`;

              const debtReceiptBuffer = await generateCanvasDebtReceipt(member, utangTx);

              let cleanWa = rawWa.replace(/\D/g, "");
              if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
              const jid = `${cleanWa}@s.whatsapp.net`;

              if (!waSocket) {
                  return ctx.reply("⚠️ Bot WhatsApp belum terhubung / offline! Silakan scan QR code WhatsApp terlebih dahulu di web dashboard.");
              }

              await waSocket.presenceSubscribe(jid);
              await waSocket.sendPresenceUpdate("composing", jid);
              await new Promise(r => setTimeout(r, 1200));
              await waSocket.sendPresenceUpdate("paused", jid);

              if (debtReceiptBuffer) {
                  await waSocket.sendMessage(jid, { image: debtReceiptBuffer, caption: reminderMsg });
              } else {
                  await waSocket.sendMessage(jid, { text: reminderMsg });
              }

              // Update last reminder timestamp
              utangTx.forEach((t: any) => {
                  t.lastReminderSentAt = new Date().toISOString();
              });
              writeDB(db);

              try {
                  await ctx.deleteMessage(waitMsg.message_id);
              } catch (e) {}

              if (debtReceiptBuffer) {
                  await ctx.replyWithPhoto({ source: debtReceiptBuffer }, {
                      caption: `🔔 *Pengingat Utang Berhasil Dikirim ke WhatsApp!*\n\n👤 Pelanggan: *${nama}*\n📱 No. WhatsApp: \`+${cleanWa}\`\n💰 Total Utang: *Rp ${totalUtang.toLocaleString('id-ID')}*\n📦 Produk: ${productNames}\n📅 Masa Tunggakan: ${daysPast} hari\n\n_Pesan pengingat dan gambar nota tagihan telah dikirimkan ke WhatsApp pelanggan._`,
                      parse_mode: 'Markdown'
                  });
              } else {
                  await ctx.reply(`✅ Pesan pengingat utang telah berhasil dikirim ke WhatsApp ${nama} (+${cleanWa})!`);
              }
          } catch (err: any) {
              console.error("Gagal mengirim pengingat utang via WA:", err);
              ctx.reply(`❌ Gagal mengirim pengingat utang ke WhatsApp: ${err.message || err}`);
          }
      });

      bot.action(/^bayar_utang_(.+)$/, async (ctx) => {
          if (!db.owners.includes(ctx.from?.id)) return;
          const memberId = ctx.match[1];
          
          userStates[ctx.from.id] = { step: 'WAIT_NOMINAL_UTANG', data: { memberId } };
          await ctx.editMessageText("Berapakah customer mu bayar?Ketik nominalnya (contoh: 10000 atau 10.000)");
      });
      
      bot.action('batal_utang', async (ctx) => {
          if (!db.owners.includes(ctx.from?.id)) return;
          delete userStates[ctx.from.id];
          await ctx.editMessageText("❌ Aksi dibatalkan.");
      });

      bot.hears("💳 Saldo Pusat", async (ctx) => {
        if (!db.owners.includes(ctx.from.id)) return;
        ctx.reply(`💳 *SALDO PUSAT (DIGIFLAZZ)*Status: ${digiflazzStatus}Saldo Saat Ini: Rp ${digiflazzBalance.toLocaleString('id-ID')}`, { parse_mode: 'Markdown' });
      });

      bot.hears("⚙️ Pengaturan", async (ctx) => {
        if (!db.owners.includes(ctx.from.id)) return;
        
        const tel = securitySuite.getTelemetry();
        ctx.reply(`🛡️ *SISTEM KEAMANAN SUPER KUAT (5-LAYER SHIELD)*
━━━━━━━━━━━━━━━━━━━━━
Status Sistem: *${tel.status} (100% SECURE)*
Score Kesehatan: *${tel.layers.helios.healthScore}/100*
Audit Terakhir: ${tel.layers.helios.lastAudit}

🛡️ *1. EGIS (Firewall & WAF):*
- Status: *ONLINE* (${tel.layers.egis.mode})
- Paket Diinspeksi: *${tel.layers.egis.inspectedPackets}*
- Serangan Ditangkal: *${tel.layers.egis.blockedAttacks}* (SQLi, XSS, Path Traversal, Scanners)

🥷 *2. NYXGUARD (Sentry & Anti-Spam):*
- Status: *ONLINE*
- IP Dikarantina: *${tel.layers.nyxguard.bannedIPsCount}*
- Spam Bot Ditangkal: *${tel.layers.nyxguard.botSpamBlocked}*

⚓ *3. ANCHOR (Tamper-Proof Ledger):*
- Status: *ONLINE* (${tel.layers.anchor.hashAlgorithm})
- Verifikasi Integritas: *${tel.layers.anchor.integrityChecksPassed} Passed*
- Upaya Manipulasi: *${tel.layers.anchor.tamperAttempts} Blocked*

🧹 *4. PURGE (Zero-Trust Sanitizer):*
- Status: *ONLINE*
- Payload Disanitasi: *${tel.layers.purge.sanitizedPayloads}*
- Kebocoran Kredensial Dicegah: *${tel.layers.purge.redactedSensitiveLeaks}*

☀️ *5. HELIOS (Threat Intelligence):*
- Status: *ONLINE* (Active Telemetry)
- Notifikasi Ancaman: Otomatis via Telegram Owner
━━━━━━━━━━━━━━━━━━━━━

⚙️ *2. Digiflazz Webhook*
Untuk update status transaksi otomatis:
URL: \`/api/digiflazz-webhook\`
Contoh: \`https://domainanda.com/api/digiflazz-webhook\`
`, { parse_mode: 'Markdown' });

      });

      
            bot.hears("📢 Pengumuman WA", async (ctx) => {
          if (!db.owners.includes(ctx.from.id)) return;
          userStates[ctx.from.id] = { step: 'ANNOUNCEMENT_MENU', data: {} };
          
          
          await ctx.reply(`📢 Menu Pengumuman WA:
Target saat ini: ${db.waAnnouncementTarget || 'Belum Diatur'}`, {
              reply_markup: {
                  keyboard: [
                      [{ text: "🎯 Set Target WA" }],
                      [{ text: "📢 Buat Pengumuman" }, { text: "🎉 Promo Otomatis" }],
                      [{ text: "🔙 Kembali ke Menu Owner" }]
                  ],
                  resize_keyboard: true
              }
          });
      });

      
      

      

      bot.hears("🎯 Set Target WA", async (ctx) => {
          if (!db.owners.includes(ctx.from.id)) return;
          userStates[ctx.from.id] = { step: 'AWAITING_WA_TARGET', data: {} };
          const currentTarget = db.waAnnouncementTarget || "Belum diatur";
          await ctx.reply(`Target WA saat ini: *${currentTarget}*Kirimkan Target ID / Nomor WA tujuan pengumuman (contoh: 120363393336519112@g.us):`, { parse_mode: 'Markdown' });
      });

      
      bot.hears("🎉 Promo Otomatis", async (ctx) => {
          if (!db.owners.includes(ctx.from.id)) return;
          await runAutoPromo(ctx);
      });

      bot.hears("📢 Buat Pengumuman", async (ctx) => {
          if (!db.owners.includes(ctx.from.id)) return;
          const target = db.waAnnouncementTarget;
          if (!target) {
              return ctx.reply("❌ Target WA belum diatur! Silakan Set Target WA terlebih dahulu.");
          }
          userStates[ctx.from.id] = { step: 'AWAITING_ANNOUNCEMENT_TEXT', data: {} };
          await ctx.reply(`Kirimkan teks, gambar, atau video (dengan caption) yang ingin dikirimkan ke target *${target}*:
(Bisa multi-baris)

💡 *TIPS OTOMATIS HARGA:*
Kamu bisa pakai kode seperti ini agar harga update otomatis sesuai setting produk & Digiflazz:\`{{KODE_SKU:REGULER}}\` -> Harga Biasa\`{{KODE_SKU:VIP}}\` -> Harga VIP\`{{KODE_SKU:STATUS}}\` -> 🟢 NORMAL / 🔴 CLOSE\`{{KODE_SKU:HEMAT}}\` -> Selisih HargaContoh:💎 ML 170DM: \`{{ML170:REGULER}}\`⭐ VIP Cuma: \`{{ML170:VIP}}\``, { parse_mode: 'Markdown' });
      });

      
      bot.hears("📸 Buat Story WA", async (ctx) => {
          if (!db.owners.includes(ctx.from.id)) return;
          userStates[ctx.from.id] = { step: 'AWAITING_STORY_MEDIA', data: {} };
          await ctx.reply(`📸 *Kirimkan gambar atau video (dengan caption) untuk dijadikan Story WA:*

Kirim sebagai Document/File di Telegram jika ingin kualitas asli (HD/tanpa pecah).`, { parse_mode: 'Markdown' });
      });

      bot.hears("📝 Tambah Member", async (ctx) => {
        if (!db.owners.includes(ctx.from.id)) return;
        userStates[ctx.from.id] = { step: 'OWNER_ADD_MEMBER_USERNAME', data: {} };
        ctx.reply("📝 MASUKKAN USERNAME MEMBER BARU:");
      });

      
      bot.on(["photo", "video", "document"], async (ctx, next) => {
          const userId = ctx.from.id;
          const state = userStates[userId];
          
          
          if (state && state.step === 'AWAITING_STORY_MEDIA') {
              if (!waSocket) {
                  await ctx.reply("❌ WhatsApp belum terhubung!");
                  delete userStates[userId];
                  return;
              }
              await ctx.reply("⏳ Mendownload media dan menyiapkan pengiriman...");
              try {
                  let fileId, mediaType, mimetype, fileName;
                  const msg = ctx.message as any;
                  if (msg.photo) {
                      fileId = msg.photo[msg.photo.length - 1].file_id;
                      mediaType = 'image';
                  } else if (msg.video) {
                      fileId = msg.video.file_id;
                      mediaType = 'video';
                  } else if (msg.document) {
                      fileId = msg.document.file_id;
                      mediaType = 'document';
                      mimetype = msg.document.mime_type;
                      fileName = msg.document.file_name || 'document';
                  }

                  const caption = msg.caption || "";
                  const fileLink = await ctx.telegram.getFileLink(fileId);
                  const response = await fetch(fileLink.href);
                  const arrayBuffer = await response.arrayBuffer();
                  const buffer = Buffer.from(arrayBuffer);
                  
                  let jidList: string[] = [...(db.waContacts || [])];
                  
                  // Add my own JID
                  var me = waSocket.user?.id?.split(':')[0] + '@s.whatsapp.net';
                  if (me && !jidList.includes(me)) jidList.push(me);
                  
                  // Add registered members WA
                  Object.values(db.registeredUsers || {}).forEach((u: any) => {
                      if (u.wa) {
                          let clean = u.wa.replace(/\D/g, "");
                          if (clean.startsWith("0")) clean = "62" + clean.substring(1);
                          let memberJid = clean + "@s.whatsapp.net";
                          if (!jidList.includes(memberJid)) jidList.push(memberJid);
                      }
                  });
                  
                  // Also include the owner's own JID just in case
                  var me = waSocket.user?.id?.split(':')[0] + '@s.whatsapp.net';
                  if (me && !jidList.includes(me)) jidList.push(me);

                  let msgOpt: any = {};
                  if (mediaType === 'image') msgOpt = { image: buffer, caption: caption };
                  else if (mediaType === 'video') msgOpt = { video: buffer, caption: caption };
                  else if (mediaType === 'document') {
                      // Some documents might not be valid for status, but we try image/video based on mimetype
                      if (mimetype?.includes('video')) msgOpt = { video: buffer, caption: caption };
                      else msgOpt = { image: buffer, caption: caption };
                  }

                  await waSocket.sendMessage('status@broadcast', msgOpt, { statusJidList: jidList });
                  
                  await ctx.reply("✅ Story WA berhasil diunggah!");
                  delete userStates[userId];
              } catch (err: any) {
                  await ctx.reply("❌ Gagal mengunggah Story WA: " + err.message);
                  delete userStates[userId];
              }
              return;
          }

                    if (state && state.step === 'AWAITING_ANNOUNCEMENT_TEXT') {
              const targetAnnounce = db.waAnnouncementTarget;
              if (!targetAnnounce) {
                  await ctx.reply("❌ Target WA belum diatur!");
                  delete userStates[userId];
                  return;
              }
              
              let fileId;
              let mediaType;
              let mimetype;
              let fileName;
              
              const msg = ctx.message as any;
              if (msg.photo) {
                  fileId = msg.photo[msg.photo.length - 1].file_id;
                  mediaType = 'image';
              } else if (msg.video) {
                  fileId = msg.video.file_id;
                  mediaType = 'video';
              } else if (msg.document) {
                  fileId = msg.document.file_id;
                  mediaType = 'document';
                  mimetype = msg.document.mime_type;
                  fileName = msg.document.file_name || 'document';
              }
              
              const caption = msg.caption || "";
              
              try {
                  const fileLink = await ctx.telegram.getFileLink(fileId);
                  const response = await fetch(fileLink.href);
                  const arrayBuffer = await response.arrayBuffer();
                  const buffer = Buffer.from(arrayBuffer);
                  
                  // Save to disk
                  const ext = fileName ? fileName.split('.').pop() : (mediaType === 'image' ? 'jpg' : 'mp4');
                  const localPath = 'announcement_media.' + ext;
                  fs.writeFileSync(localPath, buffer);
                  
                  await ctx.reply("✅ Mengirim pengumuman media ke WhatsApp...");
                  delete userStates[userId];
                  
                  if (waSocket) {
                      try {
                          let msgOpt: any = {};
                          if (mediaType === 'image') msgOpt = { image: buffer, caption: caption };
                          else if (mediaType === 'video') msgOpt = { video: buffer, caption: caption };
                          else if (mediaType === 'document') msgOpt = { document: buffer, caption: caption, mimetype: mimetype, fileName: fileName };
                          
                          const parsedCaption = await parseAnnouncementText(caption);
                          if (mediaType === 'image') msgOpt.caption = parsedCaption;
                          else if (mediaType === 'video') msgOpt.caption = parsedCaption;
                          else if (mediaType === 'document') msgOpt.caption = parsedCaption;
                          await waSocket.sendMessage(targetAnnounce, msgOpt);
                      } catch (err) {
                          await ctx.reply("⚠️ Gagal mengirim percobaan pertama: " + err.message);
                      }
                  } else {
                      await ctx.reply("⚠️ WhatsApp belum terhubung. Pengumuman akan dikirim saat WA terhubung.");
                  }
              } catch (e) {
                  await ctx.reply("❌ Gagal mendownload atau memproses media: " + e.message);
              }
              return;
          }
          
          return next();
      });


      bot.hears(["❌ Batal", "❌ Tidak"], async (ctx) => {
          const userId = ctx.from.id;
          const state = userStates[userId];
          let kb = [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Fitur Download" }]];
          if (db.owners.includes(userId)) {
             kb.push([{ text: "👑 List Member" }, { text: "📒 Cek Utang Member" }]);
             kb.push([{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }]);
          }
          if (state && state.data && state.data.memberId) {
              userStates[userId] = { step: 'LOCKED_MEMBER', data: { memberId: state.data.memberId } };
              await ctx.reply("❌ Dibatalkan. Kembali ke menu transaksi member offline.", {
                  reply_markup: { keyboard: [[{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "🔙 Kembali ke Menu Owner" }]], resize_keyboard: true }
              });
              return;
          }
          delete userStates[userId];
          await ctx.reply("❌ Dibatalkan. Kembali ke menu utama.", {
              reply_markup: { keyboard: kb, resize_keyboard: true }
          });
      });

      bot.on("text", async (ctx, next) => {
        const userId = ctx.from.id;
        const text = ctx.message.text;
        
        if (text.startsWith('/')) { return next(); }
        if (text === "🔙 Kembali") { return next(); }
        
        const ownerMenu = ["📒 Cek Utang Member", "📝 Tambah Member", "👑 List Member", "💳 Saldo Pusat", "⚙️ Pengaturan", "📢 Pengumuman WA", "📸 Buat Story WA"];
        if (ownerMenu.includes(text) && db.owners.includes(userId)) {
           delete userStates[userId];
           return next(); 
        }

        const state = userStates[userId];
        if (state) {
            switch (state.step) {

                case 'AWAITING_DOWNLOAD_LINK': {
                    const link = text.trim();
                    if (link.toLowerCase() === 'batal' || link === '🔙 Kembali ke Menu Owner' || link === '💵 Cek Saldo' || link === '🧾 Cek Tagihan' || link === '📋 Menu Produk') {
                        delete userStates[userId];
                        await ctx.reply("❌ Download dibatalkan.", {
                            reply_markup: {
                                keyboard: db.owners.includes(userId) ? 
                                [
                                    [{ text: "📒 Cek Utang Member" }],
                                    [{ text: "📝 Tambah Member" }, { text: "👑 List Member" }],
                                    [{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }],
                                    [{ text: "📢 Pengumuman WA" }, { text: "📥 Fitur Download" }]
                                ] :
                                [
                                    [{ text: "💵 Cek Saldo" }],
                                    [{ text: "🧾 Cek Tagihan" }],
                                    [{ text: "📋 Menu Produk" }],
                                    [{ text: "📥 Fitur Download" }]
                                ],
                                resize_keyboard: true
                            }
                        });
                        return;
                    }
                    if (!link.startsWith('http')) {
                        await ctx.reply("❌ Link tidak valid. Harap kirimkan link yang diawali dengan http/https.");
                        return;
                    }

                    // Save link to state so we can use it in callback
                    userStates[userId] = { step: 'AWAITING_DOWNLOAD_TYPE', data: { link: link } };
                    
                    await ctx.reply("Link terdeteksi! Silakan pilih format yang ingin didownload di bawah ini 👇", {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "📸 Gambar", callback_data: "dl_image" }],
                                [{ text: "🎥 Video", callback_data: "dl_video" }],
                                [{ text: "🎵 Audio / MP3", callback_data: "dl_audio" }]
                            ]
                        }
                    });
                    return;
                }

                case 'ASK_PIN_PREPAID': {
                    const pinEntered = text.trim();
                    if (pinEntered === '❌ Batal' || pinEntered.toLowerCase() === 'batal') {
                        delete userStates[userId];
                        const isOwner = db.owners.includes(userId);
                        let kb = [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Fitur Download" }]];
                        if (isOwner) {
                            kb.push([{ text: "👑 List Member" }, { text: "📒 Cek Utang Member" }]);
                            kb.push([{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }]);
                        }
                        await ctx.reply("❌ Transaksi dibatalkan.", { reply_markup: { keyboard: kb, resize_keyboard: true } });
                        return;
                    }

                    const regUser = registeredUsers[userId];
                    if (!regUser || regUser.pin !== pinEntered) {
                        const wrongMsg = "😡 HMM?! PIN-NYA SALAH! Hayoo, kamu siapa?! Jangan sembarangan pakai akun orang ya! Chuna gigit nih kalau berani macam-macam! 🔪👿";
                        const sd = state.data;
                        const memberIdForPrepaid = sd.memberId || `MBR-${userId}`;
                        const memberForPrepaid = members.find(m => m.id === memberIdForPrepaid);
                        if (waSocket && memberForPrepaid && memberForPrepaid.whatsapp) {
                            let cleanWa = memberForPrepaid.whatsapp.replace(/\D/g, "");
                            if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
                            const jid = cleanWa + "@s.whatsapp.net";
                            waSocket.sendMessage(jid, { text: wrongMsg }).catch(()=>{});
                        }
                        return ctx.reply(wrongMsg);
                    }
                    await ctx.reply("✅ Yey! PIN-nya benar. Chuna langsung proses transaksinya sekarang ya sayang! 🚀✨*(Demi keamanan, pesan berisi PIN-mu jangan lupa dihapus sendiri ya)*", { parse_mode: 'Markdown' });
                    const sd = state.data;
                    delete userStates[userId];
                    await processPrepaidPayment(ctx, sd.sku, sd.method, sd, sd.memberId || `MBR-${userId}`);
                    return;
                }
                case 'ASK_PIN_PASCA': {
                    const pinEntered = text.trim();
                    if (pinEntered === '❌ Batal' || pinEntered.toLowerCase() === 'batal') {
                        delete userStates[userId];
                        const isOwner = db.owners.includes(userId);
                        let kb = [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Fitur Download" }]];
                        if (isOwner) {
                            kb.push([{ text: "👑 List Member" }, { text: "📒 Cek Utang Member" }]);
                            kb.push([{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }]);
                        }
                        await ctx.reply("❌ Transaksi dibatalkan.", { reply_markup: { keyboard: kb, resize_keyboard: true } });
                        return;
                    }

                    const regUser = registeredUsers[userId];
                    if (!regUser || regUser.pin !== pinEntered) {
                        const wrongMsg = "😡 HMM?! PIN-NYA SALAH! Hayoo, kamu siapa?! Jangan sembarangan pakai akun orang ya! Chuna gigit nih kalau berani macam-macam! 🔪👿";
                        const sd = state.data;
                        const memberIdForPrepaid = sd.memberId || `MBR-${userId}`;
                        const memberForPrepaid = members.find(m => m.id === memberIdForPrepaid);
                        if (waSocket && memberForPrepaid && memberForPrepaid.whatsapp) {
                            let cleanWa = memberForPrepaid.whatsapp.replace(/\D/g, "");
                            if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
                            const jid = cleanWa + "@s.whatsapp.net";
                            waSocket.sendMessage(jid, { text: wrongMsg }).catch(()=>{});
                        }
                        return ctx.reply(wrongMsg);
                    }
                    await ctx.reply("✅ Yey! PIN-nya benar. Chuna langsung proses transaksinya sekarang ya sayang! 🚀✨*(Demi keamanan, pesan berisi PIN-mu jangan lupa dihapus sendiri ya)*", { parse_mode: 'Markdown' });
                    const sd = state.data;
                    delete userStates[userId];
                    await processPascaPayment(ctx, sd.ref_id, sd.method, sd, sd.memberId || `MBR-${userId}`);
                    return;
                }




              case 'PREPAID_INPUT_NUMBER': {
                const targetNo = text.trim();
                if (targetNo.toLowerCase() === 'batal' || targetNo === '❌ Batal') {
                    if (state.data.memberId) {
                        userStates[userId] = { step: 'LOCKED_MEMBER', data: { memberId: state.data.memberId } };
                        await ctx.reply("❌ Pembelian dibatalkan.", { reply_markup: { keyboard: [[{ text: "🧾 Cek Tagihan" }],
              [{ text: "📋 Menu Produk" }],
              [{ text: "🔙 Kembali ke Menu Owner" }]], resize_keyboard: true } });
                    } else {
                        delete userStates[userId];
                        await ctx.reply("❌ Pembelian dibatalkan.", { reply_markup: { keyboard: [[{ text: "💵 Cek Saldo" }],
                  [{ text: "🧾 Cek Tagihan" }],
                  [{ text: "📋 Menu Produk" }],
                  [{ text: "📥 Fitur Download" }]], resize_keyboard: true } });
                    }
                    return;
                }
                if (!targetNo || targetNo.length < 2) {
                    await ctx.reply("❌ Nomor tujuan tidak valid. Silakan masukkan nomor yang benar, atau ketik 'Batal'.");
                    return;
                }
                
                const product = state.data.product;
                const total = state.data.totalBayar;
                
                let nameInfo = "";
                let skuToPay = product.buyer_sku_code;
                
                state.data.targetNo = targetNo; // Save target number in state

                
                // --- Cek Nickname Game Automatis ---
                if (product.brand && (product.brand.toUpperCase() === "FREE FIRE" || product.brand.toUpperCase() === "MOBILE LEGENDS")) {
                    try {
                        const game = product.brand.toUpperCase() === "FREE FIRE" ? "freefire" : "mobilelegends";
                        let id = targetNo;
                        let zone = "";
                        
                        if (game === "mobilelegends") {
                            const match = targetNo.replace(/[^0-9]/g, ' ').trim().split(/\s+/);
                            if (match.length >= 1) id = match[0];
                            if (match.length >= 2) zone = match[1];
                        }
                        
                        let nickname = "";
                        
                        // Failover APIs
                        const apis = [
                            game === 'freefire' 
                                ? `https://api.vipayment.co.id/api/game/nickname?game=freefire&id=${id}`
                                : `https://api.vipayment.co.id/api/game/nickname?game=mobilelegends&id=${id}&zone=${zone}`,
                            game === 'freefire'
                                ? `https://api.isan.my.id/api/ff?id=${id}`
                                : `https://api.isan.my.id/api/ml?id=${id}&zone=${zone}`,
                            game === 'freefire'
                                ? `https://v2.ouzen.xyz/api/game/ff?id=${id}`
                                : `https://v2.ouzen.xyz/api/game/ml?id=${id}&zone=${zone}`
                        ];
                        
                        for (const url of apis) {
                            if (nickname) break;
                            try {
                                const res = await fetch(url, { signal: AbortSignal.timeout(3000) }).catch(() => null);
                                if (res && res.ok) {
                                    const data = await res.json();
                                    if (data.status && data.data && data.data.name) nickname = data.data.name;
                                    else if (data.name) nickname = data.name;
                                    else if (data.nickname) nickname = data.nickname;
                                }
                            } catch(e) {}
                        }

                        if (nickname) {
                            nameInfo = `👤 Nickname    : ${nickname}`;
                            state.data.nickname = nickname;
                        } else {
                            nameInfo = `👤 Nickname    : Gagal terdeteksi (gangguan API)`;
                        }
                    } catch (e) {
                        nameInfo = `👤 Nickname    : Gagal terdeteksi (gangguan API)`;
                    }
                }
                
                const replyText = `✅ *Konfirmasi Pembelian*\n\nLayanan       : ${product.product_name}\nNomor Tujuan  : ${targetNo}\n${nameInfo}\n💎 Total Bayar : Rp ${total.toLocaleString('id-ID')}`;
                const isOwner = db.owners.includes(ctx.from?.id);
                const keyboard = [];
                if (isOwner) {
                    keyboard.push([{ text: "💵 Cash" }, { text: "📝 Utang" }]);
                    keyboard.push([{ text: "❌ Batal" }]);
                } else {
                    keyboard.push([{ text: "💳 Saldo" }]);
                    keyboard.push([{ text: "❌ Batal" }]);
                }

                userStates[userId] = { step: 'WAIT_PAYMENT_PREPAID', data: { ...state.data, skuToPay } };

                await ctx.reply(replyText, {
                    parse_mode: "Markdown",
                    reply_markup: { keyboard, resize_keyboard: true }
                });
                // Automatically send sticker to WhatsApp
                const memberIdForPrepaid = state.data.memberId || `MBR-${ctx.from?.id}`;
                const memberForPrepaid = members.find(m => m.id === memberIdForPrepaid || isTelegramMatch(m.telegram, ctx.from?.id, ctx.from?.username));
                if (waSocket && memberForPrepaid && memberForPrepaid.whatsapp) {
                    let cleanWa = memberForPrepaid.whatsapp.replace(/\D/g, "");
                    if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
                    const jid = cleanWa + "@s.whatsapp.net";
                    try {
                        await waSocket.presenceSubscribe(jid);
                        await waSocket.sendPresenceUpdate('composing', jid);
                        
                        // Fetch customer's WhatsApp profile photo if available
                        const waDetails = await getCustomerWaDetails(memberForPrepaid, ctx.from?.id);
                        
                        // Generate Sticker Konfirmasi Pembelian with photo profile or monogram
                        const stickerBuffer = await generateOrderConfirmationSticker({
                            serviceName: product.product_name,
                            targetNo: targetNo,
                            totalBayar: total,
                            nickname: state.data.nickname,
                            note: 'pembelianmu akan di proses ya kk\nmohon di tunggu',
                            waPhotoUrl: waDetails?.waPhotoUrl || null
                        });

                        await new Promise(r => setTimeout(r, 1000));
                        await waSocket.sendPresenceUpdate('paused', jid);

                        if (stickerBuffer) {
                            await waSocket.sendMessage(jid, { sticker: stickerBuffer });
                        } else {
                            await waSocket.sendMessage(jid, { text: replyText });
                        }
                    } catch (err) {
                        console.error("Failed to send WA sticker/message:", err);
                        try {
                            await waSocket.sendMessage(jid, { text: replyText });
                        } catch (e2) {}
                    }
                }
                break;
              }
                          case 'OMNI_SELECT_PACKAGE':
                if (text === '❌ Batal') {
                    if (state.data.memberId) {
                        userStates[userId] = { step: 'LOCKED_MEMBER', data: { memberId: state.data.memberId } };
                        await ctx.reply("❌ Pembelian dibatalkan.", { reply_markup: { keyboard: [[{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "🔙 Kembali ke Menu Owner" }]], resize_keyboard: true } });
                    } else {
                        delete userStates[userId];
                        await ctx.reply("❌ Pembelian dibatalkan.", { reply_markup: { keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Fitur Download" }]], resize_keyboard: true } });
                    }
                    return;
                }
                
                const selectedPkg = state.data.omniPackages.find((p: any) => p.name + " - " + p.price === text.trim());
                if (!selectedPkg) {
                    await ctx.reply("❌ Pilihan tidak valid. Silakan pilih dari menu di bawah atau klik Batal.");
                    return;
                }
                
                await ctx.reply("⏳ Sedang memproses Kode Bayar untuk " + selectedPkg.name + "...");
                let omniFinalCustomerNo = selectedPkg.code;
                
                try {
                    const result = await checkPascaBill(state.data.product.buyer_sku_code, omniFinalCustomerNo);
                    if (result.status === 'Gagal') {
                         let errMsg = result.message || "";
                         let displayMsg = `❌ Pengecekan Gagal:\n${errMsg}`;
                         if (errMsg.toLowerCase().includes("ip anda tidak kami kenali")) {
                             displayMsg = `❌ Maaf Kak, pengecekan untuk pesanan Anda gagal diproses.\n\nKemungkinan ada kesalahan data atau jaringan. Silakan cek kembali, atau hubungi Chuna untuk bantuan lebih lanjut.\n\nKeterangan : Sedang ada pemeliharaan\n📦 Produk  : ${state.data.product.product_name}\n🎯 Tujuan   : ${omniFinalCustomerNo}\n\nJangan khawatir, Kakak bisa mencoba ulang kapan saja.\n\nChuna siap bantu! 😊💪`;
                             const custName = ctx.from?.first_name || "Pelanggan";
                             const memberId = state.data?.memberId || `MBR-${ctx.from?.id}`;
                             const regMember = members.find((m: any) => m.id === memberId || isTelegramMatch(m.telegram, ctx.from?.id, ctx.from?.username));
                             const regName = regMember?.name || registeredUsers[ctx.from?.id]?.username || "-";
                             const waInfo = await getCustomerWaDetails(regMember, ctx.from?.id);
                             const photoLine = waInfo.waPhotoUrl ? `\n🖼️ Foto Profil WA: Terlampir` : ``;
                             const ownerMsg = `🚨 INFO PENTING DARI CHUNA! 🚨\nIP Digiflazz tidak dikenali!\nPelanggan mencoba memesan namun gagal karena error IP.\n👤 Pelanggan: ${custName} (${omniFinalCustomerNo})\n🏷️ Nama Terdaftar: ${regName}\n📱 No. WhatsApp: ${waInfo.waPhone}\n💬 Profil WhatsApp: ${waInfo.waProfile}${photoLine}\n📦 Produk: ${state.data.product.product_name}\n⚠️ Error: ${errMsg}\n\nSegera cek dan update whitelist IP di dashboard Digiflazz Kakak!`;
                             for (const ownerId of db.owners) {
                                 if (waInfo.waPhotoUrl) {
                                     bot.telegram.sendPhoto(ownerId, waInfo.waPhotoUrl, { caption: ownerMsg }).catch(() => {
                                         bot.telegram.sendMessage(ownerId, ownerMsg).catch(()=>{});
                                     });
                                 } else {
                                     bot.telegram.sendMessage(ownerId, ownerMsg).catch(()=>{});
                                 }
                             }
                         }
                         await ctx.reply(displayMsg, {
                             reply_markup: {
                                keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Fitur Download" }]],
                                resize_keyboard: true
                             }
                         });
                         delete userStates[userId];
                    } else if (result.status === 'Sukses') {
                         const nama = result.customer_name || "-";
                         const tagihan = result.selling_price || 0;
                         
                         const memberId = state.data.memberId || `MBR-${ctx.from?.id}`;
                         const member = members.find(m => m.id === memberId || isTelegramMatch(m.telegram, ctx.from?.id, ctx.from?.username));
                         const memberType = member?.type || 'Biasa';
                         
                         const isOwnerCtx = db.owners.includes(ctx.from?.id);
                         const feeData = getProductFee(state.data.product.buyer_sku_code);
                         let adminFee = isOwnerCtx ? feeData.owner : (memberType === 'VIP' ? feeData.vip : feeData.biasa);
                         let total = tagihan + adminFee;
                         
                         let detail = selectedPkg.name;
                         
                         const billData = {
                             nama: nama,
                             no: state.data.customerNo, // The phone number instead of the giant base64 code
                             layanan: state.data.product.product_name + " - Omni",
                             total: total,
                             detail: detail
                         };
                         const base64Data = Buffer.from(JSON.stringify(billData)).toString('base64');
                         const appUrl = process.env.APP_URL || "http://localhost:3000";
                         const notaUrl = `${appUrl}/api/tagihan-nota?data=${encodeURIComponent(base64Data)}`;

                         const replyText = `✅ *Tagihan Ditemukan!*\n\nHaiii! Aku Chuna, asisten imut dari E4 Store 🐾✨\nTagihan kamu udah muncul nih, jangan sampai kelewat ya~\n\n💬 "Jangan lupa bayar tepat waktu ya, sayang! Biar listrik tetap menyala dan kamu tetap semangat seharian~ Chuna doain yang terbaik buat kamu! 🌸💖"`;

                         const isOwner = db.owners.includes(ctx.from?.id);
                         const keyboard = [];
                         if (isOwner) {
                             keyboard.push([{ text: "💵 Cash" }, { text: "📝 Utang" }]);
                             keyboard.push([{ text: "❌ Batal" }]);
                         } else {
                             keyboard.push([{ text: "💳 Saldo" }]);
                             keyboard.push([{ text: "❌ Batal" }]);
                         }

                         userStates[userId] = { step: 'WAIT_PAYMENT_PASCA', data: { ...state.data, ref_id: result.ref_id, totalBayar: total, checkResult: result, targetNo: omniFinalCustomerNo } };

                         const buffer = await generateCanvasReceipt("tagihan", billData);
                         if (buffer) {
                             await ctx.replyWithPhoto({ source: buffer }, {
                                 caption: replyText,
                                 parse_mode: 'Markdown',
                                 reply_markup: { keyboard, resize_keyboard: true }
                             });
                         } else {
                             let msg = `🧾 *Detail Tagihan*\n\n`;
                             msg += `Layanan: ${billData.layanan}\n`;
                             msg += `Detail: ${detail}\n`;
                             msg += `Nomor: ${billData.no}\n`;
                             msg += `Nama: ${billData.nama}\n\n`;
                             msg += `Tagihan: Rp ${tagihan.toLocaleString('id-ID')}\n`;
                             msg += `Admin: Rp ${adminFee.toLocaleString('id-ID')}\n`;
                             msg += `*Total: Rp ${total.toLocaleString('id-ID')}*\n\n`;
                             msg += `[Lihat Nota Web](${notaUrl})\n\n`;
                             msg += replyText;
                             await ctx.reply(msg, {
                                 parse_mode: 'Markdown',
                                 reply_markup: { keyboard, resize_keyboard: true }
                             });
                         }
                    }
                } catch (e) {
                     await ctx.reply("❌ Terjadi kesalahan saat mengecek tagihan Omni.");
                }
                return;

            case 'KODEBAYAR_SELECT_PACKAGE':
                if (text === '❌ Batal') {
                    if (state.data.memberId) {
                        userStates[userId] = { step: 'LOCKED_MEMBER', data: { memberId: state.data.memberId } };
                        await ctx.reply("❌ Pembelian dibatalkan.", { reply_markup: { keyboard: [[{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "🔙 Kembali ke Menu Owner" }]], resize_keyboard: true } });
                    } else {
                        delete userStates[userId];
                        await ctx.reply("❌ Pembelian dibatalkan.", { reply_markup: { keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Fitur Download" }]], resize_keyboard: true } });
                    }
                    return;
                }
                
                const providerMap: Record<string, string> = {
                    'BYU': 'By.U',
                    'INDOSAT': 'Indosat',
                    'TRI': 'Tri',
                    'AXIATA': 'XL/Axis'
                };
                const pLabel = providerMap[state.data.kodebayarProvider] || state.data.kodebayarProvider;

                const selectedKodebayarPkg = state.data.kodebayarPackages.find((p: any) => p.name + " - " + p.price === text.trim());
                if (!selectedKodebayarPkg) {
                    await ctx.reply("❌ Pilihan tidak valid. Silakan pilih dari menu di bawah atau klik Batal.");
                    return;
                }
                
                await ctx.reply("⏳ Sedang memproses Kode Bayar untuk " + selectedKodebayarPkg.name + "...");
                const kodeBayar = await generateKodeBayar(state.data.customerNo, selectedKodebayarPkg, state.data.kodebayarProvider);
                
                if (!kodeBayar) {
                     await ctx.reply(`❌ Gagal men-generate Kode Bayar ${pLabel} dari sistem. Silakan coba lagi nanti.`);
                     return;
                }
                
                let finalCustomerNoVal = kodeBayar;
                
                try {
                    const result = await checkPascaBill(state.data.product.buyer_sku_code, finalCustomerNoVal);
                    if (result.status === 'Gagal') {
                         let errMsg = result.message || "";
                         let displayMsg = `❌ Pengecekan Gagal:\n${errMsg}`;
                         if (errMsg.toLowerCase().includes("ip anda tidak kami kenali")) {
                             displayMsg = `❌ Maaf Kak, pengecekan untuk pesanan Anda gagal diproses.\n\nKemungkinan ada kesalahan data atau jaringan. Silakan cek kembali, atau hubungi Chuna untuk bantuan lebih lanjut.\n\nKeterangan : Sedang ada pemeliharaan\n📦 Produk  : ${state.data.product.product_name}\n🎯 Tujuan   : ${finalCustomerNoVal}\n\nJangan khawatir, Kakak bisa mencoba ulang kapan saja.\n\nChuna siap bantu! 😊💪`;
                             const custName = ctx.from?.first_name || "Pelanggan";
                             const memberId = state.data?.memberId || `MBR-${ctx.from?.id}`;
                             const regMember = members.find((m: any) => m.id === memberId || isTelegramMatch(m.telegram, ctx.from?.id, ctx.from?.username));
                             const regName = regMember?.name || registeredUsers[ctx.from?.id]?.username || "-";
                             const waInfo = await getCustomerWaDetails(regMember, ctx.from?.id);
                             const photoLine = waInfo.waPhotoUrl ? `\n🖼️ Foto Profil WA: Terlampir` : ``;
                             const ownerMsg = `🚨 INFO PENTING DARI CHUNA! 🚨\nIP Digiflazz tidak dikenali!\nPelanggan mencoba memesan namun gagal karena error IP.\n👤 Pelanggan: ${custName} (${finalCustomerNoVal})\n🏷️ Nama Terdaftar: ${regName}\n📱 No. WhatsApp: ${waInfo.waPhone}\n💬 Profil WhatsApp: ${waInfo.waProfile}${photoLine}\n📦 Produk: ${state.data.product.product_name}\n⚠️ Error: ${errMsg}\n\nSegera cek dan update whitelist IP di dashboard Digiflazz Kakak!`;
                             for (const ownerId of db.owners) {
                                 if (waInfo.waPhotoUrl) {
                                     bot.telegram.sendPhoto(ownerId, waInfo.waPhotoUrl, { caption: ownerMsg }).catch(() => {
                                         bot.telegram.sendMessage(ownerId, ownerMsg).catch(()=>{});
                                     });
                                 } else {
                                     bot.telegram.sendMessage(ownerId, ownerMsg).catch(()=>{});
                                 }
                             }
                         }
                         await ctx.reply(displayMsg, {
                             reply_markup: {
                                keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Fitur Download" }]],
                                resize_keyboard: true
                             }
                         });
                         delete userStates[userId];
                    } else if (result.status === 'Sukses') {
                         let notaBuffer: any = null;
                         const nama = result.customer_name || "-";
                         const tagihan = result.selling_price || 0;
                         
                         const memberId = state.data.memberId || `MBR-${ctx.from?.id}`;
                         const member = members.find(m => m.id === memberId || isTelegramMatch(m.telegram, ctx.from?.id, ctx.from?.username));
                         const memberType = member?.type || 'Biasa';
                         
                         const isOwnerCtx = db.owners.includes(ctx.from?.id);
                         const feeData = getProductFee(state.data.product.buyer_sku_code);
                         let adminFee = isOwnerCtx ? feeData.owner : (memberType === 'VIP' ? feeData.vip : feeData.biasa);
                         let total = tagihan + adminFee;
                         
                         let detail = selectedPkg.name;
                         
                         const billData = {
                             nama: nama,
                             no: state.data.customerNo,
                             layanan: state.data.product.product_name + ` - ${pLabel}`,
                             total: total,
                             detail: detail
                         };
                         const base64Data = Buffer.from(JSON.stringify(billData)).toString('base64');
                         const appUrl = process.env.APP_URL || "http://localhost:3000";
                         const notaUrl = `${appUrl}/api/tagihan-nota?data=${encodeURIComponent(base64Data)}`;

                         const replyText = `✅ *Tagihan Ditemukan!*\n\nHaiii! Aku Chuna, asisten imut dari E4 Store 🐾✨\nTagihan kamu udah muncul nih, jangan sampai kelewat ya~\n\n💬 "Jangan lupa bayar tepat waktu ya, sayang! Biar listrik tetap menyala dan kamu tetap semangat seharian~ Chuna doain yang terbaik buat kamu! 🌸💖"`;

                         const isOwner = db.owners.includes(ctx.from?.id);
                         const keyboard = [];
                         if (isOwner) {
                             keyboard.push([{ text: "💵 Cash" }, { text: "📝 Utang" }]);
                             keyboard.push([{ text: "❌ Batal" }]);
                         } else {
                             keyboard.push([{ text: "💳 Saldo" }]);
                             keyboard.push([{ text: "❌ Batal" }]);
                         }

                         userStates[userId] = { step: 'WAIT_PAYMENT_PASCA', data: { ...state.data, ref_id: result.ref_id, totalBayar: total, checkResult: result, targetNo: finalCustomerNoVal } };

                         const buffer = await generateCanvasReceipt("tagihan", billData);
                         if (buffer) {
                             await ctx.replyWithPhoto({ source: buffer }, {
                                 caption: replyText,
                                 parse_mode: 'Markdown',
                                 reply_markup: { keyboard, resize_keyboard: true }
                             });
                         } else {
                             await ctx.reply(replyText, {
                                 parse_mode: 'Markdown',
                                 reply_markup: { keyboard, resize_keyboard: true }
                             });
                         }
                    }
                } catch (e) {
                     await ctx.reply(`❌ Terjadi kesalahan saat mengecek tagihan ${pLabel}.`);
                }
                return;

            case 'PASCA_INPUT_NUMBER':
                const customerNo = text.trim();
                if (customerNo.toLowerCase() === 'batal' || customerNo === '❌ Batal') {
                    if (state.data.memberId) {
                        userStates[userId] = { step: 'LOCKED_MEMBER', data: { memberId: state.data.memberId } };
                        await ctx.reply("❌ Pengecekan dibatalkan.", { reply_markup: { keyboard: [[{ text: "🧾 Cek Tagihan" }],
              [{ text: "📋 Menu Produk" }],
              [{ text: "🔙 Kembali ke Menu Owner" }]], resize_keyboard: true } });
                    } else {
                        delete userStates[userId];
                        await ctx.reply("❌ Pengecekan dibatalkan.", { reply_markup: { keyboard: [[{ text: "💵 Cek Saldo" }],
                  [{ text: "🧾 Cek Tagihan" }],
                  [{ text: "📋 Menu Produk" }],
                  [{ text: "📥 Fitur Download" }]], resize_keyboard: true } });
                    }
                    return;
                }
                if (!customerNo || customerNo.length < 2) {
                    await ctx.reply("❌ Nomor tujuan tidak valid.");
                    return;
                }
                const product = state.data.product;
                await ctx.reply(`⏳ Sedang mengecek tagihan untuk nomor ${customerNo}...`);

                let finalCustomerNo = customerNo;

                // --- Auto Kode Bayar (By.U, Indosat, Tri, XL/Axis) ---
                const brand = (product.brand || "").toLowerCase();
                const sku = (product.buyer_sku_code || "").toLowerCase();
                const pname = (product.product_name || "").toLowerCase();
                
                let providerStr = "";
                let providerLabel = "";
                
                if (brand === "by.u" || brand === "byu" || pname.includes("by.u") || pname.includes("byu")) {
                    providerStr = "BYU";
                    providerLabel = "By.U";
                } else if ((brand === "indosat" || pname.includes("indosat")) && (pname.includes("pasca") || brand.includes("pasca") || sku.includes("pasca") || sku.includes("post"))) {
                    providerStr = "INDOSAT";
                    providerLabel = "Indosat";
                } else if ((brand === "tri" || brand === "three" || pname.includes("tri") || pname.includes("three")) && (pname.includes("pasca") || brand.includes("pasca") || sku.includes("pasca") || sku.includes("post"))) {
                    providerStr = "TRI";
                    providerLabel = "Tri";
                } else if ((brand.includes("xl") || brand.includes("axis") || pname.includes("xl") || pname.includes("axis")) && (pname.includes("pasca") || brand.includes("pasca") || sku.includes("pasca") || sku.includes("post") || pname.includes("cuanku"))) {
                    providerStr = "AXIATA";
                    providerLabel = "XL/Axis";
                }
                
                if (providerStr !== "") {
                    if (customerNo.startsWith('0') || customerNo.startsWith('62') || customerNo.startsWith('+62')) {
                        await ctx.reply(`⏳ Sedang mencari paket ${providerLabel} untuk nomor ${customerNo}...`);
                        const packages = await getKodeBayarPackages(customerNo, providerStr);
                        if (packages.length > 0) {
                            const memberId = state.data.memberId || `MBR-${ctx.from?.id}`;
                            const member = members.find((m: any) => m.id === memberId || isTelegramMatch(m.telegram, ctx.from?.id, ctx.from?.username));
                            const memberType = member?.type || 'Biasa';
                            const isOwnerCtx = db.owners.includes(ctx.from?.id);
                            const feeData = getProductFee(product.buyer_sku_code);
                            let adminFee = isOwnerCtx ? feeData.owner : (memberType === 'VIP' ? feeData.vip : feeData.biasa);
                            
                            packages.forEach((pkg: any) => {
                                let cleanPrice = pkg.price.replace(/[^0-9]/g, '');
                                if (cleanPrice) {
                                    let priceNum = parseInt(cleanPrice, 10);
                                    let digiflazzAdmin = product.admin || 0;
                                    let total = digiflazzAdmin + priceNum + adminFee;
                                    pkg.price = `Rp. ${total.toLocaleString('id-ID')}`;
                                }
                            });
                            
                            userStates[userId] = {
                                step: 'KODEBAYAR_SELECT_PACKAGE',
                                data: { product: product, memberId: state.data.memberId, kodebayarPackages: packages, kodebayarProvider: providerStr, customerNo: customerNo }
                            };
                            
                            const keyboard = [];
                            const limit = Math.min(packages.length, 30);
                            for (let i = 0; i < limit; i++) {
                                keyboard.push([{ text: packages[i].name + " - " + packages[i].price }]);
                            }
                            keyboard.push([{ text: "❌ Batal" }]);
                            
                            await ctx.reply(`✅ Ditemukan ${packages.length} paket.\n\nSilakan pilih paket yang ingin dibeli:`, {
                                reply_markup: {
                                    keyboard: keyboard,
                                    resize_keyboard: true
                                }
                            });
                            return;
                        } else {
                            await ctx.reply(`⚠️ Gagal mendapatkan paket dari ${providerLabel} untuk nomor ini (atau tidak ada promo). Silakan ulangi dan masukkan Kode Bayar secara manual.`);
                            return;
                        }
                    }
                }
                
                // --- Telkomsel Omni Auto Kode Bayar ---
                if (brand.includes("omni") || brand.includes("telkomsel omni") || pname.includes("omni")) {
                    if (customerNo.startsWith('0') || customerNo.startsWith('62') || customerNo.startsWith('+62')) {
                        await ctx.reply("⏳ Sedang mencari paket Telkomsel Omni untuk nomor " + customerNo + "...");
                        const packages = await getOmniPackages(customerNo);
                        if (packages.length > 0) {
                            const memberId = state.data.memberId || `MBR-${ctx.from?.id}`;
                            const member = members.find((m: any) => m.id === memberId || isTelegramMatch(m.telegram, ctx.from?.id, ctx.from?.username));
                            const memberType = member?.type || 'Biasa';
                            const isOwnerCtx = db.owners.includes(ctx.from?.id);
                            const feeData = getProductFee(product.buyer_sku_code);
                            let adminFee = isOwnerCtx ? feeData.owner : (memberType === 'VIP' ? feeData.vip : feeData.biasa);
                            
                            packages.forEach((pkg: any) => {
                                let cleanPrice = pkg.price.replace(/[^0-9]/g, '');
                                if (cleanPrice) {
                                    let priceNum = parseInt(cleanPrice, 10);
                                    let digiflazzAdmin = product.admin || 0;
                                    let total = digiflazzAdmin + priceNum + adminFee;
                                    pkg.price = `Rp. ${total.toLocaleString('id-ID')}`;
                                }
                            });
                            
                            userStates[userId] = {
                                step: 'OMNI_SELECT_PACKAGE',
                                data: { product: product, memberId: state.data.memberId, omniPackages: packages, customerNo: customerNo }
                            };
                            
                            const keyboard = [];
                            const limit = Math.min(packages.length, 30);
                            for (let i = 0; i < limit; i++) {
                                keyboard.push([{ text: packages[i].name + " - " + packages[i].price }]);
                            }
                            keyboard.push([{ text: "❌ Batal" }]);
                            
                            await ctx.reply("✅ Ditemukan " + packages.length + " paket Omni.\n\nSilakan pilih paket yang ingin dibeli:", {
                                reply_markup: {
                                    keyboard: keyboard,
                                    resize_keyboard: true
                                }
                            });
                            return;
                        } else {
                            await ctx.reply("⚠️ Gagal mendapatkan paket dari Telkomsel Omni untuk nomor ini (atau tidak ada promo). Silakan ulangi dan masukkan Kode Bayar secara manual.");
                            return;
                        }
                    }
                }

                await ctx.reply(`⏳ Sedang mengecek tagihan untuk nomor ${customerNo}...`);
                try {
                    const result = await checkPascaBill(product.buyer_sku_code, finalCustomerNo);
                    if (result.status === 'Gagal') {
                         let errMsg = result.message || "";
                         let displayMsg = `❌ Pengecekan Gagal:\n${errMsg}`;
                         if (errMsg.toLowerCase().includes("ip anda tidak kami kenali")) {
                             displayMsg = `❌ Maaf Kak, pengecekan untuk pesanan Anda gagal diproses.\n\nKemungkinan ada kesalahan data atau jaringan. Silakan cek kembali, atau hubungi Chuna untuk bantuan lebih lanjut.\n\nKeterangan : Sedang ada pemeliharaan\n📦 Produk  : ${product.product_name}\n🎯 Tujuan   : ${finalCustomerNo}\n\nJangan khawatir, Kakak bisa mencoba ulang kapan saja.\n\nChuna siap bantu! 😊💪`;
                             const custName = ctx.from?.first_name || "Pelanggan";
                             const memberId = state.data?.memberId || `MBR-${ctx.from?.id}`;
                             const regMember = members.find((m: any) => m.id === memberId || isTelegramMatch(m.telegram, ctx.from?.id, ctx.from?.username));
                             const regName = regMember?.name || registeredUsers[ctx.from?.id]?.username || "-";
                             const waInfo = await getCustomerWaDetails(regMember, ctx.from?.id);
                             const photoLine = waInfo.waPhotoUrl ? `\n🖼️ Foto Profil WA: Terlampir` : ``;
                             const ownerMsg = `🚨 INFO PENTING DARI CHUNA! 🚨\nIP Digiflazz tidak dikenali!\nPelanggan mencoba memesan namun gagal karena error IP.\n👤 Pelanggan: ${custName} (${finalCustomerNo})\n🏷️ Nama Terdaftar: ${regName}\n📱 No. WhatsApp: ${waInfo.waPhone}\n💬 Profil WhatsApp: ${waInfo.waProfile}${photoLine}\n📦 Produk: ${product.product_name}\n⚠️ Error: ${errMsg}\n\nSegera cek dan update whitelist IP di dashboard Digiflazz Kakak!`;
                             for (const ownerId of db.owners) {
                                 if (waInfo.waPhotoUrl) {
                                     bot.telegram.sendPhoto(ownerId, waInfo.waPhotoUrl, { caption: ownerMsg }).catch(() => {
                                         bot.telegram.sendMessage(ownerId, ownerMsg).catch(()=>{});
                                     });
                                 } else {
                                     bot.telegram.sendMessage(ownerId, ownerMsg).catch(()=>{});
                                 }
                             }
                         }
                         await ctx.reply(displayMsg);
                    } else if (result.status === 'Sukses') {
                         const nama = result.customer_name || "-";
                         const tagihan = result.selling_price || 0;
                         
                         // Determine member type
                         const memberId = state.data.memberId || `MBR-${ctx.from?.id}`;
                         const member = members.find(m => m.id === memberId || isTelegramMatch(m.telegram, ctx.from?.id, ctx.from?.username));
                         const memberType = member?.type || 'Biasa';
                         
                         const isOwnerCtx = db.owners.includes(ctx.from?.id);
                         const feeData = getProductFee(product.buyer_sku_code);
                         let adminFee = isOwnerCtx ? feeData.owner : (memberType === 'VIP' ? feeData.vip : feeData.biasa);
                         let total = tagihan + adminFee;
                         // We can add our own markup here if needed, but for now we just pass through
                         let detail = "";
                         if (result.desc) {
                           if (typeof result.desc === 'string') {
                               detail = result.desc;
                           } else {
                               const parts = [];
                               if (result.desc.tarif) parts.push(`⚡ Tarif: ${result.desc.tarif}`);
                               if (result.desc.daya) parts.push(`📊 Daya: ${result.desc.daya}`);
                               if (result.desc.lembar_tagihan) parts.push(`📄 Lembar: ${result.desc.lembar_tagihan}`);
                               
                               if (Array.isArray(result.desc.detail)) {
                                   result.desc.detail.forEach((d: any, idx: number) => {
                                      parts.push(`📆 Bulan ${idx + 1}: ${d.periode || ''}`);
                                      if (d.meter_awal) parts.push(`🔢 Meter: ${d.meter_awal} - ${d.meter_akhir}`);
                                   });
                               } else if (result.desc.detail) {
                                   parts.push(String(result.desc.detail));
                               }
                               detail = parts.join('\n');
                           }
                         }
                         
                         
                         const billData = {
                             nama: nama,
                             no: result.customer_no,
                             layanan: product.product_name,
                             total: total,
                             detail: detail
                         };
                         const base64Data = Buffer.from(JSON.stringify(billData)).toString('base64');
                         const appUrl = "http://localhost:3000";
                         const notaUrl = `${appUrl}/api/tagihan-nota?data=${encodeURIComponent(base64Data)}`;

                         const replyText = `✅ *Tagihan Ditemukan!*

Haiii! Aku Chuna, asisten imut dari E4 Store 🐾✨
Tagihan kamu udah muncul nih, jangan sampai kelewat ya~


💬 "Jangan lupa bayar tepat waktu ya, sayang! Biar listrik tetap menyala dan kamu tetap semangat seharian~ Chuna doain yang terbaik buat kamu! 🌸💖"`;

                         const isOwner = db.owners.includes(ctx.from?.id);
                         const keyboard = [];
                         if (isOwner) {
                             keyboard.push([{ text: "💵 Cash" }, { text: "📝 Utang" }]);
                             keyboard.push([{ text: "❌ Batal" }]);
                         } else {
                             keyboard.push([{ text: "💳 Saldo" }]);
                             keyboard.push([{ text: "❌ Batal" }]);
                         }

                         userStates[userId] = { step: 'WAIT_PAYMENT_PASCA', data: { ...state.data, ref_id: result.ref_id, totalBayar: total, checkResult: result, targetNo: finalCustomerNo } };

                         const buffer = await generateCanvasReceipt("tagihan", billData);
                         if (buffer) {
                             await ctx.replyWithPhoto({ source: buffer }, {
                                 caption: replyText,
                                 parse_mode: 'Markdown',
                                 reply_markup: { keyboard, resize_keyboard: true }
                             });
                         } else {
                             await ctx.reply(replyText, {
                                 parse_mode: 'Markdown',
                                 reply_markup: { keyboard, resize_keyboard: true }
                             });
                         }
                         
                         // Automatically send to WhatsApp
                         if (member && member.telegram) {
                      const tgIds = Array.isArray(member.telegram) ? member.telegram : [member.telegram];
                      for (const tgId of tgIds) {
                          const cleanTgId = typeof tgId === 'string' ? tgId.replace(/[^0-9]/g, '') : String(tgId);
                          if (cleanTgId && cleanTgId !== String(ctx.from?.id)) {
                              try {
                                  await bot.telegram.sendMessage(cleanTgId, replyText);
                              } catch(e) {
                                  console.error("Failed to send to customer tg", e);
                              }
                          }
                      }
                  }
                  
                  if (waSocket && member && member.whatsapp) {
                             let cleanWa = member.whatsapp.replace(/\D/g, "");
                             if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
                             const jid = cleanWa + "@s.whatsapp.net";
                             try {
                                 await waSocket.presenceSubscribe(jid);
                                 await waSocket.sendPresenceUpdate('composing', jid);
                                 await new Promise(r => setTimeout(r, 1200));
                                 await waSocket.sendPresenceUpdate('paused', jid);
                                 if (buffer) {
                                     await waSocket.sendMessage(jid, { image: buffer, caption: replyText });
                                 } else {
                                     await waSocket.sendMessage(jid, { text: replyText });
                                 }
                             } catch (err) {
                                 console.error("Failed to send WA message:", err);
                             }
                         }
                         // Save to state if we need it for payment
                         state.data.checkResult = result;
                         state.data.totalBayar = total;
                    }
                } catch (e: any) {
                    await ctx.reply(`❌ Terjadi kesalahan saat mengecek tagihan: ${e.message}`);
                }
                // Do not delete state yet if we want to proceed to payment, wait, the payment is via callback query so state is not strictly needed if we encode everything, but storing it is safer.
                // Actually, since callback query handles the payment, we can just leave the state or delete it.
                // For simplicity, let's keep the state so we have the result.
                return;

              case 'OWNER_ADD_MEMBER_USERNAME':
                state.data.username = text;
                state.step = 'OWNER_ADD_MEMBER_WA';
                await ctx.reply(`Masukkan nomor WA untuk ${text}:`);
                return;

                            case 'WAIT_PAYMENT_PREPAID': {
                const methodMap: any = { "💵 Cash": "cash", "📝 Utang": "utang", "💳 Saldo": "saldo" };
                const method = methodMap[text.trim()];
                if (text.toLowerCase() === 'batal' || text === '❌ Batal' || text === '❌ Tidak') {
                    const sd = state.data || {};
                    const memberIdForPrepaid = sd.memberId || `MBR-${userId}`;
                    const memberForPrepaid = members.find(m => m.id === memberIdForPrepaid);
                    if (waSocket && memberForPrepaid && memberForPrepaid.whatsapp) {
                        let cleanWa = memberForPrepaid.whatsapp.replace(/\D/g, "");
                        if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
                        const jid = cleanWa + "@s.whatsapp.net";
                        waSocket.sendMessage(jid, { text: "❌ Pembelian dibatalkan." }).catch(()=>{});
                    }
                    if (state.data?.memberId) {
                        userStates[userId] = { step: 'LOCKED_MEMBER', data: { memberId: state.data.memberId } };
                        await ctx.reply("❌ Pembelian dibatalkan.", { reply_markup: { keyboard: [[{ text: "🧾 Cek Tagihan" }],
              [{ text: "📋 Menu Produk" }],
              [{ text: "🔙 Kembali ke Menu Owner" }]], resize_keyboard: true } });
                    } else {
                        delete userStates[userId];
                        await ctx.reply("❌ Pembelian dibatalkan.", { reply_markup: { keyboard: [[{ text: "💵 Cek Saldo" }],
                  [{ text: "🧾 Cek Tagihan" }],
                  [{ text: "📋 Menu Produk" }],
                  [{ text: "📥 Fitur Download" }]], resize_keyboard: true } });
                    }
                    return;
                }
                if (!method) {
                    await ctx.reply("❌ Pilihan tidak valid. Silakan gunakan tombol di bawah.");
                    return;
                }
                const isOwner = db.owners.includes(ctx.from?.id);
                if (method !== 'saldo' && !isOwner) {
                    return ctx.reply("❌ Metode pembayaran tidak valid.");
                }
                if (!isOwner) {
                    userStates[userId] = { step: 'ASK_PIN_PREPAID', data: { ...state.data, method, sku: state.data.skuToPay } };
                    return ctx.reply("🔐 *Masukan PIN Keamanan Transaksi*Silakan ketik PIN Anda untuk melanjutkan transaksi ini.", { parse_mode: 'Markdown' });
                }
                await processPrepaidPayment(ctx, state.data.skuToPay, method, state.data, state.data.memberId || `MBR-${ctx.from?.id}`);
                break;
              }
              case 'WAIT_NOMINAL_UTANG': {
                  const nominalStr = text.replace(/\D/g, '');
                  if (!nominalStr) {
                      return ctx.reply("❌ Nominal tidak valid. Ketik angkanya saja ya (misal 10000).");
                  }
                  const nominal = parseInt(nominalStr, 10);
                  const memberId = state.data.memberId;
                  
                  const utangTx = transactions.filter((t: any) => t.method === 'utang' && t.status === 'Sukses' && t.memberId === memberId)
                                              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                  
                  if (utangTx.length === 0) {
                      delete userStates[userId];
                      return ctx.reply("✨ Tidak ada utang yang perlu dibayar untuk member ini.");
                  }
                  
                  let totalDebt = utangTx.reduce((acc, t) => acc + (t.price - (t.paidAmount || 0)), 0);
                  let remainingPayment = nominal;
                  
                  for (let tx of utangTx) {
                      let unpaidForTx = tx.price - (tx.paidAmount || 0);
                      if (remainingPayment >= unpaidForTx) {
                          remainingPayment -= unpaidForTx;
                          tx.paidAmount = tx.price;
                          tx.status = 'Sukses (Lunas)'; 
                      } else if (remainingPayment > 0) {
                          tx.paidAmount = (tx.paidAmount || 0) + remainingPayment;
                          remainingPayment = 0;
                      }
                  }
                  
                  db.transactions = transactions;
                  writeDB(db);
                  
                  delete userStates[userId];
                  
                  const member = members.find((m:any) => m.id === memberId);
                  const nama = member ? (member.name || "-") : "-";
                  const wa = member ? (member.whatsapp || "-") : "-";
                  
                  let rincianProduk = "";
                  utangTx.forEach((t: any) => {
                      rincianProduk += `${t.product} Rp ${t.price.toLocaleString('id-ID')}\n`;
                  });

                  const datesUtang = [...new Set(utangTx.map((t: any) => {
                      const d = new Date(t.date);
                      return `${d.getDate()} ${['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][d.getMonth()]} ${d.getFullYear()}`;
                  }))].join(', ');
                  
                  const today = new Date();
                  const tglLunas = `${today.getDate()} ${['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][today.getMonth()]} ${today.getFullYear()}`;
                  
                  let lunasText = "";
                  let isLunasTotal = nominal >= totalDebt;
                  let kembalian = isLunasTotal ? nominal - totalDebt : 0;
                  let sisa = isLunasTotal ? 0 : totalDebt - nominal;

                  const receiptProducts = utangTx.map((t: any) => ({
                      name: t.product || 'Produk',
                      price: t.price || 0
                  }));

                  if (isLunasTotal) {
                      lunasText = `✅ LUNAS TOTAL! 🎉
Halo Kak ${nama},
Dengan senang hati kami informasikan bahwa pembayaran utang kakak telah sukses dan lunas! Berikut detailnya ya:`;
                  } else {
                      lunasText = `⚠️ PEMBAYARAN SEBAGIAN
Halo Kak ${nama},
Dengan senang hati kami informasikan bahwa pembayaran utang kakak telah kami terima sebagian! Berikut detailnya ya:`;
                  }

                  let lunasImageBuffer: Buffer | null = null;
                  try {
                      lunasImageBuffer = await generateDebtSettlementReceipt({
                          nama: `Kak ${nama}`,
                          isLunasTotal: isLunasTotal,
                          products: receiptProducts,
                          totalDebt: totalDebt,
                          dibayarkan: nominal,
                          kembalian: kembalian,
                          sisaUtang: sisa,
                          tglUtang: datesUtang,
                          tglBayar: tglLunas
                      });
                  } catch (imgErr) {
                      console.error("Failed to generate lunas receipt image:", imgErr);
                  }

                  if (lunasImageBuffer) {
                      await ctx.replyWithPhoto({ source: lunasImageBuffer }, { caption: lunasText });
                  } else {
                      await ctx.reply(lunasText);
                  }
                  
                  // Kirim juga ke WA
                  if (waSocket && member && member.whatsapp) {
                      let cleanWa = member.whatsapp.replace(/\D/g, "");
                      if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
                      const jid = cleanWa + "@s.whatsapp.net";
                      try {
                          if (lunasImageBuffer) {
                              await waSocket.sendMessage(jid, { image: lunasImageBuffer, caption: lunasText });
                          } else {
                              await waSocket.sendMessage(jid, { text: lunasText });
                          }
                      } catch (err) {
                          console.error("Failed to send WA utang receipt:", err);
                      }
                  }
                  
                  return;
              }
              case 'WAIT_PAYMENT_PASCA': {
                const methodMap: any = { "💵 Cash": "cash", "📝 Utang": "utang", "💳 Saldo": "saldo" };
                const method = methodMap[text.trim()];
                if (text.toLowerCase() === 'batal' || text === '❌ Batal' || text === '❌ Tidak') {
                    const sd = state.data || {};
                    const memberIdForPrepaid = sd.memberId || `MBR-${userId}`;
                    const memberForPrepaid = members.find(m => m.id === memberIdForPrepaid);
                    if (waSocket && memberForPrepaid && memberForPrepaid.whatsapp) {
                        let cleanWa = memberForPrepaid.whatsapp.replace(/\D/g, "");
                        if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
                        const jid = cleanWa + "@s.whatsapp.net";
                        waSocket.sendMessage(jid, { text: "❌ Pembelian dibatalkan." }).catch(()=>{});
                    }
                    if (state.data?.memberId) {
                        userStates[userId] = { step: 'LOCKED_MEMBER', data: { memberId: state.data.memberId } };
                        await ctx.reply("❌ Pembayaran dibatalkan.", { reply_markup: { keyboard: [[{ text: "🧾 Cek Tagihan" }],
              [{ text: "📋 Menu Produk" }],
              [{ text: "🔙 Kembali ke Menu Owner" }]], resize_keyboard: true } });
                    } else {
                        delete userStates[userId];
                        await ctx.reply("❌ Pembayaran dibatalkan.", { reply_markup: { keyboard: [[{ text: "💵 Cek Saldo" }],
                  [{ text: "🧾 Cek Tagihan" }],
                  [{ text: "📋 Menu Produk" }],
                  [{ text: "📥 Fitur Download" }]], resize_keyboard: true } });
                    }
                    return;
                }
                if (!method) {
                    await ctx.reply("❌ Pilihan tidak valid. Silakan gunakan tombol di bawah.");
                    return;
                }
                const isOwner = db.owners.includes(ctx.from?.id);
                if (method !== 'saldo' && !isOwner) {
                    return ctx.reply("❌ Metode pembayaran tidak valid.");
                }
                if (!isOwner) {
                    userStates[userId] = { step: 'ASK_PIN_PASCA', data: { ...state.data, method, ref_id: state.data.ref_id } };
                    return ctx.reply("🔐 *Masukan PIN Keamanan Transaksi*Silakan ketik PIN Anda untuk melanjutkan transaksi ini.", { parse_mode: 'Markdown' });
                }
                await processPascaPayment(ctx, state.data.ref_id, method, state.data, state.data.memberId || `MBR-${ctx.from?.id}`);
                break;
              }
              case 'OWNER_ADD_MEMBER_WA':
                state.data.wa = text;
                const newMemberId = `MBR-${Date.now()}`;
                members.push({
                  id: newMemberId,
                  name: state.data.username,
                  whatsapp: state.data.wa,
                  telegram: '',
                  balance: 0,
                  type: 'Biasa'
                });
                delete userStates[userId];
                db.members = members;
                writeDB(db);
                await ctx.reply(`✅ Berhasil menambahkan member ${state.data.username} (${newMemberId})!`);
                return;

              
              case 'AWAITING_WA_TARGET':
                if (!db.waContacts) db.waContacts = [];
  db.waAnnouncementTarget = text;
                writeDB(db);
                delete userStates[userId];
                await ctx.reply(`✅ Target ID *${text}* telah diatur sebagai tujuan pengumuman.`, { parse_mode: 'Markdown' });
                return;

                            case 'AWAITING_ANNOUNCEMENT_TEXT':
                if (text === "🔙 Kembali ke Menu Owner") return; // Let it fall through to the handler
                const targetAnnounce = db.waAnnouncementTarget;
                if (!targetAnnounce) {
                    await ctx.reply("❌ Target WA belum diatur!");
                    delete userStates[userId];
                    return;
                }
                
                const parsedText = await parseAnnouncementText(text);
                await ctx.reply("✅ Mengirim pengumuman teks ke WhatsApp...");
                delete userStates[userId];
                
                if (waSocket) {
                    try {
                        await waSocket.sendMessage(targetAnnounce, { text: parsedText });
                    } catch (err: any) {
                        await ctx.reply("⚠️ Gagal mengirim percobaan pertama: " + err.message);
                    }
                } else {
                    await ctx.reply("⚠️ WhatsApp belum terhubung. Pengumuman akan dikirim saat WA terhubung.");
                }
                return; // Let it fall through to the handler
                const target = db.waAnnouncementTarget;
                if (!target) {
                    await ctx.reply("❌ Target WA belum diatur!");
                    delete userStates[userId];
                    return;
                }
                if (!waSocket) {
                    await ctx.reply("❌ Sistem WhatsApp belum terhubung!");
                    return;
                }
                try {
                    await waSocket.sendMessage(target, { text: text });
                    await ctx.reply("✅ Pengumuman berhasil dikirim ke WhatsApp!");
                    delete userStates[userId];
                } catch (err: any) {
                    await ctx.reply("❌ Gagal mengirim pengumuman: " + err.message);
                }
                return;

              case 'AWAITING_USERNAME':
                const isTaken = Object.values(registeredUsers).some(u => u.username.toLowerCase() === text.toLowerCase()) || members.some(m => m.name.toLowerCase() === text.toLowerCase());
                if (isTaken) {
                  await ctx.reply(`❌ Waduh, username ${text} udah dipakai kak.Coba username lain ya.`);
                  return;
                }
                state.data.username = text;
                state.step = 'AWAITING_WA';
                await ctx.reply(`👍 Oke, username ${text} aman!Sekarang kirim Nomor WhatsApp aktif kakak ya (contoh: 08123456789):`);
                return;
                  
              case 'AWAITING_WA':
                state.data.wa = text;
                state.step = 'AWAITING_OTP';
                const otp = Math.floor(100 + Math.random() * 900).toString();
                state.data.generatedOtp = otp;
                  
                if (waSocket && waStatus.includes('Connected')) {
                  let cleanWa = text.replace(/\D/g, "");
                  if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
                  const jid = `${cleanWa}@s.whatsapp.net`;
                    
                  try {
                    await waSocket.sendMessage(jid, { text: `Halo kak ${state.data.username}! 👋Ini kode rahasia (OTP) buat daftar di E4 Store: *${otp}*Jangan kasih tau siapa-siapa ya kak! 🤫` });
                    await ctx.reply(`📲 Kode OTP udah Chuna kirim ke WhatsApp kakak. Yuk masukin kode OTP-nya di sini:`);
                  } catch (e) {
                    await ctx.reply(`Waduh, Chuna gagal kirim kode OTP ke WhatsApp kakak nih. Pastikan nomornya aktif ya.Karena lagi ada kendala, Chuna kasih kode OTP-nya di sini aja ya kak: *${otp}*`);
                  }
                } else {
                  await ctx.reply(`Hmm, WhatsApp server Chuna lagi offline nih kak. 😔Tapi tenang aja, untuk sekarang Chuna kasih kode OTP-nya langsung di sini ya: *${otp}*Yuk ketik ulang kodenya di bawah!`);
                }
                return;
                  
              case 'AWAITING_OTP':
                if (text !== state.data.generatedOtp) {
                   await ctx.reply(`❌ Yah kode OTP-nya salah kak. Coba cek lagi ya kodenya!`);
                   return;
                }
                state.step = 'AWAITING_GMAIL';
                await ctx.reply(`Yeay kode OTP berhasil dikonfirmasi! 🎉\nSekarang kirim alamat Gmail aktif kakak ya (contoh: chuna@gmail.com) 📧`);
                return;

              case 'AWAITING_GMAIL':
                if (!text.includes('@')) {
                  await ctx.reply(`❌ Format Gmail sepertinya kurang tepat kak. Coba kirim ulang ya! (contoh: chuna@gmail.com)`);
                  return;
                }
                state.data.gmail = text;
                state.step = 'AWAITING_PIN';
                await ctx.reply(`Oke Gmail aman! 👌\nSatu langkah lagi nih kak. Yuk buat PIN rahasia kakak (6 angka) biar transaksi kakak aman bareng Chuna! 🔒`);
                return;
                  
              case 'AWAITING_PIN':
                state.data.pin = text;
                state.step = 'REGISTERED';
                registeredUsers[userId] = {
                  username: state.data.username,
                  wa: state.data.wa,
                  pin: state.data.pin,
                  gmail: state.data.gmail
                };
                
                let cleanUserWa = state.data.wa.replace(/\D/g, "");
                if (cleanUserWa.startsWith("0")) cleanUserWa = "62" + cleanUserWa.substring(1);
                
                const existingMember = members.find(m => {
                  let mWa = m.whatsapp.replace(/\D/g, "");
                  if (mWa.startsWith("0")) mWa = "62" + mWa.substring(1);
                  return mWa === cleanUserWa;
                });
                
                if (existingMember) {
                  existingMember.telegram = `ID:${userId}`;
                  // Optionally update name if desired, but we can keep the owner's set name or user's set name
                  // existingMember.name = state.data.username;
                } else {
                  members.push({
                    id: `MBR-${userId}`,
                    name: state.data.username,
                    whatsapp: state.data.wa,
                    telegram: `ID:${userId}`,
                    balance: 0,
                    type: 'Biasa',
                    gmail: state.data.gmail
                  });
                }
                
                delete userStates[userId];
                db.members = members; db.registeredUsers = registeredUsers; writeDB(db);

                // Notifikasi ke Owner tentang pendaftaran customer baru di Telegram
                try {
                  const tgFirstName = ctx.from?.first_name || '';
                  const tgLastName = ctx.from?.last_name || '';
                  const tgProfileName = [tgFirstName, tgLastName].filter(Boolean).join(' ') || (ctx.from?.username ? `@${ctx.from.username}` : '-');
                  const tgUsername = ctx.from?.username ? `@${ctx.from.username}` : '-';

                  let tgProfilePhotoFileId: string | null = null;
                  try {
                    const photos = await ctx.telegram.getUserProfilePhotos(userId, 0, 1);
                    if (photos && photos.total_count > 0 && photos.photos.length > 0 && photos.photos[0].length > 0) {
                      const sizeArr = photos.photos[0];
                      tgProfilePhotoFileId = sizeArr[sizeArr.length - 1].file_id;
                    }
                  } catch (photoErr) {
                    console.log("Could not get Telegram profile photo for user", userId, photoErr);
                  }

                  let fallbackWaPhoto: string | null = null;
                  if (!tgProfilePhotoFileId && waSocket) {
                    try {
                      const waJid = `${cleanUserWa}@s.whatsapp.net`;
                      fallbackWaPhoto = await waSocket.profilePictureUrl(waJid, 'image').catch(() => null);
                    } catch (e) {}
                  }

                  const photoToSend = tgProfilePhotoFileId || fallbackWaPhoto;
                  const regOwnerMsg = `🎉 *CUSTOMER BARU MENDAFTAR!* 🎉

Halo Bos, ada customer baru yang baru saja mendaftar di Telegram E4 Store:

👤 *Nama User*: ${state.data.username}
📱 *Nomor WhatsApp*: +${cleanUserWa} (${state.data.wa})
📧 *Gmail yang Diisi*: ${state.data.gmail || '-'}
💬 *Nama Profile Telegram*: ${tgProfileName}
🆔 *ID Telegram*: \`${userId}\` (${tgUsername})
📅 *Waktu*: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Makassar' })} WITA

_Data member telah berhasil tersimpan dan akun otomatis aktif._`;

                  if (bot && db.owners && db.owners.length > 0) {
                    for (const ownerId of db.owners) {
                      try {
                        if (photoToSend) {
                          await bot.telegram.sendPhoto(ownerId, photoToSend, {
                            caption: regOwnerMsg,
                            parse_mode: 'Markdown'
                          }).catch(async () => {
                            await bot.telegram.sendPhoto(ownerId, photoToSend, { caption: regOwnerMsg }).catch(async () => {
                              await bot.telegram.sendMessage(ownerId, regOwnerMsg).catch(() => {});
                            });
                          });
                        } else {
                          await bot.telegram.sendMessage(ownerId, regOwnerMsg, {
                            parse_mode: 'Markdown'
                          }).catch(async () => {
                            await bot.telegram.sendMessage(ownerId, regOwnerMsg).catch(() => {});
                          });
                        }
                      } catch (ownerErr) {
                        console.error("Gagal mengirim notifikasi pendaftaran ke owner:", ownerId, ownerErr);
                      }
                    }
                  }
                } catch (notifErr) {
                  console.error("Error saat memproses notifikasi owner pendaftaran:", notifErr);
                }

                await ctx.reply(`Yeayyy! Selamat datang di keluarga E4 Store kak ${state.data.username}! 🥳Sekarang kakak udah bisa nikmatin semua fitur keren dari Chuna.Ketik /menu buat mulai ya kak!`, {
                  reply_markup: {
                    keyboard: [
                      [{ text: "💵 Cek Saldo" }],
                  [{ text: "🧾 Cek Tagihan" }],
                  [{ text: "📋 Menu Produk" }],
                  [{ text: "📥 Fitur Download" }]
                    ],
                    resize_keyboard: true
                  }
                });
                return;
            }
        }
        
        // Product logic check
        try {
            let handled = false;
            // Check prepaid types (from state)
            try {
                const prepaid = await getDigiflazzProducts("prepaid");
                if (state && state.step === 'PREPAID_SELECT_TYPE' && !handled) {
                    let brandProducts = prepaid.filter((p: any) => p.brand === state.data.brand);
                    if (state.data.category) {
                        brandProducts = brandProducts.filter((p: any) => p.category === state.data.category);
                    }
                    const types = [...new Set(brandProducts.map((p: any) => p.type))].filter(Boolean);
                    
                    if (types.includes(text)) {
                        let filtered = brandProducts.filter((p: any) => p.type === text);
                    // (This was PREPAID_SELECT_} else {
                        filtered.sort((a: any, b: any) => a.price - b.price);
                        filtered = filtered.slice(0, 100);
                        if (filtered.length === 1) {
                            const matchedProduct = filtered[0];
                            const prevMemberId = userStates[userId]?.data?.memberId;
                            
                            // Calculate price
                            const memberId = prevMemberId || `MBR-${ctx.from?.id}`;
                            const member = members.find(m => m.id === memberId || isTelegramMatch(m.telegram, ctx.from?.id, ctx.from?.username));
                            const memberType = member?.type || 'Biasa';
                            const isOwnerCtx = db.owners.includes(ctx.from?.id);
                            const feeData = getProductFee(matchedProduct.buyer_sku_code);
                            let adminFee = isOwnerCtx ? feeData.owner : (memberType === 'VIP' ? feeData.vip : feeData.biasa);
                            let total = matchedProduct.price + adminFee;
                            if (isOwnerCtx && feeData.owner_fixed !== undefined) {
                                total = feeData.owner_fixed;
                                adminFee = total - matchedProduct.price;
                            }
                            if (!matchedProduct.buyer_product_status || !matchedProduct.seller_product_status) {
                                return ctx.reply("❌ Mohon maaf kak, produk " + matchedProduct.product_name + " sedang gangguan/cut off dari pusat.");
                            }
                            
                            userStates[userId] = { 
                                step: 'PREPAID_INPUT_NUMBER', 
                                data: { product: matchedProduct, memberId: prevMemberId, totalBayar: total, adminFee } 
                            };
                            
                            await ctx.reply(`🛒 *Detail Pembelian*\n\nProduk       : ${matchedProduct.product_name}\nBrand        : ${matchedProduct.brand}\n💎 Total Bayar : Rp ${total.toLocaleString('id-ID')}\n\n✏️ Silakan masukkan nomor tujuan (HP/ID) untuk melanjutkan pembelian.`, {
                                parse_mode: 'Markdown',
                                reply_markup: {
                                    keyboard: [[{ text: "❌ Batal" }]],
                                    resize_keyboard: true
                                }
                            });
                            handled = true;
                        } else {
                            const keyboard = [];
                            for (let i = 0; i < filtered.length; i += 2) {
                                const row = [{ text: getProductButtonText(filtered[i]) }];
                                if (filtered[i+1]) row.push({ text: getProductButtonText(filtered[i+1]) });
                                keyboard.push(row);
                            }
                            keyboard.push([{ text: "🔙 Kembali" }]);
                            await ctx.reply(`📋 *Produk ${text}*\nSilakan pilih produk yang ingin dibeli:`, { 
                                parse_mode: 'Markdown',
                                reply_markup: { keyboard: keyboard, resize_keyboard: true }
                            });
                            handled = true;
                        }
                    }
                }
            } catch (e) { console.error("Error in prepaidBrands check:", e.message); }

            if (handled) return;

            // Check pasca categories
            try {
                const pasca = await getDigiflazzProducts("pasca");
                const pascaCats = [...new Set(pasca.map((p: any) => p.category))].filter(Boolean);
                if (pascaCats.includes(text)) {
                    const filtered = pasca.filter((p: any) => p.category === text);
                    const brands = [...new Set(filtered.map((p: any) => p.brand))].sort();
                    
                    if (brands.length === 1 && brands[0] === text) {
                        // Skip category step, go straight to products
                        const productsForBrand = pasca.filter((p: any) => p.brand === text).slice(0, 100);
                        const keyboard = [];
                        for (let i = 0; i < productsForBrand.length; i += 2) {
                            const row = [{ text: getProductButtonText(productsForBrand[i]) }];
                            if (productsForBrand[i+1]) row.push({ text: getProductButtonText(productsForBrand[i+1]) });
                            keyboard.push(row);
                        }
                        keyboard.push([{ text: "🔙 Kembali" }]);
                        
                        await ctx.reply(`🧾 *Layanan ${text}*Silakan pilih layanan untuk melihat detail:`, { 
                            parse_mode: 'Markdown',
                            reply_markup: { keyboard: keyboard, resize_keyboard: true }
                        });
                        handled = true;
                    } else {
                        const keyboard = [];
                        for (let i = 0; i < brands.length; i += 2) {
                            const row = [{ text: brands[i] }];
                            if (brands[i+1]) row.push({ text: brands[i+1] });
                            keyboard.push(row);
                        }
                        keyboard.push([{ text: "🔙 Kembali" }]);

                        const prevMemberId = userStates[userId]?.data?.memberId;
                        userStates[userId] = { step: 'PASCA_SELECT_BRAND', data: { category: text, memberId: prevMemberId } };
                        await ctx.reply(`🧾 *Kategori ${text} (Pascabayar)*Silakan pilih layanan di bawah ini:`, { 
                            parse_mode: 'Markdown',
                            reply_markup: {
                                keyboard: keyboard,
                                resize_keyboard: true
                            }
                        });
                        handled = true;
                    }
                }
            } catch (e) { console.error("Error in prepaidBrands check:", e.message); }

            if (handled) return;
            
                        // Check prepaid categories
            try {
                const prepaid = await getDigiflazzProducts("prepaid");
                const prepaidCats = [...new Set(prepaid.map((p: any) => p.category))].filter(Boolean);
                if (prepaidCats.includes(text)) {
                    const filtered = prepaid.filter((p: any) => p.category === text);
                    const brands = [...new Set(filtered.map((p: any) => p.brand))].sort();
                    
                    if (brands.length === 1 && brands[0] === text) {
                        // Skip
                    } else {
                        const keyboard = [];
                        for (let i = 0; i < brands.length; i += 2) {
                            const row = [{ text: brands[i] }];
                            if (brands[i+1]) row.push({ text: brands[i+1] });
                            keyboard.push(row);
                        }
                        keyboard.push([{ text: "🔙 Kembali" }]);
                        const prevMemberId = userStates[userId]?.data?.memberId;
                        userStates[userId] = { step: 'PREPAID_SELECT_BRAND', data: { category: text, memberId: prevMemberId } };
                        await ctx.reply(`🛒 *Kategori ${text}*\nSilakan pilih brand di bawah ini:`, { 
                            parse_mode: 'Markdown',
                            reply_markup: { keyboard: keyboard, resize_keyboard: true }
                        });
                        handled = true;
                    }
                }
            } catch (e) { console.error("Error in prepaidCats check:", e.message); }
            if (handled) return;
            
            // Check prepaid brands
            try {
                const prepaid = await getDigiflazzProducts("prepaid");
                // Also check if text is a prepaid product name!
                if (!handled) {
                    const cleanText = cleanProductName(text);
                    const matchedProduct = prepaid.find((p: any) => p.product_name === cleanText);
                    if (matchedProduct) {
                        const prevMemberId = userStates[userId]?.data?.memberId;
                        
                        // Calculate price
                        const memberId = prevMemberId || `MBR-${ctx.from?.id}`;
                        const member = members.find(m => m.id === memberId || isTelegramMatch(m.telegram, ctx.from?.id, ctx.from?.username));
                        const memberType = member?.type || 'Biasa';
                        const isOwnerCtx = db.owners.includes(ctx.from?.id);
                        const feeData = getProductFee(matchedProduct.buyer_sku_code);
                        let adminFee = isOwnerCtx ? feeData.owner : (memberType === 'VIP' ? feeData.vip : feeData.biasa);
                        let total = matchedProduct.price + adminFee;
                        if (isOwnerCtx && feeData.owner_fixed !== undefined) {
                            total = feeData.owner_fixed;
                            adminFee = total - matchedProduct.price;
                        }
                        if (!matchedProduct.buyer_product_status || !matchedProduct.seller_product_status) {
                            return ctx.reply("❌ Mohon maaf kak, produk " + matchedProduct.product_name + " sedang gangguan/cut off dari pusat.");
                        }
                        
                        userStates[userId] = {
                            step: 'PREPAID_INPUT_NUMBER',
                            data: { product: matchedProduct, memberId: prevMemberId, totalBayar: total, adminFee }
                        };
                        
                        await ctx.reply(`🛒 *Detail Pembelian*\n\nProduk       : ${matchedProduct.product_name}\nBrand        : ${matchedProduct.brand}\n💎 Total Bayar : Rp ${total.toLocaleString('id-ID')}\n\n✏️ Silakan masukkan nomor tujuan (HP/ID) untuk melanjutkan pembelian.`, {
                            parse_mode: 'Markdown',
                            reply_markup: {
                                keyboard: [[{ text: "❌ Batal" }]],
                                resize_keyboard: true
                            }
                        });
                        handled = true;
                    }
                }
                const prepaidBrands = [...new Set(prepaid.map((p: any) => p.brand))].filter(Boolean);
                if (!handled && prepaidBrands.includes(text) && (!state || !state.step.startsWith("PASCA_"))) {
                    let filtered = prepaid.filter((p: any) => p.brand === text);
                    
                    const stateCategory = (state && state.step === 'PREPAID_SELECT_BRAND') ? state.data.category : null;
                    if (stateCategory) {
                        filtered = filtered.filter((p: any) => p.category === stateCategory);
                    } else {
                        // If no category in state, check if brand has multiple categories
                        const cats = [...new Set(filtered.map((p: any) => p.category))].filter(Boolean);
                        if (cats.length > 1) {
                            const keyboard = [];
                            for (let i = 0; i < cats.length; i += 2) {
                                const row = [{ text: String(cats[i]) }];
                                if (cats[i+1]) row.push({ text: String(cats[i+1]) });
                                keyboard.push(row);
                            }
                            keyboard.push([{ text: "🔙 Kembali" }]);
                            await ctx.reply(`📋 *Brand ${text}*\nProduk ini memiliki beberapa kategori. Silakan pilih kategori:`, { 
                                parse_mode: 'Markdown',
                                reply_markup: { keyboard: keyboard, resize_keyboard: true }
                            });
                            handled = true;
                            return; // Stop processing further here
                        }
                    }
                    
                    const types = [...new Set(filtered.map((p: any) => p.type))].filter(Boolean);
                    
                    if (types.length > 1) {
                        const prevMemberId = userStates[userId]?.data?.memberId;
                        userStates[userId] = { step: 'PREPAID_SELECT_TYPE', data: { brand: text, category: stateCategory, memberId: prevMemberId } };
                        
                        const keyboard = [];
                        for (let i = 0; i < types.length; i += 2) {
                            const row = [{ text: String(types[i]) }];
                            if (types[i+1]) row.push({ text: String(types[i+1]) });
                            keyboard.push(row);
                        }
                        keyboard.push([{ text: "🔙 Kembali" }]);

                        await ctx.reply(`📋 *Tipe Produk ${text}*Silakan pilih kategori (Misal: Umum/Membership/dll):`, { 
                            parse_mode: 'Markdown',
                            reply_markup: { keyboard: keyboard, resize_keyboard: true }
                        });
                        handled = true;
                    } else {
                        filtered.sort((a: any, b: any) => a.price - b.price);
                        filtered = filtered.slice(0, 100);
                        const keyboard = [];
                        for (let i = 0; i < filtered.length; i += 2) {
                            const row = [{ text: getProductButtonText(filtered[i]) }];
                            if (filtered[i+1]) row.push({ text: getProductButtonText(filtered[i+1]) });
                            keyboard.push(row);
                        }
                        keyboard.push([{ text: "🔙 Kembali" }]);

                        await ctx.reply(`📋 *Produk ${text}*Silakan pilih produk yang ingin dibeli:`, { 
                            parse_mode: 'Markdown',
                            reply_markup: { keyboard: keyboard, resize_keyboard: true }
                        });
                        handled = true;
                    }
                }
                
                
            } catch (e) { console.error("Error in prepaidBrands check:", e.message); }

            if (handled) return;

            // Check pasca brands
            try {
                const pasca = await getDigiflazzProducts("pasca");
                                // Also check if text is a pasca product name!
                if (!handled) {
                    const cleanText = cleanProductName(text);
                    const matchedProduct = pasca.find((p: any) => p.product_name === cleanText);
                    if (matchedProduct) {
                        const prevMemberId = userStates[userId]?.data?.memberId;
                        if (!matchedProduct.buyer_product_status || !matchedProduct.seller_product_status) {
                            return ctx.reply("❌ Mohon maaf kak, produk " + matchedProduct.product_name + " sedang gangguan/cut off dari pusat.");
                        }
                        userStates[userId] = { 
                            step: 'PASCA_INPUT_NUMBER', 
                            data: { product: matchedProduct, memberId: prevMemberId } 
                        };
                        await ctx.reply(`🛒 *Detail Layanan*\nNama: ${matchedProduct.product_name}\nBrand: ${matchedProduct.brand}\nKategori: ${matchedProduct.category}\n\n${matchedProduct.brand.toLowerCase().includes("by.u") || matchedProduct.brand.toLowerCase().includes("byu") ? "✏️ *Silakan masukkan Nomor HP by.U (atau Kode Pembayaran langsung):*\n\n_(Sistem akan mencarikan Kode Pembayaran otomatis)_" : (matchedProduct.brand.toLowerCase().includes("omni") || matchedProduct.brand.toLowerCase().includes("telkomsel omni") ? "✏️ *Silakan masukkan Nomor HP Telkomsel Omni (atau Kode Pembayaran langsung):*\n\n_(Sistem akan mencarikan Kode Pembayaran otomatis)_" : "✏️ *Silakan masukkan nomor tujuan/pelanggan untuk mengecek tagihan:*")}`, {
                            parse_mode: 'Markdown',
                            reply_markup: {
                                keyboard: [[{ text: "❌ Batal" }]],
                                resize_keyboard: true
                            }
                        });
                        handled = true;
                    }
                }
                const pascaBrands = [...new Set(pasca.map((p: any) => p.brand))].filter(Boolean);
                if (!handled && pascaBrands.includes(text)) {
                    let filtered = pasca.filter((p: any) => p.brand === text); filtered = filtered.slice(0, 100);
                    if (filtered.length === 1) {
                        const matchedProduct = filtered[0];
                        const prevMemberId = userStates[userId]?.data?.memberId;
                        if (!matchedProduct.buyer_product_status || !matchedProduct.seller_product_status) {
                            return ctx.reply("❌ Mohon maaf kak, produk " + matchedProduct.product_name + " sedang gangguan/cut off dari pusat.");
                        }
                        userStates[userId] = { 
                            step: 'PASCA_INPUT_NUMBER', 
                            data: { product: matchedProduct, memberId: prevMemberId } 
                        };
                        await ctx.reply(`🛒 *Detail Layanan*\nNama: ${matchedProduct.product_name}\nBrand: ${matchedProduct.brand}\nKategori: ${matchedProduct.category}\n\n${matchedProduct.brand.toLowerCase().includes("by.u") || matchedProduct.brand.toLowerCase().includes("byu") ? "✏️ *Silakan masukkan Nomor HP by.U (atau Kode Pembayaran langsung):*\n\n_(Sistem akan mencarikan Kode Pembayaran otomatis)_" : (matchedProduct.brand.toLowerCase().includes("omni") || matchedProduct.brand.toLowerCase().includes("telkomsel omni") ? "✏️ *Silakan masukkan Nomor HP Telkomsel Omni (atau Kode Pembayaran langsung):*\n\n_(Sistem akan mencarikan Kode Pembayaran otomatis)_" : "✏️ *Silakan masukkan nomor tujuan/pelanggan untuk mengecek tagihan:*")}`, {
                            parse_mode: 'Markdown',
                            reply_markup: {
                                keyboard: [[{ text: "❌ Batal" }]],
                                resize_keyboard: true
                            }
                        });
                        handled = true;
                    } else {
                        const keyboard = [];
                        for (let i = 0; i < filtered.length; i += 2) {
                            const row = [{ text: getProductButtonText(filtered[i]) }];
                            if (filtered[i+1]) row.push({ text: getProductButtonText(filtered[i+1]) });
                            keyboard.push(row);
                        }
                        keyboard.push([{ text: "🔙 Kembali" }]);

                        await ctx.reply(`🧾 *Layanan ${text}*\nSilakan pilih layanan untuk melihat detail:`, { 
                            parse_mode: 'Markdown',
                            reply_markup: {
                                keyboard: keyboard,
                                resize_keyboard: true
                            }
                        });
                        handled = true;
                    }
                }
                
                
            } catch (e) { console.error("Error in prepaidBrands check:", e.message); }

            if (handled) return;

            // If not handled, just ignore or let it pass
            return next();
        } catch (e) {
            return next();
        }
      });
      
try { await bot.telegram.deleteWebhook({ drop_pending_updates: true }); } catch (e) {}
if (process.env.APPLET_ID || process.env.K_REVISION) {
    console.log("Skipping bot.launch() in AI Studio environment to prevent 409 Conflict with your local server.");
} else {
    await bot.launch();
}

      botStatus = "Connected as @" + botInfo.username;
      console.log("Bot started successfully:", botInfo.username);
    } catch (error: any) {
      botStatus = "Error: " + error.message;
      bot = null;
      console.error("Bot start failed:", error);
      // Do not throw to prevent server crash
    }
  }


  app.get("/api/gmail/status", (req, res) => {
    res.json({
      status: db.gmailEmail ? "Configured" : "Not Configured",
      email: db.gmailEmail || ""
    });
  });

  app.post("/api/gmail/configure", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and App Password are required" });
    
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: email,
          pass: password
        }
      });
      
      // Verify connection
      await transporter.verify();
      
      db.gmailEmail = email;
      db.gmailAppPassword = password;
      writeDB(db);
      
      res.json({ success: true, message: "Gmail connected successfully" });
    } catch (error: any) {
      res.status(500).json({ success: false, error: "Failed to connect: " + error.message });
    }
  });

  app.post("/api/bot/configure", async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Token is required" });
    try {
      db.telegramToken = token;
      writeDB(db);
      await startTelegramBot(token);
      res.json({ success: true, message: "Bot connected and running" });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  if (db.telegramToken) {
    console.log("Auto-starting Telegram bot...");
    const autoStart = async () => {
      let retries = 5;
      while (retries > 0) {
        try {
          await startTelegramBot(db.telegramToken);
          console.log("Telegram bot auto-started successfully.");
          break;
        } catch (e: any) {
          console.error(`Auto-start Telegram bot failed (${retries} retries left):`, e.message);
          retries--;
          if (retries > 0) {
            await new Promise(res => setTimeout(res, 3000));
          }
        }
      }
    };
    autoStart();
  }


  // Vite middleware for development

  
  app.get("/api/tagihan-nota", (req, res) => {
    try {
        const dataStr = Buffer.from(req.query.data as string, 'base64').toString('utf-8');
        const data = JSON.parse(dataStr);
        
        let statusColor = '#4caf50';
        let statusText = 'Tagihan Ditemukan!';
        
        const linesHtml = [
            ['Nama', data.nama || '-'],
            ['Nomor', data.no || data.target || '-'],
            ['Layanan', data.layanan || '-']
        ].map(([label, val]) => `
            <div class="line">
                <span class="label">${label}</span>
                <span class="val">${val}</span>
            </div>
        `).join('');

        let html = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Struk Tagihan - E4 STORE</title>
    <style>
        @page { margin: 0; }
        body { background-color: #f0f2f5; display: flex; justify-content: center; align-items: flex-start; min-height: 100vh; margin: 0; padding: 20px; font-family: 'Courier Prime', Courier, monospace; }
        .receipt { background-color: white; width: 100%; max-width: 400px; padding: 30px 20px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); display: flex; flex-direction: column; align-items: center; box-sizing: border-box; }
        .title { font-size: 24px; font-weight: bold; margin-bottom: 5px; font-family: 'Times New Roman', serif; }
        .subtitle { font-size: 14px; color: #555; margin-bottom: 20px; }
        .badge { background-color: ${statusColor}; color: white; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: bold; margin-bottom: 20px; }
        .divider { width: 100%; border-top: 2px dashed #ccc; margin: 15px 0; }
        .lines { width: 100%; display: flex; flex-direction: column; gap: 10px; font-size: 14px; }
        .line { display: flex; justify-content: space-between; }
        .line .label { color: #555; }
        .line .val { font-weight: bold; text-align: right; max-width: 60%; word-break: break-word; }
        .box-container { width: 100%; border: 2px solid #ca8a04; border-radius: 8px; padding: 15px; margin-top: 15px; display: flex; flex-direction: column; box-sizing: border-box; }
        .box-title { font-size: 14px; font-weight: bold; margin-bottom: 5px; }
        .box-val { font-size: 16px; font-weight: bold; color: #dc2626; text-align: right; word-break: break-all; }
        
        @media print {
            body { background-color: white; padding: 0; align-items: flex-start; display: block; margin: 0; min-height: auto; }
            .receipt { box-shadow: none; max-width: 100%; padding: 10px; margin: 0; border-radius: 0; width: 100%; }
        }
    </style>
</head>
<body onload="setTimeout(() => window.print(), 500)">
    <div class="receipt">
        <div class="title">E4 STORE</div>
        <div class="subtitle">Cek Tagihan</div>
        <div class="badge">${statusText}</div>
        <div class="divider"></div>
        <div class="lines">
            ${linesHtml}
        </div>
        <div class="box-container" style="flex-direction: row; justify-content: space-between; align-items: center;">
            <div class="box-title" style="margin: 0;">TOTAL TAGIHAN</div>
            <div class="box-val">Rp ${(data.total || 0).toLocaleString('id-ID')}</div>
        </div>
    </div>
</body>
</html>`;
        res.send(html);
    } catch (e) {
        res.status(500).send("Error parsing tagihan data");
    }
});
app.get("/api/tagihan-nota-image", async (req, res) => {
    try {
        const dataStr = Buffer.from(req.query.data as string, 'base64').toString('utf-8');
        const data = JSON.parse(dataStr);
        const buffer = await generateCanvasReceipt("tagihan", data);
        if (buffer) {
            res.setHeader('Content-Type', 'image/png');
            res.send(buffer);
        } else {
            res.status(500).send("Gagal generate gambar tagihan");
        }
    } catch (e) {
        res.status(500).send("Error parsing tagihan data for image");
    }
  });


  app.post("/api/nota/:id/send-email", async (req, res) => {
    const { id } = req.params;
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, error: "Email tujuan diperlukan" });
    }
    
    if (!db.gmailEmail || !db.gmailAppPassword) {
      return res.status(400).json({ success: false, error: "Gmail belum dikonfigurasi di menu Bot" });
    }
    
    const tx = db.transactions.find(t => t.id === id);
    if (!tx) {
        return res.status(404).json({ success: false, error: "Nota tidak ditemukan" });
    }
    
    try {
      const buffer = await generateCanvasReceipt("nota", tx);
      if (!buffer) {
          return res.status(500).json({ success: false, error: "Gagal generate gambar nota" });
      }
      
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: db.gmailEmail,
          pass: db.gmailAppPassword
        }
      });
      
      const mailOptions = {
        from: `E4 Store <${db.gmailEmail}>`,
        to: email,
        subject: `Nota Pembelian - ${tx.product}`,
        text: `Halo,

Terima kasih telah berbelanja di E4 Store.
Berikut adalah nota pembelian Anda untuk produk ${tx.product}.

ID Transaksi: ${tx.id}
Harga: Rp ${tx.price.toLocaleString('id-ID')}
Status: ${tx.status}

Salam,
E4 Store`,
        attachments: [
          {
            filename: `Nota-${tx.id}.png`,
            content: buffer
          }
        ]
      };
      
      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: "Email berhasil dikirim!" });
    } catch (e: any) {
      console.error("Error sending email:", e);
      res.status(500).json({ success: false, error: "Gagal mengirim email: " + e.message });
    }
  });

  app.get("/api/nota/:id/image", async (req, res) => {
    const { id } = req.params;
    const tx = db.transactions.find(t => t.id === id);
    if (!tx) {
        return res.status(404).send("Nota tidak ditemukan.");
    }
    const buffer = await generateCanvasReceipt("nota", tx);
    if (buffer) {
        res.setHeader('Content-Type', 'image/png');
        res.send(buffer);
    } else {
        res.status(500).send("Gagal generate gambar");
    }
  });

  // Route demo gambar nota Lunas (contoh PLN Token dari Gambar 1)
  app.get("/api/demo-nota/lunas", async (req, res) => {
    try {
        const sampleLunas = {
            id: 'PRE-1789646007593',
            product: 'PLN 20.000',
            sn: '6675-2989-1173-8554-7284',
            target: '45055441815',
            namaPlg: 'JAHRAH',
            golDaya: 'R1 / 000001300',
            price: 25000,
            status: 'Sukses (Lunas)',
            isPaid: true,
            nama: 'Rido',
            method: 'saldo',
            waPhotoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces',
            date: new Date('2026-09-17T19:53:00+08:00')
        };
        const buffer = await generateCanvasReceipt("nota", sampleLunas);
        if (buffer) {
            res.setHeader('Content-Type', 'image/png');
            res.send(buffer);
        } else {
            res.status(500).send("Gagal generate gambar");
        }
    } catch (e: any) {
        res.status(500).send("Error: " + e.message);
    }
  });

  // Route demo gambar nota Belum Lunas (contoh PLN Token dari Gambar 2)
  app.get("/api/demo-nota/belum-lunas", async (req, res) => {
    try {
        const sampleBelumLunas = {
            id: 'PRE-1789646007593',
            product: 'PLN 20.000',
            sn: '6675-2989-1173-8554-7284',
            target: '45055441815',
            namaPlg: 'JAHRAH',
            golDaya: 'R1 / 000001300',
            price: 25000,
            status: 'Sukses',
            method: 'utang',
            isPaid: false,
            nama: 'Rido',
            waPhotoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces',
            date: new Date('2026-09-17T19:53:00+08:00')
        };
        const buffer = await generateCanvasReceipt("nota", sampleBelumLunas);
        if (buffer) {
            res.setHeader('Content-Type', 'image/png');
            res.send(buffer);
        } else {
            res.status(500).send("Gagal generate gambar");
        }
    } catch (e: any) {
        res.status(500).send("Error: " + e.message);
    }
  });

  // Route demo gambar nota Produk Biasa (contoh Pulsa / E-Money)
  app.get("/api/demo-nota/produk-biasa", async (req, res) => {
    try {
        const sampleProdukBiasa = {
            id: 'PRE-1789646007595',
            product: 'DANA 50.000',
            sn: 'SN2026091720048192736',
            target: '081234567890',
            price: 52000,
            status: 'Sukses (Lunas)',
            isPaid: true,
            nama: 'Rido',
            method: 'saldo',
            waPhotoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces',
            date: new Date('2026-09-17T19:53:00+08:00')
        };
        const buffer = await generateCanvasReceipt("nota", sampleProdukBiasa);
        if (buffer) {
            res.setHeader('Content-Type', 'image/png');
            res.send(buffer);
        } else {
            res.status(500).send("Gagal generate gambar");
        }
    } catch (e: any) {
        res.status(500).send("Error: " + e.message);
    }
  });

  // Route demo gambar nota Game (contoh Mobile Legends / Free Fire)
  app.get("/api/demo-nota/game", async (req, res) => {
    try {
        const sampleGame = {
            id: 'PRE-1789646007598',
            product: 'Mobile Legends 86 Diamond',
            sn: 'MLBB-849201948201',
            target: '12345678 (2041)', // ID Tujuan Game
            price: 21500,
            status: 'Sukses (Lunas)',
            isPaid: true,
            nama: 'Rido',
            method: 'saldo',
            waPhotoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces',
            date: new Date('2026-09-17T19:53:00+08:00')
        };
        const buffer = await generateCanvasReceipt("nota", sampleGame);
        if (buffer) {
            res.setHeader('Content-Type', 'image/png');
            res.send(buffer);
        } else {
            res.status(500).send("Gagal generate gambar");
        }
    } catch (e: any) {
        res.status(500).send("Error: " + e.message);
    }
  });

  // Route demo gambar nota Cek Tagihan (PLN Pascabayar) sesuai Gambar & Teks User
  app.get("/api/demo-nota/cek-tagihan", async (req, res) => {
    try {
        const sampleTagihan = {
            nama: "A*D* *A*A*U*D*N",
            no: "234000182643",
            layanan: "Pln Pascabayar",
            total: 115252,
            tarif: "R1M",
            daya: "900",
            lembar: "1",
            bulan: "202609",
            meter: "00007944 - 00008015",
            waPhotoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces',
            date: new Date('2026-09-17T19:53:00+08:00')
        };
        const buffer = await generateCanvasReceipt("tagihan", sampleTagihan);
        if (buffer) {
            res.setHeader('Content-Type', 'image/png');
            res.send(buffer);
        } else {
            res.status(500).send("Gagal generate gambar tagihan");
        }
    } catch (e: any) {
        res.status(500).send("Error: " + e.message);
    }
  });

  // Route demo khusus saat foto profil WhatsApp di-privat (Lingkaran huruf E4)
  app.get("/api/demo-nota/privat-e4", async (req, res) => {
    try {
        const samplePrivat = {
            id: 'PRE-1789646007599',
            product: 'PLN 20.000',
            sn: '6675-2989-1173-8554-7284',
            target: '45055441815',
            namaPlg: 'JAHRAH',
            golDaya: 'R1 / 000001300',
            price: 25000,
            status: 'Sukses (Lunas)',
            isPaid: true,
            nama: 'Rido',
            method: 'saldo',
            waPhotoUrl: null, // Foto profil WA privat/kosong -> otomatis tampil lingkaran huruf E4
            date: new Date('2026-09-17T19:53:00+08:00')
        };
        const buffer = await generateCanvasReceipt("nota", samplePrivat);
        if (buffer) {
            res.setHeader('Content-Type', 'image/png');
            res.send(buffer);
        } else {
            res.status(500).send("Gagal generate gambar");
        }
    } catch (e: any) {
        res.status(500).send("Error: " + e.message);
    }
  });

  // Route demo sticker konfirmasi pembelian WhatsApp (WebP Sticker dengan foto profil)
  app.get("/api/demo-sticker-konfirmasi", async (req, res) => {
    try {
        const withAvatar = req.query.avatar !== 'false';
        const stickerBuffer = await generateOrderConfirmationSticker({
            serviceName: (req.query.layanan as string) || 'PLN 20.000',
            targetNo: (req.query.tujuan as string) || '32185604272',
            totalBayar: (req.query.total as string) || 25000,
            note: 'pembelianmu akan di proses ya kk\nmohon di tunggu',
            waPhotoUrl: withAvatar ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces' : null
        });
        if (stickerBuffer) {
            res.setHeader('Content-Type', 'image/webp');
            res.send(stickerBuffer);
        } else {
            res.status(500).send("Gagal generate sticker");
        }
    } catch (e: any) {
        res.status(500).send("Error: " + e.message);
    }
  });

  // Route demo langsung untuk uji coba gambar nota pelunasan utang (sesuai template user: Kak Reza)
  app.get("/api/demo-nota-pelunasan", async (req, res) => {
    try {
        const buffer = await generateDebtSettlementReceipt({
            nama: 'Kak Reza',
            isLunasTotal: true,
            products: [{ name: 'Telkomsel 100.000', price: 103000 }],
            totalDebt: 103000,
            dibayarkan: 105000,
            kembalian: 2000,
            tglUtang: '17 September 2026',
            tglBayar: '19 September 2026'
        });
        res.setHeader('Content-Type', 'image/png');
        res.send(buffer);
    } catch (e: any) {
        res.status(500).send("Error: " + e.message);
    }
  });

  app.get("/api/nota-pelunasan/:id/image", async (req, res) => {
    const { id } = req.params;
    const tx = db.transactions.find(t => t.id === id);
    if (!tx) {
        return res.status(404).send("Transaksi tidak ditemukan.");
    }
    const member = (db.members || []).find((m: any) => m.id === tx.memberId);
    const nama = member ? (member.name || "Pelanggan") : (tx.target || "Pelanggan");
    const dUtang = new Date(tx.date || new Date());
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const tglUtangStr = `${dUtang.getDate()} ${months[dUtang.getMonth()]} ${dUtang.getFullYear()}`;
    const today = new Date();
    const tglBayarStr = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;

    const isLunas = (tx.status || '').toLowerCase().includes('lunas');
    try {
        const buffer = await generateDebtSettlementReceipt({
            nama: `Kak ${nama}`,
            isLunasTotal: isLunas,
            products: [{ name: tx.product || 'Produk', price: tx.price || 0 }],
            totalDebt: tx.price || 0,
            dibayarkan: tx.paidAmount || tx.price || 0,
            kembalian: isLunas ? Math.max(0, (tx.paidAmount || tx.price) - tx.price) : 0,
            sisaUtang: isLunas ? 0 : Math.max(0, tx.price - (tx.paidAmount || 0)),
            tglUtang: tglUtangStr,
            tglBayar: tglBayarStr
        });
        if (buffer) {
            res.setHeader('Content-Type', 'image/png');
            res.send(buffer);
        } else {
            res.status(500).send("Gagal generate gambar");
        }
    } catch (e: any) {
        res.status(500).send("Error: " + e.message);
    }
  });

  app.get("/api/nota/:id", (req, res) => {
    const { id } = req.params;
    const tx = db.transactions.find(t => t.id === id);
    if (!tx) {
        return res.status(404).send("Nota tidak ditemukan.");
    }

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Struk Nota - E4 STORE</title>
    <style>
        @page { margin: 0; size: auto; }
        body { 
            background: #0f172a; 
            color: #f8fafc;
            display: flex; 
            flex-direction: column;
            justify-content: center; 
            align-items: center; 
            min-height: 100vh; 
            margin: 0; 
            padding: 20px; 
            font-family: system-ui, -apple-system, sans-serif; 
        }
        .actions {
            display: flex;
            gap: 12px;
            margin-bottom: 20px;
            flex-wrap: wrap;
            justify-content: center;
        }
        .btn {
            background: #2563eb;
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
            transition: all 0.2s;
        }
        .btn:hover {
            background: #1d4ed8;
            transform: translateY(-1px);
        }
        .btn-download {
            background: #059669;
            box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
        }
        .btn-download:hover {
            background: #047857;
        }
        .receipt-card { 
            max-width: 580px; 
            width: 100%; 
            border-radius: 20px; 
            box-shadow: 0 20px 40px rgba(0,0,0,0.5); 
            overflow: hidden;
            display: flex;
            justify-content: center;
            background: #1e293b;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .receipt-img { 
            width: 100%; 
            height: auto; 
            display: block; 
            aspect-ratio: 1 / 1;
            object-fit: contain;
        }
        @media print {
            body { background: white; padding: 0; justify-content: flex-start; }
            .actions { display: none !important; }
            .receipt-card { box-shadow: none; border: none; max-width: 100%; border-radius: 0; }
            .receipt-img { width: 100%; max-width: 600px; margin: 0 auto; }
        }
    </style>
</head>
<body>
    <div class="actions">
        <button class="btn" onclick="window.print()">🖨️ Cetak / Print Struk</button>
        <a class="btn btn-download" href="/api/nota/${id}/image" download="nota-${id}.png">⬇️ Unduh Gambar (PNG)</a>
    </div>
    <div class="receipt-card">
        <img class="receipt-img" src="/api/nota/${id}/image" alt="Struk Transaksi ${id}" />
    </div>
</body>
</html>`;
    res.send(html);
  });

if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
