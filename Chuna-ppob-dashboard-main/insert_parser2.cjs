const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const parserCode = `
async function parseAnnouncementText(text: string) {
    if (!text.includes('{{')) return text;
    try {
        const prepaid = await getDigiflazzProducts('prepaid');
        return text.replace(/\\{\\{([^:]+)(?::([^}]+))?\\}\\}/g, (match, sku, type) => {
            const product = prepaid.find((p: any) => p.buyer_sku_code.toLowerCase() === sku.toLowerCase().trim() || p.product_name.toLowerCase() === sku.toLowerCase().trim());
            if (!product) return match; 
            
            const feeBiasa = productFees[product.buyer_sku_code]?.biasa || 0;
            const feeVip = productFees[product.buyer_sku_code]?.vip || 0;
            
            const priceReguler = product.price + feeBiasa;
            const priceVip = product.price + feeVip;
            const isNormal = product.buyer_product_status && product.seller_product_status;
            const status = isNormal ? "🟢 NORMAL" : "🔴 GANGGUAN/CLOSE";
            
            const reqType = (type || "").toUpperCase().trim();
            if (reqType === "REGULER") return "Rp " + priceReguler.toLocaleString('id-ID');
            if (reqType === "VIP") return "Rp " + priceVip.toLocaleString('id-ID');
            if (reqType === "NAMA") return product.product_name;
            if (reqType === "STATUS") return status;
            if (reqType === "HEMAT") return "Rp " + (priceReguler - priceVip).toLocaleString('id-ID');
            
            return product.product_name + " - Reg: Rp " + priceReguler.toLocaleString('id-ID') + " | VIP: Rp " + priceVip.toLocaleString('id-ID') + " (" + status + ")";
        });
    } catch (e) {
        console.error("Error parsing announcement text:", e);
        return text;
    }
}
`;

code = code.replace(/async function getDigiflazzProducts\(type: "prepaid" \| "pasca"\) \{/, parserCode + '\nasync function getDigiflazzProducts(type: "prepaid" | "pasca") {');

fs.writeFileSync('server.ts', code);
