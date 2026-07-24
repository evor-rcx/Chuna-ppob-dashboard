const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The block to replace
const oldBlock = `            ctx.fillStyle = '#333333';
            ctx.font = '18px Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Chuna - Asisten Imutmu siap bantu 24 jam!', width / 2, y + 50);
            ctx.fillText('Terimakasih telah berbelanja di E4 Store!', width / 2, y + 90);
            y += 150;`;

const newBlock = `            ctx.fillStyle = '#333333';
            ctx.font = '16px Arial, sans-serif';
            ctx.textAlign = 'center';
            const shortCode = \`#\${(data.id || 'E4').substring(0,6).toUpperCase()}\`;
            ctx.fillText('Terima kasih telah berbelanja di E4 Store!', width / 2, y + 40);
            ctx.fillText(\`Cetak: \${formattedDate} | Kode: \${shortCode}\`, width / 2, y + 70);
            ctx.fillText(\`\${calendarInfo}\`, width / 2, y + 100);
            y += 150;`;

// And the second block
const oldBlock2 = `        ctx.fillStyle = '#888888';
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

const newBlock2 = `        ctx.fillStyle = '#333333';
        ctx.font = '16px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Chuna - Asisten Imutmu siap bantu 24 jam!', width / 2, y);
        y += 25;
        ctx.fillText('Terimakasih telah berbelanja di E4 Store!', width / 2, y);
        y += 20;
        ctx.fillStyle = '#888888';
        ctx.fillText('◻  ◻  ◻  ◻  ◻', width / 2, y);`;

if (code.includes(oldBlock)) {
    code = code.replace(oldBlock, newBlock);
    if (code.includes(oldBlock2)) {
        code = code.replace(oldBlock2, newBlock2);
        fs.writeFileSync('server.ts', code);
        console.log("Canvas receipt replaced completely!");
    } else {
        console.log("Block 2 not found");
    }
} else {
    console.log("Block 1 not found");
}
