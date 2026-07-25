const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Patch WAIT_PAYMENT_PREPAID
const targetPrepaid = `                if (!isOwner) {
                    userStates[userId] = { step: 'ASK_PIN_PREPAID', data: { ...state.data, method, sku: state.data.skuToPay } };
                    return ctx.reply("🔐 *Masukan PIN Keamanan Transaksi*Silakan ketik PIN Anda untuk melanjutkan transaksi ini.", { parse_mode: 'Markdown' });
                }
                await processPrepaidPayment(ctx, state.data.skuToPay, method, state.data, state.data.memberId || \`MBR-\${ctx.from?.id}\`);`;

const newPrepaid = `                if (!isOwner) {
                    userStates[userId] = { step: 'ASK_PIN_PREPAID', data: { ...state.data, method, sku: state.data.skuToPay } };
                    return ctx.reply("🔐 *Masukan PIN Keamanan Transaksi*Silakan ketik PIN Anda untuk melanjutkan transaksi ini.", { parse_mode: 'Markdown' });
                }
                if (method === 'cash') {
                    userStates[userId] = { step: 'ASK_CASH_AMOUNT_PREPAID', data: { ...state.data, method, sku: state.data.skuToPay } };
                    return ctx.reply("💵 Silakan masukkan nominal uang tunai yang diberikan (misal: 50000):", { reply_markup: { keyboard: [[{ text: "❌ Batal" }]], resize_keyboard: true } });
                }
                await processPrepaidPayment(ctx, state.data.skuToPay, method, state.data, state.data.memberId || \`MBR-\${ctx.from?.id}\`);`;

// Patch WAIT_PAYMENT_PASCA
const targetPasca = `                if (!isOwner) {
                    userStates[userId] = { step: 'ASK_PIN_PASCA', data: { ...state.data, method, ref_id: state.data.ref_id } };
                    return ctx.reply("🔐 *Masukan PIN Keamanan Transaksi*Silakan ketik PIN Anda untuk melanjutkan transaksi ini.", { parse_mode: 'Markdown' });
                }
                await processPascaPayment(ctx, state.data.ref_id, method, state.data, state.data.memberId || \`MBR-\${ctx.from?.id}\`);`;

const newPasca = `                if (!isOwner) {
                    userStates[userId] = { step: 'ASK_PIN_PASCA', data: { ...state.data, method, ref_id: state.data.ref_id } };
                    return ctx.reply("🔐 *Masukan PIN Keamanan Transaksi*Silakan ketik PIN Anda untuk melanjutkan transaksi ini.", { parse_mode: 'Markdown' });
                }
                if (method === 'cash') {
                    userStates[userId] = { step: 'ASK_CASH_AMOUNT_PASCA', data: { ...state.data, method, ref_id: state.data.ref_id } };
                    return ctx.reply("💵 Silakan masukkan nominal uang tunai yang diberikan (misal: 50000):", { reply_markup: { keyboard: [[{ text: "❌ Batal" }]], resize_keyboard: true } });
                }
                await processPascaPayment(ctx, state.data.ref_id, method, state.data, state.data.memberId || \`MBR-\${ctx.from?.id}\`);`;

code = code.replace(targetPrepaid, newPrepaid);
code = code.replace(targetPasca, newPasca);

// Also need to add cases for ASK_CASH_AMOUNT_PREPAID and ASK_CASH_AMOUNT_PASCA
// I'll append them right after ASK_PIN_PASCA

const targetAskPinPascaCase = `                case 'ASK_PIN_PASCA': {
                    const pinEntered = text.trim();
                    const regUser = registeredUsers[userId];
                    if (!regUser || regUser.pin !== pinEntered) {
                        return ctx.reply("😡 HMM?! PIN-NYA SALAH! Hayoo, kamu siapa?! Jangan sembarangan pakai akun orang ya! Chuna gigit nih kalau berani macam-macam! 🔪👿");
                    }
                    await ctx.reply("✅ Yey! PIN-nya benar. Chuna langsung proses transaksinya sekarang ya sayang! 🚀✨*(Demi keamanan, pesan berisi PIN-mu jangan lupa dihapus sendiri ya)*", { parse_mode: 'Markdown' });
                    const sd = state.data;
                    await processPascaPayment(ctx, sd.ref_id, sd.method, sd, sd.memberId || \`MBR-\${userId}\`);
                    return;
                }`;

