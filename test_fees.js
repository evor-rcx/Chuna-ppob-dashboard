import fs from 'fs';
const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
const productFees = db.productFees || {};

function getProductFee(sku) {
    if (!sku) return { biasa: 0, vip: 0, owner: 0 };
    if (productFees[sku]) return productFees[sku];
    const upper = sku.toUpperCase();
    if (productFees[upper]) return productFees[upper];
    const lower = sku.toLowerCase();
    if (productFees[lower]) return productFees[lower];
    
    const key = Object.keys(productFees).find(k => k.toLowerCase() === lower);
    if (key) return productFees[key];
    
    return { biasa: 0, vip: 0, owner: 0 };
}

console.log("Fees for ML170:");
console.log(getProductFee("ML170"));
