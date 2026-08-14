const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldHtmlStr = `        <div class="footer">
            Chuna - Asisten Imutmu siap bantu 24 jam!<br/>Terimakasih telah berbelanja di E4 Store!
        </div>
        <div class="divider"></div>
        <div class="footer-small">
            Terima kasih telah berbelanja di E4 Store!<br/>Cetak: \${formattedDate} | Kode: #\${tx.id}
        </div>`;

const newHtmlStr = `        <div class="footer">
            Terima kasih telah berbelanja di E4 Store!<br/>Cetak: \${formattedDate} | Kode: #\${tx.id}<br/>\${calendarInfo}
        </div>
        <div class="divider"></div>
        <div class="footer-small" style="color: #333; font-size: 12px; font-weight: normal;">
            Chuna - Asisten Imutmu siap bantu 24 jam!<br/>Terimakasih telah berbelanja di E4 Store!
        </div>`;

// We also need to add calendarInfo variable
const oldJsStr = `    const dateStr = txDate.toLocaleString('en-GB', { timeZone: 'Asia/Makassar', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', '');
    const formattedDate = \`\${dateStr} WITA\`;
    
    let memberName = tx.username || '-';`;

const newJsStr = `    const dateStr = txDate.toLocaleString('en-GB', { timeZone: 'Asia/Makassar', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', '');
    const formattedDate = \`\${dateStr} WITA\`;
    const calendarInfo = getCalendarInfo(txDate);
    
    let memberName = tx.username || '-';`;

if (code.includes('Chuna - Asisten Imutmu siap bantu 24 jam!<br/>Terimakasih telah berbelanja di E4 Store!')) {
    code = code.replace(oldHtmlStr, newHtmlStr);
    code = code.replace(oldJsStr, newJsStr);
    fs.writeFileSync('server.ts', code);
    console.log("Html receipt patched!");
} else {
    console.log("Html receipt string not found.");
}
