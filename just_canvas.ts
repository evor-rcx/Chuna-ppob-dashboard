import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';

function getCalendarInfo(date: Date) {
    return '14 Juli 2026';
}

async function generateCanvasReceipt(type: 'nota' | 'tagihan', data: any): Promise<Buffer | null> {
    try {
        const width = 600;
        let height = type === 'nota' ? 1000 : 900;
        
        let token = data.sn || '-';
        let namaPlg = '';
        let golDaya = '';
        let kwh = '';
        
        if (data.sn && data.sn.includes('/')) {
            const parts = data.sn.split('/');
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
        
        const shortCode = `#${(data.id || 'E4').substring(0,6).toUpperCase()}`;
        ctx.fillText(`📅 Cetak: ${formattedDate} | Kode: ${shortCode}`, width / 2, y);
        y += 25;
        ctx.fillText(`✨ ${calendarInfo}`, width / 2, y);
        
        // create smaller canvas if needed
        const finalCanvas = createCanvas(width, y + 50);
        const finalCtx = finalCanvas.getContext('2d');
        finalCtx.drawImage(canvas, 0, 0);
        
        return finalCanvas.toBuffer('image/png');
    } catch (e: any) {
        console.error("Canvas receipt error:", e);
        return null;
    }
}

async function test() {
    const data = {
        id: "D-12345",
        date: new Date(),
        memberId: "123",
        target: "081234567890",
        sn: "1234-5678-9012/BUDI/R1/900",
        product: { product_name: "Token PLN 50.000", price: 52000 },
        total: 52000,
        status: "Sukses"
    };
    
    const buf = await generateCanvasReceipt("nota", data);
    console.log(buf ? "Buffer generated: " + buf.length : "null");
}

test();
