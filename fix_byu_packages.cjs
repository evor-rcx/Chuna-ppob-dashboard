const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const getByuPackagesFunc = `async function getByuPackages(nohp: string): Promise<any[]> {
    try {
        const params = new URLSearchParams();
        params.append("nohp", nohp);
        params.append("menu_id", "");
        params.append("ci_csrf_token", "");

        const res = await fetch("https://kodebayar.web.id/home/search_page?provider=BYU", {
            method: "POST",
            body: params
        });
        const data = await res.json();
        if (!data.is_valid_number) return [];
        const html = data.isi;
        
        let packages = [];
        const parts = html.split('<h4 class="modal-title">');
        for (let i = 1; i < parts.length; i++) {
            const part = parts[i];
            
            const nameMatch = part.match(/^(.*?)</);
            if (!nameMatch) continue;
            let baseName = nameMatch[1].trim();
            
            const descMatch = part.match(/<div class="card-body">\\s*(.*?)\\s*<\\/div>/);
            if (descMatch && !baseName) {
                baseName = descMatch[1].trim();
            }
            
            let price = "";
            const priceMatch = part.match(/Harga[\\s\\S]*?<span class="[^"]*float-right[^"]*">([^<]+)<\\/span>/i);
            if (priceMatch) {
                price = priceMatch[1].trim();
            }
            
            const orderMatch = part.match(/onclick="order\\('([^']+)',\\s*'([^']+)',\\s*(\\d+),\\s*'([^']+)'\\)"/);
            if (orderMatch && baseName) {
                let pkg: any = { name: baseName, price: price };
                pkg.arg1 = orderMatch[1];
                pkg.arg2 = orderMatch[2];
                pkg.arg3 = orderMatch[3];
                pkg.arg4 = orderMatch[4];
                
                const kodebeliField = part.match(new RegExp(\`id="kodebeli_\${pkg.arg2}"[^>]*value="([^"]+)"\`));
                pkg.kodebeliValue = kodebeliField ? kodebeliField[1] : pkg.arg1;
                pkg.token = data.token;
                
                packages.push(pkg);
            }
        }
        
        // Remove duplicates by name and price to keep the keyboard clean
        const unique = [];
        const seen = new Set();
        for (const p of packages) {
            const key = p.name + p.price;
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(p);
            }
        }
        return unique;
    } catch (e) {
        console.error("BYU scrape error", e);
        return [];
    }
}

async function generateByuKodeBayar(nohp: string, pkg: any): Promise<string | null> {
    try {
        const orderParams = new URLSearchParams();
        orderParams.append("nohp", nohp);
        orderParams.append("kode", pkg.kodebeliValue);
        orderParams.append("id", pkg.arg3);
        orderParams.append("menu_id", pkg.arg4);
        orderParams.append("ci_csrf_token", pkg.token);
        
        const res2 = await fetch("https://kodebayar.web.id/home/inquiry_page?provider=BYU", {
            method: "POST",
            body: orderParams
        });
        const orderData = await res2.json();
        return orderData.kode_bayar || null;
    } catch (e) {
        console.error("BYU generate kode bayar error", e);
        return null;
    }
}
`;

