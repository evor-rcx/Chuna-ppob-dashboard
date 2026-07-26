const fs = require('fs');
const crypto = require('crypto');
const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));

const username = db.digiflazzUsername;
const apiKey = db.digiflazzApiKey;
const signText = username + apiKey + "pricelist";
const sign = crypto.createHash("md5").update(signText).digest("hex");

fetch("https://api.digiflazz.com/v1/price-list", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        cmd: "pasca",
        username: username,
        sign: sign
    })
}).then(res => res.json()).then(data => {
    const products = data.data;
    if (!products) {
       console.log("No products data:", data);
       return;
    }
    const byu = products.filter(p => p.brand.toLowerCase().includes("by"));
    console.log("by/by.u products:", byu.map(p => ({ sku: p.buyer_sku_code, name: p.product_name, brand: p.brand })));
}).catch(console.error);
