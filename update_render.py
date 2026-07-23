import re

with open("server.ts", "r") as f:
    content = f.read()

# Remove puppeteer imports if any
content = re.sub(r'import puppeteer from "puppeteer";\n', '', content)
content = re.sub(r'const puppeteer = \(await import\("puppeteer"\)\)\.default;\n', '', content)

# Remove getBrowser
content = re.sub(r'let browserInstance = null;\nasync function getBrowser\(\) \{[\s\S]*?return browserInstance;\n\}\n', '', content)

# Replace renderUrlToImage with generateCanvasReceipt
new_func = """import { createCanvas, loadImage } from 'canvas';
import path from 'path';

async function generateCanvasReceipt(type: 'nota' | 'tagihan', data: any): Promise<Buffer | null> {
    try {
        const bgPath = path.join(process.cwd(), 'src/assets/bg_nota.png');
        const bgImage = await loadImage(bgPath);
        const canvas = createCanvas(bgImage.width, bgImage.height);
        const ctx = canvas.getContext('2d');
        
        ctx.drawImage(bgImage, 0, 0, bgImage.width, bgImage.height);
        
        ctx.fillStyle = '#000000'; // Black text
        ctx.textAlign = 'left';
        
        // Disable shadow for main text if not needed, but adding a slight white stroke helps visibility on any background
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'white';
        ctx.lineJoin = 'round';
        
        const drawText = (text: string, x: number, y: number, fontSize: number = 30, isBold: boolean = false, align: 'left' | 'center' | 'right' = 'left') => {
            ctx.font = `${isBold ? 'bold ' : ''}${fontSize}px Courier New, monospace`;
            ctx.textAlign = align as any;
            ctx.strokeText(text, x, y);
            ctx.fillText(text, x, y);
        };
        
        const startY = 350;
        const lineSpacing = 45;
        const leftColX = 150;
        const midColX = 350;
        const rightColX = 380;
        
        if (type === 'nota') {
            const txDate = new Date(data.date);
            const formattedDate = `${txDate.getDate().toString().padStart(2, '0')}/${(txDate.getMonth()+1).toString().padStart(2, '0')}/${txDate.getFullYear().toString()} ${txDate.getHours().toString().padStart(2, '0')}:${txDate.getMinutes().toString().padStart(2, '0')} WITA`;
            
            drawText('STRUK PEMBELIAN - E4 STORE', bgImage.width/2, 200, 45, true, 'center');
            
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
                drawText(label, leftColX, y, 32, true);
                drawText(':', midColX, y, 32, true);
                drawText(val, rightColX, y, 32, false);
                y += lineSpacing;
            }
            
            drawText('Terima Kasih Telah Berbelanja', bgImage.width/2, y + 80, 35, true, 'center');
            
        } else if (type === 'tagihan') {
            const txDate = new Date();
            const formattedDate = `${txDate.getDate().toString().padStart(2, '0')}/${(txDate.getMonth()+1).toString().padStart(2, '0')}/${txDate.getFullYear().toString()} ${txDate.getHours().toString().padStart(2, '0')}:${txDate.getMinutes().toString().padStart(2, '0')} WITA`;
            
            drawText('CEK TAGIHAN - E4 STORE', bgImage.width/2, 200, 45, true, 'center');
            
            let y = startY;
            const lines = [
                ['WAKTU CEK', formattedDate],
                ['NAMA', data.nama],
                ['ID PELANGGAN', data.target],
                ['LAYANAN', data.layanan],
                ['TOTAL TAGIHAN', 'Rp ' + data.total.toLocaleString('id-ID')],
            ];
            
            for (const [label, val] of lines) {
                drawText(label, leftColX, y, 32, true);
                drawText(':', midColX, y, 32, true);
                drawText(val, rightColX, y, 32, false);
                y += lineSpacing;
            }
            
            if (data.detail) {
                drawText('DETAIL: ' + data.detail, leftColX, y + 30, 25, false);
            }
            
            drawText('Silahkan Lanjutkan Pembayaran', bgImage.width/2, bgImage.height - 200, 35, true, 'center');
        }
        
        return canvas.toBuffer('image/png');
    } catch(e) {
        console.error("Canvas generate error", e);
        return null;
    }
}"""

content = re.sub(r'async function renderUrlToImage\([\s\S]*?return null;\n\}\n', new_func + '\n', content)

# Now we need to update calls to renderUrlToImage
content = re.sub(r'await renderUrlToImage\(`\$\{appUrl\}/api/nota/\$\{ref_id\}`\)', r'await generateCanvasReceipt("nota", tx)', content)
content = re.sub(r'await renderUrlToImage\(`\$\{appUrl\}/api/nota/\$\{pay_ref_id\}`\)', r'await generateCanvasReceipt("nota", transactions.find(t => t.id === pay_ref_id))', content)

# Update the call for tagihan
content = re.sub(r'const buffer = await renderUrlToImage\(notaUrl\);', r'const buffer = await generateCanvasReceipt("tagihan", billData);', content)

with open("server.ts", "w") as f:
    f.write(content)
