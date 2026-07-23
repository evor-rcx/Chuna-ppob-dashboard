const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

const newLogic = `let cachedBgImage: any = null;
let font64: any = null;
let font32: any = null;

async function initJimp() {
    if (!font64) {
        font64 = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
    }
    if (!font32) {
        font32 = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    }
    if (!cachedBgImage) {
        try {
            const path = require('path');
            const bgPath = path.join(process.cwd(), 'src/assets/bg_nota.png');
            if (fs.existsSync(bgPath)) {
                const buf = fs.readFileSync(bgPath);
                cachedBgImage = await Jimp.read(buf);
            } else {
                throw new Error("File tidak ditemukan");
            }
        } catch (e) {
            console.error("Gagal memuat bg_nota.png, menggunakan background putih. Error:", e.message);
            cachedBgImage = await new Promise((resolve, reject) => {
                new Jimp(1080, 1080, 0xFFFFFFFF, (err, image) => {
                    if (err) reject(err);
                    else resolve(image);
                });
            });
        }
    }
}

async function generateCanvasReceipt(type: 'nota' | 'tagihan', data: any): Promise<Buffer | null> {
    try {
        await initJimp();
        const image = cachedBgImage.clone();
        
        const startY = 350;
        const lineSpacing = 60;
        const leftColX = 150;
        const midColX = 350;
        const rightColX = 380;
        
        const centerPrint = (font: any, text: string, y: number) => {
            const textWidth = Jimp.measureText(font, text);
            image.print(font, (image.bitmap.width - textWidth) / 2, y, text);
        };
        
        if (type === 'nota') {
            const txDate = new Date(data.date);
            const formattedDate = \`\${txDate.getDate().toString().padStart(2, '0')}/\${(txDate.getMonth()+1).toString().padStart(2, '0')}/\${txDate.getFullYear().toString()} \${txDate.getHours().toString().padStart(2, '0')}:\${txDate.getMinutes().toString().padStart(2, '0')} WITA\`;
            
            centerPrint(font64, 'STRUK PEMBELIAN', 180);
            centerPrint(font32, 'E4 STORE', 250);
            
            let y = startY;
            const lines = [
                ['TANGGAL', formattedDate],
                ['ORDER ID', data.id],
                ['LAYANAN', data.product],
                ['TUJUAN', data.target],
                ['HARGA', 'Rp ' + data.price.toLocaleString('id-ID')],
                ['STATUS', data.status.toUpperCase()],
            ];
            if (data.sn) lines.push(['SN/TOKEN', data.sn]);
            
            for (const [label, val] of lines) {
                image.print(font32, leftColX, y, label);
                image.print(font32, midColX, y, ':');
                image.print(font32, rightColX, y, val);
                y += lineSpacing;
            }
            
            centerPrint(font32, 'Terima Kasih Telah Berbelanja', Math.max(y + 80, 850));
            
        } else if (type === 'tagihan') {
            const txDate = new Date();
            const formattedDate = \`\${txDate.getDate().toString().padStart(2, '0')}/\${(txDate.getMonth()+1).toString().padStart(2, '0')}/\${txDate.getFullYear().toString()} \${txDate.getHours().toString().padStart(2, '0')}:\${txDate.getMinutes().toString().padStart(2, '0')} WITA\`;
            
            centerPrint(font64, 'CEK TAGIHAN', 180);
            centerPrint(font32, 'E4 STORE', 250);
            
            let y = startY;
            const lines = [
                ['WAKTU CEK', formattedDate],
                ['NAMA', data.nama],
                ['ID PEL', data.target || data.no],
                ['LAYANAN', data.layanan],
                ['TOTAL', 'Rp ' + data.total.toLocaleString('id-ID')],
            ];
            
            for (const [label, val] of lines) {
                image.print(font32, leftColX, y, label);
                image.print(font32, midColX, y, ':');
                image.print(font32, rightColX, y, val);
                y += lineSpacing;
            }
            
            if (data.detail) {
                let d = 'DETAIL: ' + data.detail;
                if (d.length > 50) d = d.substring(0, 47) + '...';
                image.print(font32, leftColX, y + 30, d);
            }
            
            centerPrint(font32, 'Silahkan Lanjutkan Pembayaran', image.bitmap.height - 150);
        }
        
        return await image.getBufferAsync(Jimp.MIME_PNG);
    } catch(e: any) {
        console.error("Jimp generate error", e);
        return null;
    }
}`;

const regex = /async function generateCanvasReceipt\(type: 'nota' \| 'tagihan', data: any\): Promise<Buffer \| null> \{[\s\S]*?return null;\s*\}\s*\}/;

if (regex.test(content)) {
    content = content.replace(regex, newLogic);
    fs.writeFileSync('server.ts', content);
    console.log("Berhasil mem-patch server.ts!");
} else {
    console.log("Gagal menemukan fungsi generateCanvasReceipt di server.ts");
}
