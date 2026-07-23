const fs = require('fs');
const db = JSON.parse(fs.readFileSync('db.json'));
const crypto = require('crypto');

async function test() {
    let signText = db.digiflazzUsername + db.digiflazzApiKey + "pricelist";
    let sign = crypto.createHash("md5").update(signText).digest("hex");
    
    console.log("Fetching...");
    const response = await fetch("https://api.digiflazz.com/v1/price-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            cmd: "prepaid",
            username: db.digiflazzUsername,
            sign: sign
        })
    });
    
    const data = await response.json();
    if (data.data && Array.isArray(data.data)) {
        const three = data.data.filter(p => p.brand.toLowerCase().includes('three') || p.brand.toLowerCase().includes('tri'));
        const tsel = data.data.filter(p => p.brand.toLowerCase().includes('telkomsel'));
        const xl = data.data.filter(p => p.brand.toLowerCase().includes('xl'));
        
        console.log("Three 30, 60, 70:", three.filter(p => p.product_name.includes('30') || p.product_name.includes('60') || p.product_name.includes('70')).slice(0, 5).map(p => p.buyer_sku_code));
        console.log("Telkomsel 200:", tsel.filter(p => p.product_name.includes('200')).slice(0, 5).map(p => p.buyer_sku_code));
        console.log("XL 70, 80, 90:", xl.filter(p => p.product_name.includes('70') || p.product_name.includes('80') || p.product_name.includes('90')).slice(0, 5).map(p => p.buyer_sku_code));
    }
}
test();
