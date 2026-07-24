const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldCanvasStr = `            ctx.fillText('Chuna - Asisten Imutmu siap bantu 24 jam!', width / 2, y + 50);
            ctx.fillText('Terimakasih telah berbelanja di E4 Store!', width / 2, y + 90);
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
        ctx.fillText('Terima kasih telah berbelanja di E4 Store!', width / 2, y);
        y += 25;
        const shortCode = \`#\${(data.id || 'E4').substring(0,6).toUpperCase()}\`;
        ctx.fillText(\`📅 Cetak: \${formattedDate} | Kode: \${shortCode}\`, width / 2, y);
        y += 25;
        ctx.fillText(\`✨ \${calendarInfo}\`, width / 2, y);`;

const newCanvasStr = `            const shortCode = \`#\${(data.id || 'E4').substring(0,6).toUpperCase()}\`;
            ctx.font = '16px Arial, sans-serif';
            ctx.fillText('Terima kasih telah berbelanja di E4 Store!', width / 2, y + 40);
            ctx.fillText(\`Cetak: \${formattedDate} | Kode: \${shortCode}\`, width / 2, y + 70);
            ctx.fillText(\`\${calendarInfo}\`, width / 2, y + 100);
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
        
        ctx.fillStyle = '#333333';
        ctx.font = '16px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Chuna - Asisten Imutmu siap bantu 24 jam!', width / 2, y);
        y += 25;
        ctx.fillText('Terimakasih telah berbelanja di E4 Store!', width / 2, y);
        y += 20;
        ctx.fillStyle = '#888888';
        ctx.fillText('◻  ◻  ◻  ◻  ◻', width / 2, y);`;

if (code.includes('Chuna - Asisten Imutmu siap bantu 24 jam!')) {
    code = code.replace(oldCanvasStr, newCanvasStr);
    fs.writeFileSync('server.ts', code);
    console.log("Canvas receipt patched!");
} else {
    console.log("Canvas receipt string not found.");
}
