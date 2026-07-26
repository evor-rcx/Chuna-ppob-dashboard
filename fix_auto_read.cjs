const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// For Prepaid
const prepaidTarget = `                    } else {
                        filtered.sort((a: any, b: any) => a.price - b.price);
                        filtered = filtered.slice(0, 100);
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
                    }`;

const prepaidReplacement = `                    } else {
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

if (code.includes(prepaidTarget)) {
    code = code.replace(prepaidTarget, prepaidReplacement);
} else {
    console.log("Prepaid target not found!");
}

// For Pasca
const pascaTarget = `                if (pascaBrands.includes(text)) {
                    let filtered = pasca.filter((p: any) => p.brand === text); filtered = filtered.slice(0, 100);
                    
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
                }`;

const pascaReplacement = `                if (pascaBrands.includes(text)) {
                    let filtered = pasca.filter((p: any) => p.brand === text); filtered = filtered.slice(0, 100);
                    
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

if (code.includes(pascaTarget)) {
    code = code.replace(pascaTarget, pascaReplacement);
} else {
    console.log("Pasca target not found!");
}

fs.writeFileSync('server.ts', code);
console.log("Done replacing auto-read");
