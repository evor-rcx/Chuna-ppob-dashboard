const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace the old getOmniKodeBayar function with getOmniPackages
const getOmniKodeBayarFunc = `async function getOmniKodeBayar(nohp: string, productName: string): Promise<string | null> {
    try {
        const params = new URLSearchParams();
        params.append("nohp", nohp);
        params.append("menu_id", "");
        params.append("ci_csrf_token", "");

        const res = await fetch("https://kodebayar.web.id/home/search_page?provider=TELKOMSEL", {
            method: "POST",
            body: params
        });
        const json = await res.json();
        if (!json.isi) return null;
        const html = json.isi;
        
        let targetName = productName.toLowerCase().replace(/[^a-z0-9]/g, '');
        let regex = /<h6[^>]*>(.*?)<\\/h6>[\\s\\S]*?<div[^>]*>[\\s\\S]*?<b[^>]*>(.*?)<\\/b>[\\s\\S]*?<button[^>]*onclick="pay\\('([^']+)'/gi;
        
        let match;
        let bestMatch = null;
        let highestScore = 0;
        
        while ((match = regex.exec(html)) !== null) {
            const currentName = match[1].toLowerCase().replace(/[^a-z0-9]/g, '');
            const currentPrice = match[2];
            const currentCode = match[3];
            
            let score = 0;
            if (currentName === targetName) score += 10;
            if (targetName.includes(currentName) || currentName.includes(targetName)) score += 5;
            
            if (score > highestScore) {
                highestScore = score;
                bestMatch = currentCode;
            }
        }
        
        return bestMatch;
    } catch (e) {
        console.error("Omni scrape error", e);
        return null;
    }
}`;

const getOmniPackagesFunc = `async function getOmniPackages(nohp: string): Promise<any[]> {
    try {
        const params = new URLSearchParams();
        params.append("nohp", nohp);
        params.append("menu_id", "");
        params.append("ci_csrf_token", "");

        const res = await fetch("https://kodebayar.web.id/home/search_page?provider=TELKOMSEL", {
            method: "POST",
            body: params
        });
        const json = await res.json();
        if (!json.isi) return [];
        const html = json.isi;
        
        let packages = [];
        const parts = html.split('<h4 class="modal-title">');
        for (let i = 1; i < parts.length; i++) {
            const part = parts[i];
            const nameMatch = part.match(/^(.*?)<\\/h4>/);
            if (!nameMatch) continue;
            let baseName = nameMatch[1].trim();
            
            let dataSize = "";
            const badgeMatch = part.match(/<span class="[^"]*float-right[^"]*">([^<]*(?:GB|MB))<\\/span>/i);
            if (badgeMatch) dataSize = badgeMatch[1].trim();
            
            let masaAktif = "";
            const masaMatch = part.match(/<span class="[^"]*float-right[^"]*">([^<]*(?:Hari|Days))<\\/span>/i);
            if (masaMatch) masaAktif = masaMatch[1].trim();
            
            let price = "";
            const priceMatch = part.match(/Harga[\\s\\S]*?<span class="[^"]*float-right[^"]*">([^<]+)<\\/span>/i);
            if (priceMatch) price = priceMatch[1].trim();
            
            let code = "";
            const orderMatch = part.match(/onclick="order\\('([^']+)'/);
            if (orderMatch) code = orderMatch[1].trim();
            
            if (baseName && code) {
                let fullName = baseName;
                if (dataSize) fullName += " " + dataSize;
                if (masaAktif) fullName += " " + masaAktif;
                packages.push({ name: fullName, price: price, code: code });
            }
        }
        return packages;
    } catch (e) {
        console.error("Omni scrape error", e);
        return [];
    }
}`;

if (code.includes('getOmniKodeBayar')) {
    code = code.replace(getOmniKodeBayarFunc, getOmniPackagesFunc);
} else if (!code.includes('getOmniPackages')) {
    // If not found, inject before getByuKodeBayar
    const getByuKodeBayarStart = `async function getByuKodeBayar`;
    code = code.replace(getByuKodeBayarStart, getOmniPackagesFunc + "\n\n" + getByuKodeBayarStart);
}

// Now replace the logic in PASCA_INPUT_NUMBER
const oldLogic = `                // --- Telkomsel Omni Auto Kode Bayar ---
                else if (product.brand && (product.brand.toLowerCase().includes("omni") || product.brand.toLowerCase().includes("telkomsel omni"))) {
                    if (customerNo.startsWith('0') || customerNo.startsWith('62') || customerNo.startsWith('+62')) {
                        await ctx.reply("⏳ Sedang menggenerate Kode Bayar Telkomsel Omni secara otomatis...");
                        const kodeBayar = await getOmniKodeBayar(customerNo, product.product_name);
                        if (kodeBayar) {
                            finalCustomerNo = kodeBayar;
                            await ctx.reply("✅ Berhasil mendapatkan Kode Bayar Omni otomatis: *" + kodeBayar + "*\\n\\nMenggunakan kode bayar ini untuk pengecekan.", { parse_mode: "Markdown" });
                        } else {
                            await ctx.reply("⚠️ Gagal mendapatkan Kode Bayar otomatis dari Telkomsel Omni untuk paket ini. Silakan ulangi dan masukkan Kode Bayar secara manual jika web sedang gangguan.");
                            return;
                        }
                    }
                }`;

const newLogic = `                // --- Telkomsel Omni Auto Kode Bayar ---
                else if (product.brand && (product.brand.toLowerCase().includes("omni") || product.brand.toLowerCase().includes("telkomsel omni"))) {
                    if (customerNo.startsWith('0') || customerNo.startsWith('62') || customerNo.startsWith('+62')) {
                        await ctx.reply("⏳ Sedang mencari paket Telkomsel Omni untuk nomor " + customerNo + "...");
                        const packages = await getOmniPackages(customerNo);
                        if (packages.length > 0) {
                            userStates[userId] = {
                                step: 'OMNI_SELECT_PACKAGE',
                                data: { product: product, memberId: state.data.memberId, omniPackages: packages, customerNo: customerNo }
                            };
                            
                            const keyboard = [];
                            // Max 30 packages to avoid huge keyboards
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
                            await ctx.reply("⚠️ Gagal mendapatkan paket dari Telkomsel Omni untuk nomor ini (atau tidak ada promo). Silakan ulangi dan masukkan Kode Bayar secara manual.");
                            return;
                        }
                    }
                }`;

if (code.includes(oldLogic)) {
    code = code.replace(oldLogic, newLogic);
    console.log("Replaced Omni logic");
} else {
    console.log("Omni logic not found");
}

fs.writeFileSync('server.ts', code);
