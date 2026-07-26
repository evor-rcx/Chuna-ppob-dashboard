const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const insertBlock = `                // Also check if text is a pasca product name!
                if (!handled) {
                    const cleanText = cleanProductName(text);
                    const matchedProduct = pasca.find((p: any) => p.product_name === cleanText);
                    if (matchedProduct) {
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
                    }
                }`;

const searchStr = 'const pascaBrands = [...new Set(pasca.map((p: any) => p.brand))].filter(Boolean);';

code = code.replace(searchStr, insertBlock + '\n                ' + searchStr);
fs.writeFileSync('server.ts', code);
