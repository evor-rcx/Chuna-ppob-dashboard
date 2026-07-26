const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace getByuPackages with getKodeBayarPackages
const newFuncs = `async function getKodeBayarPackages(nohp: string, provider: string): Promise<any[]> {
    try {
        const params = new URLSearchParams();
        params.append("nohp", nohp);
        params.append("menu_id", "");
        params.append("ci_csrf_token", "");

        const res = await fetch(\`https://kodebayar.web.id/home/search_page?provider=\${provider}\`, {
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
        console.error(\`\${provider} scrape error\`, e);
        return [];
    }
}

async function generateKodeBayar(nohp: string, pkg: any, provider: string): Promise<string | null> {
    try {
        const orderParams = new URLSearchParams();
        orderParams.append("nohp", nohp);
        orderParams.append("kode", pkg.kodebeliValue);
        orderParams.append("id", pkg.arg3);
        orderParams.append("menu_id", pkg.arg4);
        orderParams.append("ci_csrf_token", pkg.token);
        
        const res2 = await fetch(\`https://kodebayar.web.id/home/inquiry_page?provider=\${provider}\`, {
            method: "POST",
            body: orderParams
        });
        const orderData = await res2.json();
        return orderData.kode_bayar || null;
    } catch (e) {
        console.error(\`\${provider} generate kode bayar error\`, e);
        return null;
    }
}`;

code = code.replace(/async function getByuPackages[\s\S]*?async function generateByuKodeBayar[\s\S]*?return null;\n    }\n}/, newFuncs);

// Replace BYU_SELECT_PACKAGE
const oldSelect = /case 'BYU_SELECT_PACKAGE':[\s\S]*?return;\n\s+case 'PASCA_INPUT_NUMBER':/;

const newSelect = `case 'KODEBAYAR_SELECT_PACKAGE':
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
                
                const providerMap: Record<string, string> = {
                    'BYU': 'By.U',
                    'INDOSAT': 'Indosat',
                    'TRI': 'Tri',
                    'AXIATA': 'XL/Axis'
                };
                const pLabel = providerMap[state.data.kodebayarProvider] || state.data.kodebayarProvider;

                const selectedPkg = state.data.kodebayarPackages.find((p: any) => p.name + " - " + p.price === text.trim());
                if (!selectedPkg) {
                    await ctx.reply("❌ Pilihan tidak valid. Silakan pilih dari menu di bawah atau klik Batal.");
                    return;
                }
                
                await ctx.reply("⏳ Sedang memproses Kode Bayar untuk " + selectedPkg.name + "...");
                const kodeBayar = await generateKodeBayar(state.data.customerNo, selectedPkg, state.data.kodebayarProvider);
                
                if (!kodeBayar) {
                     await ctx.reply(\`❌ Gagal men-generate Kode Bayar \${pLabel} dari sistem. Silakan coba lagi nanti.\`);
                     return;
                }
                
                let finalCustomerNoVal = kodeBayar;
                
                try {
                    const result = await checkPascaBill(state.data.product.buyer_sku_code, finalCustomerNoVal);
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
                         
                         let detail = selectedPkg.name;
                         
                         const billData = {
                             nama: nama,
                             no: state.data.customerNo,
                             layanan: state.data.product.product_name + \` - \${pLabel}\`,
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

                         userStates[userId] = { step: 'WAIT_PAYMENT_PASCA', data: { ...state.data, ref_id: result.ref_id, totalBayar: total, checkResult: result, targetNo: finalCustomerNoVal } };

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
                     await ctx.reply(\`❌ Terjadi kesalahan saat mengecek tagihan \${pLabel}.\`);
                }
                return;

            case 'PASCA_INPUT_NUMBER':`;

code = code.replace(oldSelect, newSelect);


// Now replace the checking logic in PASCA_INPUT_NUMBER
const oldLogic = /                \/\/ --- BY\.U Auto Kode Bayar ---[\s\S]*?            case 'PASCA_CONFIRM':/;

