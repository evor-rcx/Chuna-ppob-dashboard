import fs from "fs";
import cron from "node-cron";
import express from "express";

import path from 'path';

import Jimp from 'jimp';
import { createCanvas } from '@napi-rs/canvas';


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


function getCalendarInfo(date: Date) {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    
    // We want the time in Makassar timezone to get the right day
    const witaStr = date.toLocaleString('en-US', { timeZone: 'Asia/Makassar' });
    const witaDate = new Date(witaStr);
    
    const dayName = days[witaDate.getDay()];
    
    const holidays = [
        { month: 0, date: 1, name: 'Tahun Baru Masehi' },
        { month: 1, date: 14, name: 'Hari Valentine' },
        { month: 3, date: 21, name: 'Hari Kartini' },
        { month: 4, date: 1, name: 'Hari Buruh' },
        { month: 4, date: 2, name: 'Hari Pendidikan Nasional' },
        { month: 4, date: 20, name: 'Hari Kebangkitan Nasional' },
        { month: 5, date: 1, name: 'Hari Lahir Pancasila' },
        { month: 7, date: 17, name: 'Hari Kemerdekaan RI' },
        { month: 9, date: 1, name: 'Hari Kesaktian Pancasila' },
        { month: 9, date: 28, name: 'Hari Sumpah Pemuda' },
        { month: 10, date: 10, name: 'Hari Pahlawan' },
        { month: 11, date: 22, name: 'Hari Ibu' },
        { month: 11, date: 25, name: 'Hari Raya Natal' }
    ];
    
    let nextHoliday = null;
    let minDiff = Infinity;
    const currentYear = witaDate.getFullYear();
    
    for (const h of holidays) {
        let hDate = new Date(currentYear, h.month, h.date);
        if (hDate < witaDate && hDate.toDateString() !== witaDate.toDateString()) {
            hDate = new Date(currentYear + 1, h.month, h.date);
        }
        
        const todayStart = new Date(witaDate.getFullYear(), witaDate.getMonth(), witaDate.getDate());
        const hStart = new Date(hDate.getFullYear(), hDate.getMonth(), hDate.getDate());
        const diffTime = Math.abs(hStart.getTime() - todayStart.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 0 && diffDays < minDiff) {
            minDiff = diffDays;
            nextHoliday = { ...h, daysLeft: diffDays };
        }
    }
    
    let eventText = '';
    if (nextHoliday) {
        if (nextHoliday.daysLeft === 0) {
            eventText = nextHoliday.name + ' (Hari Ini)';
        } else {
            eventText = nextHoliday.name + ' (' + nextHoliday.daysLeft + ' hari lagi)';
        }
    }
    
    return `${dayName}, ${eventText}`;
}

