const fs = require('fs');
const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
const counts = db.transactions.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
}, {});
console.log(counts);
