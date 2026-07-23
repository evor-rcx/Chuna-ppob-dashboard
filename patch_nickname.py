import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

target = """                const product = state.data.product;
                const total = state.data.totalBayar;
                
                // For PLN Prepaid, we could do inq-pln to check name, but for simplicity we just confirm first
                // Let's check name if it's PLN Token
                let nameInfo = "";
                let skuToPay = product.buyer_sku_code;
                
                state.data.targetNo = targetNo; // Save target number in state
                
                const replyText = `✅ *Konfirmasi Pembelian*\\n\\nLayanan: ${product.product_name}\\nNomor: ${targetNo}\\n\\n💎 *TOTAL BAYAR: Rp ${total.toLocaleString('id-ID')}*`;"""

replacement = """                const product = state.data.product;
                const total = state.data.totalBayar;
                
                let nameInfo = "";
                let skuToPay = product.buyer_sku_code;
                
                state.data.targetNo = targetNo; // Save target number in state
                
                // --- Cek Nickname Game Automatis ---
                if (product.brand && (product.brand.toUpperCase() === "FREE FIRE" || product.brand.toUpperCase() === "MOBILE LEGENDS")) {
                    try {
                        const game = product.brand.toUpperCase() === "FREE FIRE" ? "freefire" : "mobilelegends";
                        let id = targetNo;
                        let zone = "";
                        
                        if (game === "mobilelegends") {
                            const match = targetNo.replace(/[^0-9]/g, ' ').trim().split(/\\s+/);
                            if (match.length >= 1) id = match[0];
                            if (match.length >= 2) zone = match[1];
                        }
                        
                        let nickname = "";
                        
                        // Failover APIs
                        const apis = [
                            game === 'freefire' 
                                ? `https://api.vipayment.co.id/api/game/nickname?game=freefire&id=${id}`
                                : `https://api.vipayment.co.id/api/game/nickname?game=mobilelegends&id=${id}&zone=${zone}`,
                            game === 'freefire'
                                ? `https://api.isan.my.id/api/ff?id=${id}`
                                : `https://api.isan.my.id/api/ml?id=${id}&zone=${zone}`,
                            game === 'freefire'
                                ? `https://v2.ouzen.xyz/api/game/ff?id=${id}`
                                : `https://v2.ouzen.xyz/api/game/ml?id=${id}&zone=${zone}`
                        ];
                        
                        for (const url of apis) {
                            if (nickname) break;
                            try {
                                const res = await fetch(url, { timeout: 3000 }).catch(() => null);
                                if (res && res.ok) {
                                    const data = await res.json();
                                    if (data.status && data.data && data.data.name) nickname = data.data.name;
                                    else if (data.name) nickname = data.name;
                                    else if (data.nickname) nickname = data.nickname;
                                }
                            } catch(e) {}
                        }

                        if (nickname) {
                            nameInfo = `\\n👤 Nickname: *${nickname}*`;
                            state.data.nickname = nickname;
                        } else {
                            nameInfo = `\\n👤 Nickname: _(Gagal dicek/API Gangguan)_`;
                        }
                    } catch (e) {
                        nameInfo = `\\n👤 Nickname: _(Gagal dicek)_`;
                    }
                }
                
                const replyText = `✅ *Konfirmasi Pembelian*\\n\\nLayanan: ${product.product_name}\\nNomor: ${targetNo}${nameInfo}\\n\\n💎 *TOTAL BAYAR: Rp ${total.toLocaleString('id-ID')}*`;"""

if target in content:
    content = content.replace(target, replacement)
    with open('server.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched successfully")
else:
    print("Target not found")
