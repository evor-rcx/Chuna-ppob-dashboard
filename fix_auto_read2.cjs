const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// For Prepaid
const prepaidTarget = /\} else \{\s+filtered\.sort\(\(a: any, b: any\) => a\.price - b\.price\);\s+filtered = filtered\.slice\(0, 100\);\s+const keyboard = \[\];\s+for \(let i = 0; i < filtered\.length; i \+= 2\) \{\s+const row = \[\{ text: getProductButtonText\(filtered\[i\]\) \}\];\s+if \(filtered\[i\+1\]\) row\.push\(\[\{ text: getProductButtonText\(filtered\[i\+1\]\) \}\]\);\s+keyboard\.push\(row\);\s+\}\s+keyboard\.push\(\[\{ text: "🔙 Kembali" \}\]\);\s+await ctx\.reply\(\`📋 \*Produk \$\{text\}\*\\nSilakan pilih produk yang ingin dibeli:\`, \{\s+parse_mode: 'Markdown',\s+reply_markup: \{ keyboard: keyboard, resize_keyboard: true \}\s+\}\);\s+handled = true;\s+\}/m;

// wait, the regex above has `row.push([{ text:` which is WRONG, it should be `row.push({ text:`. Let's just use substring!

const p1 = code.indexOf('filtered.sort((a: any, b: any) => a.price - b.price);');
if (p1 !== -1) {
    const endStr = 'handled = true;\n                    }';
    const p2 = code.indexOf(endStr, p1);
    if (p2 !== -1) {
        const fullMatch = code.substring(p1 - 30, p2 + endStr.length);
        
        const replacement = `} else {
                        filtered.sort((a: any, b: any) => a.price - b.price);
                        filtered = filtered.slice(0, 100);
                        if (filtered.length === 1) {
                            const matchedProduct = filtered[0];
                            const prevMemberId = userStates[userId]?.data?.memberId;
                            
                            // Calculate price
                            const memberId = prevMemberId || \`MBR-\${ctx.from?.id}\`;
                            const member = members.find(m => m.id === memberId || isTelegramMatch(m.telegram, ctx.from?.id, ctx.from?.username));
                            const memberType = member?.type || 'Biasa';
                            const isOwnerCtx = db.owners.includes(ctx.from?.id);
                            const feeData = getProductFee(matchedProduct.buyer_sku_code);
                            let adminFee = isOwnerCtx ? feeData.owner : (memberType === 'VIP' ? feeData.vip : feeData.biasa);
                            let total = matchedProduct.price + adminFee;
                            if (isOwnerCtx && feeData.owner_fixed !== undefined) {
                                total = feeData.owner_fixed;
                                adminFee = total - matchedProduct.price;
                            }
                            if (!matchedProduct.buyer_product_status || !matchedProduct.seller_product_status) {
                                return ctx.reply("❌ Mohon maaf kak, produk " + matchedProduct.product_name + " sedang gangguan/cut off dari pusat.");
                            }
                            
                            userStates[userId] = { 
                                step: 'PREPAID_INPUT_NUMBER', 
                                data: { product: matchedProduct, memberId: prevMemberId, totalBayar: total, adminFee } 
                            };
                            
                            await ctx.reply(\`🛒 *Detail Pembelian*\\n\\nProduk       : \${matchedProduct.product_name}\\nBrand        : \${matchedProduct.brand}\\n💎 Total Bayar : Rp \${total.toLocaleString('id-ID')}\\n\\n✏️ Silakan masukkan nomor tujuan (HP/ID) untuk melanjutkan pembelian.\`, {
                                parse_mode: 'Markdown',
                                reply_markup: {
                                    keyboard: [[{ text: "❌ Batal" }]],
                                    resize_keyboard: true
                                }
                            });
                            handled = true;
                        } else {
                            const keyboard = [];
                            for (let i = 0; i < filtered.length; i += 2) {
                                const row = [{ text: getProductButtonText(filtered[i]) }];
                                if (filtered[i+1]) row.push({ text: getProductButtonText(filtered[i+1]) });
                                keyboard.push(row);
                            }
                            keyboard.push([{ text: "🔙 Kembali" }]);
                            await ctx.reply(\`📋 *Produk \${text}*\\nSilakan pilih produk yang ingin dibeli:\`, { 
                                parse_mode: 'Markdown',
                                reply_markup: { keyboard: keyboard, resize_keyboard: true }
                            });
                            handled = true;
                        }
                    }`;
        code = code.substring(0, p1 - 30) + replacement + code.substring(p2 + endStr.length);
        console.log("Prepaid replaced!");
    } else {
        console.log("Prepaid p2 not found");
    }
} else {
    console.log("Prepaid p1 not found");
}

const pascaStr1 = 'let filtered = pasca.filter((p: any) => p.brand === text); filtered = filtered.slice(0, 100);';
const pascaP1 = code.indexOf(pascaStr1);
if (pascaP1 !== -1) {
    const endStrPasca = 'handled = true;\n                }';
    const pascaP2 = code.indexOf(endStrPasca, pascaP1);
    if (pascaP2 !== -1) {
        const replacementPasca = `${pascaStr1}
                    if (filtered.length === 1) {
                        const matchedProduct = filtered[0];
                        const prevMemberId = userStates[userId]?.data?.memberId;
                        if (!matchedProduct.buyer_product_status || !matchedProduct.seller_product_status) {
                            return ctx.reply("❌ Mohon maaf kak, produk " + matchedProduct.product_name + " sedang gangguan/cut off dari pusat.");
                        }
                        userStates[userId] = { 
                            step: 'PASCA_INPUT_NUMBER', 
                            data: { product: matchedProduct, memberId: prevMemberId } 
                        };
                        await ctx.reply(\`🛒 *Detail Layanan*\\nNama: \${matchedProduct.product_name}\\nBrand: \${matchedProduct.brand}\\nKategori: \${matchedProduct.category}\\n\\n✏️ *Silakan masukkan nomor tujuan/pelanggan untuk mengecek tagihan:*\`, {
                            parse_mode: 'Markdown',
                            reply_markup: {
                                keyboard: [[{ text: "❌ Batal" }]],
                                resize_keyboard: true
                            }
                        });
                        handled = true;
                    } else {
                        const keyboard = [];
                        for (let i = 0; i < filtered.length; i += 2) {
                            const row = [{ text: getProductButtonText(filtered[i]) }];
                            if (filtered[i+1]) row.push({ text: getProductButtonText(filtered[i+1]) });
                            keyboard.push(row);
                        }
                        keyboard.push([{ text: "🔙 Kembali" }]);

                        await ctx.reply(\`🧾 *Layanan \${text}*\\nSilakan pilih layanan untuk melihat detail:\`, { 
                            parse_mode: 'Markdown',
                            reply_markup: {
                                keyboard: keyboard,
                                resize_keyboard: true
                            }
                        });
                        handled = true;
                    }
                }`;
        code = code.substring(0, pascaP1) + replacementPasca + code.substring(pascaP2 + endStrPasca.length);
        console.log("Pasca replaced!");
    } else {
        console.log("Pasca p2 not found");
    }
} else {
    console.log("Pasca p1 not found");
}

fs.writeFileSync('server.ts', code);
