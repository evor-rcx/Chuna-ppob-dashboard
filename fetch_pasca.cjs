const fs = require('fs');
const crypto = require('crypto');
const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));

const username = db.settings.digiflazzUsername;
const apiKey = db.settings.digiflazzApiKey;
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
    const omni = products.filter(p => p.brand.toLowerCase().includes("omni"));
    console.log(omni.map(p => ({ sku: p.buyer_sku_code, name: p.product_name, brand: p.brand })));
});