// Replace getByuKodeBayar with the new functions
// First, find the whole getByuKodeBayar function and replace it
code = code.replace(/async function getByuKodeBayar\([\s\S]*?async function getOmniPackages/g, getByuPackagesFunc + "\nasync function getOmniPackages");


// Now replace the ByU logic in PASCA_INPUT_NUMBER
const oldLogic = `                // --- BY.U Auto Kode Bayar ---
                if (product.brand && (product.brand.toLowerCase() === "by.u" || product.brand.toLowerCase() === "byu")) {
                    if (customerNo.startsWith('0') || customerNo.startsWith('62') || customerNo.startsWith('+62')) {
                        await ctx.reply("⏳ Sedang menggenerate Kode Bayar dari By.U secara otomatis...");
                        const kodeBayar = await getByuKodeBayar(customerNo, product.product_name);
                        if (kodeBayar) {
                            finalCustomerNo = kodeBayar; // Override with the real Kode Bayar
                            await ctx.reply("✅ Berhasil mendapatkan Kode Bayar By.U otomatis: *" + kodeBayar + "*\\n\\nMenggunakan kode bayar ini untuk pengecekan.", { parse_mode: "Markdown" });
                        } else {
                            await ctx.reply("⚠️ Gagal mendapatkan Kode Bayar otomatis dari By.U untuk paket ini. Silakan ulangi dan masukkan Kode Bayar secara manual jika web sedang gangguan.");
                            return;
                        }
                    }
                }`;

const newLogic = `                // --- BY.U Auto Kode Bayar ---
                if (product.brand && (product.brand.toLowerCase() === "by.u" || product.brand.toLowerCase() === "byu")) {
                    if (customerNo.startsWith('0') || customerNo.startsWith('62') || customerNo.startsWith('+62')) {
                        await ctx.reply("⏳ Sedang mencari paket By.U untuk nomor " + customerNo + "...");
                        const packages = await getByuPackages(customerNo);
                        if (packages.length > 0) {
                            userStates[userId] = {
                                step: 'BYU_SELECT_PACKAGE',
                                data: { product: product, memberId: state.data.memberId, byuPackages: packages, customerNo: customerNo }
                            };
                            
                            const keyboard = [];
                            const limit = Math.min(packages.length, 30);
                            for (let i = 0; i < limit; i++) {
                                keyboard.push([{ text: packages[i].name + " - " + packages[i].price }]);
                            }
                            keyboard.push([{ text: "❌ Batal" }]);
                            
                            await ctx.reply("✅ Ditemukan " + packages.length + " paket.\\n\\nSilakan pilih paket yang ingin dibeli:", {
                                reply_markup: {
                                    keyboard: keyboard,
                                    resize_keyboard: true
                                }
                            });
                            return;
                        } else {
                            await ctx.reply("⚠️ Gagal mendapatkan paket dari By.U untuk nomor ini (atau tidak ada promo). Silakan ulangi dan masukkan Kode Bayar secara manual.");
                            return;
                        }
                    }
                }`;

code = code.replace(oldLogic, newLogic);


// Add BYU_SELECT_PACKAGE step
const newStep = `            case 'BYU_SELECT_PACKAGE':
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
                
                const selectedByu = state.data.byuPackages.find((p: any) => p.name + " - " + p.price === text.trim());
                if (!selectedByu) {
                    await ctx.reply("❌ Pilihan tidak valid. Silakan pilih dari menu di bawah atau klik Batal.");
                    return;
                }
                
                await ctx.reply("⏳ Sedang memproses Kode Bayar untuk " + selectedByu.name + "...");
                const kodeBayar = await generateByuKodeBayar(state.data.customerNo, selectedByu);
                
                if (!kodeBayar) {
                     await ctx.reply("❌ Gagal men-generate Kode Bayar By.U dari sistem. Silakan coba lagi nanti.");
                     return;
                }
                
                let byuFinalCustomerNo = kodeBayar;
                
                try {
                    const result = await checkPascaBill(state.data.product.buyer_sku_code, byuFinalCustomerNo);
                    if (result.status === 'Gagal') {
                         await ctx.reply(\`❌ Pengecekan Gagal:\${result.message}\`, {
                             reply_markup: {
                                keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Fitur Download" }]],
                                resize_keyboard: true
                             }
                         });
                         delete userStates[userId];
                    } else if (result.status === 'Sukses') {
                         let notaBuffer: any = null;
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
                         
                         let detail = selectedByu.name;
                         
                         const billData = {
                             nama: nama,
                             no: state.data.customerNo, // The phone number instead of the kode bayar
                             layanan: state.data.product.product_name + " - By.U",
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

                         userStates[userId] = { step: 'WAIT_PAYMENT_PASCA', data: { ...state.data, ref_id: result.ref_id, totalBayar: total, checkResult: result, targetNo: byuFinalCustomerNo } };

                         const buffer = await generateCanvasReceipt("tagihan", billData);
                         if (buffer) {
                             await ctx.replyWithPhoto({ source: buffer }, {
                                 caption: replyText,
                                 parse_mode: 'Markdown',
                                 reply_markup: { keyboard, resize_keyboard: true }
                             });
                         } else {
                             await ctx.reply(replyText, {
                                 parse_mode: 'Markdown',
                                 reply_markup: { keyboard, resize_keyboard: true }
                             });
                         }
                    }
                } catch (e) {
                     await ctx.reply("❌ Terjadi kesalahan saat mengecek tagihan By.U.");
                }
                return;

`;

const insertTarget = `            case 'PASCA_INPUT_NUMBER':`;
code = code.replace(insertTarget, newStep + insertTarget);

fs.writeFileSync('server.ts', code);
console.log("Updated BYU integration");
