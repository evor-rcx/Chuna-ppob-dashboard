import fs from 'fs';
const dbFile = 'db.json';
const db = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
db.transactions.forEach(t => {
    if (typeof t.product === 'object' && t.product !== null) {
        t.product = t.product.product_name || 'Unknown Product';
    }
});
fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
console.log("Fixed db.json");
