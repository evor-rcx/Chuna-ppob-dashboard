const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target1 = `            case 'OMNI_SELECT_PACKAGE':`;
const end1 = `            case 'PASCA_INPUT_NUMBER':`;
const blockRegex = new RegExp(`case 'OMNI_SELECT_PACKAGE':[\\s\\S]*?case 'PASCA_INPUT_NUMBER':`);

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
                         const nama = result.customer_name || "-";
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
                         
                         let detail = selectedPkg.name;
                         
                         const billData = {
                             nama: nama,
                             no: state.data.customerNo, // The phone number instead of the giant base64 code
                             layanan: state.data.product.product_name + " - Omni",
                             total: total,
                             detail: detail
                         };
                         const base64Data = Buffer.from(JSON.stringify(billData)).toString('base64');
                         const appUrl = process.env.APP_URL || "http://localhost:3000";
                         const notaUrl = \`\${appUrl}/api/tagihan-nota?data=\${encodeURIComponent(base64Data)}\`;

                         const replyText = \`✅ *Tagihan Ditemukan!*\\n\\nHaiii! Aku Chuna, asisten imut dari E4 Store 🐾✨\\nTagihan kamu udah muncul nih, jangan sampai kelewat ya~\\n\\n💬 "Jangan lupa bayar tepat waktu ya, sayang! Biar listrik tetap menyala dan kamu tetap semangat seharian~ Chuna doain yang terbaik buat kamu! 🌸💖"\`;

                         const isOwner = db.owners.includes(ctx.from?.id);
                         const keyboard = [];
                         if (isOwner) {
                             keyboard.push([{ text: "💵 Cash" }, { text: "📝 Utang" }]);
                             keyboard.push([{ text: "❌ Batal" }]);
                         } else {
                             keyboard.push([{ text: "💳 Saldo" }]);
                             keyboard.push([{ text: "❌ Batal" }]);
                         }

                         userStates[userId] = { step: 'WAIT_PAYMENT_PASCA', data: { ...state.data, ref_id: result.ref_id, totalBayar: total, checkResult: result, targetNo: omniFinalCustomerNo } };

                         const buffer = await generateCanvasReceipt("tagihan", billData);
                         if (buffer) {
                             await ctx.replyWithPhoto({ source: buffer }, {
                                 caption: replyText,
                                 parse_mode: 'Markdown',
                                 reply_markup: { keyboard, resize_keyboard: true }
                             });
                         } else {
                             let msg = \`🧾 *Detail Tagihan*\\n\\n\`;
                             msg += \`Layanan: \${billData.layanan}\\n\`;
                             msg += \`Detail: \${detail}\\n\`;
                             msg += \`Nomor: \${billData.no}\\n\`;
                             msg += \`Nama: \${billData.nama}\\n\\n\`;
                             msg += \`Tagihan: Rp \${tagihan.toLocaleString('id-ID')}\\n\`;
                             msg += \`Admin: Rp \${adminFee.toLocaleString('id-ID')}\\n\`;
                             msg += \`*Total: Rp \${total.toLocaleString('id-ID')}*\\n\\n\`;
                             msg += \`[Lihat Nota Web](\${notaUrl})\\n\\n\`;
                             msg += replyText;
                             await ctx.reply(msg, {
                                 parse_mode: 'Markdown',
                                 reply_markup: { keyboard, resize_keyboard: true }
                             });
                         }
                    }
                } catch (e) {
                     await ctx.reply("❌ Terjadi kesalahan saat mengecek tagihan Omni.");
                }
                return;

            case 'PASCA_INPUT_NUMBER':`;

if (code.match(blockRegex)) {
    code = code.replace(blockRegex, newHandler);
    console.log("Replaced OMNI_SELECT_PACKAGE");
} else {
    console.log("Could not find block");
}
fs.writeFileSync('server.ts', code);

