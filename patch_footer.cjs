const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldFooter = `        ctx.fillStyle = '#333333';
        ctx.font = '16px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Chuna - Asisten Imutmu siap bantu 24 jam!', width / 2, y);
        y += 25;
        ctx.fillText('Terimakasih telah berbelanja di E4 Store!', width / 2, y);
        y += 20;
        ctx.fillStyle = '#888888';
        ctx.fillText('◻  ◻  ◻  ◻  ◻', width / 2, y);`;

const newFooter = `        ctx.fillStyle = '#888888';
        ctx.font = '16px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Terima kasih telah berbelanja di E4 Store!', width / 2, y);
        y += 25;
        ctx.fillText(\`Cetak: \${formattedDate} | Kode: #\${data.id || 'E4'}\`, width / 2, y);
        y += 25;
        if (calendarInfo) {
            ctx.fillText(calendarInfo, width / 2, y);
        } else {
            y -= 25;
        }
        y += 30;
        ctx.fillText('◻  ◻  ◻  ◻  ◻', width / 2, y);`;

code = code.replace(oldFooter, newFooter);
fs.writeFileSync('server.ts', code);
