const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const bugPattern = `                         // Fix: Untuk produk Pasca, jangan gunakan owner_fixed sebagai total bayar,
                         // melainkan tetap gunakan adminFee (feeData.owner)
                         if (isOwnerCtx && feeData.owner_fixed !== undefined) {
                             // Jika owner mengeset owner_fixed untuk Pasca, kita anggap itu sebagai Biaya Admin
                             adminFee = feeData.owner_fixed;
                             total = tagihan + adminFee;
                         }`;

const originalPattern = `                         if (isOwnerCtx && feeData.owner_fixed !== undefined) {
                             total = feeData.owner_fixed;
                             adminFee = total - tagihan;
                         }`;

code = code.replace(new RegExp(bugPattern.replace(/[.*+?^$\/{}()|\\]/g, '\\$&'), 'g'), originalPattern);

code = code.replace(/const tagihan = result\.selling_price \|\| 0;/g, "const tagihan = result.price || 0;");

fs.writeFileSync('server.ts', code);
