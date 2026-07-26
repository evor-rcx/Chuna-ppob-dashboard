const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const handlerStr = `            case 'PASCA_INPUT_NUMBER':`;
const newHandler = `            case 'OMNI_SELECT_PACKAGE':
                if (text === '❌ Batal') {
                    if (state.data.memberId) {
                        userStates[userId] = { step: 'LOCKED_MEMBER', data: { memberId: state.data.memberId } };
                        await ctx.reply("❌ Pembelian dibatalkan.", { reply_markup: { keyboard: [[{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "🔙 Kembali ke Menu Owner" }]], resize_keyboard: true } });
                    } else {
                        delete userStates[userId];
                        await ctx.reply("❌ Pembelian dibatalkan.", { reply_markup: { keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Fitur Download" }]], resize_keyboard: true } });
                    }
                    return;
                }
                
                const selectedPkg = state.data.omniPackages.find((p: any) => p.name + " - " + p.price === text.trim());
                if (!selectedPkg) {
                    await ctx.reply("❌ Pilihan tidak valid. Silakan pilih dari menu di bawah atau klik Batal.");
                    return;
                }
                
                await ctx.reply("⏳ Sedang memproses Kode Bayar untuk " + selectedPkg.name + "...");
                
                // Switch back to PASCA_INPUT_NUMBER behavior but using the generated code
                state.step = 'PASCA_INPUT_NUMBER';
                // Pass the code as if the user typed it
                // Need to mock the text and re-trigger or just duplicate the logic.
                // It's cleaner to just continue the logic here.
                
                let omniFinalCustomerNo = selectedPkg.code;
                try {
                    const result = await checkPascaBill(state.data.product.buyer_sku_code, omniFinalCustomerNo);
                    if (result.status === 'Gagal') {
                         await ctx.reply(\`❌ Pengecekan Gagal:\${result.message}\`, {
                             reply_markup: {
                                keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Fitur Download" }]],
                                resize_keyboard: true
                             }
                         });
                         delete userStates[userId];
                    } else if (result.status === 'Sukses') {
                         const tagihan = result.selling_price || 0;
                         const memberId = state.data.memberId || \`MBR-\${ctx.from?.id}\`;
                         const member = members.find(m => m.id === memberId || isTelegramMatch(m.telegram, ctx.from?.id, ctx.from?.username));
                         const memberType = member?.type || 'Biasa';
                         const isOwnerCtx = db.owners.includes(ctx.from?.id);
                         const feeData = getProductFee(state.data.product.buyer_sku_code);
                         let adminFee = isOwnerCtx ? feeData.owner : (memberType === 'VIP' ? feeData.vip : feeData.biasa);
                         let total = tagihan + adminFee;
                         if (isOwnerCtx && feeData.owner_fixed !== undefined) {
                             total = feeData.owner_fixed;
                             adminFee = total - tagihan;
                         }
                         userStates[userId] = {
                             step: 'PASCA_CONFIRM',
                             data: { 
                                 product: state.data.product, 
                                 customerNo: state.data.customerNo, 
                                 billResult: result, 
                                 memberId: memberId,
                                 adminFee: adminFee,
                                 total: total,
                                 omniPackageName: selectedPkg.name
                             }
                         };
                         let msg = \`🧾 *Detail Tagihan*\n\n\`;
                         msg += \`Produk: \${state.data.product.product_name}\\n\`;
                         msg += \`Paket: \${selectedPkg.name}\\n\`;
                         msg += \`Nomor: \${state.data.customerNo}\\n\`;
                         msg += \`Nama: \${result.customer_name || "-"}\\n\\n\`;
                         msg += \`Tagihan: Rp \${tagihan.toLocaleString('id-ID')}\\n\`;
                         msg += \`Admin: Rp \${adminFee.toLocaleString('id-ID')}\\n\`;
                         msg += \`*Total: Rp \${total.toLocaleString('id-ID')}*\\n\\n\`;
                         msg += \`Apakah Anda ingin melanjutkan pembayaran?\`;
                         await ctx.reply(msg, {
                             parse_mode: 'Markdown',
                             reply_markup: {
                                 keyboard: [[{ text: "✅ Bayar" }, { text: "❌ Batal" }]],
                                 resize_keyboard: true
                             }
                         });
                    }
                } catch (e) {
                     await ctx.reply("❌ Terjadi kesalahan saat mengecek tagihan.");
                }
                return;

            case 'PASCA_INPUT_NUMBER':`;

code = code.replace(handlerStr, newHandler);
fs.writeFileSync('server.ts', code);
console.log("Added OMNI_SELECT_PACKAGE handler");
