const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const parserCode = `
async function parseAnnouncementText(text: string) {
    if (!text.includes('{{')) return text;
    try {
        const prepaid = await fetchProducts('prepaid');
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

// Insert the function somewhere after fetchProducts
code = code.replace(/async function fetchProducts\(type: string\) \{[\s\S]*?return productsCache\[cacheKey\]\.data;\n\}/, 
  match => match + "\n\n" + parserCode);

// Update bot.on("photo", "video", "document") (where we send the test message)
code = code.replace(/await waSocket\.sendMessage\(targetAnnounce, msgOpt\);/, 
  `const parsedCaption = await parseAnnouncementText(caption);
                          if (mediaType === 'image') msgOpt.caption = parsedCaption;
                          else if (mediaType === 'video') msgOpt.caption = parsedCaption;
                          else if (mediaType === 'document') msgOpt.caption = parsedCaption;
                          await waSocket.sendMessage(targetAnnounce, msgOpt);`);

// Update text handler for AWAITING_ANNOUNCEMENT_TEXT
code = code.replace(/db\.waAnnouncementText = text;\n\s*db\.waAnnouncementMedia = null;/,
  `db.waAnnouncementText = text;
                db.waAnnouncementMedia = null;
                const parsedText = await parseAnnouncementText(text);`);

// Update waSocket.sendMessage(targetAnnounce, { text: text });
code = code.replace(/await waSocket\.sendMessage\(targetAnnounce, \{ text: text \}\);/g, 
  `await waSocket.sendMessage(targetAnnounce, { text: parsedText });`);

// Update the setInterval
code = code.replace(/const caption = db\.waAnnouncementText \|\| "";/g, 
  `const caption = await parseAnnouncementText(db.waAnnouncementText || "");`);
code = code.replace(/msgOpt = \{ text: db\.waAnnouncementText \};/g, 
  `msgOpt = { text: await parseAnnouncementText(db.waAnnouncementText || "") };`);

// Add help text to the "📢 Buat Pengumuman" message
code = code.replace(/Kirimkan teks, gambar, atau video \(dengan caption\) yang ingin dikirimkan ke target \*\$\{target\}\*:\\n\\n\(Bisa multi-baris\)/,
  "Kirimkan teks, gambar, atau video (dengan caption) yang ingin dikirimkan ke target *${target}*:\\n\\n(Bisa multi-baris)\\n\\n💡 *TIPS OTOMATIS HARGA:*\\nKamu bisa pakai kode seperti ini agar harga update otomatis sesuai setting produk & Digiflazz:\\n`{{KODE_SKU:REGULER}}` -> Harga Biasa\\n`{{KODE_SKU:VIP}}` -> Harga VIP\\n`{{KODE_SKU:STATUS}}` -> 🟢 NORMAL / 🔴 CLOSE\\n`{{KODE_SKU:HEMAT}}` -> Selisih Harga\\n\\nContoh:\\n💎 ML 170DM: `{{ML170:REGULER}}`\\n⭐ VIP Cuma: `{{ML170:VIP}}`");

fs.writeFileSync('server.ts', code);