const newLogicBlock = `                // --- Auto Kode Bayar (By.U, Indosat, Tri, XL/Axis) ---
                const brand = (product.brand || "").toLowerCase();
                const sku = (product.buyer_sku_code || "").toLowerCase();
                const pname = (product.product_name || "").toLowerCase();
                
                let providerStr = "";
                let providerLabel = "";
                
                if (brand === "by.u" || brand === "byu" || pname.includes("by.u") || pname.includes("byu")) {
                    providerStr = "BYU";
                    providerLabel = "By.U";
                } else if ((brand === "indosat" || pname.includes("indosat")) && (pname.includes("pasca") || brand.includes("pasca") || sku.includes("pasca") || sku.includes("post"))) {
                    providerStr = "INDOSAT";
                    providerLabel = "Indosat";
                } else if ((brand === "tri" || brand === "three" || pname.includes("tri") || pname.includes("three")) && (pname.includes("pasca") || brand.includes("pasca") || sku.includes("pasca") || sku.includes("post"))) {
                    providerStr = "TRI";
                    providerLabel = "Tri";
                } else if ((brand.includes("xl") || brand.includes("axis") || pname.includes("xl") || pname.includes("axis")) && (pname.includes("pasca") || brand.includes("pasca") || sku.includes("pasca") || sku.includes("post") || pname.includes("cuanku"))) {
                    providerStr = "AXIATA";
                    providerLabel = "XL/Axis";
                }
                
                if (providerStr !== "") {
                    if (customerNo.startsWith('0') || customerNo.startsWith('62') || customerNo.startsWith('+62')) {
                        await ctx.reply(\`⏳ Sedang mencari paket \${providerLabel} untuk nomor \${customerNo}...\`);
                        const packages = await getKodeBayarPackages(customerNo, providerStr);
                        if (packages.length > 0) {
                            userStates[userId] = {
                                step: 'KODEBAYAR_SELECT_PACKAGE',
                                data: { product: product, memberId: state.data.memberId, kodebayarPackages: packages, kodebayarProvider: providerStr, customerNo: customerNo }
                            };
                            
                            const keyboard = [];
                            const limit = Math.min(packages.length, 30);
                            for (let i = 0; i < limit; i++) {
                                keyboard.push([{ text: packages[i].name + " - " + packages[i].price }]);
                            }
                            keyboard.push([{ text: "❌ Batal" }]);
                            
                            await ctx.reply(\`✅ Ditemukan \${packages.length} paket.\\n\\nSilakan pilih paket yang ingin dibeli:\`, {
                                reply_markup: {
                                    keyboard: keyboard,
                                    resize_keyboard: true
                                }
                            });
                            return;
                        } else {
                            await ctx.reply(\`⚠️ Gagal mendapatkan paket dari \${providerLabel} untuk nomor ini (atau tidak ada promo). Silakan ulangi dan masukkan Kode Bayar secara manual.\`);
                            return;
                        }
                    }
                }
                
                // --- Telkomsel Omni Auto Kode Bayar ---
                if (brand.includes("omni") || brand.includes("telkomsel omni") || pname.includes("omni")) {
                    if (customerNo.startsWith('0') || customerNo.startsWith('62') || customerNo.startsWith('+62')) {
                        await ctx.reply("⏳ Sedang mencari paket Telkomsel Omni untuk nomor " + customerNo + "...");
                        const packages = await getOmniPackages(customerNo);
                        if (packages.length > 0) {
                            userStates[userId] = {
                                step: 'OMNI_SELECT_PACKAGE',
                                data: { product: product, memberId: state.data.memberId, omniPackages: packages, customerNo: customerNo }
                            };
                            
                            const keyboard = [];
                            const limit = Math.min(packages.length, 30);
                            for (let i = 0; i < limit; i++) {
                                keyboard.push([{ text: packages[i].name + " - " + packages[i].price }]);
                            }
                            keyboard.push([{ text: "❌ Batal" }]);
                            
                            await ctx.reply("✅ Ditemukan " + packages.length + " paket Omni.\\n\\nSilakan pilih paket yang ingin dibeli:", {
                                reply_markup: {
                                    keyboard: keyboard,
                                    resize_keyboard: true
                                }
                            });
                            return;
                        } else {
                            await ctx.reply("⚠️ Gagal mendapatkan paket dari Telkomsel Omni untuk nomor ini (atau tidak ada promo). Silakan ulangi dan masukkan Kode Bayar secara manual.");
                            return;
                        }
                    }
                }

                try {
                    const result = await checkPascaBill(product.buyer_sku_code, finalCustomerNo);
                    if (result.status === 'Gagal') {
                         await ctx.reply(\`❌ Pengecekan Gagal:\${result.message}\`);
                    } else if (result.status === 'Sukses') {
                         const nama = result.customer_name || "-";
                         const tagihan = result.selling_price || 0;
                         
                         // Determine member type
                         const memberId = state.data.memberId || \`MBR-\${ctx.from?.id}\`;
                         const member = members.find(m => m.id === memberId || isTelegramMatch(m.telegram, ctx.from?.id, ctx.from?.username));
                         const memberType = member?.type || 'Biasa';
                         
                         const isOwnerCtx = db.owners.includes(ctx.from?.id);
                         const feeData = getProductFee(product.buyer_sku_code);
                         let adminFee = isOwnerCtx ? feeData.owner : (memberType === 'VIP' ? feeData.vip : feeData.biasa);
                         let total = tagihan + adminFee;
                         if (isOwnerCtx && feeData.owner_fixed !== undefined) {
                             total = feeData.owner_fixed;
                             adminFee = total - tagihan;
                         }
                         
                         let detail = "";
                         if (result.desc) {
                           if (typeof result.desc === 'string') {
                               detail = result.desc;
                           } else {
                               const parts = [];
                               if (result.desc.tarif) parts.push(\`⚡ Tarif: \${result.desc.tarif}\`);
                               if (result.desc.daya) parts.push(\`📊 Daya: \${result.desc.daya}\`);
                               if (result.desc.lembar_tagihan) parts.push(\`📄 Lembar: \${result.desc.lembar_tagihan}\`);
                               
                               if (Array.isArray(result.desc.detail)) {
                                   result.desc.detail.forEach((d: any, idx: number) => {
                                      parts.push(\`📆 Bulan \${idx + 1}: \${d.periode || ''}\`);
                                      if (d.meter_awal) parts.push(\`🔢 Meter: \${d.meter_awal} - \${d.meter_akhir}\`);
                                   });
                               } else if (result.desc.detail) {
                                   parts.push(String(result.desc.detail));
                               }
                               detail = parts.join('\\n');
                           }
                         }
                         
                         
                         const billData = {
                             nama: nama,
                             no: result.customer_no,
                             layanan: product.product_name,
                             total: total,
                             detail: detail
                         };
                         const base64Data = Buffer.from(JSON.stringify(billData)).toString('base64');
                         const appUrl = "http://localhost:3000";
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

                         userStates[userId] = { step: 'WAIT_PAYMENT_PASCA', data: { ...state.data, ref_id: result.ref_id, totalBayar: total, checkResult: result, targetNo: finalCustomerNo } };

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
                     await ctx.reply("❌ Terjadi kesalahan saat mengecek tagihan.");
                }
                return;

            case 'PASCA_CONFIRM':`;

code = code.replace(oldLogic, newLogicBlock);

fs.writeFileSync('server.ts', code);
console.log("Replaced logic");
