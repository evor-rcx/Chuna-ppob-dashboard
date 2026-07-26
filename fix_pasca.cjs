const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `                let finalCustomerNo = customerNo;
                try {
                    const result = await checkPascaBill(product.buyer_sku_code, finalCustomerNo);`;

const replacement = `                let finalCustomerNo = customerNo;

                // --- Auto Kode Bayar (By.U, Indosat, Tri, XL/Axis) ---
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
                    const result = await checkPascaBill(product.buyer_sku_code, finalCustomerNo);`;

code = code.replace(target, replacement);

fs.writeFileSync('server.ts', code);
console.log("Fixed pasca input");
