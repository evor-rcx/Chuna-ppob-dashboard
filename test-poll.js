const fs = require('fs');
const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
const pending = db.transactions.filter(t => t.status === 'Pending');
console.log(JSON.stringify(pending, null, 2));
