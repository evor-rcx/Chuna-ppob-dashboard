const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `                const product = state.data.product;
                await ctx.reply(\`⏳ Sedang mengecek tagihan untuk nomor \${customerNo}...\`);
                let finalCustomerNo = customerNo;`;

const replacement = `                const product = state.data.product;
                let finalCustomerNo = customerNo;`;

code = code.replace(target, replacement);

const target2 = `                // --- Telkomsel Omni Auto Kode Bayar ---
                if (brand.includes("omni") || brand.includes("telkomsel omni") || pname.includes("omni")) {
                    if (customerNo.startsWith('0') || customerNo.startsWith('62') || customerNo.startsWith('+62')) {
                        await ctx.reply("⏳ Sedang mencari paket Telkomsel Omni untuk nomor " + customerNo + "...");`;

const replacement2 = `                // --- Telkomsel Omni Auto Kode Bayar ---
                if (brand.includes("omni") || brand.includes("telkomsel omni") || pname.includes("omni")) {
                    if (customerNo.startsWith('0') || customerNo.startsWith('62') || customerNo.startsWith('+62')) {
                        await ctx.reply("⏳ Sedang mencari paket Telkomsel Omni untuk nomor " + customerNo + "...");`;

const target3 = `                try {
                    const result = await checkPascaBill(product.buyer_sku_code, finalCustomerNo);`;

const replacement3 = `                await ctx.reply(\`⏳ Sedang mengecek tagihan untuk nomor \${customerNo}...\`);
                try {
                    const result = await checkPascaBill(product.buyer_sku_code, finalCustomerNo);`;

code = code.replace(target3, replacement3);

fs.writeFileSync('server.ts', code);
console.log("Fixed messages");
