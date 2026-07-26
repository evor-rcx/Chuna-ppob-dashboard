const fs = require('fs');
const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
const pasca = db.digiflazzProductsPasca;
const omni = pasca.filter(p => p.brand === 'Telkomsel Omni' || p.product_name.includes('Omni'));
console.log(omni.map(o => ({ sku: o.buyer_sku_code, name: o.product_name, brand: o.brand })));
