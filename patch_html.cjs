const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const htmlFooterOld = `<div class="footer-small" style="color: #333; font-size: 12px; font-weight: normal;">
            Chuna - Asisten Imutmu siap bantu 24 jam!<br/>Terimakasih telah berbelanja di E4 Store!
        </div>`;

const htmlFooterNew = `<div class="footer-small" style="color: #333; font-size: 12px; font-weight: normal;">
            ◻  ◻  ◻  ◻  ◻
        </div>`;

code = code.replace(htmlFooterOld, htmlFooterNew);
fs.writeFileSync('server.ts', code);