export async function generateCanvasReceipt(type: 'nota' | 'tagihan', data: any): Promise<Buffer | null> {
    try {
        const width = 600;
        let height = type === 'nota' ? 1000 : 900;
        
        let token = data.sn ? String(data.sn) : '-';
        let namaPlg = '';
        let golDaya = '';
        let kwh = '';
        
        if (token && token.includes('/')) {
            const parts = token.split('/');
            token = parts[0];
            namaPlg = parts[1] || '';
            if (parts.length > 3) {
                golDaya = `${parts[2]} / ${parts[3]}`;
                kwh = parts[4] || '';
            } else {
                golDaya = parts.slice(2).join(' / ');
            }
        }
        
        const lines: [string, string][] = [];
        const txDate = new Date(data.date || new Date());
        const dateStr = txDate.toLocaleString('en-GB', { timeZone: 'Asia/Makassar', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', '');
        const formattedDate = `${dateStr} WITA`;
        const calendarInfo = getCalendarInfo(txDate);

        let memberName = data.memberId || data.nama || '-';
        if (type === 'nota') {
            try {
                const members = JSON.parse(fs.readFileSync('db.json', 'utf-8')).members || [];
                const m = members.find((x:any) => x.id === data.memberId);
                if (m && m.name) memberName = m.name;
            } catch (e) {}
            
            lines.push(['Nama', memberName]);
            lines.push(['ID Pelanggan', data.target || '-']);
            lines.push(['Order ID', data.id || '-']);
            lines.push(['Tanggal', formattedDate]);
            lines.push(['Pembelian', data.product || '-']);
            if (namaPlg) lines.push(['Nama Pel.', namaPlg]);
            if (golDaya) lines.push(['Gol/Daya', golDaya]);
            
            height = 1000 + (lines.length * 35);
        } else {
            lines.push(['Nama', data.nama || '-']);
            lines.push(['Nomor', data.no || data.target || '-']);
            lines.push(['Layanan', data.layanan || '-']);
            height = 800 + (lines.length * 35);
            if (data.detail) height += 250;
        }

        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.fillRect(0, 0, width, height);

        let y = 60;
        
        // Header
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 36px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('E4 STORE', width / 2, y);
        y += 40;
        
        ctx.fillStyle = '#555555';
        ctx.font = '22px Arial, sans-serif';
        ctx.fillText(type === 'nota' ? 'Token Listrik / Struk Pembayaran' : 'Cek Tagihan', width / 2, y);
        y += 50;
        
        // Badge
        let isSukses = type === 'nota' && data.status && data.status.toLowerCase().includes('sukses');
        ctx.fillStyle = isSukses ? '#4caf50' : '#dc2626';
        if (type === 'nota' && data.status && data.status.toLowerCase() === 'pending') ctx.fillStyle = '#f59e0b';
        
        const badgeText = type === 'nota' ? `Status: ${data.status.toUpperCase()} ${(isSukses?'(LUNAS)':'')}` : `Tagihan Ditemukan!`;
        ctx.beginPath();
        
            ctx.moveTo((width - 400) / 2 + 20, y);
            ctx.lineTo((width - 400) / 2 + 400 - 20, y);
            ctx.quadraticCurveTo((width - 400) / 2 + 400, y, (width - 400) / 2 + 400, y + 20);
            ctx.lineTo((width - 400) / 2 + 400, y + 45 - 20);
            ctx.quadraticCurveTo((width - 400) / 2 + 400, y + 45, (width - 400) / 2 + 400 - 20, y + 45);
            ctx.lineTo((width - 400) / 2 + 20, y + 45);
            ctx.quadraticCurveTo((width - 400) / 2, y + 45, (width - 400) / 2, y + 45 - 20);
            ctx.lineTo((width - 400) / 2, y + 20);
            ctx.quadraticCurveTo((width - 400) / 2, y, (width - 400) / 2 + 20, y);

        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillText(badgeText, width / 2, y + 30);
        y += 80;
        
        // Divider
        const drawDivider = (yPos: number) => {
            ctx.beginPath();
            ctx.setLineDash([8, 8]);
            ctx.moveTo(40, yPos);
            ctx.lineTo(width - 40, yPos);
            ctx.strokeStyle = '#cccccc';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.setLineDash([]);
        };
        
        drawDivider(y);
        y += 50;
        
        // Lines
        ctx.textAlign = 'left';
        ctx.font = '22px Arial, sans-serif';
        
        for (const [label, val] of lines) {
            ctx.fillStyle = '#555555';
            ctx.fillText(label, 50, y);
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'right';
            ctx.fillText(val, width - 50, y);
            ctx.textAlign = 'left';
            y += 45;
        }
        
        if (type === 'nota') {
            y += 20;
            // Token Box
            ctx.strokeStyle = '#ca8a04';
            ctx.lineWidth = 2;
            ctx.beginPath();
        
            ctx.moveTo(50 + 10, y);
            ctx.lineTo(50 + width - 100 - 10, y);
            ctx.quadraticCurveTo(50 + width - 100, y, 50 + width - 100, y + 10);
            ctx.lineTo(50 + width - 100, y + 100 - 10);
            ctx.quadraticCurveTo(50 + width - 100, y + 100, 50 + width - 100 - 10, y + 100);
            ctx.lineTo(50 + 10, y + 100);
            ctx.quadraticCurveTo(50, y + 100, 50, y + 100 - 10);
            ctx.lineTo(50, y + 10);
            ctx.quadraticCurveTo(50, y, 50 + 10, y);

            ctx.stroke();
            
            ctx.fillStyle = '#000000';
            ctx.fillText('Token / SN', 70, y + 40);
            
            ctx.fillStyle = '#ef4444';
            ctx.textAlign = 'right';
            ctx.font = 'bold 20px Arial, sans-serif';
            // Wrap token if long
            if (token.length > 25) {
                ctx.fillText(token.substring(0, 25), width - 70, y + 40);
                ctx.fillText(token.substring(25), width - 70, y + 75);
            } else {
                ctx.fillText(token, width - 70, y + 55);
            }
            ctx.textAlign = 'left';
            y += 140;
        }
        
        y += 20;
        // Total Box
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
            ctx.moveTo(50 + 10, y);
            ctx.lineTo(50 + width - 100 - 10, y);
            ctx.quadraticCurveTo(50 + width - 100, y, 50 + width - 100, y + 10);
            ctx.lineTo(50 + width - 100, y + 80 - 10);
            ctx.quadraticCurveTo(50 + width - 100, y + 80, 50 + width - 100 - 10, y + 80);
            ctx.lineTo(50 + 10, y + 80);
            ctx.quadraticCurveTo(50, y + 80, 50, y + 80 - 10);
            ctx.lineTo(50, y + 10);
            ctx.quadraticCurveTo(50, y, 50 + 10, y);

        ctx.stroke();
        
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 24px Arial, sans-serif';
        ctx.fillText('TOTAL BAYAR', 70, y + 50);
        
        ctx.fillStyle = '#ef4444';
        ctx.textAlign = 'right';
        ctx.fillText('Rp ' + (data.price || data.total || 0).toLocaleString('id-ID'), width - 70, y + 50);
        ctx.textAlign = 'left';
        y += 110;
        
        if (type === 'tagihan' && data.detail) {
            let detailsList = data.detail.replace(/[💎⚡📄📅💡💳]/g, '').split('\n').filter((l: string) => !l.toLowerCase().includes('admin') && !l.toLowerCase().includes('total'));
            for (let l of detailsList) {
                if(l.toLowerCase().includes('tarif') || l.toLowerCase().includes('daya') || l.toLowerCase().includes('lembar')) {
                    const parts = l.split(':');
                    ctx.fillStyle = '#555555';
                    ctx.font = '20px Arial, sans-serif';
                    let icon = '⚡';
                    if(l.toLowerCase().includes('daya')) icon = '📊';
                    if(l.toLowerCase().includes('lembar')) icon = '📄';
                    ctx.fillText(`${parts[0].trim()}`, 50, y);
                    ctx.fillStyle = '#000000';
                    ctx.textAlign = 'right';
                    ctx.fillText(parts[1] ? parts[1].trim() : '', width - 50, y);
                    ctx.textAlign = 'left';
                    y += 35;
                } else if (l.toLowerCase().includes('bulan') || l.toLowerCase().includes('meter')) {
                    ctx.fillStyle = '#f5f5f5';
                    ctx.beginPath();
        ctx.fillRect(50, y, width - 100, 45);
                    ctx.fillStyle = '#000000';
                    ctx.font = '18px Arial, sans-serif';
                    ctx.fillText(l.trim(), 70, y + 30);
                    y += 55;
                }
            }
            y += 20;
        }

        if (type === 'nota') {
            ctx.fillStyle = '#f8f9fa';
            ctx.beginPath();
        
            ctx.moveTo(50 + 10, y);
            ctx.lineTo(50 + width - 100 - 10, y);
            ctx.quadraticCurveTo(50 + width - 100, y, 50 + width - 100, y + 10);
            ctx.lineTo(50 + width - 100, y + 130 - 10);
            ctx.quadraticCurveTo(50 + width - 100, y + 130, 50 + width - 100 - 10, y + 130);
            ctx.lineTo(50 + 10, y + 130);
            ctx.quadraticCurveTo(50, y + 130, 50, y + 130 - 10);
            ctx.lineTo(50, y + 10);
            ctx.quadraticCurveTo(50, y, 50 + 10, y);

            ctx.fill();
            
            ctx.fillStyle = '#333333';
            ctx.font = '18px Arial, sans-serif';
            ctx.textAlign = 'center';
            const shortCode = `#${(data.id || 'E4').substring(0,6).toUpperCase()}`;
            ctx.fillText(`📅 Cetak: ${formattedDate} | Kode: ${shortCode}`, width / 2, y + 50);
            ctx.fillText(`✨ ${calendarInfo}`, width / 2, y + 90);
            y += 150;
        } else {
            ctx.fillStyle = '#fdf2f8';
            ctx.beginPath();
        
            ctx.moveTo(50 + 10, y);
            ctx.lineTo(50 + width - 100 - 10, y);
            ctx.quadraticCurveTo(50 + width - 100, y, 50 + width - 100, y + 10);
            ctx.lineTo(50 + width - 100, y + 100 - 10);
            ctx.quadraticCurveTo(50 + width - 100, y + 100, 50 + width - 100 - 10, y + 100);
            ctx.lineTo(50 + 10, y + 100);
            ctx.quadraticCurveTo(50, y + 100, 50, y + 100 - 10);
            ctx.lineTo(50, y + 10);
            ctx.quadraticCurveTo(50, y, 50 + 10, y);

            ctx.fill();
            
            ctx.fillStyle = '#db2777';
            ctx.font = 'bold 20px Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Silahkan Lanjutkan Pembayaran', width / 2, y + 45);
            ctx.fillStyle = '#333333';
            ctx.font = '16px Arial, sans-serif';
            ctx.fillText('Screenshot halaman ini jika diperlukan.', width / 2, y + 80);
            y += 130;
        }

        drawDivider(y);
        y += 40;
        
        ctx.fillStyle = '#888888';
        ctx.font = '16px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('◻  ◻  ◻  ◻  ◻', width / 2, y);
        y += 30;
        ctx.fillText('Chuna - Asisten Imutmu siap bantu 24 jam!', width / 2, y);
        y += 25;
        ctx.fillText('Terimakasih telah berbelanja di E4 Store!', width / 2, y);
        
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

const registeredUsers: Record<number, { username: string, wa: string, pin: string }> = db.registeredUsers || {};

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




export let waSocket: ReturnType<typeof makeWASocket> | null = null;
let waStatus = "Disconnected";
let waPairingCode = "";
let isRequestingPairingCode = false;


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
          
          // Retry sending TG receipts for successful/failed transactions that failed to send TG msg
          if (bot) {
              const unsentTgTxs = transactions.filter((t: any) => (t.status === 'Sukses' || t.status === 'Gagal') && t.tgReceiptSent === false && t.tgChatId);
              for (const tx of unsentTgTxs) {
                  try {
                      await bot.telegram.sendChatAction(tx.tgChatId, "typing");
                      await new Promise(r => setTimeout(r, 1500));
                      let msg = "";
                      let buffer = null;
                      if (tx.status === 'Sukses') {
                          msg = `🎉 Horee! Sukses, Kak!\nPesanan sudah diproses otomatis oleh E4 Store. ${tx.product} sudah masuk ke akun ${tx.target} dan siap digunakan! 💪🔥\n\nTerima kasih telah berbelanja di E4 Store! 🐾\nChuna ~ Asisten Imutmu siap bantu 24 jam!\n\nKalau mau tanya-tanya atau order lagi, langsung chat Chuna di Bot Telegram:\n👉 https://t.me/ChunaChanbot\n\nChuna tunggu chat dari Kakak! 😊💖`;
                          buffer = await generateCanvasReceipt("nota", tx);
                      } else {
                          let refundMsg = tx.method === 'saldo' ? '✅ Saldo sebesar Rp ' + (tx.price||0).toLocaleString('id-ID') + ' telah dikembalikan ke akunmu!' : (tx.method === 'utang' ? '✅ Utang sebesar Rp ' + (tx.price||0).toLocaleString('id-ID') + ' telah dibatalkan!' : '✅ Mohon kembalikan uang tunai sebesar Rp ' + (tx.price||0).toLocaleString('id-ID') + ' kepada pelanggan.');
                          msg = `❌ *Transaksi Gagal!*\n\nMaaf Kak, pembayaran untuk pesanan Anda (${tx.product}) gagal diproses.\n\n${refundMsg}\n\nTenang saja, Kakak bisa mencoba ulang kapan pun.`;
                      }
                      
                      if (buffer) {
                          try { await bot.telegram.deleteMessage(tx.tgChatId, tx.tgMsgId); } catch(e) {}
                          await bot.telegram.sendPhoto(tx.tgChatId, { source: buffer }, { caption: msg, parse_mode: "Markdown" });
                      } else {
                          try { 
                              await bot.telegram.editMessageText(tx.tgChatId, tx.tgMsgId, undefined, msg, { parse_mode: "Markdown" }); 
                          } catch (e) { 
                              try { await bot.telegram.sendMessage(tx.tgChatId, msg, { parse_mode: "Markdown" }); } catch(err) {}
                          }
                      }
                      const tIndex = db.transactions.findIndex((t: any) => t.id === tx.id);
                      if (tIndex >= 0) {
                          db.transactions[tIndex].tgReceiptSent = true;
                          writeDB(db);
                      }
                  } catch (e) {
                      console.error("Failed to retry TG receipt for", tx.id, e);
                  }
              }
          }

          // Retry sending WA receipts for successful/failed transactions that failed to send WA msg
          if (waSocket) {
              const unsentTxs = transactions.filter((t: any) => (t.status === 'Sukses' || t.status === 'Gagal') && t.waReceiptSent !== true);
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
                          let buffer = null;
                          let caption = "";
                          if (tx.status === 'Sukses') {
                              buffer = await generateCanvasReceipt("nota", tx);
                              caption = "✅ *Transaksi Berhasil!* Berikut nota pembelian kamu ya, kak. Terima kasih sudah belanja di E4 Store! 🥰";
                          } else {
                              let refundMsg = tx.method === 'saldo' ? '✅ Saldo sebesar Rp ' + tx.price.toLocaleString('id-ID') + ' telah dikembalikan ke akunmu!' : (tx.method === 'utang' ? '✅ Utang sebesar Rp ' + tx.price.toLocaleString('id-ID') + ' telah dibatalkan!' : '✅ Mohon kembalikan uang tunai sebesar Rp ' + tx.price.toLocaleString('id-ID') + ' kepada pelanggan.');
                              caption = `❌ *Transaksi Gagal!*\n\nMaaf Kak, pembayaran untuk pesanan Anda (${tx.product}) gagal diproses.\n\n${refundMsg}\n\nTenang saja, Kakak bisa mencoba ulang kapan pun.`;
                          }
                          
                          await waSocket.sendPresenceUpdate("composing", jid);
                          await new Promise(r => setTimeout(r, 1200));
                          await waSocket.sendPresenceUpdate("paused", jid);
                          if (buffer) {
                              await waSocket.sendMessage(jid, { image: buffer, caption: caption });
                          } else {
                              await waSocket.sendMessage(jid, { text: caption });
                          }
                          
                          const tIndex = db.transactions.findIndex((t: any) => t.id === tx.id);
                          if (tIndex >= 0) {
                              db.transactions[tIndex].waReceiptSent = true;
                              writeDB(db);
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

            let finalMsg = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${headerText}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

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
            
            finalMsg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🎁 KEUNTUNGAN ORDER VIA BOT RESMI:\n✅ Harga spesial lebih murah setiap hari\n✅ Hemat lebih banyak tiap transaksi\n✅ Bebas dari kenaikan harga sementara\n✅ Notifikasi promo & perubahan harga duluan\n\n⏳ Stok terbatas!\nJangan sampe kehabisan, kak!\n\n👇 CARA ORDER (GAMPANG BANGET):\n🤖 Klik bot resmi kami aja:\n👉 [@Chuna_Chan_bot](https://t.me/Chuna_Chan_bot)\n\nProses kilat, amanah, dan terpercaya!\n\n💚 E4STORE – Top Up Cepat, Harga Sahabat Gamer!\n\n#E4STORE #Pengumuman #HargaNaik #HargaTurun #TopUpMurah\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
            
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

const app = express();
  const PORT = 3000;

  app.use(express.json());

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
                if (memberIndex >= 0) {
                    member = members[memberIndex];
                    nama = member.name || "-";
                    let isOwnerSelf = false;
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
                tx.waReceiptSent = false;
                tx.tgReceiptSent = false;
                
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

Pesanan sudah diproses otomatis oleh E4 Store. ${tx.product} sudah masuk ke akun ${nama || tx.target} dan siap digunakan! 💪🔥

Terima kasih telah berbelanja di E4 Store! 🐾

Chuna ~ Asisten Imutmu siap bantu 24 jam!
Kalau mau tanya-tanya atau order lagi, langsung chat Chuna di Bot Telegram:
👉 https://t.me/ChunaChanbot

Chuna tunggu chat dari Kakak! 😊💖`;
                } else if (status === 'Gagal') {
                    let refundMsg = tx.method === 'saldo' ? '✅ Saldo sebesar Rp ' + tx.price.toLocaleString('id-ID') + ' telah dikembalikan ke akunmu!' : (tx.method === 'utang' ? '✅ Utang sebesar Rp ' + tx.price.toLocaleString('id-ID') + ' telah dibatalkan!' : '✅ Mohon kembalikan uang tunai sebesar Rp ' + tx.price.toLocaleString('id-ID') + ' kepada pelanggan.');
                    if ((data.message || '').toLowerCase().includes('ip')) {
                        msg = `❌ Maaf Kak, pembayaran untuk pesanan Anda gagal diproses.\n\nSistem pusat E4 Store saat ini sedang mengalami gangguan koneksi. Mohon tunggu beberapa saat dan coba lagi nanti.\n\nKeterangan : Server sedang gangguan\n📦 Produk  : ${tx.product}\n🎯 Tujuan   : ${tx.target} (${nama})\n\n${refundMsg}\n\nJangan khawatir, Kakak bisa mencoba ulang nanti.\n\nButuh bantuan? Chat Chuna di Bot Telegram:\n👉 https://t.me/ChunaChanbot\n\nChuna siap bantu! 😊💪`;
                        const ownerMsg = `🚨 *INFO PENTING DARI CHUNA!* 🚨\n\nTransaksi dari Kak *${nama}* gagal karena masalah IP!\n\nKeterangan dari Digiflazz: _${data.message}_\n\nSegera cek dan daftarkan IP server terbaru di dashboard Digiflazz ya Kak! 🌐`;
                        for (const ownerId of db.owners) {
                            try {
                                await bot.telegram.sendMessage(ownerId, ownerMsg, { parse_mode: 'Markdown' });
                            } catch(e) {}
                        }
                    } else {
                        msg = `❌ Maaf Kak, pembayaran untuk pesanan Anda gagal diproses.\n\nKemungkinan ada kesalahan data atau saldo kurang. Silakan cek kembali, atau hubungi Chuna untuk bantuan.\n\nKeterangan : ${data.message || 'Transaksi Gagal'}\n📦 Produk  : ${tx.product}\n🎯 Tujuan   : ${tx.target} (${nama})\n\n${refundMsg}\n\nTenang saja, Kakak bisa mencoba ulang kapan pun.\n\nButuh bantuan? Chat Chuna di Bot Telegram:\n👉 https://t.me/ChunaChanbot\n\nChuna siap bantu! 😊💪`;
                    }
                    
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
                                await bot.telegram.sendPhoto(tx.tgChatId, { source: buffer }, { caption: msg, parse_mode: "Markdown" });
                                tgPhotoSent = true;
                            }
                        }
                        if (!tgPhotoSent) {
                            try {
                                await bot.telegram.editMessageText(tx.tgChatId, tx.tgMsgId, undefined, msg, { parse_mode: "Markdown" });
                            } catch (e) {
                                try { await bot.telegram.sendMessage(tx.tgChatId, msg, { parse_mode: "Markdown" }); } catch(err) {}
                            }
                        }
                        
                        const tIndex = db.transactions.findIndex((t: any) => t.id === tx.id);
                        if (tIndex >= 0) {
                            db.transactions[tIndex].tgReceiptSent = true;
                            writeDB(db);
                        }
                    } catch (e) {
                        try { await bot.telegram.sendMessage(tx.tgChatId, msg, { parse_mode: "Markdown" }); } catch(err) {}
                    }
                    })();
                } else if (bot && member && member.telegram && member.telegram.length > 0) {
                    (async () => {
                    try {
                        const tgId = Array.isArray(member.telegram) ? member.telegram[0] : member.telegram.replace(/\D/g, '');
                        let tgPhotoSent = false;
                        if (status === 'Sukses') {
                            const buffer = await generateCanvasReceipt("nota", tx);
                            if (buffer) {
                                await bot.telegram.sendPhoto(tgId, { source: buffer }, { caption: msg, parse_mode: "Markdown" });
                                tgPhotoSent = true;
                            }
                        }
                        if (!tgPhotoSent) {
                            await bot.telegram.sendMessage(tgId, msg, { parse_mode: "Markdown" });
                        }
                        const tIndex = db.transactions.findIndex((t: any) => t.id === tx.id);
                        if (tIndex >= 0) {
                            db.transactions[tIndex].tgReceiptSent = true;
                            writeDB(db);
                        }
                    } catch (e) {
                    }
                    })();
                }
                
                if (waSocket && member && member.whatsapp) {
                    (async () => {
                    try {
                        let cleanWa = member.whatsapp.replace(/\D/g, "");
                        if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
                        const jid = cleanWa + "@s.whatsapp.net";
                        
                        let caption = "";
                        let buffer = null;
                        if (status === 'Sukses') {
                            buffer = await generateCanvasReceipt("nota", tx);
                            caption = "✅ *Transaksi Berhasil!* Berikut nota pembelian kamu ya, kak. Terima kasih sudah belanja di E4 Store! 🥰";
                        } else if (status === 'Gagal') {
                            let refundMsg = tx.method === 'saldo' ? '✅ Saldo sebesar Rp ' + (tx.price||0).toLocaleString('id-ID') + ' telah dikembalikan ke akunmu!' : (tx.method === 'utang' ? '✅ Utang sebesar Rp ' + (tx.price||0).toLocaleString('id-ID') + ' telah dibatalkan!' : '✅ Mohon kembalikan uang tunai sebesar Rp ' + (tx.price||0).toLocaleString('id-ID') + ' kepada pelanggan.');
                            caption = `❌ *Transaksi Gagal!*\n\nMaaf Kak, pembayaran untuk pesanan Anda (${tx.product}) gagal diproses.\n\n${refundMsg}\n\nTenang saja, Kakak bisa mencoba ulang kapan pun.`;
                        }
                        
                        await waSocket.sendPresenceUpdate("composing", jid);
                        await new Promise(r => setTimeout(r, 1200));
                        await waSocket.sendPresenceUpdate("paused", jid);
                        
                        if (buffer) {
                            await waSocket.sendMessage(jid, { image: buffer, caption: caption });
                        } else {
                            if (tx.waMsgKey) {
                                try { await waSocket.sendMessage(jid, { text: caption, edit: tx.waMsgKey }); } catch(e) {
                                    await waSocket.sendMessage(jid, { text: caption });
                                }
                            } else {
                                await waSocket.sendMessage(jid, { text: caption });
                            }
                        }
                        
                        const tIndex = db.transactions.findIndex((t: any) => t.id === tx.id);
                        if (tIndex >= 0) {
                            db.transactions[tIndex].waReceiptSent = true;
                            writeDB(db);
                        }
                    } catch (e) {
                    }
                    })();
                }
            }
        }
        return { success: true };
    } catch(e) {
        console.error("processDigiflazzWebhookData error", e);
        return { success: false };
    }
  }

  app.post("/api/bot/webhook", async (req, res) => {
    try {
        const payload = req.body;
        if (payload.data) {
            await processDigiflazzWebhookData(payload.data);
        }
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

    waSocket.ev.on("creds.update", saveCreds);

    waSocket.ev.on("contacts.upsert", (contacts) => {
      let changed = false;
      if (!db.waContacts) db.waContacts = [];
      for (const contact of contacts) {
          if (contact.id && contact.id.endsWith('@s.whatsapp.net')) {
              if (!db.waContacts.includes(contact.id)) {
                  db.waContacts.push(contact.id);
                  changed = true;
              }
          }
      }
      if (changed) writeDB(db);
    });
    
    
    waSocket.ev.on("messaging-history.set", (history) => {
      let changed = false;
      if (!db.waContacts) db.waContacts = [];
      for (const contact of history.contacts || []) {
          if (contact.id && contact.id.endsWith('@s.whatsapp.net')) {
              if (!db.waContacts.includes(contact.id)) {
                  db.waContacts.push(contact.id);
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
        
        if (statusCode === 401 || statusCode === 403 || statusCode === 405) {
           try { fs.rmSync(path.join(process.cwd(), "wa_auth"), { recursive: true, force: true }); } catch (e) { }
           waSocket = null;
        } else {
           if (waReconnectAttempts < 5) {
             waReconnectAttempts++;
             console.log("Reconnecting WA in 3 seconds...");
             setTimeout(startWaSocket, 3000);
           }
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

    waSocket.ev.on("messages.upsert", async (m) => {
      const msg = m.messages[0];
      if (!msg.key.fromMe && m.type === "notify") {
        console.log("Got WA message:", msg.message?.conversation);
      }
    });

    waSocket.ev.on("call", async (calls) => {
      for (const call of calls) {
        if (call.status === "offer") {
          const replyMsg = `Maaf banget, Kak! Chuna nggak bisa angkat telepon sekarang (lagi sibuk ngurus pelanggan lain, hihi). Tapi jangan khawatir, mending langsung chat Bot Telegram resmi E4Store aja! Di sana Chuna 24 jam siap bantu jawab semua pertanyaan kamu dengan cepat dan ramah~👉 https://t.me/ChunaChanbotChuna asisten E4Store, transaksi langsung otomatis kok, tetap aman dan terpercaya! Yuk, mampir~ Chuna tunggu, ya! 😘🐾`;
          try {
            if (waSocket) {
              await waSocket.rejectCall(call.id, call.from);
              await waSocket.presenceSubscribe(call.from);
              await waSocket.sendPresenceUpdate('composing', call.from);
              await new Promise(r => setTimeout(r, 1200));
              await waSocket.sendPresenceUpdate('paused', call.from);
              await waSocket.sendMessage(call.from, { text: replyMsg });
            }
          } catch (e) {
            console.error("Failed to reject call", e);
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
    const todayWita = getWitaDate();
    const filtered = (db.expenses || []).filter((e: any) => getWitaDate(e.date) === todayWita);
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

  app.post("/api/physical-transactions", (req, res) => {
    const { items, total, method, customer } = req.body;
    
    // Update stock
    for (const item of items) {
       const product = db.physicalProducts.find((p: any) => p.id === item.id);
       if (product) {
           product.stock = Math.max(0, product.stock - item.quantity);
       }
    }
    
    const newTx = {
       id: "PHY-" + Date.now(),
       date: new Date().toISOString(),
       items,
       total,
       method,
       customer,
       type: 'physical'
    };
    
    db.physicalTransactions.push(newTx);
    writeDB(db);
    res.json(newTx);
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
    for (const p of db.physicalProducts) {
      totalNilaiStok += (p.buyPrice || 0) * (p.stock || 0);
    }
    
    let totalPendapatan = 0;
    let modalTerjual = 0;
    
    let totalPiutang = 0;
    for (const tx of db.physicalTransactions || []) {
      if (tx.method === 'cash') {
          totalPendapatan += tx.total;
      } else {
          totalPiutang += (tx.total - (tx.paidAmount || 0));
          totalPendapatan += (tx.paidAmount || 0);
      }
      for (const item of tx.items) {
        modalTerjual += (item.buyPrice || 0) * item.quantity;
      }
    }
    
    let totalPengeluaran = 0;
    for (const exp of db.expenses || []) {
      totalPengeluaran += exp.amount;
    }
    
    res.json({
      totalModalKeseluruhan: totalNilaiStok + modalTerjual + totalPengeluaran,
      totalNilaiStok,
      totalPendapatan,
      totalPengeluaran,
      totalKeuntungan: totalPendapatan - modalTerjual - totalPengeluaran,
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

  app.post("/api/transactions/:id/lunas", async (req, res) => {
    const tx = db.transactions.find(t => t.id === req.params.id);
    if (!tx) return res.status(404).json({ error: "Transaksi tidak ditemukan" });
    if (tx.method !== 'utang' || tx.status !== 'Sukses') return res.status(400).json({ error: "Hanya utang yang sukses dapat dilunasi" });
    
    tx.status = 'Sukses (Lunas)';
    db.transactions = transactions;
    writeDB(db);

    const member = members.find((m: any) => m.id === tx.memberId);
    if (member) {
      const msg = `🎉 *Terima Kasih, Kesayangan!* 🎉Utang kamu untuk pembelian *${tx.product}* sebesar Rp ${tx.price.toLocaleString('id-ID')} sudah LUNAS ya! Makasih udah bayar tepat waktu, Chuna seneng banget! 💖🐾*Nota Pelunasan:*ID: ${tx.id}Produk: ${tx.product}Tujuan: ${tx.target}Tanggal: ${new Date().toLocaleString('id-ID')}Jangan lupa mampir belanja lagi di E4 Store!`;
      
      // Notify Telegram if possible
      if (bot && member.telegram && member.telegram.length > 0) {
        try {
          const tgId = Array.isArray(member.telegram) ? member.telegram[0] : member.telegram.replace(/\D/g, '');
          await bot.telegram.sendMessage(tgId, msg, { parse_mode: 'Markdown' });
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
          await waSocket?.sendMessage(jid, { text: msg });
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
      const member = members.find(m => m.id === id);
      if (member) {
         member.balance = balance;
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
        prefix += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
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
    res.json({ status: botStatus, running: bot !== null });
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
                    return ctx.reply(`❌ TRANSAKSI DITOLAK!Maaf kak, saldo kakak tidak mencukupi untuk melakukan transaksi ini.💳 Saldo Saat Ini: Rp ${member.balance.toLocaleString('id-ID')}💰 Total Bayar: Rp ${total.toLocaleString('id-ID')}Silakan isi ulang saldo kakak terlebih dahulu. 🙏`);
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
                
                // PRE-REGISTER TRANSACTION
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
                    waReceiptSent: false
                });
                db.transactions = transactions;
                writeDB(db);
                
                let msg = "";
                let tgMsgId: number | undefined;
                let waMsgKey: any | undefined;
                let waJid: string | undefined;
                let notaBuffer: Buffer | null = null;
                
                let returnMarkup;
                if (stateData.memberId) {
                    returnMarkup = { keyboard: [[{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "🔙 Kembali ke Menu Owner" }]], resize_keyboard: true };
                } else {
                    returnMarkup = { keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]], resize_keyboard: true };
                }

                if (status === 'Pending') {
                    msg = `⏳ Hai Kak!

Pesanan Anda sedang diproses oleh sistem pusat E4 Store. Mohon tunggu beberapa saat, nanti akan kami kabari setelah selesai.

📦 Produk  : ${product.product_name}
🎯 Tujuan   : ${targetDisplay} (${member.name || "-"})

Untuk cek status atau bertanya, langsung chat Chuna di Bot Telegram, ya!
👉 https://t.me/ChunaChanbot

Chuna menunggu kabar baik dari Kakak! 😊`;
                    const tgMsg = await ctx.reply(msg, { reply_markup: returnMarkup });
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

Pesanan sudah diproses otomatis oleh E4 Store. ${product.product_name} sudah masuk ke akun ${member.name || targetDisplay} dan siap digunakan! 💪🔥

Terima kasih telah berbelanja di E4 Store! 🐾

Chuna ~ Asisten Imutmu siap bantu 24 jam!
Kalau mau tanya-tanya atau order lagi, langsung chat Chuna di Bot Telegram:
👉 https://t.me/ChunaChanbot

Chuna tunggu chat dari Kakak! 😊💖`;
                    const appUrl = "http://localhost:3000";
                    if (pay_ref_id) notaBuffer = await generateCanvasReceipt("nota", { id: pay_ref_id, memberId: member.id, type: "prepaid", product: product.product_name, sku: product.buyer_sku_code, target: targetDisplay, price: total, modal: digiflazzPrice, cuan: cuan > 0 ? cuan : 0, status: status, method: method, sn: payJson.data?.sn || "-", date: new Date().toISOString() });
                    let tgMsg;
                    if (notaBuffer) {
                        tgMsg = await ctx.replyWithPhoto({ source: notaBuffer }, { caption: msg, parse_mode: 'Markdown', reply_markup: returnMarkup });
                    } else {
                        tgMsg = await ctx.reply(msg, { parse_mode: 'Markdown', reply_markup: returnMarkup });
                    }
                    tgMsgId = tgMsg.message_id;
                } else {
                    let refundMsg = method === 'saldo' ? '✅ Saldo sebesar Rp ' + total.toLocaleString('id-ID') + ' telah dikembalikan ke akunmu!' : (method === 'utang' ? '✅ Utang sebesar Rp ' + total.toLocaleString('id-ID') + ' telah dibatalkan!' : '✅ Mohon kembalikan uang tunai sebesar Rp ' + total.toLocaleString('id-ID') + ' kepada pelanggan.');
                    msg = `❌ Maaf Kak, pembayaran untuk pesanan Anda gagal diproses.

Kemungkinan ada kesalahan data atau saldo kurang. Silakan cek kembali, atau hubungi Chuna untuk bantuan${(payJson.data.message || '').toLowerCase().includes('ip') ? ' lebih lanjut' : ''}.

Keterangan : ${payJson.data.message || 'Transaksi Gagal'}
📦 Produk  : ${product.product_name}
🎯 Tujuan   : ${targetDisplay} (${member.name || "-"})

${refundMsg}

${(payJson.data.message || '').toLowerCase().includes('ip') ? 'Jangan khawatir, Kakak bisa mencoba ulang kapan saja.' : 'Tenang saja, Kakak bisa mencoba ulang kapan pun.'}

Butuh bantuan? ${(payJson.data.message || '').toLowerCase().includes('ip') ? `Langsung chat Chuna di Bot Telegram:\n👉 https://t.me/ChunaChanbot\n\nChuna siap membantu dengan senyum! 😊💪` : `Chat Chuna di Bot Telegram:\n👉 https://t.me/ChunaChanbot\n\nChuna siap bantu! 😊💪`}`;
                    
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
                    const tgMsg = await ctx.reply(msg, { reply_markup: returnMarkup });
                    tgMsgId = tgMsg.message_id;
                }
                
                let waImageSent = false;
                if (msg && waSocket && member.whatsapp) {
                    let cleanWa = member.whatsapp.replace(/\D/g, "");
                    if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
                    const jid = cleanWa + "@s.whatsapp.net";
                    waJid = jid;
                    try {
                        await waSocket.presenceSubscribe(jid);
                        await waSocket.sendPresenceUpdate('composing', jid);
                        await new Promise(r => setTimeout(r, 1200));
                        await waSocket.sendPresenceUpdate('paused', jid);
                        let waMsg;
                        if (typeof notaBuffer !== 'undefined' && notaBuffer) {
                            waMsg = await waSocket.sendMessage(jid, { image: notaBuffer, caption: msg });
                            waImageSent = true;
                        } else {
                            waMsg = await waSocket.sendMessage(jid, { text: msg });
                        }
                        if (waMsg) waMsgKey = waMsg.key;
                    } catch (err) {
                        console.error("Failed to send WA message:", err);
                    }
                }
                
                const txIndex = transactions.findIndex(t => t.id === pay_ref_id);
                if (txIndex >= 0) {
                    transactions[txIndex].waReceiptSent = status === 'Sukses' ? waImageSent : false;
                    transactions[txIndex].tgMsgId = tgMsgId;
                    transactions[txIndex].waMsgKey = waMsgKey;
                    transactions[txIndex].tgChatId = ctx.chat?.id;
                    transactions[txIndex].waJid = waJid;
                    db.transactions = transactions;
                    writeDB(db);
                }
                
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
        
        if (stateData.memberId) {
            userStates[ctx.from?.id || 0] = { step: 'LOCKED_MEMBER', data: { memberId: stateData.memberId } };
        } else {
            delete userStates[ctx.from?.id || 0];
        }
}


async function processPascaPayment(ctx: any, ref_id: string, method: string, stateData: any, memberId: string) {
        const member = members.find((m: any) => m.id === memberId || isTelegramMatch(m.telegram, ctx.from?.id, ctx.from?.username));
        if (!member) return ctx.reply("❌ Member tidak ditemukan.");
        
        const isOwnerSelf = db.owners.includes(ctx.from?.id) && isTelegramMatch(member.telegram, ctx.from?.id, ctx.from?.username);
        const checkResult = stateData.checkResult;
        const total = stateData.totalBayar;
        const customerNo = stateData.targetNo || stateData.customerNo || stateData.checkResult?.customer_no || "-";
        
        if (!isOwnerSelf) {
            if (method === 'saldo') {
                if (member.balance < total) {
                    return ctx.reply(`❌ TRANSAKSI DITOLAK!Maaf kak, saldo kakak tidak mencukupi untuk melakukan transaksi ini.💳 Saldo Saat Ini: Rp ${member.balance.toLocaleString('id-ID')}💰 Total Bayar: Rp ${total.toLocaleString('id-ID')}Silakan isi ulang saldo kakak terlebih dahulu. 🙏`);
                }
                member.balance -= total;
                db.members = members;
                writeDB(db);
            }
        }
        
        const methodDisplay = method === 'cash' ? '💵 Tunai (Cash)' : method === 'utang' ? '📝 Utang' : '💳 Saldo';
        await ctx.reply(`⏳ Status: Sedang memproses pembayaran tagihan untuk nomor ${customerNo} melalui metode ${methodDisplay}. Mohon ditunggu.`);
        
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
                
                // PRE-REGISTER TRANSACTION
                transactions.unshift({
                    id: pay_ref_id,
                    memberId: member.id,
                    type: "pasca",
                    product: stateData.product.product_name,
                    sku: stateData.product.buyer_sku_code,
                    target: customerNo,
                    price: total,
                    modal: digiflazzPrice,
                    cuan: cuan > 0 ? cuan : 0,
                    status: status,
                    method: method,
                    sn: payJson.data?.sn || "-",
                    date: new Date().toISOString(),
                    waReceiptSent: false
                });
                db.transactions = transactions;
                writeDB(db);
                
                let msg = "";
                let tgMsgId: number | undefined;
                let waMsgKey: any | undefined;
                let waJid: string | undefined;
                let notaBuffer: Buffer | null = null;
                
                let returnMarkup;
                if (stateData.memberId) {
                    returnMarkup = { keyboard: [[{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "🔙 Kembali ke Menu Owner" }]], resize_keyboard: true };
                } else {
                    returnMarkup = { keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]], resize_keyboard: true };
                }

                if (status === 'Pending') {
                    msg = `⏳ Hai Kak!

Pesanan Anda sedang diproses oleh sistem pusat E4 Store. Mohon tunggu beberapa saat, nanti akan kami kabari setelah selesai.

📦 Tagihan : ${stateData.product.product_name}
🎯 Tujuan   : ${customerNo} (${payJson.data?.customer_name || checkResult?.customer_name || "-"})

Untuk cek status atau bertanya, langsung chat Chuna di Bot Telegram, ya!
👉 https://t.me/ChunaChanbot

Chuna menunggu kabar baik dari Kakak! 😊`;
                    const tgMsg = await ctx.reply(msg, { reply_markup: returnMarkup });
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

Pesanan sudah diproses otomatis oleh E4 Store. ${stateData.product.product_name} sudah masuk ke akun ${checkResult?.customer_name || customerNo} dan siap digunakan! 💪🔥

Terima kasih telah berbelanja di E4 Store! 🐾

Chuna ~ Asisten Imutmu siap bantu 24 jam!
Kalau mau tanya-tanya atau order lagi, langsung chat Chuna di Bot Telegram:
👉 https://t.me/ChunaChanbot

Chuna tunggu chat dari Kakak! 😊💖`;
                    const appUrl = "http://localhost:3000";
                    if (pay_ref_id) notaBuffer = await generateCanvasReceipt("nota", { id: pay_ref_id, memberId: member.id, type: "pasca", product: stateData.product.product_name, sku: stateData.product.buyer_sku_code, target: customerNo, price: total, modal: digiflazzPrice, cuan: cuan > 0 ? cuan : 0, tagihan: stateData.checkResult?.selling_price || 0, admin_pel: stateData.adminFee || 0, status: status, method: method, sn: payJson.data?.sn || "-", date: new Date().toISOString() });
                    let tgMsg;
                    if (notaBuffer) {
                        tgMsg = await ctx.replyWithPhoto({ source: notaBuffer }, { caption: msg, parse_mode: 'Markdown', reply_markup: returnMarkup });
                    } else {
                        tgMsg = await ctx.reply(msg, { parse_mode: 'Markdown', reply_markup: returnMarkup });
                    }
                    tgMsgId = tgMsg.message_id;
                } else {
                    let refundMsg = method === 'saldo' ? '✅ Saldo sebesar Rp ' + total.toLocaleString('id-ID') + ' telah dikembalikan ke akunmu!' : (method === 'utang' ? '✅ Utang sebesar Rp ' + total.toLocaleString('id-ID') + ' telah dibatalkan!' : '✅ Mohon kembalikan uang tunai sebesar Rp ' + total.toLocaleString('id-ID') + ' kepada pelanggan.');
                    msg = `❌ Maaf Kak, pembayaran untuk pesanan Anda gagal diproses.

Kemungkinan ada kesalahan data atau saldo kurang. Silakan cek kembali, atau hubungi Chuna untuk bantuan${(payJson.data.message || '').toLowerCase().includes('ip') ? ' lebih lanjut' : ''}.

Keterangan : ${payJson.data.message || 'Transaksi Gagal'}
📦 Tagihan : ${stateData.product.product_name}
🎯 Tujuan   : ${customerNo} (${payJson.data?.customer_name || checkResult?.customer_name || "-"})

${refundMsg}

${(payJson.data.message || '').toLowerCase().includes('ip') ? 'Jangan khawatir, Kakak bisa mencoba ulang kapan saja.' : 'Tenang saja, Kakak bisa mencoba ulang kapan pun.'}

Butuh bantuan? ${(payJson.data.message || '').toLowerCase().includes('ip') ? `Langsung chat Chuna di Bot Telegram:\n👉 https://t.me/ChunaChanbot\n\nChuna siap membantu dengan senyum! 😊💪` : `Chat Chuna di Bot Telegram:\n👉 https://t.me/ChunaChanbot\n\nChuna siap bantu! 😊💪`}`;
                    
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
                    const tgMsg = await ctx.reply(msg, { reply_markup: returnMarkup });
                    tgMsgId = tgMsg.message_id;
                }

                let waImageSent = false;
                if (msg && waSocket && member.whatsapp) {
                    let cleanWa = member.whatsapp.replace(/\D/g, "");
                    if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
                    const jid = cleanWa + "@s.whatsapp.net";
                    waJid = jid;
                    try {
                        await waSocket.presenceSubscribe(jid);
                        await waSocket.sendPresenceUpdate('composing', jid);
                        await new Promise(r => setTimeout(r, 1200));
                        await waSocket.sendPresenceUpdate('paused', jid);
                        let waMsg;
                        if (typeof notaBuffer !== 'undefined' && notaBuffer) {
                            waMsg = await waSocket.sendMessage(jid, { image: notaBuffer, caption: msg });
                            waImageSent = true;
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
                    target: customerNo,
                    price: total,
                    modal: digiflazzPrice,
                    cuan: cuan > 0 ? cuan : 0,
                    tagihan: stateData.checkResult?.selling_price || 0,
                    admin_pel: stateData.adminFee || 0,
                    status: status,
                    method: method,
                    sn: payJson.data?.sn || "-",
                    date: new Date().toISOString(),
                    waReceiptSent: status === 'Sukses' ? waImageSent : false,
                    tgMsgId,
                    waMsgKey,
                    tgChatId: ctx.chat?.id,
                    waJid
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
                target: customerNo,
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
        
        if (stateData.memberId) {
            userStates[ctx.from?.id || 0] = { step: 'LOCKED_MEMBER', data: { memberId: stateData.memberId } };
        } else {
            delete userStates[ctx.from?.id || 0];
        }
}

      


            token = token.trim();
      const agent = new https.Agent({ family: 4 });
      bot = new Telegraf(token, { telegram: { agent } });
      bot.catch((err, ctx) => {
        console.error('Ooops, encountered an error for ' + ctx.updateType, err);
      });
      
      const botInfo = await bot.telegram.getMe();
      
      let welcomeVoiceFileId: string | null = db.welcomeVoiceFileId || null;
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
             "👑 DASHBOARD E4 STORE\nSelamat datang bosku! Mau kelola apa hari ini?",
             {
               reply_markup: {
                 keyboard: [
                   [{ text: "📒 Cek Utang Member" }],
                   [{ text: "📝 Tambah Member" }, { text: "👑 List Member" }],
                   [{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }],
                   [{ text: "📢 Pengumuman WA" }],
                   [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]
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
            "✅ Welcome back kak di E4 Store Official! 🥰Mau transaksi apa hari ini kak bareng Chuna?",
            {
              reply_markup: {
                keyboard: [
                  [{ text: "💵 Cek Saldo" }],
                  [{ text: "🧾 Cek Tagihan" }],
                  [{ text: "📋 Menu Produk" }],
                  [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]
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
          if (registeredUsers[ctx.from.id]) {
             ctx.reply("Mohon maaf kak, akun anda sudah terdaftar dengan tegas.");
             return;
          }
          userStates[ctx.from.id] = { step: 'AWAITING_USERNAME', data: {} };
        }
        ctx.reply(`📝 PENDAFTARAN AKUN

Oke kak! Langkah pertama, kasih tau Chuna Username yang kakak mau dong.`);
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
│  👑  HAI, ${nameUpper}!
│  ───────────────
│  ▸  Status      : 𝙑𝙚𝙧𝙞𝙛𝙞𝙚𝙙 𝙋𝙧𝙞𝙢𝙚
│  ▸  Tipe Akun   : ${typeCap} (siap naik)
│  ▸  Kontak      : ${wa} [✅ Aktif]
│
│  💳  SALDO ANDA
│  ───────────────
│  ▸  Rp ${balance} 
│     [ ░░░░░░░░░░ ] 
│
├─── ✨ CHUNA · SPECIAL CALL ✨ ───
│
│  🎁  Promo spesial untuk "${nameOriginal}":
│  ✔️  Free admin fee 
│  
│
└─── 🚀 24/7 Ready. Balas kapan saja ───`);
          } else {
             await ctx.reply("❌ Kakak belum terdaftar. Yuk daftar dulu!💡 Info: ID Telegram kakak adalah *" + ctx.from.id + "* (Berikan ID ini ke Owner untuk dihubungkan dengan akun web kakak)", { parse_mode: "Markdown" });
          }
        } catch (e) {
          console.error("Failed to answer", e);
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
          await ctx.reply("👑 DASHBOARD E4 STORE\nSelamat datang bosku! Mau kelola apa hari ini?", {
              reply_markup: {
                  keyboard: [
                      [{ text: "📒 Cek Utang Member" }],
                      [{ text: "📝 Tambah Member" }, { text: "👑 List Member" }],
                      [{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }],
                      [{ text: "📢 Pengumuman WA" }],
                      [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]
                  ],
                  resize_keyboard: true
              }
          });
      });

            
      bot.hears("📥 Download", async (ctx) => {
        userStates[ctx.from.id] = { step: 'AWAITING_DOWNLOAD', data: {} };
        const info = `*Fitur Download 📥*

Halo kak! Silakan kirimkan link video/audio yang ingin didownload.
Chuna mendukung download dari:
🎵 TikTok
📸 Instagram
🎬 YouTube
📘 Facebook
🐦 Twitter

Kirim linknya sekarang ya! 🥰`;
        await ctx.reply(info, { parse_mode: 'Markdown' });
      });

      bot.hears("🎵 Lirik Lagu", async (ctx) => {
        userStates[ctx.from.id] = { step: 'AWAITING_LIRIK', data: {} };
        const info = `*Fitur Lirik & Pencarian Musik 🎵*

Halo kak! Silakan kirimkan judul lagu yang ingin dicari (contoh: *Matahariku Agnez Mo*).
Chuna akan mencarikan lagu beserta liriknya! 🥰`;
        await ctx.reply(info, { parse_mode: 'Markdown' });
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
                      [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]
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

      bot.action(/^sel_off_(.+)$/, async (ctx) => {
        await ctx.answerCbQuery();
        if (!db.owners.includes(ctx.from?.id)) return;
        const memberId = ctx.match[1];
        const member = members.find(m => m.id === memberId);
        if (!member) {
          return ctx.reply("❌ Member tidak ditemukan!");
        }
        
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
          await ctx.answerCbQuery();
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
                      [{ text: "✅ Bayar", callback_data: `bayar_utang_${memberId}` }],
                      [{ text: "❌ Tidak", callback_data: `batal_utang` }]
                  ]
              }
          });
      });

      bot.action(/^bayar_utang_(.+)$/, async (ctx) => {
          await ctx.answerCbQuery();
          if (!db.owners.includes(ctx.from?.id)) return;
          const memberId = ctx.match[1];
          
          userStates[ctx.from.id] = { step: 'WAIT_NOMINAL_UTANG', data: { memberId } };
          await ctx.editMessageText("Berapakah customer mu bayar?Ketik nominalnya (contoh: 10000 atau 10.000)");
      });
      
      bot.action('batal_utang', async (ctx) => {
          await ctx.answerCbQuery();
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
        
        ctx.reply(`⚙️ *PENGATURAN SISTEM*

1. *Digiflazz Webhook*
Untuk menerima update transaksi otomatis (Sukses/Gagal dari Pending), silakan atur Webhook di Web Digiflazz:
- Masuk ke Pengaturan Webhook Digiflazz
- Masukkan URL ini (tambahkan URL server di depannya):
\`/api/digiflazz-webhook\`
Contoh: \`https://domainanda.com/api/digiflazz-webhook\`

*Pastikan tidak ada spasi saat copy.*
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

      bot.on("text", async (ctx, next) => {
        const userId = ctx.from.id;
        const text = ctx.message.text;
        
        if (text.startsWith('/')) { return next(); }
        if (text === "🔙 Kembali") { return next(); }

        // COMMANDS DARI FILE
        if (text.startsWith('.tt ') || text.startsWith('.tiktok ')) {
            const url = text.split(' ')[1];
            if (!url) return ctx.reply("❌ Link TikTok-nya mana kak?");
            await ctx.reply("⏳ Tunggu sebentar ya, Chuna sedang mendownload TikTok...");
            try {
                const btch = (await import('btch-downloader')).default || await import('btch-downloader');
                const result = await btch.ttdl(url);
                if (result && result.video) {
                    await ctx.replyWithVideo(result.video, { caption: "✅ Berhasil di-download oleh Chuna!" });
                } else if (result && result.audio) {
                    await ctx.replyWithVideo(result.audio[0] || result.audio, { caption: "✅ Berhasil di-download oleh Chuna!" }).catch(async () => {
                        await ctx.replyWithAudio(result.audio[0] || result.audio);
                    });
                } else {
                    await ctx.reply("❌ Gagal mendownload.");
                }
            } catch (e: any) { await ctx.reply("❌ Error: " + e.message); }
            return;
        }

        if (text.startsWith('.ig ') || text.startsWith('.instagram ')) {
            const url = text.split(' ')[1];
            if (!url) return ctx.reply("❌ Link Instagram-nya mana kak?");
            await ctx.reply("⏳ Tunggu sebentar ya, Chuna sedang mendownload IG...");
            try {
                const btch = (await import('btch-downloader')).default || await import('btch-downloader');
                const result = await btch.igdl(url);
                if (result && Array.isArray(result) && result.length > 0) {
                    for (const media of result) {
                        if (media.url) {
                            if (media.url.includes('.mp4')) await ctx.replyWithVideo(media.url, { caption: "✅ Berhasil!" });
                            else await ctx.replyWithPhoto(media.url, { caption: "✅ Berhasil!" });
                        }
                    }
                } else {
                    await ctx.reply("❌ Gagal mendownload.");
                }
            } catch (e: any) { await ctx.reply("❌ Error: " + e.message); }
            return;
        }

        if (text.startsWith('.ytmp4 ')) {
            const url = text.split(' ')[1];
            if (!url) return ctx.reply("❌ Link YouTube-nya mana kak?");
            await ctx.reply("⏳ Tunggu sebentar ya, Chuna sedang mendownload YT MP4...");
            try {
                const btch = (await import('btch-downloader')).default || await import('btch-downloader');
                const result = await btch.youtube(url);
                if (result && result.video) {
                    await ctx.replyWithVideo(result.video, { caption: "✅ Berhasil!" });
                } else { await ctx.reply("❌ Gagal mendownload."); }
            } catch (e: any) { await ctx.reply("❌ Error: " + e.message); }
            return;
        }

        if (text.startsWith('.ytmp3 ')) {
            const url = text.split(' ')[1];
            if (!url) return ctx.reply("❌ Link YouTube-nya mana kak?");
            await ctx.reply("⏳ Tunggu sebentar ya, Chuna sedang mendownload YT MP3...");
            try {
                const btch = (await import('btch-downloader')).default || await import('btch-downloader');
                const result = await btch.youtube(url);
                if (result && result.audio) {
                    await ctx.replyWithAudio(result.audio, { caption: "✅ Berhasil!" });
                } else { await ctx.reply("❌ Gagal mendownload."); }
            } catch (e: any) { await ctx.reply("❌ Error: " + e.message); }
            return;
        }

        if (text.startsWith('.fb ')) {
            const url = text.split(' ')[1];
            if (!url) return ctx.reply("❌ Link Facebook-nya mana kak?");
            await ctx.reply("⏳ Tunggu sebentar ya, Chuna sedang mendownload FB...");
            try {
                const btch = (await import('btch-downloader')).default || await import('btch-downloader');
                const result = await btch.fbdown(url);
                if (result && result.video) {
                    await ctx.replyWithVideo(result.video, { caption: "✅ Berhasil!" });
                } else if (result && result.Normal_video) {
                    await ctx.replyWithVideo(result.Normal_video, { caption: "✅ Berhasil!" });
                } else { await ctx.reply("❌ Gagal mendownload."); }
            } catch (e: any) { await ctx.reply("❌ Error: " + e.message); }
            return;
        }

        if (text.startsWith('.tw ') || text.startsWith('.twitter ')) {
            const url = text.split(' ')[1];
            if (!url) return ctx.reply("❌ Link Twitter-nya mana kak?");
            await ctx.reply("⏳ Tunggu sebentar ya, Chuna sedang mendownload Twitter...");
            try {
                const btch = (await import('btch-downloader')).default || await import('btch-downloader');
                const result = await btch.twitter(url);
                if (result && result.url) {
                    if (result.url[0] && result.url[0].hd) {
                        await ctx.replyWithVideo(result.url[0].hd, { caption: "✅ Berhasil!" });
                    } else {
                        await ctx.reply("❌ Gagal mendownload.");
                    }
                } else { await ctx.reply("❌ Gagal mendownload."); }
            } catch (e: any) { await ctx.reply("❌ Error: " + e.message); }
            return;
        }

        if (text.startsWith('.spotify ')) {
            const url = text.split(' ')[1];
            if (!url) return ctx.reply("❌ Link Spotify-nya mana kak?");
            await ctx.reply("⏳ Tunggu sebentar ya, Chuna sedang mendownload Spotify...");
            try {
                const btch = (await import('btch-downloader')).default || await import('btch-downloader');
                const result = await btch.spotify(url);
                if (result && result.audio) {
                    await ctx.replyWithAudio(result.audio, { caption: `✅ ${result.title || 'Berhasil!'}` });
                } else { await ctx.reply("❌ Gagal mendownload."); }
            } catch (e: any) { await ctx.reply("❌ Error: " + e.message); }
            return;
        }

        if (text.startsWith('.pinterest ') || text.startsWith('.pin ')) {
            const url = text.split(' ')[1];
            if (!url) return ctx.reply("❌ Link Pinterest-nya mana kak?");
            await ctx.reply("⏳ Tunggu sebentar ya, Chuna sedang mendownload Pinterest...");
            try {
                const btch = (await import('btch-downloader')).default || await import('btch-downloader');
                const result = await btch.pinterest(url);
                if (result && Array.isArray(result) && result.length > 0) {
                    for (const url of result) {
                        await ctx.replyWithPhoto(url);
                    }
                } else if (result) {
                    await ctx.replyWithPhoto(result);
                } else { await ctx.reply("❌ Gagal mendownload."); }
            } catch (e: any) { await ctx.reply("❌ Error: " + e.message); }
            return;
        }

        if (text.startsWith('.lirik ') || text.startsWith('.play ')) {
            const query = text.substring(text.indexOf(' ') + 1).trim();
            if (!query) return ctx.reply("❌ Judul lagunya apa kak?");
            await ctx.reply("⏳ Chuna sedang mencari '" + query + "'...");
            try {
                const ytSearch = (await import('yt-search')).default || await import('yt-search');
                const searchResult = await ytSearch(query);
                let msg = "🎵 *Hasil Pencarian YouTube* 🎵\n\n";
                if (searchResult && searchResult.videos.length > 0) {
                    const top = searchResult.videos.slice(0, 3);
                    top.forEach((v: any, i: number) => {
                        msg += `*${i+1}. ${v.title}*\n⏱️ ${v.timestamp} | 👁️ ${v.views}\n🔗 ${v.url}\n\n`;
                    });
                    const photoUrl = top[0].thumbnail;
                    
                    try {
                        const axios = (await import('axios')).default || await import('axios');
                        const lyricsRes = await axios.get(`https://some-random-api.com/lyrics?title=${encodeURIComponent(query)}`);
                        if (lyricsRes.data && lyricsRes.data.lyrics) {
                            msg += `\n*Lirik Lagu:*\n\n${lyricsRes.data.lyrics.substring(0, 2000)}`;
                        }
                    } catch (e) {}
                    
                    await ctx.replyWithPhoto(photoUrl, { caption: msg.substring(0, 1024), parse_mode: 'Markdown' });
                    if (msg.length > 1024) await ctx.reply(msg, { parse_mode: 'Markdown' });
                } else {
                    await ctx.reply("❌ Lagu tidak ditemukan.");
                }
            } catch (e: any) { await ctx.reply("❌ Error: " + e.message); }
            return;
        }

        
        const ownerMenu = ["📒 Cek Utang Member", "📝 Tambah Member", "👑 List Member", "💳 Saldo Pusat", "⚙️ Pengaturan", "📢 Pengumuman WA", "📸 Buat Story WA"];
        if (ownerMenu.includes(text) && db.owners.includes(userId)) {
           delete userStates[userId];
           return next(); 
        }

        const state = userStates[userId];
        if (state) {
            switch (state.step) {

                case 'AWAITING_DOWNLOAD': {
                    if (text === '❌ Batal') {
                        delete userStates[userId];
                        
                    let returnMarkup;
                    if (db.owners.includes(userId)) {
                        returnMarkup = {
                            keyboard: [
                                [{ text: "📒 Cek Utang Member" }],
                                [{ text: "📝 Tambah Member" }, { text: "👑 List Member" }],
                                [{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }],
                                [{ text: "📢 Pengumuman WA" }],
                                [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]
                            ],
                            resize_keyboard: true
                        };
                    } else {
                        returnMarkup = { keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]], resize_keyboard: true };
                    }
await ctx.reply("❌ Download dibatalkan.", { reply_markup: returnMarkup });
                        return;
                    }
                    const url = text.trim();
                    if (!url.startsWith('http')) {
                        await ctx.reply("❌ Mohon kirimkan link (URL) yang valid!");
                        return;
                    }
                    userStates[userId] = { step: 'AWAITING_DOWNLOAD_FORMAT', url };
                    await ctx.reply("Pilih format yang ingin didownload 👇", {
                        reply_markup: {
                            keyboard: [
                                [{ text: "🎥 Video" }, { text: "🎵 Audio / MP3" }],
                                [{ text: "📸 Gambar" }, { text: "❌ Batal" }]
                            ],
                            resize_keyboard: true
                        }
                    });
                    return;
                }
                
                case 'AWAITING_DOWNLOAD_FORMAT': {
                    if (text === '❌ Batal') {
                        delete userStates[userId];
                        
                    let returnMarkup;
                    if (db.owners.includes(userId)) {
                        returnMarkup = {
                            keyboard: [
                                [{ text: "📒 Cek Utang Member" }],
                                [{ text: "📝 Tambah Member" }, { text: "👑 List Member" }],
                                [{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }],
                                [{ text: "📢 Pengumuman WA" }],
                                [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]
                            ],
                            resize_keyboard: true
                        };
                    } else {
                        returnMarkup = { keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]], resize_keyboard: true };
                    }
await ctx.reply("❌ Download dibatalkan.", { reply_markup: returnMarkup });
                        return;
                    }
                    
                    const format = text;
                    if (!["🎥 Video", "🎵 Audio / MP3", "📸 Gambar"].includes(format)) {
                        await ctx.reply("❌ Silakan pilih format menggunakan tombol di bawah.");
                        return;
                    }
                    
                    const url = state.url;
                    await ctx.reply("⏳ Tunggu sebentar ya, Chuna sedang mendownload media...");
                    
                    try {
                        const btch = (await import('btch-downloader')).default || await import('btch-downloader');
                        let result;
                        if (url.includes('tiktok.com')) result = await btch.ttdl(url);
                        else if (url.includes('instagram.com')) result = await btch.igdl(url);
                        else if (url.includes('youtube.com') || url.includes('youtu.be')) result = await btch.youtube(url);
                        else if (url.includes('facebook.com') || url.includes('fb.watch')) result = await btch.fbdown(url);
                        else if (url.includes('twitter.com') || url.includes('x.com')) result = await btch.twitter(url);
                        else result = await btch.aio(url);

                        const isVideo = format === "🎥 Video";
                        const isAudio = format === "🎵 Audio / MP3";
                        const isImage = format === "📸 Gambar";
                        
                        // Helper to find URL recursively or in array
                        const extractUrls = (res: any): string[] => {
                            if (!res) return [];
                            if (typeof res === 'string' && res.startsWith('http')) return [res];
                            if (Array.isArray(res)) return res.map(r => extractUrls(r)).flat();
                            
                            let urls: string[] = [];
                            if (res.url) urls.push(res.url);
                            if (res.video) urls.push(...extractUrls(res.video));
                            if (res.audio) urls.push(...extractUrls(res.audio));
                            if (res.image) urls.push(...extractUrls(res.image));
                            if (res.mp4) urls.push(...extractUrls(res.mp4));
                            if (res.mp3) urls.push(...extractUrls(res.mp3));
                            if (res.thumbnail) urls.push(...extractUrls(res.thumbnail));
                            return urls.flat();
                        };
                        
                        let allUrls = extractUrls(result);
                        
                        // Filter by extension roughly
                        let targetUrls = allUrls.filter(u => {
                            const lu = u.toLowerCase();
                            if (isAudio && (lu.includes('.mp3') || lu.includes('audio') || result?.mp3 === u || (result?.audio && JSON.stringify(result.audio).includes(u)))) return true;
                            if (isVideo && (lu.includes('.mp4') || lu.includes('video') || result?.mp4 === u || (result?.video && JSON.stringify(result.video).includes(u)))) return true;
                            if (isImage && (lu.includes('.jpg') || lu.includes('.jpeg') || lu.includes('.png') || lu.includes('image') || result?.thumbnail === u)) return true;
                            return false;
                        });
                        
                        if (targetUrls.length === 0) {
                            // fallback, if nothing specific matched, maybe just use the first few if we can guess
                            if (isVideo && result?.mp4) targetUrls = [result.mp4];
                            else if (isAudio && result?.mp3) targetUrls = [result.mp3];
                            else if (isImage && result?.thumbnail) targetUrls = [result.thumbnail];
                            else {
                                // If still nothing, just give whatever we got based on what the API usually returns
                                if (isVideo) targetUrls = allUrls.filter(u => !u.includes('.jpg') && !u.includes('.mp3'));
                                if (isAudio) targetUrls = allUrls.filter(u => !u.includes('.jpg') && !u.includes('.mp4'));
                            }
                        }
                        
                        // Remove duplicates
                        targetUrls = [...new Set(targetUrls)];
                        
                        if (targetUrls.length > 0) {
                            for (const mediaUrl of targetUrls) {
                                try {
                                    if (isVideo) {
                                        await ctx.replyWithVideo(mediaUrl, { caption: "✅ Video berhasil di-download!" });
                                        break; // Only send the first video to avoid spamming multiple qualities
                                    } else if (isAudio) {
                                        await ctx.replyWithAudio(mediaUrl, { caption: "✅ Audio berhasil di-download!" });
                                        break;
                                    } else {
                                        await ctx.replyWithPhoto(mediaUrl, { caption: "✅ Gambar berhasil di-download!" });
                                    }
                                } catch(e) {}
                            }
                        } else {
                             await ctx.reply("❌ Gagal mendapatkan format " + format + " dari link tersebut.");
                        }

                    } catch (e: any) {
                        await ctx.reply("❌ Terjadi kesalahan saat mendownload media. " + e.message);
                    }
                    
                    delete userStates[userId];
                    
                    let returnMarkup;
                    if (db.owners.includes(userId)) {
                        returnMarkup = {
                            keyboard: [
                                [{ text: "📒 Cek Utang Member" }],
                                [{ text: "📝 Tambah Member" }, { text: "👑 List Member" }],
                                [{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }],
                                [{ text: "📢 Pengumuman WA" }],
                                [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]
                            ],
                            resize_keyboard: true
                        };
                    } else {
                        returnMarkup = { keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]], resize_keyboard: true };
                    }
await ctx.reply("Menu Utama", { reply_markup: returnMarkup });
                    return;
                }

                case 'AWAITING_LIRIK': {
                    if (text === '❌ Batal') {
                        delete userStates[userId];
                        
                    let returnMarkup;
                    if (db.owners.includes(userId)) {
                        returnMarkup = {
                            keyboard: [
                                [{ text: "📒 Cek Utang Member" }],
                                [{ text: "📝 Tambah Member" }, { text: "👑 List Member" }],
                                [{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }],
                                [{ text: "📢 Pengumuman WA" }],
                                [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]
                            ],
                            resize_keyboard: true
                        };
                    } else {
                        returnMarkup = { keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]], resize_keyboard: true };
                    }
await ctx.reply("❌ Pencarian dibatalkan.", { reply_markup: returnMarkup });
                        return;
                    }
                    const query = text.trim();
                    await ctx.reply("⏳ Chuna sedang mencari lirik lagu '" + query + "'...");
                    try {
                        const ytSearch = (await import('yt-search')).default || await import('yt-search');
                        const searchResult = await ytSearch(query);
                        let msg = "🎵 *Hasil Pencarian YouTube* 🎵\n\n";
                        if (searchResult && searchResult.videos.length > 0) {
                            const top = searchResult.videos.slice(0, 3);
                            top.forEach((v: any, i: number) => {
                                msg += `*${i+1}. ${v.title}*\n⏱️ ${v.timestamp} | 👁️ ${v.views}\n🔗 ${v.url}\n\n`;
                            });
                            const photoUrl = top[0].thumbnail;
                            
                            // Let's try lyrics api
                            try {
                                const axios = (await import('axios')).default || await import('axios');
                                const lyricsRes = await axios.get(`https://some-random-api.com/lyrics?title=${encodeURIComponent(query)}`);
                                if (lyricsRes.data && lyricsRes.data.lyrics) {
                                    msg += `\n*Lirik Lagu:*\n\n${lyricsRes.data.lyrics.substring(0, 3000)}`;
                                }
                            } catch (e) {
                                msg += "\n_(Lirik lagu tidak ditemukan di database kami)_";
                            }
                            
                            await ctx.replyWithPhoto(photoUrl, { caption: msg.substring(0, 1024), parse_mode: 'Markdown' });
                            if (msg.length > 1024) {
                                await ctx.reply(msg, { parse_mode: 'Markdown' });
                            }
                        } else {
                            await ctx.reply("❌ Lagu tidak ditemukan.");
                        }
                    } catch (e: any) {
                        await ctx.reply("❌ Terjadi kesalahan saat mencari lagu. " + e.message);
                    }
                    delete userStates[userId];
                    return;
                }

                case 'ASK_PIN_PREPAID': {
                    const pinEntered = text.trim();
                    const regUser = registeredUsers[userId];
                    if (!regUser || regUser.pin !== pinEntered) {
                        return ctx.reply("😡 HMM?! PIN-NYA SALAH! Hayoo, kamu siapa?! Jangan sembarangan pakai akun orang ya! Chuna gigit nih kalau berani macam-macam! 🔪👿");
                    }
                    await ctx.reply("✅ Yey! PIN-nya benar. Chuna langsung proses transaksinya sekarang ya sayang! 🚀✨*(Demi keamanan, pesan berisi PIN-mu jangan lupa dihapus sendiri ya)*", { parse_mode: 'Markdown' });
                    const sd = state.data;
                    delete userStates[userId];
                    await processPrepaidPayment(ctx, sd.sku, sd.method, sd, sd.memberId || `MBR-${userId}`);
                    return;
                }
                case 'ASK_PIN_PASCA': {
                    const pinEntered = text.trim();
                    const regUser = registeredUsers[userId];
                    if (!regUser || regUser.pin !== pinEntered) {
                        return ctx.reply("😡 HMM?! PIN-NYA SALAH! Hayoo, kamu siapa?! Jangan sembarangan pakai akun orang ya! Chuna gigit nih kalau berani macam-macam! 🔪👿");
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
                        await ctx.reply("❌ Pembelian dibatalkan.", { reply_markup: { keyboard: [[{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "🔙 Kembali ke Menu Owner" }]], resize_keyboard: true } });
                    } else {
                        delete userStates[userId];
                        
                        let returnMarkup;
                        if (db.owners.includes(userId)) {
                            returnMarkup = {
                                keyboard: [
                                    [{ text: "📒 Cek Utang Member" }],
                                    [{ text: "📝 Tambah Member" }, { text: "👑 List Member" }],
                                    [{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }],
                                    [{ text: "📢 Pengumuman WA" }],
                                    [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]
                                ],
                                resize_keyboard: true
                            };
                        } else {
                            returnMarkup = { keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]], resize_keyboard: true };
                        }
await ctx.reply("❌ Pembelian dibatalkan.", { reply_markup: returnMarkup });
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
                // Automatically send to WhatsApp
                const memberIdForPrepaid = state.data.memberId || `MBR-${ctx.from?.id}`;
                const memberForPrepaid = members.find(m => m.id === memberIdForPrepaid || isTelegramMatch(m.telegram, ctx.from?.id, ctx.from?.username));
                if (waSocket && memberForPrepaid && memberForPrepaid.whatsapp) {
                    let cleanWa = memberForPrepaid.whatsapp.replace(/\D/g, "");
                    if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
                    const jid = cleanWa + "@s.whatsapp.net";
                    try {
                        await waSocket.presenceSubscribe(jid);
                        await waSocket.sendPresenceUpdate('composing', jid);
                        await new Promise(r => setTimeout(r, 1200));
                        await waSocket.sendPresenceUpdate('paused', jid);
                        await waSocket.sendMessage(jid, { text: replyText });
                    } catch (err) {
                        console.error("Failed to send WA message:", err);
                    }
                }
                break;
              }
              case 'PASCA_INPUT_NUMBER':
                const customerNo = text.trim();
                if (customerNo.toLowerCase() === 'batal' || customerNo === '❌ Batal') {
                    if (state.data.memberId) {
                        userStates[userId] = { step: 'LOCKED_MEMBER', data: { memberId: state.data.memberId } };
                        await ctx.reply("❌ Pengecekan dibatalkan.", { reply_markup: { keyboard: [[{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "🔙 Kembali ke Menu Owner" }]], resize_keyboard: true } });
                    } else {
                        delete userStates[userId];
                        
                        let returnMarkup;
                        if (db.owners.includes(userId)) {
                            returnMarkup = {
                                keyboard: [
                                    [{ text: "📒 Cek Utang Member" }],
                                    [{ text: "📝 Tambah Member" }, { text: "👑 List Member" }],
                                    [{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }],
                                    [{ text: "📢 Pengumuman WA" }],
                                    [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]
                                ],
                                resize_keyboard: true
                            };
                        } else {
                            returnMarkup = { keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]], resize_keyboard: true };
                        }
await ctx.reply("❌ Pengecekan dibatalkan.", { reply_markup: returnMarkup });
                    }
                    return;
                }
                if (!customerNo || customerNo.length < 2) {
                    await ctx.reply("❌ Nomor tujuan tidak valid.");
                    return;
                }
                const product = state.data.product;
                await ctx.reply(`⏳ Sedang mengecek tagihan untuk nomor ${customerNo}...`);
                try {
                    const result = await checkPascaBill(product.buyer_sku_code, customerNo);
                    if (result.status === 'Gagal') {
                         await ctx.reply(`❌ Pengecekan Gagal:${result.message}`);
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
                         if (isOwnerCtx && feeData.owner_fixed !== undefined) {
                             total = feeData.owner_fixed;
                             adminFee = total - tagihan;
                         }
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

                         userStates[userId] = { step: 'WAIT_PAYMENT_PASCA', data: { ...state.data, ref_id: result.ref_id, totalBayar: total, checkResult: result, targetNo: customerNo } };

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
                    if (state.data.memberId) {
                        userStates[userId] = { step: 'LOCKED_MEMBER', data: { memberId: state.data.memberId } };
                        await ctx.reply("❌ Pembelian dibatalkan.", { reply_markup: { keyboard: [[{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "🔙 Kembali ke Menu Owner" }]], resize_keyboard: true } });
                    } else {
                        delete userStates[userId];
                        
                        let returnMarkup;
                        if (db.owners.includes(userId)) {
                            returnMarkup = {
                                keyboard: [
                                    [{ text: "📒 Cek Utang Member" }],
                                    [{ text: "📝 Tambah Member" }, { text: "👑 List Member" }],
                                    [{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }],
                                    [{ text: "📢 Pengumuman WA" }],
                                    [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]
                                ],
                                resize_keyboard: true
                            };
                        } else {
                            returnMarkup = { keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]], resize_keyboard: true };
                        }
await ctx.reply("❌ Pembelian dibatalkan.", { reply_markup: returnMarkup });
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
                  const produkList = [...new Set(utangTx.map((t: any) => t.product))].join(', ');
                  const datesUtang = [...new Set(utangTx.map((t: any) => {
                      const d = new Date(t.date);
                      return `${d.getDate()} ${['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][d.getMonth()]} ${d.getFullYear()}`;
                  }))].join(', ');
                  
                  const today = new Date();
                  const tglLunas = `${today.getDate()} ${['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][today.getMonth()]} ${today.getFullYear()}`;

                  let lunasText = `Saya yang bertanda tangan di bawah ini:

· Nama Customer   : ${nama}
· No. WhatsApp    : ${wa}
· Produk Digital  : ${produkList}
· Total Tagihan   : Rp ${nominal.toLocaleString('id-ID')}

Dengan ini menyatakan bahwa:

· Tanggal pemesanan / utang : ${datesUtang}
· Tanggal pelunasan         : ${tglLunas}`;

                  if (nominal === totalDebt) {
                      lunasText += `\n\nStatus pembayaran saya telah lunas pada tanggal tersebut di atas. Terima kasih.`;
                      await ctx.reply(lunasText);
                  } else if (nominal < totalDebt) {
                      const sisa = totalDebt - nominal;
                      lunasText += `\n\nStatus pembayaran saya baru dibayar sebagian, sisa utang: Rp ${sisa.toLocaleString('id-ID')}.`;
                      await ctx.reply(lunasText);
                  } else {
                      const kembalian = nominal - totalDebt;
                      lunasText += `\n\nStatus pembayaran saya telah lunas pada tanggal tersebut di atas. Terima kasih.\n\n💸 Kembalian: Rp ${kembalian.toLocaleString('id-ID')}`;
                      await ctx.reply(lunasText);
                  }
                  
                  // Kirim juga ke WA
                  if (waSocket && member && member.whatsapp) {
                      let cleanWa = member.whatsapp.replace(/\D/g, "");
                      if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
                      const jid = cleanWa + "@s.whatsapp.net";
                      try {
                          await waSocket.sendMessage(jid, { text: lunasText });
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
                    if (state.data.memberId) {
                        userStates[userId] = { step: 'LOCKED_MEMBER', data: { memberId: state.data.memberId } };
                        await ctx.reply("❌ Pembayaran dibatalkan.", { reply_markup: { keyboard: [[{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "🔙 Kembali ke Menu Owner" }]], resize_keyboard: true } });
                    } else {
                        delete userStates[userId];
                        
                        let returnMarkup;
                        if (db.owners.includes(userId)) {
                            returnMarkup = {
                                keyboard: [
                                    [{ text: "📒 Cek Utang Member" }],
                                    [{ text: "📝 Tambah Member" }, { text: "👑 List Member" }],
                                    [{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }],
                                    [{ text: "📢 Pengumuman WA" }],
                                    [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]
                                ],
                                resize_keyboard: true
                            };
                        } else {
                            returnMarkup = { keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]], resize_keyboard: true };
                        }
await ctx.reply("❌ Pembayaran dibatalkan.", { reply_markup: returnMarkup });
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
                state.step = 'AWAITING_PIN';
                await ctx.reply(`Yeay kode OTP berhasil dikonfirmasi! 🎉Satu langkah lagi nih kak. Yuk buat PIN rahasia kakak (6 angka) biar transaksi kakak aman bareng Chuna! 🔒`);
                return;
                  
              case 'AWAITING_PIN':
                state.data.pin = text;
                state.step = 'REGISTERED';
                registeredUsers[userId] = {
                  username: state.data.username,
                  wa: state.data.wa,
                  pin: state.data.pin
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
                    type: 'Biasa'
                  });
                }
                
                delete userStates[userId];
                db.members = members; db.registeredUsers = registeredUsers; writeDB(db);
                await ctx.reply(`Yeayyy! Selamat datang di keluarga E4 Store kak ${state.data.username}! 🥳Sekarang kakak udah bisa nikmatin semua fitur keren dari Chuna.Ketik /menu buat mulai ya kak!`, {
                  reply_markup: {
                    keyboard: [
                      [{ text: "💵 Cek Saldo" }],
                      [{ text: "🧾 Cek Tagihan" }],
                      [{ text: "📋 Menu Produk" }]
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
                    const brandProducts = prepaid.filter((p: any) => p.brand === state.data.brand);
                    const types = [...new Set(brandProducts.map((p: any) => p.type))].filter(Boolean);
                    
                    if (types.includes(text)) {
                        let filtered = brandProducts.filter((p: any) => p.type === text);
                        filtered.sort((a: any, b: any) => a.price - b.price); filtered = filtered.slice(0, 100);
                        
                        const keyboard = [];
                        for (let i = 0; i < filtered.length; i += 2) {
                            const row = [{ text: getProductButtonText(filtered[i]) }];
                            if (filtered[i+1]) row.push({ text: getProductButtonText(filtered[i+1]) });
                            keyboard.push(row);
                        }
                        keyboard.push([{ text: "🔙 Kembali" }]);
                        
                        await ctx.reply(`📋 *Produk ${state.data.brand} - ${text}*Silakan pilih produk yang ingin dibeli:`, { 
                            parse_mode: 'Markdown',
                            reply_markup: { keyboard: keyboard, resize_keyboard: true }
                        });
                        handled = true;
                    }
                }
            } catch(e) { console.error("Error:", e.message); }
            
            // Check prepaid categories
            try {
                const prepaid = await getDigiflazzProducts("prepaid");
                const prepaidCats = [...new Set(prepaid.map((p: any) => p.category))].filter(Boolean);
                if (prepaidCats.includes(text)) {
                    const filtered = prepaid.filter((p: any) => p.category === text);
                    const brands = [...new Set(filtered.map((p: any) => p.brand))].sort();
                    
                    if (brands.length === 1 && brands[0] === text) {
                        // Skip category step, go straight to products
                        const productsForBrand = prepaid.filter((p: any) => p.brand === text).slice(0, 100);
                        const keyboard = [];
                        for (let i = 0; i < productsForBrand.length; i += 2) {
                            const row = [{ text: getProductButtonText(productsForBrand[i]) }];
                            if (productsForBrand[i+1]) row.push({ text: getProductButtonText(productsForBrand[i+1]) });
                            keyboard.push(row);
                        }
                        keyboard.push([{ text: "🔙 Kembali" }]);
                        
                        await ctx.reply(`📋 *Produk ${text}*Silakan pilih produk yang ingin dibeli:`, { 
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

                        await ctx.reply(`📋 *Kategori ${text} (Prabayar)*Silakan pilih brand di bawah ini:`, { 
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
            
            // Check prepaid brands
            try {
                const prepaid = await getDigiflazzProducts("prepaid");
                const prepaidBrands = [...new Set(prepaid.map((p: any) => p.brand))].filter(Boolean);
                if (prepaidBrands.includes(text)) {
                    let filtered = prepaid.filter((p: any) => p.brand === text);
                    const types = [...new Set(filtered.map((p: any) => p.type))].filter(Boolean);
                    
                    if (types.length > 1) {
                        const prevMemberId = userStates[userId]?.data?.memberId;
                        userStates[userId] = { step: 'PREPAID_SELECT_TYPE', data: { brand: text, memberId: prevMemberId } };
                        
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
            } catch (e) { console.error("Error in prepaidBrands check:", e.message); }

            if (handled) return;

            // Check pasca brands
            try {
                const pasca = await getDigiflazzProducts("pasca");
                const pascaBrands = [...new Set(pasca.map((p: any) => p.brand))].filter(Boolean);
                if (pascaBrands.includes(text)) {
                    let filtered = pasca.filter((p: any) => p.brand === text); filtered = filtered.slice(0, 100);
                    
                    const keyboard = [];
                    for (let i = 0; i < filtered.length; i += 2) {
                        const row = [{ text: getProductButtonText(filtered[i]) }];
                        if (filtered[i+1]) row.push({ text: getProductButtonText(filtered[i+1]) });
                        keyboard.push(row);
                    }
                    keyboard.push([{ text: "🔙 Kembali" }]);

                    await ctx.reply(`🧾 *Layanan ${text}*Silakan pilih layanan untuk melihat detail:`, { 
                        parse_mode: 'Markdown',
                        reply_markup: {
                            keyboard: keyboard,
                            resize_keyboard: true
                        }
                    });
                    handled = true;
                }
                
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
                        await ctx.reply(`🛒 *Detail Layanan*Nama: ${matchedProduct.product_name}Brand: ${matchedProduct.brand}Kategori: ${matchedProduct.category}✏️ *Silakan masukkan nomor tujuan/pelanggan untuk mengecek tagihan:*`, {
                            parse_mode: 'Markdown',
                            reply_markup: {
                                keyboard: [[{ text: "❌ Batal" }]],
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
await bot.launch();

      botStatus = "Connected as @" + botInfo.username;
      console.log("Bot started successfully:", botInfo.username);
    } catch (error: any) {
      botStatus = "Error: " + error.message;
      bot = null;
      console.error("Bot start failed:", error);
      // Do not throw to prevent server crash
    }
  }

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

  app.get("/api/nota/:id", (req, res) => {
    const { id } = req.params;
    const tx = db.transactions.find(t => t.id === id);
    if (!tx) {
        return res.status(404).send("Nota tidak ditemukan.");
    }
    
    const isSukses = tx.status && tx.status.toLowerCase().includes('sukses');
    const isPending = tx.status && tx.status.toLowerCase() === 'pending';
    let statusColor = isSukses ? '#4caf50' : (isPending ? '#f59e0b' : '#dc2626');
    let statusText = `Status: ${tx.status.toUpperCase()} ${isSukses ? '(LUNAS)' : ''}`;
    
    let token = tx.sn || '-';
    
    let targetId = tx.target || '-';
    let nicknameFromTarget = '';
    if (targetId.includes('(') && targetId.endsWith(')')) {
        const match = targetId.match(/(.*)\s*\((.*)\)$/);
        if (match) {
            targetId = match[1].trim();
            nicknameFromTarget = match[2].trim();
        }
    }
    if (token === '-' && nicknameFromTarget) {
        token = nicknameFromTarget;
    }

    let namaPlg = '';
    let golDaya = '';
    
    if (token && token.includes('/')) {
        const parts = token.split('/');
        token = parts[0];
        namaPlg = parts[1] || '';
        if (parts.length > 3) {
            golDaya = `${parts[2]} / ${parts[3]}`;
        } else {
            golDaya = parts.slice(2).join(' / ');
        }
    }
    
    const txDate = new Date(tx.date || new Date());
    const dateStr = txDate.toLocaleString('en-GB', { timeZone: 'Asia/Makassar', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', '');
    const formattedDate = `${dateStr} WITA`;
    const calendarInfo = getCalendarInfo(txDate);
    
    let memberName = tx.username || '-';
    try {
        const m = db.members.find(x => x.id === tx.memberId);
        if (m && m.name) memberName = m.name;
    } catch(e) {}
    
    const linesHtml = [
        ['Nama', memberName],
        ['ID Pelanggan', targetId],
        ['Order ID', tx.id || '-'],
        ['Tanggal', formattedDate],
        ['Pembelian', tx.product || '-'],
        ...(namaPlg ? [['Nama Pel.', namaPlg]] : []),
        ...(golDaya ? [['Gol/Daya', golDaya]] : [])
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
    <title>Struk - E4 STORE</title>
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
        .footer { background-color: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; font-size: 12px; color: #64748b; margin-top: 20px; width: 100%; box-sizing: border-box; }
        .footer-small { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 15px; }
        
        @media print {
            body { background-color: white; padding: 0; align-items: flex-start; display: block; margin: 0; min-height: auto; }
            .receipt { box-shadow: none; max-width: 100%; padding: 10px; margin: 0; border-radius: 0; width: 100%; }
        }
    </style>
</head>
<body onload="setTimeout(() => window.print(), 500)">
    <div class="receipt">
        <div class="title">E4 STORE</div>
        <div class="subtitle">Token Listrik / Struk Pembayaran</div>
        <div class="badge">${statusText}</div>
        <div class="divider"></div>
        <div class="lines">
            ${linesHtml}
        </div>
        ${token !== '-' ? `
        <div class="box-container">
            <div class="box-title">Token / SN</div>
            <div class="box-val">${token}</div>
        </div>
        ` : ''}
        <div class="box-container" style="flex-direction: row; justify-content: space-between; align-items: center;">
            <div class="box-title" style="margin: 0;">TOTAL BAYAR</div>
            <div class="box-val">Rp ${(tx.price || 0).toLocaleString('id-ID')}</div>
        </div>
        <div class="footer">
            Cetak: ${formattedDate} | Kode: #${tx.id}<br/>✨ ${calendarInfo}
        </div>
        <div class="divider"></div>
        <div class="footer-small">
            Chuna - Asisten Imutmu siap bantu 24 jam!<br/>Terimakasih telah berbelanja di E4 Store!
        </div>
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
