const fs = require('fs');
const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
console.log(JSON.stringify(db.transactions.slice(0, 5), null, 2));