const newAskCashAmountCases = `
                case 'ASK_CASH_AMOUNT_PREPAID': {
                    if (text.toLowerCase() === 'batal' || text === '❌ Batal') {
                        if (state.data.memberId) {
                            userStates[userId] = { step: 'LOCKED_MEMBER', data: { memberId: state.data.memberId } };
                            return ctx.reply("❌ Pembelian dibatalkan.", { reply_markup: { keyboard: [[{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "🔙 Kembali ke Menu Owner" }]], resize_keyboard: true } });
                        } else {
                            delete userStates[userId];
                            return ctx.reply("❌ Pembelian dibatalkan.", { reply_markup: { keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Fitur Download" }]], resize_keyboard: true } });
                        }
                    }
                    const cash = parseInt(text.replace(/\\D/g, ''));
                    if (isNaN(cash)) {
                        return ctx.reply("❌ Nominal tidak valid. Silakan masukkan angka saja:");
                    }
                    const total = state.data.totalBayar;
                    if (cash < total) {
                        return ctx.reply(\`❌ Uang kurang! Total bayar adalah Rp \${total.toLocaleString('id-ID')}. Masukkan nominal yang benar:\`);
                    }
                    const kembalian = cash - total;
                    state.data.kembalianText = kembalian > 0 ? \`\\n💵 Uang Tunai : Rp \${cash.toLocaleString('id-ID')}\\n✅ Kembalian  : Rp \${kembalian.toLocaleString('id-ID')}\` : \`\\n💵 Uang Tunai : Rp \${cash.toLocaleString('id-ID')}\\n✅ Uang Pas\`;
                    
                    const sd = state.data;
                    await processPrepaidPayment(ctx, sd.sku, sd.method, sd, sd.memberId || \`MBR-\${userId}\`);
                    return;
                }
                case 'ASK_CASH_AMOUNT_PASCA': {
                    if (text.toLowerCase() === 'batal' || text === '❌ Batal') {
                        if (state.data.memberId) {
                            userStates[userId] = { step: 'LOCKED_MEMBER', data: { memberId: state.data.memberId } };
                            return ctx.reply("❌ Pembayaran dibatalkan.", { reply_markup: { keyboard: [[{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "🔙 Kembali ke Menu Owner" }]], resize_keyboard: true } });
                        } else {
                            delete userStates[userId];
                            return ctx.reply("❌ Pembayaran dibatalkan.", { reply_markup: { keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Fitur Download" }]], resize_keyboard: true } });
                        }
                    }
                    const cash = parseInt(text.replace(/\\D/g, ''));
                    if (isNaN(cash)) {
                        return ctx.reply("❌ Nominal tidak valid. Silakan masukkan angka saja:");
                    }
                    const total = state.data.totalBayar;
                    if (cash < total) {
                        return ctx.reply(\`❌ Uang kurang! Total bayar adalah Rp \${total.toLocaleString('id-ID')}. Masukkan nominal yang benar:\`);
                    }
                    const kembalian = cash - total;
                    state.data.kembalianText = kembalian > 0 ? \`\\n💵 Uang Tunai : Rp \${cash.toLocaleString('id-ID')}\\n✅ Kembalian  : Rp \${kembalian.toLocaleString('id-ID')}\` : \`\\n💵 Uang Tunai : Rp \${cash.toLocaleString('id-ID')}\\n✅ Uang Pas\`;
                    
                    const sd = state.data;
                    await processPascaPayment(ctx, sd.ref_id, sd.method, sd, sd.memberId || \`MBR-\${userId}\`);
                    return;
                }`;

code = code.replace(targetAskPinPascaCase, targetAskPinPascaCase + newAskCashAmountCases);

fs.writeFileSync('server.ts', code);
console.log("Cash states patched!");
